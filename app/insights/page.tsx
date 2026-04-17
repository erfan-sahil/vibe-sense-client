"use client";

import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";

type InsightsData =
  | { has_data: false }
  | {
      has_data: true;
      total_records: number;
      dominant_all_time: string;
      dominant_this_week: string;
      week_total: number;
      volatility: number;
      neg_streak: number;
      streak_emotion: string;
      pos_streak: number;
      tips: string[];
      activity_change: number;
    };

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<InsightsData>("/api/insights")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
        <p className="mt-2 text-muted-foreground">Patterns distilled from your emotion history.</p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load insights</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {!data ? (
        <Skeleton className="h-48 w-full" />
      ) : !data.has_data ? (
        <Card>
          <CardHeader>
            <CardTitle>No data yet</CardTitle>
            <CardDescription>Log a few voice sessions while signed in to unlock insights.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>This week</CardTitle>
              <CardDescription>
                Dominant: <Badge className="ml-1">{data.dominant_this_week}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="text-foreground">{data.week_total}</span> samples in the last 7 days · activity change{" "}
                <span className="text-foreground">{data.activity_change >= 0 ? "+" : ""}
                {data.activity_change}</span>
              </p>
              <p>Volatility index: {data.volatility}%</p>
              <p>
                Negative streak: {data.neg_streak} day(s) {data.streak_emotion ? `(${data.streak_emotion})` : ""}
              </p>
              <p>Positive streak: {data.pos_streak} day(s)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>All time</CardTitle>
              <CardDescription>
                {data.total_records} records · dominant <Badge>{data.dominant_all_time}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-foreground">Tips for your recent week</p>
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                {data.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
