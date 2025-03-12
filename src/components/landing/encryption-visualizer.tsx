"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Lock, Unlock, Shield, Key, FileText, RefreshCw, ArrowRight, Zap, Database, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EncryptionVisualizer() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [password, setPassword] = useState("password123");
  const [plaintext, setPlaintext] = useState("My secret note");
  const [ciphertext, setCiphertext] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  
  // Generate a random ciphertext for visualization
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let encrypted = "";
    for (let i = 0; i < plaintext.length * 4; i++) {
      encrypted += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCiphertext(encrypted);
  }, [plaintext]);

  // Auto-play animation with improved timing and state management
  useEffect(() => {
    if (isPlaying) {
      setStep(0); // Reset to first step when starting animation
      const timer = setInterval(() => {
        setStep(prevStep => {
          if (prevStep < 4) {
            return prevStep + 1;
          } else {
            setIsPlaying(false);
            return 0;
          }
        });
      }, 2000); // Increased duration for better visibility
      return () => clearInterval(timer);
    }
  }, [isPlaying]); // Only depend on isPlaying state

  const startAnimation = () => {
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
      color: "bg-blue-500"
    },
    {
      title: "Your Password",
      description: "Enter your secure password",
      icon: Key,
      color: "bg-yellow-500"
    },
    {
      title: "Encryption",
      description: "Your note is encrypted locally",
      icon: Lock,
      color: "bg-purple-500"
    },
    {
      title: "Transmission",
      description: "Encrypted data is sent to server",
      icon: Shield,
      color: "bg-green-500"
    },
    {
      title: "Secure Storage",
      description: "Only encrypted data is stored",
      icon: Database,
      color: "bg-red-500"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // Particle effect for the encryption process
  const Particles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-70 dark:opacity-40"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative" ref={containerRef}>
      {/* Enhanced background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>
      
      <motion.div 
        className="text-center mb-12 relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h2 
          className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4"
          variants={itemVariants}
        >
          See How Your Data Is Protected
        </motion.h2>
        <motion.p 
          className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          Watch our interactive visualization of the end-to-end encryption process
        </motion.p>
      </motion.div>

      <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl p-6 sm:p-10 max-w-5xl mx-auto border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-sm relative z-10 hover:shadow-2xl transition-all duration-500">
        {/* Horizontal Progress steps */}
        <div className="flex justify-between mb-8 relative">
          {steps.map((s, i) => (
            <div 
              key={i} 
              className="flex flex-col items-center relative z-10 px-2"
              onMouseEnter={() => handleStepHover(i)}
              onMouseLeave={() => handleStepHover(null)}
            >
              <motion.div 
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${i <= step ? s.color : 'bg-gray-200 dark:bg-gray-700'} transition-colors duration-500 cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-transform`}
                animate={{
                  scale: i === step ? [1, 1.1, 1] : hoveredStep === i ? 1.05 : 1,
                  boxShadow: i === step 
                    ? "0px 0px 20px rgba(66, 153, 225, 0.6)" 
                    : hoveredStep === i 
                      ? "0px 0px 15px rgba(66, 153, 225, 0.4)" 
                      : "none"
                }}
                transition={{ 
                  repeat: i === step ? Infinity : 0, 
                  duration: 2,
                  type: "spring",
                  stiffness: 300
                }}
                onClick={() => handleStepClick(i)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {React.createElement(s.icon, { 
                  className: `w-5 h-5 sm:w-7 sm:h-7 text-white transition-transform duration-300 ${hoveredStep === i ? 'scale-110' : ''}` 
                })}
              </motion.div>
              <motion.p 
                className={`mt-2 text-xs sm:text-sm font-medium text-center ${i <= step ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}
                animate={{ 
                  scale: hoveredStep === i ? 1.05 : 1,
                  y: hoveredStep === i ? -2 : 0
                }}
              >
                {s.title}
              </motion.p>
              {hoveredStep === i && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-8 bg-white dark:bg-gray-800 px-3 py-1 rounded-md shadow-md text-xs whitespace-nowrap z-20 max-w-[150px] sm:max-w-none text-center"
                >
                  {s.description}
                </motion.div>
              )}
            </div>
          ))}
          {/* Connecting line */}
          <div className="absolute top-7 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -z-0">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500" 
              animate={{ width: `${(step / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Horizontal Visualization area */}
        <div className="relative h-80 sm:h-96 mb-8 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 shadow-inner border border-gray-200 dark:border-gray-700 group hover:shadow-lg transition-all duration-300">
          <Particles />
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div 
                key="step0"
                className="absolute inset-0 flex flex-col items-center justify-center p-6"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  animate={{ y: [0, -5, 0], rotateZ: [0, 2, 0, -2, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative"
                >
                  <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-md animate-pulse"></div>
                  <FileText className="w-20 h-20 text-blue-500 mb-4 drop-shadow-md relative z-10" />
                </motion.div>
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md border border-blue-100 dark:border-blue-900 transform transition-all duration-300 hover:shadow-xl">
                  <p className="text-gray-800 dark:text-gray-200 font-mono text-sm sm:text-lg break-words">{plaintext}</p>
                </div>
                <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 bg-white/80 dark:bg-gray-800/80 px-3 py-1 rounded-full shadow-sm">Your original note content</p>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div 
                key="step1"
                className="absolute inset-0 flex flex-col items-center justify-center p-6"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, 0, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative"
                >
                  <div className="absolute -inset-4 bg-yellow-500/20 rounded-full blur-md animate-pulse"></div>
                  <Key className="w-20 h-20 text-yellow-500 mb-4 drop-shadow-md relative z-10" />
                </motion.div>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full max-w-md">
                  <motion.div 
                    className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-md border border-yellow-100 dark:border-yellow-900 w-full sm:w-auto flex-1"
                    whileHover={{ scale: 1.03 }}
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Password</p>
                    <p className="text-gray-800 dark:text-gray-200 font-mono text-sm sm:text-base">{password}</p>
                  </motion.div>
                </div>
                <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 bg-white/80 dark:bg-gray-800/80 px-3 py-1 rounded-full shadow-sm">Your password is never sent to our servers</p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                className="absolute inset-0 flex flex-col items-center justify-center p-6"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 0, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative"
                >
                  <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-md animate-pulse"></div>
                  <Lock className="w-20 h-20 text-purple-500 mb-4 drop-shadow-md relative z-10" />
                </motion.div>
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md border border-purple-100 dark:border-purple-900 transform transition-all duration-300 hover:shadow-xl">
                  <p className="text-gray-800 dark:text-gray-200 font-mono text-sm sm:text-lg break-words">{ciphertext}</p>
                </div>
                <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 bg-white/80 dark:bg-gray-800/80 px-3 py-1 rounded-full shadow-sm">Your note is encrypted using AES-256</p>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                className="absolute inset-0 flex flex-col items-center justify-center p-6"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex flex-col items-center justify-center w-full">
                  <motion.div
                    animate={{ x: [0, 100, 100] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                    className="relative mb-8"
                  >
                    <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-md"></div>
                    <Shield className="w-16 h-16 text-green-500 drop-shadow-md relative z-10" />
                  </motion.div>
                  
                  <div className="w-full flex justify-between items-center gap-4 max-w-lg">
                    <motion.div 
                      className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex-1"
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <p className="text-xs text-gray-500 mb-1">Your Device</p>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                        <motion.div 
                          className="h-full bg-green-500" 
                          animate={{ width: ["0%", "100%"] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div
                      animate={{ x: [0, 10, 0], rotate: [0, 5, 0, -5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex-1"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <p className="text-xs text-gray-500 mb-1">Our Server</p>
                      <div className="flex items-center justify-center">
                        <Server className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                      </div>
                    </motion.div>
                  </div>
                </div>
                <p className="mt-8 text-xs sm:text-sm text-gray-500 bg-white/80 dark:bg-gray-800/80 px-3 py-1 rounded-full shadow-sm">Only encrypted data leaves your device</p>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                className="absolute inset-0 flex flex-col items-center justify-center p-6"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative"
                >
                  <div className="absolute -inset-4 bg-red-500/20 rounded-full blur-md animate-pulse"></div>
                  <Database className="w-20 h-20 text-red-500 mb-4 drop-shadow-md relative z-10" />
                </motion.div>
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md border border-red-100 dark:border-red-900 transform transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-gray-500">Encrypted Storage</p>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-mono text-sm sm:text-base break-words">{ciphertext.substring(0, 40)}...</p>
                </div>
                <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 bg-white/80 dark:bg-gray-800/80 px-3 py-1 rounded-full shadow-sm">Even we can't read your notes without your password</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={startAnimation}
            disabled={isPlaying}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            size="lg"
          >
            <RefreshCw className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} />
            {isPlaying ? 'Playing...' : 'Play Animation'}
          </Button>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {manualMode ? 'Manual mode: Click on steps to navigate' : 'Click on any step icon to explore'}
          </div>
        </div>
      </div>
    </div>
  );
}