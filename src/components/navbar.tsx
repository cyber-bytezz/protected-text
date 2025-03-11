"use client";

import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-between items-center mt-6 px-4 sm:px-10 py-3 backdrop-blur-sm bg-white/50 rounded-2xl shadow-sm mx-2 sm:mx-4"
    >
      <Link href="/" className="text-lg font-medium text-black hover:text-zinc-700 transition-all duration-300 transform hover:scale-105">
        <span className="flex items-center">
          <FaLock className="w-5 h-5 mr-2 text-blue-600" />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text font-bold text-2xl">
            Encrypt
          </span>
        </span>
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="https://github.com"
          target="_blank"
          className="text-black dark:text-white hover:text-blue-600 flex items-center transition-all duration-300 transform hover:scale-105"
        >
          <FaGithub className="w-6 h-6 sm:mr-2" /> 
          <span className="hidden sm:inline text-lg font-medium">GitHub</span>
        </Link>
      </div>
    </motion.nav>
  );
}
