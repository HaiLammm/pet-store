"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void } | ReactNode;
  className?: string;
};

export default function EmptyState({
  icon,
  title = "Nothing here yet",
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border bg-card text-card-foreground p-8 grid place-items-center",
        className
      )}
    >
      <div className="flex flex-col items-center text-center gap-3 max-w-md">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {typeof action === "object" && action && "label" in action ? (
          <Button className="mt-1" onClick={action.onClick}>
            {action.label}
          </Button>
        ) : (
          action && <div className="mt-1">{action}</div>
        )}
      </div>
    </div>
  );
}
