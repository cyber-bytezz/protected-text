"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Hero from "./hero";
import Features from "./features";
import HowToUse from "./how-to-use";
import FAQ from "./faq";
import { Footer } from "./Footer";
import HyperEncryptionVisualizer from "./HyperEncryptionVisualizer";

export default function InteractiveLanding() {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const encryptionRef = useRef<HTMLDivElement>(null);
  const howToUseRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  
  // Parallax effect for the hero section
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0.7]);
  const heroY = useTransform(scrollY, [0, 600], [0, 100]);
  const featuresY = useTransform(scrollY, [300, 600], [100, 0]);
  const featuresOpacity = useTransform(scrollY, [300, 500], [0.3, 1]);
  
  // Check which section is in view
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      const sections = [
        { ref: heroRef, id: "hero" },
        { ref: featuresRef, id: "features" },
        { ref: encryptionRef, id: "encryption" },
        { ref: howToUseRef, id: "how-to-use" },
        { ref: faqRef, id: "faq" }
      ];
      
      for (const section of sections) {
        if (!section.ref.current) continue;
        
        const offsetTop = section.ref.current.offsetTop;
        const offsetHeight = section.ref.current.offsetHeight;
        
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Scroll to section function
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      window.scrollTo({
        top: ref.current.offsetTop - 80, // Adjust for navbar height
        behavior: "smooth"
      });
    }
  };
  
  // Animation variants for sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.2 }
    }
  };
  
  // Enhanced animation variants for children elements
  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  // Navigation items
  const navItems = [
    { id: "hero", label: "Home", ref: heroRef },
    { id: "features", label: "Features", ref: featuresRef },
    { id: "encryption", label: "Encryption", ref: encryptionRef },
    { id: "how-to-use", label: "How To Use", ref: howToUseRef },
    { id: "faq", label: "FAQ", ref: faqRef }
  ];
  
  return (
    <div className="relative">
      {/* Enhanced Navigation dots with glow effect */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
        <motion.div 
          className="flex flex-col items-center space-y-6 p-4 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-gray-200/20 dark:border-gray-800/20 shadow-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => scrollToSection(item.ref)}
              className="group flex items-center"
              aria-label={`Scroll to ${item.label}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span 
                className={`w-3 h-3 rounded-full transition-all duration-300 ${activeSection === item.id ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125' : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-400'}`}
                animate={activeSection === item.id ? {
                  boxShadow: ['0px 0px 0px rgba(59, 130, 246, 0)', '0px 0px 8px rgba(59, 130, 246, 0.5)', '0px 0px 0px rgba(59, 130, 246, 0)']
                } : {}}
                transition={{ duration: 2, repeat: activeSection === item.id ? Infinity : 0 }}
              />
              <motion.span 
                className={`ml-3 text-sm font-medium transition-all duration-300 ${activeSection === item.id ? 'opacity-100 text-blue-600 dark:text-blue-400' : 'opacity-0 group-hover:opacity-100 text-gray-600 dark:text-gray-400'}`}
                initial={{ width: 0 }}
                animate={{ width: 'auto' }}
                transition={{ duration: 0.2 }}
              >
                {item.label}
              </motion.span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Mobile navigation dots (horizontal) */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 lg:hidden">
        <motion.div 
          className="flex items-center justify-center space-x-4 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => scrollToSection(item.ref)}
              aria-label={`Scroll to ${item.label}`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.span 
                className={`block w-3 h-3 rounded-full ${activeSection === item.id ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125' : 'bg-gray-300 dark:bg-gray-600'}`}
                animate={activeSection === item.id ? {
                  boxShadow: ['0px 0px 0px rgba(59, 130, 246, 0)', '0px 0px 8px rgba(59, 130, 246, 0.5)', '0px 0px 0px rgba(59, 130, 246, 0)']
                } : {}}
                transition={{ duration: 2, repeat: activeSection === item.id ? Infinity : 0 }}
              />
            </motion.button>
          ))}
        </motion.div>
      </div>
      
      {/* Hero Section with enhanced parallax */}
      <motion.div 
        ref={heroRef} 
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10"
      >
        <Hero />
      </motion.div>
      
      {/* Features Section with parallax effect */}
      <motion.div
        ref={featuresRef}
        style={{ y: featuresY, opacity: featuresOpacity }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <Features />
      </motion.div>
      
      {/* Encryption Visualizer Section with enhanced background */}
      <motion.div
        ref={encryptionRef}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        className="relative py-10 overflow-hidden"
      >
        {/* Enhanced background decoration with animation */}
        <div className="absolute inset-0 overflow-hidden">
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
        <HyperEncryptionVisualizer />
      </motion.div>
      
      {/* How To Use Section with enhanced animations */}
      <motion.div
        ref={howToUseRef}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        className="py-10 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
        </div>
        
        <div className="text-center mb-12 relative z-10">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            How To Use Encrypt
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Get started with Encrypt in just a few simple steps
          </motion.p>
        </div>
        <HowToUse />
      </motion.div>
      
      {/* FAQ Section with enhanced animations */}
      <motion.div
        ref={faqRef}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        className="py-10 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          />
        </div>
        <FAQ />
      </motion.div>
      
      {/* Footer with enhanced animation */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
        className="relative z-10"
      >
        <Footer />
      </motion.div>

      {/* Scroll to top button */}
      <motion.button
        className="fixed bottom-20 right-6 z-50 p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 lg:flex items-center justify-center hidden"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: activeSection !== "hero" ? 1 : 0,
          scale: activeSection !== "hero" ? 1 : 0,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </motion.button>
    </div>
  );
}