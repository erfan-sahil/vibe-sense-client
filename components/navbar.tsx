"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Mic2, Moon, Sun } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

const links = [
  ["Detect", "/detect"],
  ["History", "/history"],
  ["Analytics", "/analytics"],
  ["Stress", "/stress"],
  ["Wellness", "/wellness"],
  ["Journal", "/journal"],
  ["Chat", "/chat"],
  ["Insights", "/insights"],
] as const;

type MeResponse = {
  user: { id: string; username: string; email: string } | null;
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<MeResponse["user"] | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    apiFetch<MeResponse>("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("theme");
    const darkEnabled = savedTheme
      ? savedTheme === "dark"
      : root.classList.contains("dark");

    root.classList.toggle("dark", darkEnabled);
    setIsDark(darkEnabled);
    setThemeReady(true);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const nextIsDark = !isDark;

    root.classList.toggle("dark", nextIsDark);
    localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    setIsDark(nextIsDark);
  };

  const logout = async () => {
    await apiFetch<{ ok: boolean }>("/api/auth/logout", {
      method: "POST",
      body: "{}",
    });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Mic2 className="size-4" />
          </span>
          <span className="hidden sm:inline">VibeSense</span>
        </Link>

        <nav className="hidden flex-1 flex-wrap items-center justify-center gap-1 md:flex">
          {links.map(([label, href]) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "rounded-none bg-transparent px-3 text-muted-foreground transition-colors duration-200",
                  "hover:bg-transparent hover:text-foreground hover:underline hover:underline-offset-8",
                  active &&
                    "font-medium text-foreground underline underline-offset-8 hover:text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {themeReady && isDark ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "icon-sm" }),
                "md:hidden",
              )}
              aria-label="Menu"
            >
              <Menu className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {links.map(([label, href]) => (
                <DropdownMenuItem key={href} onClick={() => router.push(href)}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {!loaded ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.username}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-xl border-border/80 px-4 transition-all duration-200 hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
              )}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
