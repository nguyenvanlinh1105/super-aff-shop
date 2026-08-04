"use client";

import { motion } from "framer-motion";

export function FloatingElement({ 
  children, 
  delay = 0, 
  yOffset = 8, 
  duration = 3.5,
  className = ""
}: { 
  children: React.ReactNode; 
  delay?: number;
  yOffset?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -yOffset, 0] }}
      transition={{
        duration: duration,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop",
        delay: delay
      }}
    >
      {children}
    </motion.div>
  );
}
