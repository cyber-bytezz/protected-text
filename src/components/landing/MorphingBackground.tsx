\"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

interface NoisePoint {
  x: number;
  y: number;
  dx: number;
  dy: number;
  phase: number;
  offset: number;
  frequency: number;
  amplitude: number;
}

export default function MorphingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });
  const controls = useAnimation();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [noisePoints, setNoisePoints] = useState<NoisePoint[]>([]);
  const [colorScheme, setColorScheme] = useState({
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    background: '#ffffff'
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [time, setTime] = useState(0);
  const animationFrameRef = useRef<number>();
  
  // Initialize canvas and noise points
  useEffect(() => {
    if (containerRef.current && canvasRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
      
      // Set canvas dimensions
      const canvas = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      // Initialize noise points
      const points: NoisePoint[] = [];
      const pointCount = Math.min(Math.floor((width * height) / 15000), 20);
      
      for (let i = 0; i < pointCount; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          dx: (Math.random() - 0.5) * 0.5,
          dy: (Math.random() - 0.5) * 0.5,
          phase: Math.random() * Math.PI * 2,
          offset: Math.random() * 100,
          frequency: 0.001 + Math.random() * 0.008,
          amplitude: 50 + Math.random() * 100
        });
      }
      
      setNoisePoints(points);
      
      // Check if dark mode is enabled
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDarkMode) {
        setColorScheme({
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#ec4899',
          background: '#111827'
        });
      }
    }
  }, []);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        
        // Update canvas dimensions
        const canvas = canvasRef.current;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', () => setIsHovering(true));
      container.addEventListener('mouseleave', () => setIsHovering(false));
    }
    
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', () => setIsHovering(true));
        container.removeEventListener('mouseleave', () => setIsHovering(false));
      }
    };
  }, []);
  
  // Animation loop
  useEffect(() => {
    if (!isInView || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);
    
    const animate = () => {
      setTime(prevTime => prevTime + 0.01);
      
      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Update noise points
      setNoisePoints(prevPoints => {
        return prevPoints.map(point => {
          // Update position with slight randomness
          let x = point.x + point.dx + Math.sin(time * 0.5 + point.offset) * 0.2;
          let y = point.y + point.dy + Math.cos(time * 0.5 + point.offset) * 0.2;
          
          // Mouse interaction
          if (isHovering) {
            const dx = mousePosition.x - point.x;
            const dy = mousePosition.y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 200;
            
            if (distance < maxDistance) {
              const force = (1 - distance / maxDistance) * 2;
              x += (dx / distance) * force * 0.2;
              y += (dy / distance) * force * 0.2;
            }
          }
          
          // Bounce off edges
          if (x < 0 || x > dimensions.width) point.dx *= -1;
          if (y < 0 || y > dimensions.height) point.dy *= -1;
          
          // Keep within bounds
          x = Math.max(0, Math.min(dimensions.width, x));
          y = Math.max(0, Math.min(dimensions.height, y));
          
          return { ...point, x, y };
        });
      });
      
      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height);
      gradient.addColorStop(0, `${colorScheme.primary}05`);
      gradient.addColorStop(0.5, `${colorScheme.secondary}05`);
      gradient.addColorStop(1, `${colorScheme.accent}05`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      
      // Draw metaballs
      drawMetaballs(ctx);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInView, dimensions, noisePoints, isHovering, mousePosition, colorScheme, time]);
  
  // Draw metaballs using noise points
  const drawMetaballs = (ctx: CanvasRenderingContext2D) => {
    // Create off-screen canvas for metaballs
    const offCanvas = document.createElement('canvas');
    offCanvas.width = dimensions.width;
    offCanvas.height = dimensions.height;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;
    
    // Clear off-screen canvas
    offCtx.clearRect(0, 0, dimensions.width, dimensions.height);
    
    // Draw metaballs
    noisePoints.forEach(point => {
      const radius = 50 + Math.sin(time + point.phase) * 20;
      const gradient = offCtx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, radius
      );
      
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      offCtx.fillStyle = gradient;
      offCtx.beginPath();
      offCtx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      offCtx.fill();
    });
    
    // Apply threshold filter to create metaball effect
    const imageData = offCtx.getImageData(0, 0, dimensions.width, dimensions.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      
      if (brightness > 200) {
        // Create gradient colors for metaballs
        const x = (i / 4) % dimensions.width;
        const y = Math.floor((i / 4) / dimensions.width);
        const normalizedX = x / dimensions.width;
        const normalizedY = y / dimensions.height;
        
        // Create a flowing color effect
        const hue = (normalizedX * 60 + normalizedY * 60 + time * 10) % 360;
        const saturation = 80 + Math.sin(time + normalizedX * Math.PI) * 20;
        const lightness = 60 + Math.cos(time + normalizedY * Math.PI) * 10;
        
        // Convert HSL to RGB
        const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
        const x1 = c * (1 - Math.abs((hue / 60) % 2 - 1));
        const m = lightness / 100 - c / 2;
        
        let r1, g1, b1;
        if (hue < 60) { r1 = c; g1 = x1; b1 = 0; }
        else if (hue < 120) { r1 = x1; g1 = c; b1 = 0; }
        else if (hue < 180) { r1 = 0; g1 = c; b1 = x1; }
        else if (hue < 240) { r1 = 0; g1 = x1; b1 = c; }
        else if (hue < 300) { r1 = x1; g1 = 0; b1 = c; }
        else { r1 = c; g1 = 0; b1 = x1; }
        
        data[i] = Math.round((r1 + m) * 255);
        data[i + 1] = Math.round((g1 + m) * 255);
        data[i + 2] = Math.round((b1 + m) * 255);
        data[i + 3] = 120; // Semi-transparent
      } else {
        data[i + 3] = 0; // Transparent
      }
    }
    
    offCtx.putImageData(imageData, 0, 0);
    
    // Draw the metaball canvas onto the main canvas
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(offCanvas, 0, 0);
    
    // Add some noise texture
    addNoiseTexture(ctx);
    
    // Add glow effect
    ctx.globalCompositeOperation = 'screen';
    ctx.filter = 'blur(8px)';
    ctx.globalAlpha = 0.3;
    ctx.drawImage(offCanvas, 0, 0);
    ctx.filter = 'none';
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };
  
  // Add noise texture to the canvas
  const addNoiseTexture = (ctx: CanvasRenderingContext2D) => {
    const imageData = ctx.getImageData(0, 0, dimensions.width, dimensions.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Only add noise to non-transparent pixels
      if (data[i + 3] > 0) {
        const noise = (Math.random() - 0.5) * 10;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };
  
  // Animation for container
  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        transition: { duration: 0.8, ease: "easeOut" }
      });
    } else {
      controls.start({ opacity: 0 });
    }
  }, [isInView, controls]);
  
  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden z-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={controls}
    >
      <canvas