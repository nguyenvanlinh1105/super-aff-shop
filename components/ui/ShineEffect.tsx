"use client";

import { motion } from "framer-motion";

export function ShineEffect({ delay = 0, repeatDelay = 4 }: { delay?: number; repeatDelay?: number }) {
  return (
    <motion.div
      className="absolute top-0 bottom-0 left-[-100%] w-[40%] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-20 skew-x-[-25deg]"
      animate={{ left: ["-100%", "250%"] }}
      transition={{
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: repeatDelay,
        delay: delay
      }}
    />
  );
}
