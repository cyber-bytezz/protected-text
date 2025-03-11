\"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import { Lock, Shield, Key, FileText, Database, RefreshCw, ArrowRight, Sparkles, Code, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from 'next-themes';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Text, Environment, Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere } from '@react-three/drei';

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

// 3D Text component with glow effect
function GlowingText({ text, position, color, fontSize = 0.5, rotation = [0, 0, 0] }: 
  { text: string; position: [number, number, number]; color: string; fontSize?: number; rotation?: [number, number, number] }) {
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <Text
        position={position}
        rotation={rotation}
        fontSize={fontSize}
        color={color}
        font="/fonts/Inter-Bold.woff"
        characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};:'\",./<>?`~"
        material={new THREE.MeshStandardMaterial({ emissive: color, emissiveIntensity: 2 })}
      >
        {text}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
      </Text>
    </Float>
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
      
      // Pulse effect during encryption
      meshRef.current.material.distort = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    } else {
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, 1.0, 0.05);
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, 1.0, 0.05);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, 1.0, 0.05);
      
      // Subtle movement when not in encryption step
      meshRef.current.material.distort = 0.2 + Math.sin(state.clock.elapsedTime) * 0.1;
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
      <MeshDistortMaterial
        color={color}
        envMapIntensity={0.8}
        clearcoat={0.8}
        clearcoatRoughness={0.2}
        metalness={0.5}
        distort={0.2}
        speed={5}
        roughness={0.2}
        toneMapped={false}
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

// Binary code particles
function BinaryParticles({ step }: { step: number }) {
  const particles = useMemo(() => {
    const temp = [];
    const count = 100;
    
    for (let i = 0; i < count; i++) {
      const binary = Math.random() > 0.5 ? '1' : '0';
      const position: [number, number, number] = [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ];
      const scale = Math.random() * 0.2 + 0.1;
      const speed = Math.random() * 0.02 + 0.01;
      const rotationSpeed = Math.random() * 0.01;
      
      temp.push({ binary, position, scale, speed, rotationSpeed });
    }
    
    return temp;
  }, []);
  
  const textRef = useRef<THREE.Group[]>([]);
  
  useFrame((state) => {
    // Only show during encryption step
    if (step !== 2) return;
    
    particles.forEach((particle, i) => {
      if (!textRef.current[i]) return;
      
      // Move particles
      textRef.current[i].position.x += Math.sin(state.clock.elapsedTime + i) * particle.speed;
      textRef.current[i].position.y += Math.cos(state.clock.elapsedTime + i) * particle.speed;
      textRef.current[i].position.z += Math.sin(state.clock.elapsedTime * 0.5 + i) * particle.speed;
      
      // Rotate particles
      textRef.current[i].rotation.x += particle.rotationSpeed;
      textRef.current[i].rotation.y += particle.rotationSpeed * 1.5;
      textRef.current[i].rotation.z += particle.rotationSpeed * 0.5;
      
      // Fade based on distance from center
      const distance = textRef.current[i].position.length();
      textRef.current[i].scale.setScalar(
        particle.scale * (1 - Math.min(1, distance / 10))
      );
    });
  });
  
  return (
    <>
      {particles.map((particle, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) textRef.current[i] = el;
          }}
          position={particle.position}
          scale={[particle.scale, particle.scale, particle.scale]}
        >
          <Text
            color={particle.binary === '1' ? '#4ade80' : '#60a5fa'}
            fontSize={1}
            font="/fonts/JetBrainsMono-Bold.woff"
            anchorX="center"
            anchorY="middle"
          >
            {particle.binary}
            <meshStandardMaterial
              color={particle.binary === '1' ? '#4ade80' : '#60a5fa'}
              emissive={particle.binary === '1' ? '#4ade80' : '#60a5fa'}
              emissiveIntensity={2}
              toneMapped={false}
            />
          </Text>
        </group>
      ))}
    </>
  );
}

// 3D Scene component
function EncryptionScene({ step, password, plaintext, ciphertext }: 
  { step: number; password: string; plaintext: string; ciphertext: string }) {
  const [packets, setPackets] = useState<DataPacket[]>([]);
  const { camera } = useThree();
  
  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 0, 5);
  }, [camera]);
  
  // Generate data packets based on step
  useEffect(() => {
    // Clear packets when changing steps
    if (step === 0 || step === 1) {
      setPackets([]);
      return;
    }
    
    // Add packets during encryption and transmission steps
    const interval = setInterval(() => {
      if (step === 2 || step === 3 || step === 4) {
        setPackets(prev => {
          // Remove completed packets
          const filtered = prev.filter(p => p.progress < 1);
          
          // Add new packets if not too many
          if (filtered.length < 30) {
            return [
              ...filtered,
              {
                id: Date.now(),
                progress: 0,
                size: Math.random() * 3 + 1,
                color: getRandomColor(),
                speed: Math.random() * 0.01 + 0.005,
                path: step === 2 ? 'encrypt' : step === 3 ? 'transmit' : 'store',
                pulsePhase: Math.random() * Math.PI * 2,
                rotationSpeed: Math.random() * 0.1
              }
            ];
          }
          
          return filtered;
        });
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [step]);
  
  // Update packet progress
  useFrame((state, delta) => {
    setPackets(prev => 
      prev.map(packet => ({
        ...packet,
        progress: packet.progress + packet.speed,
        pulsePhase: packet.pulsePhase + delta * 5
      }))
    );
    
    // Camera movement based on step
    if (step === 0) { // Note step
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, -2, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0, 0.05);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5, 0.05);
    } else if (step === 1) { // Password step
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 2, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1, 0.05);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5, 0.05);
    } else if (step === 2) { // Encryption step
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0