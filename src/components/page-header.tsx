import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-primary/80 mb-2">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
