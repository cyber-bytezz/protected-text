"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, FileText, RefreshCw, Github, ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  const [inputValue, setInputValue] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [particles, setParticles] = useState<Array<{top: string, left: string, animY: number, duration: number, delay: number}>>([]);

  useEffect(() => {
    setIsLoaded(true);
    
    // Generate particles only on the client side
    const newParticles = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animY: -(Math.random() * 100 + 50),
        duration: 5 + Math.random() * 10,
        delay: Math.random() * 5
      });
    }
    setParticles(newParticles);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      window.location.href = `/${inputValue.trim()}`;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
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

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.98 }
  };

  const features = [
    { icon: Shield, text: "End-to-end encryption", description: "Your data is encrypted before it leaves your device" },
    { icon: Lock, text: "Password protected", description: "Secure access with password protection" },
    { icon: FileText, text: "Rich text editor", description: "Format your notes with a powerful editor" },
    { icon: RefreshCw, text: "Auto-sync", description: "Changes are automatically saved and synced" }
  ];

  return (
    <main className="flex justify-center items-center min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-black">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Enhanced animated background elements */}
        <motion.div 
          className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-25 animate-blob"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div 
          className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-25 animate-blob animation-delay-2000"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div 
          className="absolute top-32 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-25 animate-blob animation-delay-4000"
          animate={{
            scale: [1, 1.4, 1],
            y: [0, 40, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
        
        {/* Add floating particles effect - client-side only */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-70 dark:opacity-40"
              style={{
                top: particle.top,
                left: particle.left,
              }}
              animate={{
                y: [0, particle.animY],
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          ))}
        </div>
        
        <Navbar />
        <motion.div 
          className="flex flex-col justify-center items-center mt-16 md:mt-24 lg:mt-28 relative z-10"
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="text-center max-w-4xl mx-auto">
            <motion.div 
              className="flex justify-center items-center mb-8"
              variants={itemVariants}
            >
              <Link href="https://github.com" target="_blank">
                <motion.div
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonVariants}
                >
                  <Button
                    variant="outline"
                    className="bg-white/90 text-black dark:bg-black/90 dark:text-white flex justify-center items-center rounded-full px-6 py-3 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 border border-blue-200 dark:border-blue-900"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    <span>Star on GitHub</span> 
                    <motion.span 
                      className="ml-2"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        rotate: [0, 20, 0, -20, 0],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >⭐</motion.span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold max-w-3xl mx-auto text-center mt-4 relative z-20 py-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 leading-tight"
              variants={itemVariants}
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              Your Notes. <br className="md:hidden" />
              <span className="relative inline-block">
                Sealed
                <motion.span 
                  className="absolute -bottom-1 left-0 w-full h-2 bg-gradient-to-r from-blue-700 to-purple-700 rounded-full shadow-sm"
                  animate={{ 
                    width: ["0%", "100%"],
                    left: ["50%", "0%"],
                  }}
                  transition={{ 
                    duration: 1, 
                    delay: 1,
                    ease: "easeOut"
                  }}
                />
              </span> & Secure.
              <motion.span
                className="absolute -right-8 top-0"
                animate={{
                  rotate: [0, 20, 0, -20, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-center text-lg sm:text-xl md:text-2xl pb-4 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mt-6 font-light"
              variants={itemVariants}
            >
              Fully open-source encrypted notepad with rich text support. No login required.
            </motion.p>

            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto"
              variants={itemVariants}
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex flex-col items-center p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer"
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  onHoverStart={() => setActiveFeature(index)}
                  onHoverEnd={() => setActiveFeature(null)}
                >
                  <motion.div 
                    className={`p-4 ${feature.bgColor} rounded-full mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300`}
                    animate={activeFeature === index ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, 0, -5, 0],
                    } : {}}
                    transition={{ duration: 2, repeat: activeFeature === index ? Infinity : 0 }}
                  >
                    <feature.icon className={`w-7 h-7 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} />
                    <motion.div 
                      className="absolute inset-0 bg-white dark:bg-gray-800 rounded-full -z-10 opacity-0 group-hover:opacity-20"
                      animate={activeFeature === index ? {
                        scale: [1, 1.8, 1],
                        opacity: [0, 0.2, 0]
                      } : {}}
                      transition={{ duration: 2, repeat: activeFeature === index ? Infinity : 0 }}
                    />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{feature.text}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{feature.description}</p>
                  
                  {/* Decorative background elements */}
                  <div className="absolute -right-12 -bottom-12 w-24 h-24 bg-gradient-to-br from-transparent to-gray-100 dark:to-gray-700/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </motion.div>
              ))}
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-3 mt-16 bg-white/90 dark:bg-gray-800/90 p-6 rounded-2xl shadow-lg max-w-2xl mx-auto border border-gray-100 dark:border-gray-700 relative overflow-hidden group"
              variants={itemVariants}
              whileHover={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
            >
              {/* Animated background effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={isHovering ? {
                  background: [
                    'linear-gradient(90deg, rgba(59,130,246,0.05) 0%, rgba(147,51,234,0.05) 100%)',
                    'linear-gradient(90deg, rgba(147,51,234,0.05) 0%, rgba(59,130,246,0.05) 100%)',
                    'linear-gradient(90deg, rgba(59,130,246,0.05) 0%, rgba(147,51,234,0.05) 100%)'
                  ]
                } : {}}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <div className="flex items-center justify-center w-full sm:w-auto relative">
                <motion.span 
                  className="text-lg sm:text-xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 whitespace-nowrap"
                  animate={isInputFocused ? { scale: 1.05 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  Encrypt.com/
                </motion.span>
                <div className="relative w-full max-w-sm">
                  <Input
                    type="text"
                    placeholder="mynotes"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    className="w-full py-3 text-lg border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-blue-500 transition-all ml-1 pr-10"
                  />
                  {inputValue && (
                    <motion.div 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                    >
                      <Lock className="w-5 h-5" />
                    </motion.div>
                  )}
                </div>
              </div>
              <motion.div
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
                className="w-full sm:w-auto"
              >
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto py-3 px-8 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <motion.span 
                    className="relative z-10"
                    animate={{ x: inputValue ? [0, -3, 0] : 0 }}
                    transition={{ duration: 1, repeat: inputValue ? Infinity : 0, repeatDelay: 2 }}
                  >
                    Get Started
                  </motion.span>
                  <motion.div
                    className="relative z-10"
                    animate={{ 
                      x: inputValue ? [0, 5, 0] : 0,
                      scale: inputValue ? [1, 1.2, 1] : 1
                    }}
                    transition={{ duration: 1, repeat: inputValue ? Infinity : 0, repeatDelay: 2 }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                  
                  {/* Button shine effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 -z-0"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                  />
                </Button>
              </motion.div>
            </motion.form>

            <motion.div
              className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400 relative"
              variants={itemVariants}
            >
              <motion.p
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
              >
                No account needed. Your data stays on your device.
                <motion.span 
                  className="inline-block ml-2"
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Shield className="w-4 h-4 inline text-blue-500" />
                </motion.span>
                <motion.span className="ml-2">🔒</motion.span>
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
