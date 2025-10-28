"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Search,
  Menu,
  X,
  User as UserIcon,
  PawPrint,
  Settings,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/cart";

export default function AdminNavbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleProfileClick = useCallback(
    () => router.push("/profile"),
    [router]
  );
  const handleSettingsClick = useCallback(
    () => router.push("/settings"),
    [router]
  );
  const handleAdminClick = useCallback(
    () => router.push("/admin/dashboard"),
    [router]
  );
  const handleLogoutClick = useCallback(() => {
    logout();
    router.push("/");
  }, [logout, router]);

  return (
    <header className="bg-background border-b border-border shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline-block font-bold text-xl">
              LilyTrinh & DrogonCoon Cattery
            </span>
          </Link>
        </div>

        {/* Right: Search and Account */}
        <div className="flex items-center gap-2">
          {!isSearchOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="text-black hover:bg-gray-200"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}
          {isSearchOpen && (
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search here..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border-border shadow-sm hover:shadow-md transition-all"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close search</span>
              </Button>
            </div>
          )}

          {/* Account */}
          <div className="flex items-center">
            {!isAuthenticated ? (
              <div className="flex gap-2">
                <Link href="/sign-in">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-black hover:bg-gray-200"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    size="sm"
                    className="bg-red-700 hover:bg-red-500 text-white"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Card className="group flex items-center gap-0 p-2 rounded-lg border border-gray-200 hover:shadow-md bg-card">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {user?.avatar ? (
                          <AvatarImage src={user.avatar} alt="Profile" />
                        ) : (
                          <AvatarImage
                            src="/placeholder-avatar.jpg"
                            alt="Profile"
                          />
                        )}
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <div className="font-semibold text-card-foreground group-hover:text-primary">
                          {user?.name || "User"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user?.role === "admin" ? "Admin" : "Customer"}
                        </div>
                      </div>
                      <ChevronDown
                        size={16}
                        className="text-muted-foreground group-hover:text-primary ml-1"
                      />
                    </div>
                  </Card>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={0}
                  className="z-[60] w-48 shadow-lg border border-border bg-popover rounded-lg p-1 bg-white mt-2"
                >
                  <DropdownMenuItem
                    onClick={handleProfileClick}
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <UserIcon size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-popover-foreground">
                      Profile
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSettingsClick}
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <Settings size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-popover-foreground">
                      Settings
                    </span>
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <DropdownMenuItem
                      onClick={handleAdminClick}
                      className="flex items-center gap-3 px-3 py-2"
                    >
                      <LayoutDashboard
                        size={16}
                        className="text-muted-foreground"
                      />
                      <span className="text-sm font-medium text-popover-foreground">
                        Admin
                      </span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-1 bg-gray-300" />
                  <DropdownMenuItem
                    onClick={handleLogoutClick}
                    className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-destructive/10"
                  >
                    <LogOut size={16} />
                    <span className="text-sm font-medium text-red-600">
                      Logout
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {/* Mobile menu icon placeholder to align heights */}
          <Button variant="ghost" size="icon" className="md:hidden" aria-hidden>
            <Menu className="h-5 w-5 opacity-0" />
          </Button>
        </div>
      </div>
    </header>
  );
}
