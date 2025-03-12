"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import { Lock, Shield, Key, FileText, Database, RefreshCw, ArrowRight, Sparkles, Code, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from 'next-themes';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

// Helper function to get random color
function getRandomColor() {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981'];
  return colors[Math.floor(Math.random() * colors.length)];
}

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
  lifespan: number;
  age: number;
}

interface DataPacket {
  id: number;
  progress: number;
  size: number;
  color: string;
  speed: number;
  path: 'encrypt' | 'transmit' | 'store';
  pulsePhase: number;
  rotationSpeed: number;
}

// Simple text display using basic THREE.js mesh
function SimpleTextDisplay({ text, position, color, fontSize = 0.5, rotation = [0, 0, 0] }: 
  { text: string; position: [number, number, number]; color: string; fontSize?: number; rotation?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create floating effect manually
  useFrame((state) => {
    if (meshRef.current) {
      // Simple floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      // Gentle rotation
      meshRef.current.rotation.x = rotation[0] + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      meshRef.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
    >
      <boxGeometry args={[text.length * 0.1 * fontSize, fontSize, 0.05]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={2} 
        toneMapped={false} 
      />
    </mesh>
  );
}

// Animated encryption sphere
function EncryptionSphere({ step, color }: { step: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Animate based on current step
    if (step === 2) { // Encryption step
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, 1.2, 0.05);
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, 1.2, 0.05);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, 1.2, 0.05);
    } else {
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, 1.0, 0.05);
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, 1.0, 0.05);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, 1.0, 0.05);
    }
    
    // Rotation
    meshRef.current.rotation.x += 0.003;
    meshRef.current.rotation.y += 0.005;
  });
  
  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color={color}
        envMapIntensity={0.8}
        metalness={0.5}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

// Data packet visualization
function DataPackets({ packets, step }: { packets: DataPacket[]; step: number }) {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!group.current) return;
    
    // Rotate the entire group
    group.current.rotation.y += 0.002;
  });
  
  return (
    <group ref={group}>
      {packets.map((packet) => {
        // Calculate position based on progress and path
        let position: [number, number, number] = [0, 0, 0];
        
        if (packet.path === 'encrypt') {
          // Spiral into the center during encryption
          const angle = packet.progress * Math.PI * 10;
          const radius = 3 * (1 - packet.progress);
          position = [
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            (packet.progress - 0.5) * 4
          ];
        } else if (packet.path === 'transmit') {
          // Move from left to right during transmission
          position = [
            -4 + packet.progress * 8,
            Math.sin(packet.progress * Math.PI * 2) * 1.5,
            Math.cos(packet.progress * Math.PI * 3) * 1.5
          ];
        } else { // 'store'
          // Move to database position
          position = [
            3 - packet.progress * 2,
            -2 + packet.progress * 2,
            1 - packet.progress * 2
          ];
        }
        
        return (
          <mesh
            key={packet.id}
            position={position}
            rotation={[packet.progress * Math.PI * 2, packet.progress * Math.PI * 4, 0]}
          >
            <boxGeometry args={[packet.size * 0.1, packet.size * 0.1, packet.size * 0.1]} />
            <meshStandardMaterial
              color={packet.color}
              emissive={packet.color}
              emissiveIntensity={1 + Math.sin(packet.pulsePhase) * 0.5}
              toneMapped={false}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Add the default export for the component
export default function HyperEncryptionVisualizer() {
  // Component implementation will go here
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [packets, setPackets] = useState<DataPacket[]>([]);
  
  // Initialize data packets
  useEffect(() => {
    const newPackets: DataPacket[] = [];
    for (let i = 0; i < 20; i++) {
      newPackets.push({
        id: i,
        progress: Math.random(),
        size: Math.random() * 2 + 1,
        color: getRandomColor(),
        speed: Math.random() * 0.5 + 0.2,
        path: Math.random() > 0.6 ? 'encrypt' : Math.random() > 0.5 ? 'transmit' : 'store',
        pulsePhase: Math.random() * Math.PI * 2,
        rotationSpeed: Math.random() * 0.02 + 0.01
      });
    }
    setPackets(newPackets);
  }, []);
  
  // Auto-play animation
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        if (step < 4) {
          setStep(step + 1);
        } else {
          setStep(0);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, isPlaying]);
  
  return (
    <div className="w-full h-[500px] relative">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <EncryptionSphere step={step} color="#8b5cf6" />
        <DataPackets packets={packets} step={step} />
        <SimpleTextDisplay 
          text="Encrypted" 
          position={[0, 1.5, 0]} 
          color="#8b5cf6" 
          fontSize={0.3} 
        />
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
          <ChromaticAberration offset={[0.002, 0.002]} />
          <Noise opacity={0.02} />
        </EffectComposer>
      </Canvas>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <Button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isPlaying ? "Pause" : "Play"} Animation
        </Button>
      </div>
    </div>
  );
}