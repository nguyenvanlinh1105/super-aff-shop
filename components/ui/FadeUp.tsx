"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FadeUpProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
}

export function FadeUp({ children, className }: FadeUpProps) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
}
