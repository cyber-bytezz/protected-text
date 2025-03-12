"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  opacity: number;
  rotation: number;
  shape: 'circle' | 'square' | 'triangle' | 'lock' | 'key';
};

const SHAPES = ['circle', 'square', 'triangle', 'lock', 'key'];
const COLORS = [
  'rgba(59, 130, 246, 0.8)', // blue
  'rgba(139, 92, 246, 0.8)',  // purple
  'rgba(236, 72, 153, 0.8)',  // pink
  'rgba(16, 185, 129, 0.8)',  // green
  'rgba(245, 158, 11, 0.8)',  // amber
];

export default function ParticleEncryption() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });
  
  // Initialize particles
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Create particles when dimensions change
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    
    const newParticles: Particle[] = [];
    const particleCount = Math.min(Math.floor(dimensions.width / 10), 100);
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 8 + 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        velocity: {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 1.5,
        },
        opacity: Math.random() * 0.5 + 0.3,
        rotation: Math.random() * 360,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)] as any,
      });
    }
    
    setParticles(newParticles);
  }, [dimensions]);
  
  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || particles.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    
    const render = () => {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Update and draw particles
      const updatedParticles = particles.map(particle => {
        // Update position
        let newX = particle.x + particle.velocity.x;
        let newY = particle.y + particle.velocity.y;
        
        // Bounce off walls
        if (newX < 0 || newX > dimensions.width) {
          particle.velocity.x *= -1;
          newX = particle.x + particle.velocity.x;
        }
        
        if (newY < 0 || newY > dimensions.height) {
          particle.velocity.y *= -1;
          newY = particle.y + particle.velocity.y;
        }
        
        // Apply encryption effect
        if (isEncrypting) {
          // Move particles toward the center during encryption
          const centerX = dimensions.width / 2;
          const centerY = dimensions.height / 2;
          const dx = centerX - newX;
          const dy = centerY - newY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 50) {
            newX += dx * 0.02;
            newY += dy * 0.02;
            
            // Increase velocity during encryption
            particle.velocity.x *= 1.001;
            particle.velocity.y *= 1.001;
            
            // Change color gradually
            if (Math.random() > 0.95) {
              particle.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            }
          }
        }
        
        // Draw the particle
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.translate(newX, newY);
        ctx.rotate((particle.rotation + (isEncrypting ? 5 : 0)) * Math.PI / 180);
        
        // Draw different shapes
        switch (particle.shape) {
          case 'square':
            ctx.fillStyle = particle.color;
            ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            break;
            
          case 'triangle':
            ctx.beginPath();
            ctx.moveTo(0, -particle.size / 2);
            ctx.lineTo(particle.size / 2, particle.size / 2);
            ctx.lineTo(-particle.size / 2, particle.size / 2);
            ctx.closePath();
            ctx.fillStyle = particle.color;
            ctx.fill();
            break;
            
          case 'lock':
            // Simple lock shape
            ctx.beginPath();
            ctx.arc(0, -particle.size / 4, particle.size / 3, 0, Math.PI, true);
            ctx.fillStyle = particle.color;
            ctx.fill();
            ctx.fillRect(-particle.size / 3, -particle.size / 4, particle.size / 1.5, particle.size / 1.5);
            break;
            
          case 'key':
            // Simple key shape
            ctx.beginPath();
            ctx.arc(0, -particle.size / 2, particle.size / 3, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
            ctx.fillRect(-particle.size / 8, -particle.size / 2, particle.size / 4, particle.size);
            ctx.fillRect(0, particle.size / 4, particle.size / 2, particle.size / 8);
            break;
            
          case 'circle':
          default:
            ctx.beginPath();
            ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
            break;
        }
        
        ctx.restore();
        
        // Return updated particle
        return {
          ...particle,
          x: newX,
          y: newY,
          rotation: particle.rotation + (isEncrypting ? 2 : 0.2),
        };
      });
      
      setParticles(updatedParticles);
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [particles, dimensions, isEncrypting]);
  
  // Control animation based on view
  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
      });
      
      // Start encryption animation after a delay
      const timer = setTimeout(() => setIsEncrypting(true), 1000);
      const resetTimer = setTimeout(() => setIsEncrypting(false), 5000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(resetTimer);
      };
    } else {
      controls.start({ opacity: 0, y: 50 });
      setIsEncrypting(false);
    }
  }, [isInView, controls]);
  
  return (
    <motion.div 
      ref={containerRef}
      className="w-full h-[400px] relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800/50 shadow-xl"
      initial={{ opacity: 0, y: 50 }}
      animate={controls}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <canvas 
        ref={canvasRef} 
        width={dimensions.width} 
        height={dimensions.height}
        className="absolute inset-0"
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
        <motion.h3 
          className="text-2xl md:text-3xl font-bold text-white mb-4 text-center"
          animate={{
            textShadow: isHovered ? 
              ['0px 0px 8px rgba(59, 130, 246, 0.7)', '0px 0px 16px rgba(139, 92, 246, 0.7)', '0px 0px 8px rgba(59, 130, 246, 0.7)'] : 
              '0px 0px 0px rgba(0, 0, 0, 0)'
          }}
          transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
        >
          End-to-End Encryption Visualized
        </motion.h3>
        
        <motion.p 
          className="text-gray-300 text-center max-w-md"
          animate={{
            opacity: isEncrypting ? [0.7, 1, 0.7] : 1
          }}
          transition={{ duration: 2, repeat: isEncrypting ? Infinity : 0 }}
        >
          {isEncrypting ? 
            "Encrypting your data with AES-256 before it leaves your device..." : 
            "Your notes are encrypted locally before being stored securely in the cloud."}
        </motion.p>
        
        <motion.button
          className="mt-8 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEncrypting(!isEncrypting)}
        >
          {isEncrypting ? "Stop Encryption" : "Visualize Encryption"}
        </motion.button>
      </div>
    </motion.div>
  );
}