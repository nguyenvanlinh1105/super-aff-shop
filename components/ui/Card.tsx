import { HTMLAttributes } from "react";

type Variant = "default" | "soft" | "tinted" | "dark" | "cream";

const variantClasses: Record<Variant, string> = {
  default: "bg-white text-neutral-900 shadow-cute border border-primary-100/70",
  soft: "bg-primary-50 text-neutral-900 border border-primary-100",
  tinted: "bg-gradient-to-br from-primary-100 to-primary-50 text-neutral-900 border border-primary-200/80 shadow-cute",
  cream: "bg-gradient-to-br from-secondary-50 to-secondary-100 text-neutral-900 border border-secondary-300/50 shadow-sm",
  dark: "bg-gradient-to-br from-neutral-900 to-neutral-700 text-white shadow-cute-lg border border-neutral-700",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  hover?: boolean;
}

export function Card({ variant = "default", hover = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-3xl p-6 ${variantClasses[variant]} ${
        hover ? "transition-all duration-200 hover:shadow-cute-lg hover:-translate-y-1 cursor-pointer" : ""
      } ${className}`}
      {...props}
    />
  );
}

