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
import { Text3D, OrbitControls, Float, Sphere, MeshDistortMaterial, Environment } from '@react-three/drei';

// Define types for our visualization elements
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
  phase: number;
  noiseOffset: number;
  quantumState: number;
  targetX?: number;
  targetY?: number;
  targetZ?: number;
  originalX?: number;
  originalY?: number;
  originalZ?: number;
  type: 'data' | 'key' | 'cipher' | 'noise';
  active: boolean;
}

interface DataPacket {
  id: number;
  progress: number;
  size: number;
  color: string;
  speed: number;
  path: 'encrypt' | 'transmit' | 'store';
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  controlPoint1: { x: number; y: number };
  controlPoint2: { x: number; y: number };
  pulsePhase: number;
  dataType: 'plaintext' | 'key' | 'ciphertext';
}

// 3D Scene Components
const EncryptionSphere = ({ step, isActive }: { step: number; isActive: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Rotation animation
    meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
    meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.5;
    
    // Scale animation based on step
    const targetScale = isActive ? 1.2 : 0.8;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);
    
    // Color animation
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    if (material) {
      // Change color based on step
      const targetColor = new THREE.Color(step === 2 ? '#8b5cf6' : step === 3 ? '#22c55e' : '#3b82f6');
      material.color.lerp(targetColor, 0.05);
      material.emissive.lerp(targetColor.clone().multiplyScalar(0.2), 0.05);
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color={step === 2 ? '#8b5cf6' : step === 3 ? '#22c55e' : '#3b82f6'}
        roughness={0.2}
        metalness={0.8}
        envMapIntensity={1}
        distort={0.4}
        speed={isActive ? 2 : 0.5}
        emissive={step === 2 ? '#8b5cf6' : step === 3 ? '#22c55e' : '#3b82f6'}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

const DataParticles = ({ step, count = 100 }: { step: number; count?: number }) => {
  const { size } = useThree();
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      temp.push({
        position,
        color: new THREE.Color(Math.random() > 0.5 ? '#3b82f6' : '#8b5cf6'),
        scale: Math.random() * 0.2 + 0.1,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        ),
      });
    }
    return temp;
  }, [count]);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  useFrame((state) => {
    if (!mesh.current) return;
    
    particles.forEach((particle, i) => {
      // Update position based on velocity
      particle.position.add(particle.velocity);
      
      // Apply step-specific behaviors
      if (step === 2) { // Encryption - particles move toward center
        particle.position.lerp(new THREE.Vector3(0, 0, 0), 0.01);
        particle.color.lerp(new THREE.Color('#8b5cf6'), 0.05);
      } else if (step === 3) { // Transmission - particles move in a direction
        particle.position.x += 0.01;
        if (particle.position.x > 5) particle.position.x = -5;
        particle.color.lerp(new THREE.Color('#22c55e'), 0.05);
      } else if (step === 4) { // Storage - particles organize into a grid
        const gridX = ((i % 10) - 5) * 0.5;
        const gridY = (Math.floor(i / 10) % 10 - 5) * 0.5;
        const gridZ = (Math.floor(i / 100) - 5) * 0.5;
        particle.position.lerp(new THREE.Vector3(gridX, gridY, gridZ), 0.01);
        particle.color.lerp(new THREE.Color('#ef4444'), 0.05);
      } else {
        // Default behavior - gentle floating
        particle.position.y += Math.sin(state.clock.getElapsedTime() * 0.5 + i) * 0.002;
        particle.color.lerp(new THREE.Color('#3b82f6'), 0.05);
      }
      
      // Boundary check with wrapping
      if (particle.position.length() > 10) {
        particle.position.normalize().multiplyScalar(10);
        particle.velocity.negate(); // Reverse direction
      }
      
      // Update instance
      dummy.position.copy(particle.position);
      dummy.scale.set(particle.scale, particle.scale, particle.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      mesh.current.setColorAt(i, particle.color);
    });
    
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });
  
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.2, 0]} />
      <meshStandardMaterial roughness={0.3} metalness={0.7} envMapIntensity={2} />
    </instancedMesh>
  );
};

const EncryptionScene = ({ step }: { step: number }) => {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <EncryptionSphere step={step} isActive={true} />
      </Float>
      
      <DataParticles step={step} count={200} />
      
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      <Environment preset="city" />
      
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={0.5} />
        <ChromaticAberration offset={[0.002, 0.002]} />
        <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
    </Canvas>
  );
};

// 2D Canvas Visualization
const CanvasVisualization = ({ 
  step, 
  dimensions, 
  particles, 
  dataPackets,
  password,
  plaintext,
  ciphertext
}: { 
  step: number; 
  dimensions: { width: number; height: number }; 
  particles: Particle[];
  dataPackets: DataPacket[];
  password: string;
  plaintext: string;
  ciphertext: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions with device pixel ratio for sharpness
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    
    // Draw step-specific elements
    if (step === 0) { // Your Note
      // Draw plaintext representation
      const textX = dimensions.width * 0.5;
      const textY = dimensions.height * 0.5;
      
      // Draw text background
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.fillRect(textX - 150, textY - 30, 300, 60);
      
      // Draw text
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#3b82f6';
      ctx.fillText(plaintext, textX, textY);
      
      // Draw decorative elements
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(textX - 160, textY - 40, 320, 80, 8);
      ctx.stroke();
    } else if (step === 1) { // Your Password
      // Draw password representation
      const keyX = dimensions.width * 0.5;
      const keyY = dimensions.height * 0.5;
      
      // Draw key background
      ctx.fillStyle = 'rgba(234, 179, 8, 0.1)';
      ctx.fillRect(keyX - 100, keyY - 20, 200, 40);
      
      // Draw key text
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#eab308';
      ctx.fillText(password, keyX, keyY);
      
      // Draw key icon
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      // Key head
      ctx.arc(keyX - 70, keyY, 15, 0, Math.PI * 2);
      
      // Key shaft
      ctx.moveTo(keyX - 55, keyY);
      ctx.lineTo(keyX + 70, keyY);
      
      // Key teeth
      ctx.moveTo(keyX + 20, keyY);
      ctx.lineTo(keyX + 20, keyY - 10);
      ctx.moveTo(keyX + 40, keyY);
      ctx.lineTo(keyX + 40, keyY - 15);
      ctx.moveTo(keyX + 60, keyY);
      ctx.lineTo(keyX + 60, keyY - 10);
      
      ctx.stroke();
    }
    
    // Draw particles
    particles.forEach(particle => {
      // Calculate 3D projection
      const scale = (particle.z + 100) / 200; // Scale based on z position
      const size = particle.size * scale;
      const x = particle.x;
      const y = particle.y;
      
      // Skip particles that are too small or outside the canvas
      if (size < 0.5 || x < -size || x > dimensions.width + size || y < -size || y > dimensions.height + size) {
        return;
      }
      
      ctx.save();
      ctx.globalAlpha = particle.opacity * scale;
      ctx.translate(x, y);
      ctx.rotate((particle.rotationX + particle.rotationY + particle.rotationZ) / 3 * Math.PI / 180);
      
      // Draw different particle types based on step and particle type
      if (step === 2 && Math.random() > 0.7) { // Encryption step - show lock symbols occasionally
        ctx.fillStyle = particle.color;
        // Draw lock shape
        ctx.beginPath();
        ctx.arc(0, -size/4, size/2, 0, Math.PI, true);
        ctx.fill();
        ctx.fillRect(-size/2, -size/4, size, size);
      } else if (step === 3 && particle.type === 'cipher') { // Transmission - show encrypted data
        ctx.fillStyle = particle.color;
        // Draw data packet shape
        ctx.beginPath();
        ctx.moveTo(-size, -size/2);
        ctx.lineTo(size, -size/2);
        ctx.lineTo(size/2, size/2);
        ctx.lineTo(-size/2, size/2);
        ctx.closePath();
        ctx.fill();
      } else {
        // Default particle shape
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
    
    // Draw data packets (flowing data visualization)
    dataPackets.forEach(packet => {
      let startX, startY, endX, endY;
      
      if (packet.path === 'encrypt') {
        // Encryption path: from plaintext to center
        startX = dimensions.width * 0.25;
        startY = dimensions.height * 0.5;
        endX = dimensions.width * 0.5;
        endY = dimensions.height * 0.5;
      } else if (packet.path === 'transmit') {
        // Transmission path: from center to server
        startX = dimensions.width * 0.5;
        startY = dimensions.height * 0.5;
        endX = dimensions.width * 0.75;
        endY = dimensions.height * 0.5;
      } else { // 'store'
        // Storage path: from server to database
        startX = dimensions.width * 0.75;
        startY = dimensions.height * 0.5;
        endX = dimensions.width * 0.85;
        endY = dimensions.height * 0.7;
      }
      
      // Calculate current position along the path
      const t = packet.progress;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;
      
      // Draw packet
      ctx.save();
      
      // Pulse effect
      const pulseScale = 1 + Math.sin(Date.now() * 0.01 + packet.id * 0.1) * 0.2;
      
      // Draw glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, packet.size * 2 * pulseScale);
      gradient.addColorStop(0, packet.color);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, packet.size * 2 * pulseScale, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw packet core
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x, y, packet.size * 0.5 * pulseScale, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
    
    // Draw step-specific overlays
    if (step === 2) { // Encryption
      // Draw encryption process visualization
      const centerX = dimensions.width * 0.5;
      const centerY = dimensions.height * 0.5;
      
      // Draw encryption field
      ctx.save();
      const encryptionRadius = 80;
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, encryptionRadius
      );
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
      gradient.addColorStop(0.7, 'rgba(139, 92, 246, 0.1)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, encryptionRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw encryption symbols
      const time = Date.now() * 0.001;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time;
        const x = centerX + Math.cos(angle) * encryptionRadius * 0.7;
        const y = centerY + Math.sin(angle) * encryptionRadius * 0.7;
        
        ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Alternate between lock symbols and encryption characters
        if (i % 2 === 0) {
          ctx.fillText('🔒', x, y);
        } else {
          const chars = ['A', 'E', 'S', '2', '5', '6'];
          ctx.fillText(chars[i % chars.length], x, y);
        }
      }
      
      ctx.restore();
    } else if (step === 3) { // Transmission
      // Draw data flow path
      const startX = dimensions.width * 0.5;
      const startY = dimensions.height * 0.5;
      const endX = dimensions.width * 0.75;
      const endY = dimensions.height * 0.5;
      
      ctx.save();
      
      // Draw path
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.lineWidth = 15;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Draw animated dashes along the path
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 15]);
      ctx.lineDashOffset = -Date.now() * 0.05;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      ctx.restore();
    } else if (step === 4) { // Storage
      // Draw database visualization
      const dbX = dimensions.width * 0.8;
      const dbY = dimensions.height * 0.7;
      const dbWidth = 60;
      const dbHeight = 80;
      
      ctx.save();
      
      // Draw database body
      const dbGradient = ctx.createLinearGradient(dbX - dbWidth/2, dbY, dbX + dbWidth/2, dbY);
      dbGradient.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
      dbGradient.addColorStop(1, 'rgba(239, 68, 68, 0.4)');
      
      // Database cylinder
      ctx.fillStyle = dbGradient;
      
      // Top ellipse
      ctx.beginPath();
      ctx.ellipse(dbX, dbY - dbHeight/2, dbWidth/2, dbWidth/4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Rectangle body
      ctx.fillRect(dbX - dbWidth/2, dbY - dbHeight/2, dbWidth, dbHeight);
      
      // Bottom ellipse
      ctx.beginPath();
      ctx.ellipse(dbX, dbY + dbHeight/2, dbWidth/2, dbWidth/4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw data rows
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 0; i < 5; i++) {
        const rowY = dbY - dbHeight/3 + i * dbHeight/6;
        ctx.fillRect(dbX - dbWidth/3, rowY, dbWidth*2/3, 2);
      }
      
      // Draw lock on database
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', dbX, dbY);
      
      ctx.restore();
    }
  }, [step, dimensions, particles, dataPackets, password, plaintext, ciphertext]);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

// Main Component
export default function HolographicEncryptionVisualizer() {
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
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
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
        const type = Math.random() > 0.7 ? 
          (Math.random() > 0.5 ? 'key' : 'cipher') : 
          (Math.random() > 0.5 ? 'data' : 'noise');
          
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
          phase: Math.random() * Math.PI * 2,
          noiseOffset: Math.random() * 100,
          quantumState: Math.floor(Math.random() * 2),
          type: type as any,
          active: Math.random() > 0.5
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