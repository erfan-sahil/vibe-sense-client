"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { Navbar } from "@/components/navbar";

const AUTH_PATHS = new Set(["/login", "/register"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname ? AUTH_PATHS.has(pathname) : false;

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("theme");
    const darkEnabled = savedTheme ? savedTheme === "dark" : true;
    root.classList.toggle("dark", darkEnabled);
  }, []);

  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </>
  );
}
