"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface FadeUpProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
}

export function FadeUp({ children, className, delay = 0, duration = 0.8, y = 40 }: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration,
        delay,
        ease: [0.32, 0.72, 0, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
