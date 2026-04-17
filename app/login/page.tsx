"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-12 rounded-xl border-border/60 bg-background/70 px-3.5 text-sm text-foreground transition-all placeholder:text-muted-foreground/75 focus-visible:border-primary/45 focus-visible:ring-3 focus-visible:ring-primary/15 dark:bg-black dark:border-input";

const primaryBtn =
  "w-full rounded-xl border border-primary/30 bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/85 hover:text-primary-foreground/90 hover:shadow-md disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? "Sign in failed");
        return;
      }
      router.push("/detect");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(120,120,120,0.15),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(120,120,120,0.15),transparent_45%)]" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-5 inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to home
        </Link>

        <div
          className={cn(
            "rounded-2xl bg-card/85 p-7 shadow-lg backdrop-blur-md sm:p-8"
          )}
        >
          <div className="mb-7 space-y-2 text-center">
            <span className="mx-auto inline-flex rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              SER Account
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                className={fieldClass}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                className={fieldClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
              />
            </div>

            {error ? (
              <Alert variant="destructive" className="rounded-xl">
                <AlertTitle>Could not sign in</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <button type="submit" className={primaryBtn} disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary underline-offset-4 transition hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
