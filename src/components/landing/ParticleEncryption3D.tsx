"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Lock, Shield, Key, FileText, Database } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  opacity: number;
  speed: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
}

export default function ParticleEncryption3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });
  const controls = useAnimation();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [activeIcon, setActiveIcon] = useState<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const icons = [
    { icon: FileText, color: '#3b82f6', label: 'Your Note' },
    { icon: Key, color: '#eab308', label: 'Your Password' },
    { icon: Lock, color: '#8b5cf6', label: 'Encryption' },
    { icon: Shield, color: '#22c55e', label: 'Secure Transfer' },
    { icon: Database, color: '#ef4444', label: 'Encrypted Storage' }
  ];

  // Initialize particles
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
      
      const newParticles: Particle[] = [];
      const particleCount = Math.min(Math.floor((width * height) / 5000), 150);
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random() * 200 - 100,
          size: Math.random() * 4 + 1,
          color: getRandomColor(),
          opacity: Math.random() * 0.5 + 0.1,
          speed: Math.random() * 0.5 + 0.2,
          rotationX: Math.random() * 360,
          rotationY: Math.random() * 360,
          rotationZ: Math.random() * 360
        });
      }
      
      setParticles(newParticles);
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle mouse movement for interactive particles
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

  // Animate particles
  useEffect(() => {
    if (!isInView) return;

    const animateParticles = () => {
      setParticles(prevParticles => {
        return prevParticles.map(particle => {
          // Basic movement
          let x = particle.x + Math.sin(Date.now() * 0.001 * particle.speed) * 0.5;
          let y = particle.y + Math.cos(Date.now() * 0.001 * particle.speed) * 0.5;
          let z = particle.z;
          
          // Mouse interaction
          if (isHovering) {
            const dx = mousePosition.x - particle.x;
            const dy = mousePosition.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 150;
            
            if (distance < maxDistance) {
              const force = (1 - distance / maxDistance) * 2;
              x -= (dx / distance) * force;
              y -= (dy / distance) * force;
              z += force * 10;
            }
          }
          
          // Keep particles within bounds with wrapping
          if (x < 0) x = dimensions.width;
          if (x > dimensions.width) x = 0;
          if (y < 0) y = dimensions.height;
          if (y > dimensions.height) y = 0;
          
          // Rotation for 3D effect
          const rotationX = (particle.rotationX + 0.1 * particle.speed) % 360;
          const rotationY = (particle.rotationY + 0.1 * particle.speed) % 360;
          const rotationZ = (particle.rotationZ + 0.1 * particle.speed) % 360;
          
          return {
            ...particle,
            x,
            y,
            z,
            rotationX,
            rotationY,
            rotationZ
          };
        });
      });
      
      requestAnimationFrame(animateParticles);
    };
    
    const animationId = requestAnimationFrame(animateParticles);
    return () => cancelAnimationFrame(animationId);
  }, [isInView, isHovering, mousePosition, dimensions]);

  // Auto-rotate through icons
  useEffect(() => {
    if (!isInView) return;
    
    const interval = setInterval(() => {
      setActiveIcon(prev => (prev + 1) % icons.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isInView, icons.length]);

  // Animation for container
  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
      });
    } else {
      controls.start({ opacity: 0, y: 50 });
    }
  }, [isInView, controls]);

  // Helper function to get random color
  const getRandomColor = () => {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Calculate 3D perspective for each particle
  const getParticleStyle = (particle: Particle) => {
    const scale = (particle.z + 100) / 200; // Scale based on z position
    const zIndex = Math.floor(particle.z + 100);
    
    return {
      left: `${particle.x}px`,
      top: `${particle.y}px`,
      transform: `scale(${scale}) rotateX(${particle.rotationX}deg) rotateY(${particle.rotationY}deg) rotateZ(${particle.rotationZ}deg)`,
      opacity: particle.opacity * scale,
      zIndex,
      width: `${particle.size}px`,
      height: `${particle.size}px`,
      backgroundColor: particle.color
    };
  };

  return (
    <motion.div 
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative"
      initial={{ opacity: 0, y: 50 }}
      animate={controls}
      ref={containerRef}
    >
      <div className="text-center mb-12 relative z-10">
        <motion.h2 
          className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
          transition={{ duration: 0.6 }}
        >
          Advanced Encryption Visualization
        </motion.h2>
        <motion.p 
          className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Experience our state-of-the-art encryption process in 3D
        </motion.p>
      </div>

      <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl p-6 sm:p-10 max-w-5xl mx-auto border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-sm relative z-10 hover:shadow-2xl transition-all duration-500">
        {/* 3D Particle visualization area */}
        <div 
          className="relative h-80 sm:h-96 mb-8 overflow-hidden rounded-xl bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-4 sm:p-6 shadow-inner border border-gray-200 dark:border-gray-700 group hover:shadow-lg transition-all duration-300"
          style={{ perspective: '1000px' }}
        >
          {/* Particles */}
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={getParticleStyle(particle)}
              initial={{ opacity: 0 }}
              animate={{ opacity: particle.opacity }}
              transition={{ duration: 1 }}
            />
          ))}
          
          {/* Central 3D rotating icon */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="relative"
              animate={{
                rotateY: [0, 360],
                rotateX: [0, 15, 0, -15, 0],
              }}
              transition={{ rotateY: { duration: 20, repeat: Infinity, ease: "linear" }, rotateX: { duration: 10, repeat: Infinity, ease: "easeInOut" } }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {icons.map((iconData, index) => {
                const Icon = iconData.icon;
                const isActive = index === activeIcon;
                const angle = (index / icons.length) * 360;
                
                return (
                  <motion.div
                    key={index}
                    className={`absolute transform ${isActive ? 'scale-150' : 'scale-100'} transition-transform duration-500`}
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(100px)`,
                      transformOrigin: 'center center',
                      color: iconData.color,
                      opacity: isActive ? 1 : 0.5,
                    }}
                    animate={{
                      scale: isActive ? [1, 1.2, 1] : 1,
                      filter: isActive ? ['drop-shadow(0 0 0px transparent)', 'drop-shadow(0 0 15px ' + iconData.color + ')', 'drop-shadow(0 0 0px transparent)'] : 'none'
                    }}
                    transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                  >
                    <Icon size={isActive ? 64 : 48} strokeWidth={1.5} />
                  </motion.div>
                );
              })}
              
              {/* Central sphere */}
              <motion.div 
                className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-sm"
                style={{ 
                  transform: 'translateZ(0px)',
                  boxShadow: 'inset 0 0 20px rgba(255,255,255,0.2), 0 0 30px rgba(59, 130, 246, 0.3)'
                }}
                animate={{
                  boxShadow: [
                    'inset 0 0 20px rgba(255,255,255,0.2), 0 0 30px rgba(59, 130, 246, 0.3)',
                    'inset 0 0 20px rgba(255,255,255,0.2), 0 0 50px rgba(139, 92, 246, 0.5)',
                    'inset 0 0 20px rgba(255,255,255,0.2), 0 0 30px rgba(59, 130, 246, 0.3)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
            
            {/* Active icon label */}
            <motion.div
              className="absolute bottom-8 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: