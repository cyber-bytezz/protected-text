\"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import { Lock, Shield, Key, FileText, Database, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from 'next-themes';
import { useFrame } from '@react-three/fiber';
import { Canvas, ShaderMaterial, Mesh } from '@react-three/fiber';
import * as THREE from 'three';
import quantumFieldShader from './shaders/quantumField.frag';

// Define particle types for different visualization effects
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
  targetX?: number;
  targetY?: number;
  targetZ?: number;
  phase: number;
  noiseX: number;
  noiseY: number;
  quantumState: number;
  colorPhase: number;
}

interface DataPacket {
  id: number;
  progress: number;
  size: number;
  color: string;
  speed: number;
  path: 'encrypt' | 'transmit' | 'store';
}

export default function AdvancedEncryptionVisualizer() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [password, setPassword] = useState("password123");
  const [plaintext, setPlaintext] = useState("My secret note");
  const [ciphertext, setCiphertext] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dataPackets, setDataPackets] = useState<DataPacket[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [showExplanation, setShowExplanation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Generate a random ciphertext for visualization
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let encrypted = "";
    for (let i = 0; i < plaintext.length * 4; i++) {
      encrypted += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCiphertext(encrypted);
  }, [plaintext]);

  // Initialize particles and dimensions
  useEffect(() => {
    if (containerRef.current && visualizationRef.current) {
      const { width, height } = visualizationRef.current.getBoundingClientRect();
      setDimensions({ width, height });
      
      // Create particles
      const newParticles: Particle[] = [];
      const particleCount = Math.min(Math.floor((width * height) / 8000), 100);
      
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
          rotationZ: Math.random() * 360,
          phase: Math.random() * Math.PI * 2
        });
      }
      
      setParticles(newParticles);
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (visualizationRef.current) {
        const { width, height } = visualizationRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle mouse movement for interactive particles
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (visualizationRef.current) {
        const rect = visualizationRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        
        // Update rotation based on mouse position
        setRotation({
          x: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
          y: ((e.clientX - rect.left) / rect.width - 0.5) * 20
        });
      }
    };

    const container = visualizationRef.current;
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

  // Auto-play animation
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        if (step < 4) {
          setStep(step + 1);
        } else {
          setStep(0);
          setIsPlaying(false);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, isPlaying]);

  // Animate particles
  useEffect(() => {
    if (!isInView) return;

    const animateParticles = () => {
      setParticles(prevParticles => {
        return prevParticles.map(particle => {
          // Basic movement with sine wave pattern
          let x = particle.x + Math.sin(Date.now() * 0.001 * particle.speed + particle.phase) * 0.8;
          let y = particle.y + Math.cos(Date.now() * 0.001 * particle.speed + particle.phase) * 0.8;
          let z = particle.z + Math.sin(Date.now() * 0.0005 * particle.speed + particle.phase) * 0.5;
          
          // Step-specific behavior
          if (step === 2) { // Encryption step - particles converge
            const centerX = dimensions.width / 2;
            const centerY = dimensions.height / 2;
            const dx = centerX - x;
            const dy = centerY - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = Math.max(dimensions.width, dimensions.height) * 0.4;
            
            if (distance < maxDistance) {
              const force = (1 - distance / maxDistance) * 0.02;
              x += dx * force;
              y += dy * force;
              z += 5 * force;
            }
          } else if (step === 3) { // Transmission step - particles flow right
            x += particle.speed * 0.5;
            if (x > dimensions.width) {
              x = 0;
            }
          }
          
          // Mouse interaction
          if (isHovering) {
            const dx = mousePosition.x - x;
            const dy = mousePosition.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 150;
            
            if (distance < maxDistance) {
              const force = (1 - distance / maxDistance) * 1.5;
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
          if (z < -100) z = 100;
          if (z > 100) z = -100;
          
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
      
      // Animate data packets during encryption and transmission
      if (step === 2 || step === 3) {
        // Occasionally add new data packets
        if (Math.random() < 0.05 && dataPackets.length < 20) {
          setDataPackets(prev => [
            ...prev,
            {
              id: Date.now(),
              progress: 0,
              size: Math.random() * 8 + 4,
              color: getRandomColor(),
              speed: Math.random() * 0.01 + 0.005,
              path: step === 2 ? 'encrypt' : 'transmit'
            }
          ]);
        }
        
        // Update existing data packets
        setDataPackets(prev => 
          prev
            .map(packet => ({
              ...packet,
              progress: packet.progress + packet.speed
            }))
            .filter(packet => packet.progress < 1) // Remove completed packets
        );
      } else if (step === 4) { // Storage step
        // Occasionally add new data packets going to storage
        if (Math.random() < 0.03 && dataPackets.length < 15) {
          setDataPackets(prev => [
            ...prev,
            {
              id: Date.now(),
              progress: 0,
              size: Math.random() * 6 + 3,
              color: getRandomColor(),
              speed: Math.random() * 0.008 + 0.003,
              path: 'store'
            }
          ]);
        }
        
        // Update existing data packets
        setDataPackets(prev => 
          prev
            .map(packet => ({
              ...packet,
              progress: packet.progress + packet.speed
            }))
            .filter(packet => packet.progress < 1) // Remove completed packets
        );
      } else {
        // Clear data packets for other steps
        if (dataPackets.length > 0) {
          setDataPackets([]);
        }
      }
      
      requestAnimationFrame(animateParticles);
    };
    
    const animationId = requestAnimationFrame(animateParticles);
    return () => cancelAnimationFrame(animationId);
  }, [isInView, isHovering, mousePosition, dimensions, step, dataPackets.length]);

  const startAnimation = () => {
    setStep(0);
    setIsPlaying(true);
    setManualMode(false);
  };

  const handleStepClick = (index: number) => {
    if (!isPlaying) {
      setStep(index);
      setManualMode(true);
    }
  };
  
  const handleStepHover = (index: number | null) => {
    setHoveredStep(index);
  };

  const steps = [
    {
      title: "Your Note",
      description: "Start with your plain text note",
      icon: FileText,
      color: "bg-blue-500",
      detailedExplanation: "Your note begins as plain text that you can read and edit. At this stage, it's not yet protected."
    },
    {
      title: "Your Password",
      description: "Enter your secure password",
      icon: Key,
      color: "bg-yellow-500",
      detailedExplanation: "Your password is the key to encrypting and decrypting your note. It never leaves your device and is not stored anywhere."
    },
    {
      title: "Encryption",
      description: "Your note is encrypted locally",
      icon: Lock,
      color: "bg-purple-500",
      detailedExplanation: "Using AES-256 encryption, your note is transformed into unreadable ciphertext right on your device before being sent anywhere."
    },
    {
      title: "Transmission",
      description: "Encrypted data is sent to server",
      icon: Shield,
      color: "bg-green-500",
      detailedExplanation: "Only after encryption is complete does your data travel over the internet. Even if intercepted, it cannot be read without your password."
    },
    {
      title: "Secure Storage",
      description: "Only encrypted data is stored",
      icon: Database,
      color: "bg-red-500",
      detailedExplanation: "Our servers only store the encrypted version of your note. Without your password, no one (not even us) can access your original content."
    }
  ];

  // Helper function to get random color
  const getRandomColor = () => {
    const hue = Math.sin(Date.now() * 0.0001) * 360;
    const saturation = 70 + Math.random() * 30;
    const lightness = 40 + Math.random() * 20;
    return `hsl(${hue},${saturation}%,${lightness}%)`;
  };
  let x = particle.x + (noise.simplex3(particle.noiseX, particle.noiseY, Date.now()*0.0001) * 2);
  let y = particle.y + (noise.simplex3(particle.noiseY, particle.noiseX, Date.now()*0.0001) * 2);
  particle.noiseX += 0.01;
  particle.noiseY += 0.01;
  particle.color = `hsl(${(particle.colorPhase + Date.now()*0.1) % 360},${70 + Math.sin(particle.phase)*30}%,${50 + Math.cos(particle.quantumState)*20}%)`;
  if(Math.random() < 0.002) {
    particle.quantumState = (particle.quantumState + 1) % 2;
    particle.z = particle.quantumState === 0 ? particle.z + 50 : particle.z - 50;
  }
}
  
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

// Animate data packets during encryption and transmission
if (step === 2 || step === 3) {
  // Occasionally add new data packets
  if (Math.random() < 0.05 && dataPackets.length < 20) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 8 + 4,
        color: getRandomColor(),
        speed: Math.random() * 0.01 + 0.005,
        path: step === 2 ? 'encrypt' : 'transmit'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else if (step === 4) { // Storage step
  // Occasionally add new data packets going to storage
  if (Math.random() < 0.03 && dataPackets.length < 15) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 6 + 3,
        color: getRandomColor(),
        speed: Math.random() * 0.008 + 0.003,
        path: 'store'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else {
  // Clear data packets for other steps
  if (dataPackets.length > 0) {
    setDataPackets([]);
  }
}

requestAnimationFrame(animateParticles);
};

const animationId = requestAnimationFrame(animateParticles);
return () => cancelAnimationFrame(animationId);
}, [isInView, isHovering, mousePosition, dimensions, step, dataPackets.length]);

const startAnimation = () => {
setStep(0);
setIsPlaying(true);
setManualMode(false);
};

const handleStepClick = (index: number) => {
if (!isPlaying) {
setStep(index);
setManualMode(true);
}
};

const handleStepHover = (index: number | null) => {
setHoveredStep(index);
};

const steps = [
{
title: "Your Note",
description: "Start with your plain text note",
icon: FileText,
color: "bg-blue-500",
detailedExplanation: "Your note begins as plain text that you can read and edit. At this stage, it's not yet protected."
},
{
title: "Your Password",
description: "Enter your secure password",
icon: Key,
color: "bg-yellow-500",
detailedExplanation: "Your password is the key to encrypting and decrypting your note. It never leaves your device and is not stored anywhere."
},
{
title: "Encryption",
description: "Your note is encrypted locally",
icon: Lock,
color: "bg-purple-500",
detailedExplanation: "Using AES-256 encryption, your note is transformed into unreadable ciphertext right on your device before being sent anywhere."
},
{
title: "Transmission",
description: "Encrypted data is sent to server",
icon: Shield,
color: "bg-green-500",
detailedExplanation: "Only after encryption is complete does your data travel over the internet. Even if intercepted, it cannot be read without your password."
},
{
title: "Secure Storage",
description: "Only encrypted data is stored",
icon: Database,
color: "bg-red-500",
detailedExplanation: "Our servers only store the encrypted version of your note. Without your password, no one (not even us) can access your original content."
}
];

// Helper function to get random color
const getRandomColor = () => {
const hue = Math.sin(Date.now() * 0.0001) * 360;
const saturation = 70 + Math.random() * 30;
const lightness = 40 + Math.random() * 20;
return `hsl(${hue},${saturation}%,${lightness}%)`;
};
  let x = particle.x + (noise.simplex3(particle.noiseX, particle.noiseY, Date.now()*0.0001) * 2);
  let y = particle.y + (noise.simplex3(particle.noiseY, particle.noiseX, Date.now()*0.0001) * 2);
  particle.noiseX += 0.01;
  particle.noiseY += 0.01;
  particle.color = `hsl(${(particle.colorPhase + Date.now()*0.1) % 360},${70 + Math.sin(particle.phase)*30}%,${50 + Math.cos(particle.quantumState)*20}%)`;
  if(Math.random() < 0.002) {
    particle.quantumState = (particle.quantumState + 1) % 2;
    particle.z = particle.quantumState === 0 ? particle.z + 50 : particle.z - 50;
  }
}
  
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

// Animate data packets during encryption and transmission
if (step === 2 || step === 3) {
  // Occasionally add new data packets
  if (Math.random() < 0.05 && dataPackets.length < 20) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 8 + 4,
        color: getRandomColor(),
        speed: Math.random() * 0.01 + 0.005,
        path: step === 2 ? 'encrypt' : 'transmit'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else if (step === 4) { // Storage step
  // Occasionally add new data packets going to storage
  if (Math.random() < 0.03 && dataPackets.length < 15) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 6 + 3,
        color: getRandomColor(),
        speed: Math.random() * 0.008 + 0.003,
        path: 'store'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else {
  // Clear data packets for other steps
  if (dataPackets.length > 0) {
    setDataPackets([]);
  }
}

requestAnimationFrame(animateParticles);
};

const animationId = requestAnimationFrame(animateParticles);
return () => cancelAnimationFrame(animationId);
}, [isInView, isHovering, mousePosition, dimensions, step, dataPackets.length]);

const startAnimation = () => {
setStep(0);
setIsPlaying(true);
setManualMode(false);
};

const handleStepClick = (index: number) => {
if (!isPlaying) {
setStep(index);
setManualMode(true);
}
};

const handleStepHover = (index: number | null) => {
setHoveredStep(index);
};

const steps = [
{
title: "Your Note",
description: "Start with your plain text note",
icon: FileText,
color: "bg-blue-500",
detailedExplanation: "Your note begins as plain text that you can read and edit. At this stage, it's not yet protected."
},
{
title: "Your Password",
description: "Enter your secure password",
icon: Key,
color: "bg-yellow-500",
detailedExplanation: "Your password is the key to encrypting and decrypting your note. It never leaves your device and is not stored anywhere."
},
{
title: "Encryption",
description: "Your note is encrypted locally",
icon: Lock,
color: "bg-purple-500",
detailedExplanation: "Using AES-256 encryption, your note is transformed into unreadable ciphertext right on your device before being sent anywhere."
},
{
title: "Transmission",
description: "Encrypted data is sent to server",
icon: Shield,
color: "bg-green-500",
detailedExplanation: "Only after encryption is complete does your data travel over the internet. Even if intercepted, it cannot be read without your password."
},
{
title: "Secure Storage",
description: "Only encrypted data is stored",
icon: Database,
color: "bg-red-500",
detailedExplanation: "Our servers only store the encrypted version of your note. Without your password, no one (not even us) can access your original content."
}
];

// Helper function to get random color
const getRandomColor = () => {
const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981
useFrame((state) => {
  const material = visualizationRef.current?.material as ShaderMaterial;
  if(material) {
    material.uniforms.time.value = state.clock.getElapsedTime();
    material.uniforms.mouse.value.set(
      mousePosition.x / dimensions.width,
      1 - mousePosition.y / dimensions.height
    );
  }
});

{showExplanation && (
  <Canvas
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
      opacity: 0.3
    }}
  >
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        args={[{
          uniforms: {
            time: { value: 0 },
            mouse: { value: new THREE.Vector2() }
          },
          fragmentShader: quantumFieldShader
        }]}
      />
    </mesh>
  </Canvas>
)}
  let x = particle.x + (noise.simplex3(particle.noiseX, particle.noiseY, Date.now()*0.0001) * 2);
  let y = particle.y + (noise.simplex3(particle.noiseY, particle.noiseX, Date.now()*0.0001) * 2);
  particle.noiseX += 0.01;
  particle.noiseY += 0.01;
  particle.color = `hsl(${(particle.colorPhase + Date.now()*0.1) % 360},${70 + Math.sin(particle.phase)*30}%,${50 + Math.cos(particle.quantumState)*20}%)`;
  if(Math.random() < 0.002) {
    particle.quantumState = (particle.quantumState + 1) % 2;
    particle.z = particle.quantumState === 0 ? particle.z + 50 : particle.z - 50;
  }
}
  
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

// Animate data packets during encryption and transmission
if (step === 2 || step === 3) {
  // Occasionally add new data packets
  if (Math.random() < 0.05 && dataPackets.length < 20) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 8 + 4,
        color: getRandomColor(),
        speed: Math.random() * 0.01 + 0.005,
        path: step === 2 ? 'encrypt' : 'transmit'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else if (step === 4) { // Storage step
  // Occasionally add new data packets going to storage
  if (Math.random() < 0.03 && dataPackets.length < 15) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 6 + 3,
        color: getRandomColor(),
        speed: Math.random() * 0.008 + 0.003,
        path: 'store'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else {
  // Clear data packets for other steps
  if (dataPackets.length > 0) {
    setDataPackets([]);
  }
}

requestAnimationFrame(animateParticles);
};

const animationId = requestAnimationFrame(animateParticles);
return () => cancelAnimationFrame(animationId);
}, [isInView, isHovering, mousePosition, dimensions, step, dataPackets.length]);

const startAnimation = () => {
setStep(0);
setIsPlaying(true);
setManualMode(false);
};

const handleStepClick = (index: number) => {
if (!isPlaying) {
setStep(index);
setManualMode(true);
}
};

const handleStepHover = (index: number | null) => {
setHoveredStep(index);
};

const steps = [
{
title: "Your Note",
description: "Start with your plain text note",
icon: FileText,
color: "bg-blue-500",
detailedExplanation: "Your note begins as plain text that you can read and edit. At this stage, it's not yet protected."
},
{
title: "Your Password",
description: "Enter your secure password",
icon: Key,
color: "bg-yellow-500",
detailedExplanation: "Your password is the key to encrypting and decrypting your note. It never leaves your device and is not stored anywhere."
},
{
title: "Encryption",
description: "Your note is encrypted locally",
icon: Lock,
color: "bg-purple-500",
detailedExplanation: "Using AES-256 encryption, your note is transformed into unreadable ciphertext right on your device before being sent anywhere."
},
{
title: "Transmission",
description: "Encrypted data is sent to server",
icon: Shield,
color: "bg-green-500",
detailedExplanation: "Only after encryption is complete does your data travel over the internet. Even if intercepted, it cannot be read without your password."
},
{
title: "Secure Storage",
description: "Only encrypted data is stored",
icon: Database,
color: "bg-red-500",
detailedExplanation: "Our servers only store the encrypted version of your note. Without your password, no one (not even us) can access your original content."
}
];

// Helper function to get random color
const getRandomColor = () => {
const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981
useFrame((state) => {
  const material = visualizationRef.current?.material as ShaderMaterial;
  if(material) {
    material.uniforms.time.value = state.clock.getElapsedTime();
    material.uniforms.mouse.value.set(
      mousePosition.x / dimensions.width,
      1 - mousePosition.y / dimensions.height
    );
  }
});
  let x = particle.x + (noise.simplex3(particle.noiseX, particle.noiseY, Date.now()*0.0001) * 2);
  let y = particle.y + (noise.simplex3(particle.noiseY, particle.noiseX, Date.now()*0.0001) * 2);
  particle.noiseX += 0.01;
  particle.noiseY += 0.01;
  particle.color = `hsl(${(particle.colorPhase + Date.now()*0.1) % 360},${70 + Math.sin(particle.phase)*30}%,${50 + Math.cos(particle.quantumState)*20}%)`;
  if(Math.random() < 0.002) {
    particle.quantumState = (particle.quantumState + 1) % 2;
    particle.z = particle.quantumState === 0 ? particle.z + 50 : particle.z - 50;
  }
}
  
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

// Animate data packets during encryption and transmission
if (step === 2 || step === 3) {
  // Occasionally add new data packets
  if (Math.random() < 0.05 && dataPackets.length < 20) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 8 + 4,
        color: getRandomColor(),
        speed: Math.random() * 0.01 + 0.005,
        path: step === 2 ? 'encrypt' : 'transmit'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else if (step === 4) { // Storage step
  // Occasionally add new data packets going to storage
  if (Math.random() < 0.03 && dataPackets.length < 15) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 6 + 3,
        color: getRandomColor(),
        speed: Math.random() * 0.008 + 0.003,
        path: 'store'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else {
  // Clear data packets for other steps
  if (dataPackets.length > 0) {
    setDataPackets([]);
  }
}

requestAnimationFrame(animateParticles);
};

const animationId = requestAnimationFrame(animateParticles);
return () => cancelAnimationFrame(animationId);
}, [isInView, isHovering, mousePosition, dimensions, step, dataPackets.length]);

const startAnimation = () => {
setStep(0);
setIsPlaying(true);
setManualMode(false);
};

const handleStepClick = (index: number) => {
if (!isPlaying) {
setStep(index);
setManualMode(true);
}
};

const handleStepHover = (index: number | null) => {
setHoveredStep(index);
};

const steps = [
{
title: "Your Note",
description: "Start with your plain text note",
icon: FileText,
color: "bg-blue-500",
detailedExplanation: "Your note begins as plain text that you can read and edit. At this stage, it's not yet protected."
},
{
title: "Your Password",
description: "Enter your secure password",
icon: Key,
color: "bg-yellow-500",
detailedExplanation: "Your password is the key to encrypting and decrypting your note. It never leaves your device and is not stored anywhere."
},
{
title: "Encryption",
description: "Your note is encrypted locally",
icon: Lock,
color: "bg-purple-500",
detailedExplanation: "Using AES-256 encryption, your note is transformed into unreadable ciphertext right on your device before being sent anywhere."
},
{
title: "Transmission",
description: "Encrypted data is sent to server",
icon: Shield,
color: "bg-green-500",
detailedExplanation: "Only after encryption is complete does your data travel over the internet. Even if intercepted, it cannot be read without your password."
},
{
title: "Secure Storage",
description: "Only encrypted data is stored",
icon: Database,
color: "bg-red-500",
detailedExplanation: "Our servers only store the encrypted version of your note. Without your password, no one (not even us) can access your original content."
}
];

// Helper function to get random color
const getRandomColor = () => {
const hue = Math.sin(Date.now() * 0.0001) * 360;
const saturation = 70 + Math.random() * 30;
const lightness = 40 + Math.random() * 20;
return `hsl(${hue},${saturation}%,${lightness}%)`;
};
  let x = particle.x + (noise.simplex3(particle.noiseX, particle.noiseY, Date.now()*0.0001) * 2);
  let y = particle.y + (noise.simplex3(particle.noiseY, particle.noiseX, Date.now()*0.0001) * 2);
  particle.noiseX += 0.01;
  particle.noiseY += 0.01;
  particle.color = `hsl(${(particle.colorPhase + Date.now()*0.1) % 360},${70 + Math.sin(particle.phase)*30}%,${50 + Math.cos(particle.quantumState)*20}%)`;
  if(Math.random() < 0.002) {
    particle.quantumState = (particle.quantumState + 1) % 2;
    particle.z = particle.quantumState === 0 ? particle.z + 50 : particle.z - 50;
  }
}
  
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

// Animate data packets during encryption and transmission
if (step === 2 || step === 3) {
  // Occasionally add new data packets
  if (Math.random() < 0.05 && dataPackets.length < 20) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 8 + 4,
        color: getRandomColor(),
        speed: Math.random() * 0.01 + 0.005,
        path: step === 2 ? 'encrypt' : 'transmit'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else if (step === 4) { // Storage step
  // Occasionally add new data packets going to storage
  if (Math.random() < 0.03 && dataPackets.length < 15) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 6 + 3,
        color: getRandomColor(),
        speed: Math.random() * 0.008 + 0.003,
        path: 'store'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else {
  // Clear data packets for other steps
  if (dataPackets.length > 0) {
    setDataPackets([]);
  }
}

requestAnimationFrame(animateParticles);
};

const animationId = requestAnimationFrame(animateParticles);
return () => cancelAnimationFrame(animationId);
}, [isInView, isHovering, mousePosition, dimensions, step, dataPackets.length]);

const startAnimation = () => {
setStep(0);
setIsPlaying(true);
setManualMode(false);
};

const handleStepClick = (index: number) => {
if (!isPlaying) {
setStep(index);
setManualMode(true);
}
};

const handleStepHover = (index: number | null) => {
setHoveredStep(index);
};

const steps = [
{
title: "Your Note",
description: "Start with your plain text note",
icon: FileText,
color: "bg-blue-500",
detailedExplanation: "Your note begins as plain text that you can read and edit. At this stage, it's not yet protected."
},
{
title: "Your Password",
description: "Enter your secure password",
icon: Key,
color: "bg-yellow-500",
detailedExplanation: "Your password is the key to encrypting and decrypting your note. It never leaves your device and is not stored anywhere."
},
{
title: "Encryption",
description: "Your note is encrypted locally",
icon: Lock,
color: "bg-purple-500",
detailedExplanation: "Using AES-256 encryption, your note is transformed into unreadable ciphertext right on your device before being sent anywhere."
},
{
title: "Transmission",
description: "Encrypted data is sent to server",
icon: Shield,
color: "bg-green-500",
detailedExplanation: "Only after encryption is complete does your data travel over the internet. Even if intercepted, it cannot be read without your password."
},
{
title: "Secure Storage",
description: "Only encrypted data is stored",
icon: Database,
color: "bg-red-500",
detailedExplanation: "Our servers only store the encrypted version of your note. Without your password, no one (not even us) can access your original content."
}
];

// Helper function to get random color
const getRandomColor = () => {
const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981
useFrame((state) => {
  const material = visualizationRef.current?.material as ShaderMaterial;
  if(material) {
    material.uniforms.time.value = state.clock.getElapsedTime();
    material.uniforms.mouse.value.set(
      mousePosition.x / dimensions.width,
      1 - mousePosition.y / dimensions.height
    );
  }
});
  let x = particle.x + (noise.simplex3(particle.noiseX, particle.noiseY, Date.now()*0.0001) * 2);
  let y = particle.y + (noise.simplex3(particle.noiseY, particle.noiseX, Date.now()*0.0001) * 2);
  particle.noiseX += 0.01;
  particle.noiseY += 0.01;
  particle.color = `hsl(${(particle.colorPhase + Date.now()*0.1) % 360},${70 + Math.sin(particle.phase)*30}%,${50 + Math.cos(particle.quantumState)*20}%)`;
  if(Math.random() < 0.002) {
    particle.quantumState = (particle.quantumState + 1) % 2;
    particle.z = particle.quantumState === 0 ? particle.z + 50 : particle.z - 50;
  }
}
  
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

// Animate data packets during encryption and transmission
if (step === 2 || step === 3) {
  // Occasionally add new data packets
  if (Math.random() < 0.05 && dataPackets.length < 20) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 8 + 4,
        color: getRandomColor(),
        speed: Math.random() * 0.01 + 0.005,
        path: step === 2 ? 'encrypt' : 'transmit'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else if (step === 4) { // Storage step
  // Occasionally add new data packets going to storage
  if (Math.random() < 0.03 && dataPackets.length < 15) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 6 + 3,
        color: getRandomColor(),
        speed: Math.random() * 0.008 + 0.003,
        path: 'store'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else {
  // Clear data packets for other steps
  if (dataPackets.length > 0) {
    setDataPackets([]);
  }
}

requestAnimationFrame(animateParticles);
};

const animationId = requestAnimationFrame(animateParticles);
return () => cancelAnimationFrame(animationId);
}, [isInView, isHovering, mousePosition, dimensions, step, dataPackets.length]);

const startAnimation = () => {
setStep(0);
setIsPlaying(true);
setManualMode(false);
};

const handleStepClick = (index: number) => {
if (!isPlaying) {
setStep(index);
setManualMode(true);
}
};

const handleStepHover = (index: number | null) => {
setHoveredStep(index);
};

const steps = [
{
title: "Your Note",
description: "Start with your plain text note",
icon: FileText,
color: "bg-blue-500",
detailedExplanation: "Your note begins as plain text that you can read and edit. At this stage, it's not yet protected."
},
{
title: "Your Password",
description: "Enter your secure password",
icon: Key,
color: "bg-yellow-500",
detailedExplanation: "Your password is the key to encrypting and decrypting your note. It never leaves your device and is not stored anywhere."
},
{
title: "Encryption",
description: "Your note is encrypted locally",
icon: Lock,
color: "bg-purple-500",
detailedExplanation: "Using AES-256 encryption, your note is transformed into unreadable ciphertext right on your device before being sent anywhere."
},
{
title: "Transmission",
description: "Encrypted data is sent to server",
icon: Shield,
color: "bg-green-500",
detailedExplanation: "Only after encryption is complete does your data travel over the internet. Even if intercepted, it cannot be read without your password."
},
{
title: "Secure Storage",
description: "Only encrypted data is stored",
icon: Database,
color: "bg-red-500",
detailedExplanation: "Our servers only store the encrypted version of your note. Without your password, no one (not even us) can access your original content."
}
];

// Helper function to get random color
const getRandomColor = () => {
const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981
useFrame((state) => {
  const material = visualizationRef.current?.material as ShaderMaterial;
  if(material) {
    material.uniforms.time.value = state.clock.getElapsedTime();
    material.uniforms.mouse.value.set(
      mousePosition.x / dimensions.width,
      1 - mousePosition.y / dimensions.height
    );
  }
});
  let x = particle.x + (noise.simplex3(particle.noiseX, particle.noiseY, Date.now()*0.0001) * 2);
  let y = particle.y + (noise.simplex3(particle.noiseY, particle.noiseX, Date.now()*0.0001) * 2);
  particle.noiseX += 0.01;
  particle.noiseY += 0.01;
  particle.color = `hsl(${(particle.colorPhase + Date.now()*0.1) % 360},${70 + Math.sin(particle.phase)*30}%,${50 + Math.cos(particle.quantumState)*20}%)`;
  if(Math.random() < 0.002) {
    particle.quantumState = (particle.quantumState + 1) % 2;
    particle.z = particle.quantumState === 0 ? particle.z + 50 : particle.z - 50;
  }
}
  
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

// Animate data packets during encryption and transmission
if (step === 2 || step === 3) {
  // Occasionally add new data packets
  if (Math.random() < 0.05 && dataPackets.length < 20) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 8 + 4,
        color: getRandomColor(),
        speed: Math.random() * 0.01 + 0.005,
        path: step === 2 ? 'encrypt' : 'transmit'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else if (step === 4) { // Storage step
  // Occasionally add new data packets going to storage
  if (Math.random() < 0.03 && dataPackets.length < 15) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 6 + 3,
        color: getRandomColor(),
        speed: Math.random() * 0.008 + 0.003,
        path: 'store'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else {
  // Clear data packets for other steps
  if (dataPackets.length > 0) {
    setDataPackets([]);
  }
}

requestAnimationFrame(animateParticles);
};

const animationId = requestAnimationFrame(animateParticles);
return () => cancelAnimationFrame(animationId);
}, [isInView, isHovering, mousePosition, dimensions, step, dataPackets.length]);

const startAnimation = () => {
setStep(0);
setIsPlaying(true);
setManualMode(false);
};

const handleStepClick = (index: number) => {
if (!isPlaying) {
setStep(index);
setManualMode(true);
}
};

const handleStepHover = (index: number | null) => {
setHoveredStep(index);
};

const steps = [
{
title: "Your Note",
description: "Start with your plain text note",
icon: FileText,
color: "bg-blue-500",
detailedExplanation: "Your note begins as plain text that you can read and edit. At this stage, it's not yet protected."
},
{
title: "Your Password",
description: "Enter your secure password",
icon: Key,
color: "bg-yellow-500",
detailedExplanation: "Your password is the key to encrypting and decrypting your note. It never leaves your device and is not stored anywhere."
},
{
title: "Encryption",
description: "Your note is encrypted locally",
icon: Lock,
color: "bg-purple-500",
detailedExplanation: "Using AES-256 encryption, your note is transformed into unreadable ciphertext right on your device before being sent anywhere."
},
{
title: "Transmission",
description: "Encrypted data is sent to server",
icon: Shield,
color: "bg-green-500",
detailedExplanation: "Only after encryption is complete does your data travel over the internet. Even if intercepted, it cannot be read without your password."
},
{
title: "Secure Storage",
description: "Only encrypted data is stored",
icon: Database,
color: "bg-red-500",
detailedExplanation: "Our servers only store the encrypted version of your note. Without your password, no one (not even us) can access your original content."
}
];

// Helper function to get random color
const getRandomColor = () => {
const hue = Math.sin(Date.now() * 0.0001) * 360;
const saturation = 70 + Math.random() * 30;
const lightness = 40 + Math.random() * 20;
return `hsl(${hue},${saturation}%,${lightness}%)`;
};
  let x = particle.x + (noise.simplex3(particle.noiseX, particle.noiseY, Date.now()*0.0001) * 2);
  let y = particle.y + (noise.simplex3(particle.noiseY, particle.noiseX, Date.now()*0.0001) * 2);
  particle.noiseX += 0.01;
  particle.noiseY += 0.01;
  particle.color = `hsl(${(particle.colorPhase + Date.now()*0.1) % 360},${70 + Math.sin(particle.phase)*30}%,${50 + Math.cos(particle.quantumState)*20}%)`;
  if(Math.random() < 0.002) {
    particle.quantumState = (particle.quantumState + 1) % 2;
    particle.z = particle.quantumState === 0 ? particle.z + 50 : particle.z - 50;
  }
}
  
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

// Animate data packets during encryption and transmission
if (step === 2 || step === 3) {
  // Occasionally add new data packets
  if (Math.random() < 0.05 && dataPackets.length < 20) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 8 + 4,
        color: getRandomColor(),
        speed: Math.random() * 0.01 + 0.005,
        path: step === 2 ? 'encrypt' : 'transmit'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else if (step === 4) { // Storage step
  // Occasionally add new data packets going to storage
  if (Math.random() < 0.03 && dataPackets.length < 15) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 6 + 3,
        color: getRandomColor(),
        speed: Math.random() * 0.008 + 0.003,
        path: 'store'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else {
  // Clear data packets for other steps
  if (dataPackets.length > 0) {
    setDataPackets([]);
  }
}

requestAnimationFrame(animateParticles);
};

const animationId = requestAnimationFrame(animateParticles);
return () => cancelAnimationFrame(animationId);
}, [isInView, isHovering, mousePosition, dimensions, step, dataPackets.length]);

const startAnimation = () => {
setStep(0);
setIsPlaying(true);
setManualMode(false);
};

const handleStepClick = (index: number) => {
if (!isPlaying) {
setStep(index);
setManualMode(true);
}
};

const handleStepHover = (index: number | null) => {
setHoveredStep(index);
};

const steps = [
{
title: "Your Note",
description: "Start with your plain text note",
icon: FileText,
color: "bg-blue-500",
detailedExplanation: "Your note begins as plain text that you can read and edit. At this stage, it's not yet protected."
},
{
title: "Your Password",
description: "Enter your secure password",
icon: Key,
color: "bg-yellow-500",
detailedExplanation: "Your password is the key to encrypting and decrypting your note. It never leaves your device and is not stored anywhere."
},
{
title: "Encryption",
description: "Your note is encrypted locally",
icon: Lock,
color: "bg-purple-500",
detailedExplanation: "Using AES-256 encryption, your note is transformed into unreadable ciphertext right on your device before being sent anywhere."
},
{
title: "Transmission",
description: "Encrypted data is sent to server",
icon: Shield,
color: "bg-green-500",
detailedExplanation: "Only after encryption is complete does your data travel over the internet. Even if intercepted, it cannot be read without your password."
},
{
title: "Secure Storage",
description: "Only encrypted data is stored",
icon: Database,
color: "bg-red-500",
detailedExplanation: "Our servers only store the encrypted version of your note. Without your password, no one (not even us) can access your original content."
}
];

// Helper function to get random color
const getRandomColor = () => {
const hue = Math.sin(Date.now() * 0.0001) * 360;
const saturation = 70 + Math.random() * 30;
const lightness = 40 + Math.random() * 20;
return `hsl(${hue},${saturation}%,${lightness}%)`;
};
  let x = particle.x + (noise.simplex3(particle.noiseX, particle.noiseY, Date.now()*0.0001) * 2);
  let y = particle.y + (noise.simplex3(particle.noiseY, particle.noiseX, Date.now()*0.0001) * 2);
  particle.noiseX += 0.01;
  particle.noiseY += 0.01;
  particle.color = `hsl(${(particle.colorPhase + Date.now()*0.1) % 360},${70 + Math.sin(particle.phase)*30}%,${50 + Math.cos(particle.quantumState)*20}%)`;
  if(Math.random() < 0.002) {
    particle.quantumState = (particle.quantumState + 1) % 2;
    particle.z = particle.quantumState === 0 ? particle.z + 50 : particle.z - 50;
  }
}
  
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

// Animate data packets during encryption and transmission
if (step === 2 || step === 3) {
  // Occasionally add new data packets
  if (Math.random() < 0.05 && dataPackets.length < 20) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 8 + 4,
        color: getRandomColor(),
        speed: Math.random() * 0.01 + 0.005,
        path: step === 2 ? 'encrypt' : 'transmit'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else if (step === 4) { // Storage step
  // Occasionally add new data packets going to storage
  if (Math.random() < 0.03 && dataPackets.length < 15) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 6 + 3,
        color: getRandomColor(),
        speed: Math.random() * 0.008 + 0.003,
        path: 'store'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else {
  // Clear data packets for other steps
  if (dataPackets.length > 0) {
    setDataPackets([]);
  }
}

requestAnimationFrame(animateParticles);
};

const animationId = requestAnimationFrame(animateParticles);
return () => cancelAnimationFrame(animationId);
}, [isInView, isHovering, mousePosition, dimensions, step, dataPackets.length]);

const startAnimation = () => {
setStep(0);
setIsPlaying(true);
setManualMode(false);
};

const handleStepClick = (index: number) => {
if (!isPlaying) {
setStep(index);
setManualMode(true);
}
};

const handleStepHover = (index: number | null) => {
setHoveredStep(index);
};

const steps = [
{
title: "Your Note",
description: "Start with your plain text note",
icon: FileText,
color: "bg-blue-500",
detailedExplanation: "Your note begins as plain text that you can read and edit. At this stage, it's not yet protected."
},
{
title: "Your Password",
description: "Enter your secure password",
icon: Key,
color: "bg-yellow-500",
detailedExplanation: "Your password is the key to encrypting and decrypting your note. It never leaves your device and is not stored anywhere."
},
{
title: "Encryption",
description: "Your note is encrypted locally",
icon: Lock,
color: "bg-purple-500",
detailedExplanation: "Using AES-256 encryption, your note is transformed into unreadable ciphertext right on your device before being sent anywhere."
},
{
title: "Transmission",
description: "Encrypted data is sent to server",
icon: Shield,
color: "bg-green-500",
detailedExplanation: "Only after encryption is complete does your data travel over the internet. Even if intercepted, it cannot be read without your password."
},
{
title: "Secure Storage",
description: "Only encrypted data is stored",
icon: Database,
color: "bg-red-500",
detailedExplanation: "Our servers only store the encrypted version of your note. Without your password, no one (not even us) can access your original content."
}
];

// Helper function to get random color
const getRandomColor = () => {
const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981
useFrame((state) => {
  const material = visualizationRef.current?.material as ShaderMaterial;
  if(material) {
    material.uniforms.time.value = state.clock.getElapsedTime();
    material.uniforms.mouse.value.set(
      mousePosition.x / dimensions.width,
      1 - mousePosition.y / dimensions.height
    );
  }
});
  let x = particle.x + (noise.simplex3(particle.noiseX, particle.noiseY, Date.now()*0.0001) * 2);
  let y = particle.y + (noise.simplex3(particle.noiseY, particle.noiseX, Date.now()*0.0001) * 2);
  particle.noiseX += 0.01;
  particle.noiseY += 0.01;
  particle.color = `hsl(${(particle.colorPhase + Date.now()*0.1) % 360},${70 + Math.sin(particle.phase)*30}%,${50 + Math.cos(particle.quantumState)*20}%)`;
  if(Math.random() < 0.002) {
    particle.quantumState = (particle.quantumState + 1) % 2;
    particle.z = particle.quantumState === 0 ? particle.z + 50 : particle.z - 50;
  }
}
  
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

// Animate data packets during encryption and transmission
if (step === 2 || step === 3) {
  // Occasionally add new data packets
  if (Math.random() < 0.05 && dataPackets.length < 20) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 8 + 4,
        color: getRandomColor(),
        speed: Math.random() * 0.01 + 0.005,
        path: step === 2 ? 'encrypt' : 'transmit'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else if (step === 4) { // Storage step
  // Occasionally add new data packets going to storage
  if (Math.random() < 0.03 && dataPackets.length < 15) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 6 + 3,
        color: getRandomColor(),
        speed: Math.random() * 0.008 + 0.003,
        path: 'store'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else {
  // Clear data packets for other steps
  if (dataPackets.length > 0) {
    setDataPackets([]);
  }
}

requestAnimationFrame(animateParticles);
};

const animationId = requestAnimationFrame(animateParticles);
return () => cancelAnimationFrame(animationId);
}, [isInView, isHovering, mousePosition, dimensions, step, dataPackets.length]);

const startAnimation = () => {
setStep(0);
setIsPlaying(true);
setManualMode(false);
};

const handleStepClick = (index: number) => {
if (!isPlaying) {
setStep(index);
setManualMode(true);
}
};

const handleStepHover = (index: number | null) => {
setHoveredStep(index);
};

const steps = [
{
title: "Your Note",
description: "Start with your plain text note",
icon: FileText,
color: "bg-blue-500",
detailedExplanation: "Your note begins as plain text that you can read and edit. At this stage, it's not yet protected."
},
{
title: "Your Password",
description: "Enter your secure password",
icon: Key,
color: "bg-yellow-500",
detailedExplanation: "Your password is the key to encrypting and decrypting your note. It never leaves your device and is not stored anywhere."
},
{
title: "Encryption",
description: "Your note is encrypted locally",
icon: Lock,
color: "bg-purple-500",
detailedExplanation: "Using AES-256 encryption, your note is transformed into unreadable ciphertext right on your device before being sent anywhere."
},
{
title: "Transmission",
description: "Encrypted data is sent to server",
icon: Shield,
color: "bg-green-500",
detailedExplanation: "Only after encryption is complete does your data travel over the internet. Even if intercepted, it cannot be read without your password."
},
{
title: "Secure Storage",
description: "Only encrypted data is stored",
icon: Database,
color: "bg-red-500",
detailedExplanation: "Our servers only store the encrypted version of your note. Without your password, no one (not even us) can access your original content."
}
];

// Helper function to get random color
const getRandomColor = () => {
const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981
useFrame((state) => {
  const material = visualizationRef.current?.material as ShaderMaterial;
  if(material) {
    material.uniforms.time.value = state.clock.getElapsedTime();
    material.uniforms.mouse.value.set(
      mousePosition.x / dimensions.width,
      1 - mousePosition.y / dimensions.height
    );
  }
});
  let x = particle.x + (noise.simplex3(particle.noiseX, particle.noiseY, Date.now()*0.0001) * 2);
  let y = particle.y + (noise.simplex3(particle.noiseY, particle.noiseX, Date.now()*0.0001) * 2);
  particle.noiseX += 0.01;
  particle.noiseY += 0.01;
  particle.color = `hsl(${(particle.colorPhase + Date.now()*0.1) % 360},${70 + Math.sin(particle.phase)*30}%,${50 + Math.cos(particle.quantumState)*20}%)`;
  if(Math.random() < 0.002) {
    particle.quantumState = (particle.quantumState + 1) % 2;
    particle.z = particle.quantumState === 0 ? particle.z + 50 : particle.z - 50;
  }
}
  
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

// Animate data packets during encryption and transmission
if (step === 2 || step === 3) {
  // Occasionally add new data packets
  if (Math.random() < 0.05 && dataPackets.length < 20) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 8 + 4,
        color: getRandomColor(),
        speed: Math.random() * 0.01 + 0.005,
        path: step === 2 ? 'encrypt' : 'transmit'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else if (step === 4) { // Storage step
  // Occasionally add new data packets going to storage
  if (Math.random() < 0.03 && dataPackets.length < 15) {
    setDataPackets(prev => [
      ...prev,
      {
        id: Date.now(),
        progress: 0,
        size: Math.random() * 6 + 3,
        color: getRandomColor(),
        speed: Math.random() * 0.008 + 0.003,
        path: 'store'
      }
    ]);
  }
  
  // Update existing data packets
  setDataPackets(prev => 
    prev
      .map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed
      }))
      .filter(packet => packet.progress < 1) // Remove completed packets
  );
} else {
  // Clear data packets for other steps
  if (dataPackets.length > 0) {
    setDataPackets([]);
  }
}

requestAnimationFrame(animateParticles);
};

const animationId = requestAnimationFrame(animateParticles);
return () => cancelAnimationFrame(animationId);
}, [isInView, isHovering, mousePosition, dimensions, step, dataPackets.length]);

const startAnimation = () => {
setStep(0);
setIsPlaying(true);
setManualMode(false);
};

const handleStepClick = (index: number) => {
if (!isPlaying) {
setStep