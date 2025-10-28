"use client";

import Link from "next/link";
import { useState, useCallback, useEffect, useRef } from "react";
import { settingsAPI } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  User as UserIcon,
  PawPrint,
  Settings,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Sun,
  Moon,
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
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePreferencesStore } from "@/store/preferences";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [siteName, setSiteName] = useState<string>(
    "LilyTrinh & DrogonCoon Cattery"
  );
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const theme = usePreferencesStore((s) => s.theme);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const isDark = theme === "dark";

  const handleProfileClick = useCallback(() => {
    router.push("/profile");
  }, [router]);

  const handleSettingsClick = useCallback(() => {
    router.push("/settings");
  }, [router]);

  const handleAdminClick = useCallback(() => {
    router.push("/admin/dashboard");
  }, [router]);

  const handleLogoutClick = useCallback(() => {
    // Clear any existing timer to avoid multiple redirects
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    // Execute logout immediately
    logout();
    // After 3 seconds, navigate to homepage and force a reload
    logoutTimerRef.current = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.assign("/");
      } else {
        router.push("/");
      }
    }, 3000);
  }, [logout, router]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isMenuOpen]);

  // Cleanup logout timer on unmount
  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

  // Fetch site name from settings
  useEffect(() => {
    let mounted = true;
    settingsAPI
      .get()
      .then((res) => {
        if (!mounted) return;
        const name = (res.data?.siteName as string) || "";
        if (name) setSiteName(name);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="bg-background border-b border-border shadow-sm transition-colors duration-200 relative z-50 overflow-visible">
      <div className="relative px-6 py-4 grid grid-cols-[auto_1fr_auto] items-center">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block text-xl">
              {siteName}
            </span>
          </Link>
        </div>

        {/* Menu center */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 items-center space-x-6">
          <Link
            href="/"
            className="text-medium font-medium transition-colors hover:text-[#b91c1c]"
          >
            Home
          </Link>

          <Link
            href="/kings"
            className="text-medium font-medium transition-colors hover:text-[#b91c1c]"
          >
            Kings
          </Link>
          <Link
            href="/queens"
            className="text-medium font-medium transition-colors hover:text-[#b91c1c]"
          >
            Queens
          </Link>
          <Link
            href="/kittens"
            className="text-medium font-medium transition-colors hover:text-[#b91c1c]"
          >
            Kittens
          </Link>
          <Link
            href="/about"
            className="text-medium font-medium transition-colors hover:text-[#b91c1c]"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="text-medium font-medium transition-colors hover:text-[#b91c1c]"
          >
            Contact
          </Link>
        </nav>

        {/* Actions right */}
        <div className="flex items-center justify-end space-x-2">
          <div className="hidden md:flex items-center gap-2">
            {/* Theme segmented toggle (desktop) */}
            <div
              role="group"
              aria-label="Theme"
              className="relative flex items-center rounded-full border border-border bg-card p-0.5"
              title={isDark ? "Dark mode" : "Light mode"}
            >
              <span
                aria-hidden
                className={`absolute inset-y-0 my-0.5 w-1/2 rounded-full bg-muted transition-transform duration-200 ${
                  isDark ? "translate-x-full" : "translate-x-0"
                }`}
              />
              <button
                type="button"
                onClick={() => setTheme("light")}
                aria-label="Switch to light"
                className={`relative z-10 size-8 grid place-items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  !isDark
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                aria-label="Switch to dark"
                className={`relative z-10 size-8 grid place-items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  isDark
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="size-4" />
              </button>
            </div>
            {!isAuthenticated ? (
              <div className="flex space-x-2">
                <Link href="/sign-in">
                  <Button
                    variant="ghost"
                    size="sm"
                    className=" text-foreground hover:bg-muted transition-colors"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-red-700 text-white hover:bg-red-500 border-none"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Card className="group flex items-center gap-0 p-2 rounded-x-lg border border-border hover:shadow-md transition-all duration-200 bg-card">
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
                        <div className="font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200">
                          {user?.name || "User"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user?.role === "admin" ? "Admin" : "Customer"}
                        </div>
                      </div>
                      <ChevronDown
                        size={16}
                        className="text-muted-foreground group-hover:text-primary transition-colors duration-200 ml-1"
                      />
                    </div>
                  </Card>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-48 shadow-lg border border-border bg-card text-foreground rounded-lg p-1"
                >
                  <DropdownMenuItem
                    onClick={handleProfileClick}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200 cursor-pointer"
                  >
                    <UserIcon size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Profile
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleSettingsClick}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200 cursor-pointer"
                  >
                    <Settings size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Settings
                    </span>
                  </DropdownMenuItem>

                  {user?.role === "admin" && (
                    <DropdownMenuItem
                      onClick={handleAdminClick}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200 cursor-pointer"
                    >
                      <LayoutDashboard
                        size={16}
                        className="text-muted-foreground"
                      />
                      <span className="text-sm font-medium text-foreground">
                        Admin
                      </span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="my-1 bg-border" />

                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleLogoutClick}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 transition-colors duration-200 cursor-pointer text-red-600"
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
          <div className="md:hidden flex items-center gap-1">
            {/* Theme segmented toggle (mobile) */}
            <div
              role="group"
              aria-label="Theme"
              className="relative flex items-center rounded-full border border-border bg-card p-0.5"
            >
              <span
                aria-hidden
                className={`absolute inset-y-0 my-0.5 w-1/2 rounded-full bg-muted transition-transform duration-200 ${
                  isDark ? "translate-x-full" : "translate-x-0"
                }`}
              />
              <button
                type="button"
                onClick={() => setTheme("light")}
                aria-label="Switch to light"
                className={`relative z-10 size-8 grid place-items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  !isDark
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                aria-label="Switch to dark"
                className={`relative z-10 size-8 grid place-items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  isDark
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="size-4" />
              </button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="mr-1"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-[100] bg-background md:hidden overflow-y-auto">
          <nav className="container grid gap-3 p-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/kittens"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Kittens
            </Link>
            <Link
              href="/kings"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Kings
            </Link>
            <Link
              href="/queens"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Queens
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact Us
            </Link>
            <Separator className="my-2 " />
            {!isAuthenticated ? (
              <>
                <Link
                  href="/sign-in"
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 text-lg font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  className="text-left text-red-600 font-semibold"
                  onClick={() => {
                    handleLogoutClick();
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
