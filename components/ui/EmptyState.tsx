import { IllustCatEmpty } from "@/components/icons/CatRibbonIcons";
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
        <IllustCatEmpty className="w-40 h-40" />
        {Icon && (
          <div className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 shadow-cute">
            <Icon size={20} strokeWidth={2} />
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

