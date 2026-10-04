"use client";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // The Hall of Fame handles its own dramatic intro, so we can make the transition very subtle or skip it.
  // But a gentle fade in on all pages looks great.
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: pathname === '/' ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
