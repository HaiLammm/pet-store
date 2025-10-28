"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  containerClassName?: string;
  center?: boolean;
  actions?: ReactNode;
};

export default function Section({
  title,
  subtitle,
  children,
  className,
  headerClassName,
  containerClassName,
  center = false,
  actions,
}: SectionProps) {
  return (
    <section
      className={cn("py-8 md:py-10 bg-background text-foreground", className)}
    >
      <div className={cn("container mx-auto px-4", containerClassName)}>
        {(title || subtitle || actions) && (
          <div
            className={cn(
              "mb-6 flex flex-col gap-2 md:mb-8",
              center ? "items-center text-center" : "items-start",
              headerClassName
            )}
          >
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                {title}
              </h2>
            )}
            {title && (
              <div
                className={cn(
                  "h-1 w-52 rounded-full mt-2",
                  center && "mx-auto",
                  "bg-[currentColor]"
                )}
              />
            )}
            {subtitle && (
              <p className="text-muted-foreground max-w-2xl">{subtitle}</p>
            )}
            {actions && <div className={cn(center && "mt-1")}>{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
