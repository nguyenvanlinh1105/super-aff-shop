import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 py-8 text-center fade-in">
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-neutral-100 p-1 border border-neutral-200/80 shadow-2xs flex items-center justify-center mx-auto overflow-hidden shrink-0">
          <img
            src="/logo-200.png"
            alt="MeowBack Mascot"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        {Icon && (
          <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-100 text-primary-600 border border-white">
            <Icon size={9} strokeWidth={2.5} />
          </div>
        )}
      </div>
      <div>
        <div className="text-sm font-bold text-neutral-800">{title}</div>
        {description && (
          <div className="mt-0.5 max-w-[340px] text-xs text-neutral-500 leading-relaxed">{description}</div>
        )}
      </div>
      {action && <div className="mt-1.5">{action}</div>}
    </div>
  );
}

