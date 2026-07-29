import { LucideIcon } from "lucide-react";
import { IconBow } from "@/components/icons/CatRibbonIcons";

const toneConfig = {
  default: {
    iconBg: "bg-primary-100 text-primary-600",
    gradient: "from-white to-primary-50/50",
    accent: "#FF6D9E",
  },
  positive: {
    iconBg: "bg-[#E6F8EE] text-[#2D8A56]",
    gradient: "from-white to-[#E6F8EE]/50",
    accent: "#7ED9A8",
  },
  warning: {
    iconBg: "bg-[#FFF8E1] text-[#B87A14]",
    gradient: "from-white to-[#FFF8E1]/50",
    accent: "#FFCB77",
  },
  negative: {
    iconBg: "bg-negative-bg text-negative",
    gradient: "from-white to-negative-bg/50",
    accent: "#FF8FA3",
  },
};

export function StatCard({
  icon: Icon,
  label,
  value,
  tag,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tag?: string;
  tone?: "default" | "positive" | "warning" | "negative";
}) {
  const cfg = toneConfig[tone];

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${cfg.gradient} p-5 shadow-cute border border-primary-100/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-cute-lg`}
    >
      {/* Top ribbon accent line animated on hover */}
      <div
        className="absolute top-0 left-4 right-4 h-[3px] rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)` }}
      />

      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${cfg.iconBg} shadow-sm transition-transform duration-200 group-hover:scale-110`}
        >
          <Icon size={20} strokeWidth={1.8} />
        </div>
        {tag ? (
          <span className="rounded-full bg-primary-100/80 px-2.5 py-0.5 text-[10px] font-bold text-primary-600 border border-primary-200/50">
            {tag}
          </span>
        ) : (
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <IconBow className="w-4 h-4 text-accent-bow" />
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="text-[12px] font-bold uppercase tracking-wider text-neutral-500">{label}</div>
        <div className="mt-1 text-[24px] font-extrabold text-neutral-900 tabular-nums leading-tight">
          {value}
        </div>
      </div>

      {/* Bottom-right decorative soft paw circle */}
      <div
        className="pointer-events-none absolute -right-3 -bottom-3 h-16 w-16 rounded-full opacity-10 transition-transform duration-300 group-hover:scale-125"
        style={{ background: cfg.accent }}
      />
    </div>
  );
}

