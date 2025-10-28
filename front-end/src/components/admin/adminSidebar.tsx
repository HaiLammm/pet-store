"use client";

import Link from "next/link";
import { LayoutDashboard, PawPrint, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pet", label: "Pet", icon: PawPrint },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 bg-card text-card-foreground border-r border-border flex flex-col font-sans">
      <div className="h-16 px-6 flex items-center font-extrabold text-xl tracking-tight">
        ADMIN PANEL
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-md font-medium hover:bg-accent ${
                active
                  ? "bg-accent text-accent-foreground shadow"
                  : "text-muted-foreground"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
