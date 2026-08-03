"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  y?: number;
}

export function HoverCard({ children, className, scale = 1.01, y = -4 }: HoverCardProps) {
  return (
    <motion.div
      whileHover={{ scale, y }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn("block w-full h-full", className)}
    >
      {children}
    </motion.div>
  );
}
