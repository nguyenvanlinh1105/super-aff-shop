"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function StickyStack({ cards, className }: { cards: React.ReactNode[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    
    // Register inside useEffect to avoid SSR issues
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card");
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return;
        ScrollTrigger.create({
          trigger: card,
          start: "top top", // pin at viewport top
          endTrigger: cardEls[cardEls.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    }, ref);
    
    return () => ctx.revert();
  }, [reduce]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {cards.map((card, i) => (
        <div
          key={i}
          className="stack-card sticky top-0 min-h-[85dvh] flex items-center justify-center pt-20 pb-10"
        >
          {card}
        </div>
      ))}
    </div>
  );
}
