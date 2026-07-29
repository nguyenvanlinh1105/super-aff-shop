import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "tertiary" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-cute hover:shadow-cute-lg hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-primary-400",
  secondary:
    "bg-primary-100 text-primary-600 hover:bg-primary-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-primary-200",
  tertiary:
    "bg-white text-neutral-700 border border-primary-200/80 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-300",
  danger:
    "bg-negative-bg text-negative hover:bg-negative/20 active:bg-negative/30 focus-visible:ring-negative/30",
  accent:
    "bg-gradient-to-r from-accent-bow to-primary-500 text-white shadow-bow hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-accent-bow",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-1.5 text-[13px] leading-5 gap-1.5",
  md: "px-6 py-2.5 text-[14px] leading-6 gap-2",
  lg: "px-8 py-3.5 text-[15px] leading-6 gap-2.5",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

