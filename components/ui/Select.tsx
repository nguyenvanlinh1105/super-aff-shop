import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={`w-full appearance-none rounded-xl border border-ink/10 bg-canvas px-md py-[10px] pr-[44px] text-[14px] font-medium text-ink transition-all duration-150 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary hover:border-ink/20 cursor-pointer ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="pointer-events-none absolute right-md top-1/2 -translate-y-1/2 text-mute/60"
        />
      </div>
    );
  }
);
Select.displayName = "Select";
