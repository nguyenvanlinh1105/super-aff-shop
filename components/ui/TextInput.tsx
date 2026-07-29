import { InputHTMLAttributes, forwardRef } from "react";

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-2xl border border-primary-200/80 bg-white px-4 py-2.5 text-[14px] font-medium text-neutral-900 placeholder:text-neutral-500 transition-all duration-150 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 hover:border-primary-300 ${className}`}
        {...props}
      />
    );
  }
);
TextInput.displayName = "TextInput";

