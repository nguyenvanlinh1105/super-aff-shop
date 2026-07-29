type BadgeTone = "positive" | "negative" | "warning" | "neutral" | "info" | "primary" | "bow";

const toneClasses: Record<BadgeTone, string> = {
  primary: "bg-primary-100 text-primary-600 border border-primary-200/60",
  bow: "bg-gradient-to-r from-primary-100 to-primary-200 text-accent-bow border border-primary-300/50 font-bold",
  positive: "bg-[#E6F8EE] text-[#2D8A56] border border-[#B3EBD0]",
  negative: "bg-negative-bg text-negative border border-primary-200",
  warning: "bg-[#FFF8E1] text-[#B87A14] border border-[#FFE082]",
  neutral: "bg-neutral-100 text-neutral-700 border border-neutral-300/60",
  info: "bg-[#EBF5FF] text-[#1E70BF] border border-[#BEE0FF]",
};

const dotClasses: Record<BadgeTone, string> = {
  primary: "bg-primary-500",
  bow: "bg-accent-bow",
  positive: "bg-positive",
  negative: "bg-negative",
  warning: "bg-warning",
  neutral: "bg-neutral-500",
  info: "bg-[#38C8FF]",
};

export function Badge({
  tone = "neutral",
  dot = false,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-0.5 text-[12px] font-semibold leading-5 ${toneClasses[tone]}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClasses[tone]}`} />
      )}
      {children}
    </span>
  );
}

