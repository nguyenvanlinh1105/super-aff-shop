"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InfiniteMarqueeProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  direction?: "left" | "right";
}

export function InfiniteMarquee({
  children,
  speed = 40,
  className,
  direction = "left",
}: InfiniteMarqueeProps) {
  const dirMultiplier = direction === "left" ? -1 : 1;
  return (
    <div className={cn("flex overflow-hidden relative", className)}>
      <motion.div
        className="flex shrink-0 w-max"
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed,
        }}
      >
        <div className="flex shrink-0 items-center gap-8 px-4">
          {children}
        </div>
        <div className="flex shrink-0 items-center gap-8 px-4">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
