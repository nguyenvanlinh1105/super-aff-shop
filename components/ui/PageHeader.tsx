export function PageHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-lg fade-in">
      <div className="flex items-center gap-md">
        {icon && <img src={icon} alt="" className="h-12 w-12 shrink-0 object-contain" />}
        <div>
          <h1 className="text-[24px] font-black tracking-tight text-ink">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-[14px] text-mute font-medium">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex items-center gap-sm shrink-0">{action}</div>}
    </div>
  );
}
