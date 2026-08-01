"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function LiquidButton({ children, className, icon, ...props }: LiquidButtonProps) {
  return (
    <motion.button
      whileHover="hover"
      whileTap={{ scale: 0.96 }}
      className={cn(
        "group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-primary-500 px-6 py-3 font-bold text-white shadow-cute transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-primary-600 hover:shadow-cute-lg",
        className
      )}
      {...props}
    >
      {/* Liquid background effect */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary-400 via-primary-300 to-primary-500 opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-100" />
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 z-0 w-1/2 -skew-x-12 bg-white/20 blur-md"
        variants={{
          hover: { x: ["-150%", "250%"] },
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      <span className="relative z-10">{children}</span>

      {icon && (
        <motion.div
          className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
          variants={{
            hover: { x: 4, y: -2, scale: 1.05 },
          }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        >
          {icon}
        </motion.div>
      )}
    </motion.button>
  );
}
