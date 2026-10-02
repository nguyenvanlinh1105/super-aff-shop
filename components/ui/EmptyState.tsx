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
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center fade-in">
      <div className="relative">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-pink-50/80 p-2.5 border border-pink-200/70 shadow-sm flex items-center justify-center mx-auto overflow-hidden">
          <img
            src="/icon-512.png"
            alt="MeowBack Mascot"
            className="w-full h-full object-contain rounded-2xl drop-shadow-xs"
          />
        </div>
        {Icon && (
          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 shadow-cute border-2 border-white">
            <Icon size={16} strokeWidth={2.5} />
          </div>
        )}
      </div>
      <div>
        <div className="text-[17px] font-bold text-neutral-900">{title}</div>
        {description && (
          <div className="mt-1 max-w-[340px] text-[14px] text-neutral-500 leading-relaxed">{description}</div>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

