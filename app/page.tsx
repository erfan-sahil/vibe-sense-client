import Link from "next/link";
import { ArrowRight, LineChart, Mic, HeartPulse, BookHeart, MessageCircle, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  { title: "Emotion detection", href: "/detect", icon: Mic, copy: "Upload speech and see probabilities for six emotion classes." },
  { title: "Stress monitor", href: "/stress", icon: LineChart, copy: "Turn model outputs into a stress score and guided tips." },
  { title: "Wellness check-ins", href: "/wellness", icon: HeartPulse, copy: "Log how you sound and track streak-aware alerts." },
  { title: "Mood journal", href: "/journal", icon: BookHeart, copy: "Keep notes with auto-tagged emotions and filters." },
  { title: "Analytics", href: "/analytics", icon: Sparkles, copy: "See how your emotions distribute over time." },
  { title: "Assistant", href: "/chat", icon: MessageCircle, copy: "Chat with an emotion-aware helper." },
];

export default function HomePage() {
  return (
    <div className="space-y-14 pb-10">
      <section className="space-y-6 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Emotional wellbeing platform</p>
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Detect emotion, monitor stress, and build healthier daily patterns
        </h1>
        <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
          Analyze speech in seconds, review your emotional trends, journal key moments, and get assistant-guided support in one clear workflow.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/detect" className={cn(buttonVariants({ size: "lg" }), "inline-flex items-center gap-2")}>
            Detect emotion <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }), "rounded-xl")}
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ title, href, icon: Icon, copy }) => (
          <Link
            key={href}
            href={href}
            className="group block rounded-xl ring-1 ring-border transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-muted/45 hover:shadow-md hover:ring-primary/20 dark:hover:bg-muted/30"
          >
            <Card className="border-0 bg-transparent shadow-none ring-0">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors duration-200 group-hover:bg-primary/25">
                  <Icon className="size-5 transition-transform duration-200 group-hover:scale-105" />
                </div>
                <CardTitle className="text-lg transition-colors duration-200 group-hover:text-primary">
                  {title}
                </CardTitle>
                <CardDescription>{copy}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-medium text-primary transition-transform duration-200 group-hover:translate-x-0.5">
                  Open →
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
