"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import AuthButton from "./AuthButton";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
  const { isMenuOpen, toggleMenu, isAdmin } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1], // easeOutQuint
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };

  return (
    <>
      {/* Brand Logo - Top Left */}
      <Link href="/" className="fixed top-6 left-6 z-50 mix-blend-difference group">
        <img 
          src="/logo.png" 
          alt="Pixlvault" 
          className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] group-hover:scale-110 transition-transform duration-300"
        />
      </Link>

      <button
        onClick={toggleMenu}
        className="fixed top-6 right-6 z-50 p-2 text-white mix-blend-difference hover:opacity-70 transition-opacity"
      >
        {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-white"
          >
            <nav className="flex flex-col items-center gap-8 text-4xl font-light tracking-widest">
              <motion.div variants={itemVariants}>
                <Link href="/" onClick={toggleMenu} className="hover:text-gray-400 transition-colors">
                  Hall of Fame
                </Link>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Link href="/explore" onClick={toggleMenu} className="hover:text-gray-400 transition-colors">
                  Explore
                </Link>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Link href="/upload" onClick={toggleMenu} className="hover:text-gray-400 transition-colors">
                  Upload
                </Link>
              </motion.div>
              
              {isAdmin && (
                <motion.div variants={itemVariants}>
                  <Link href="/admin" onClick={toggleMenu} className="hover:text-amber-500/80 transition-colors text-amber-500">
                    Admin
                  </Link>
                </motion.div>
              )}
            </nav>
            
            <motion.div variants={itemVariants} className="mt-16">
              <AuthButton />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
