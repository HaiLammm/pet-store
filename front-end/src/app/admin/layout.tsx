import type { Metadata } from "next";
import React from "react";
import AdminSidebar from "@/components/admin/adminSidebar";
import AdminNavbar from "@/components/admin/adminNavbar";

export const metadata: Metadata = {
  title: "Admin | PetStore",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar />
        <div className="flex-1 p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
