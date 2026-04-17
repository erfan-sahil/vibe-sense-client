"use client";

import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/api";

type Distribution = { labels: string[]; counts: number[] };

type Timeline = { dates: string[]; datasets: Record<string, number[]> };

export default function AnalyticsPage() {
  const [distribution, setDistribution] = useState<Distribution | null>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch<Distribution>("/api/analytics/distribution?days=30"),
      apiFetch<Timeline>("/api/analytics/timeline?days=14"),
    ])
      .then(([d, t]) => {
        setDistribution(d);
        setTimeline(t);
      })
      .catch((err) => setError(err.message));
  }, []);

  const maxCount = distribution ? Math.max(...distribution.counts, 1) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-2 text-muted-foreground">Lightweight charts from your stored emotion records.</p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Unauthorized or API error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="distribution">
        <TabsList>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="timeline">By day</TabsTrigger>
        </TabsList>
        <TabsContent value="distribution" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Last 30 days</CardTitle>
              <CardDescription>How often each emotion was predicted</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!distribution ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                distribution.labels.map((label, i) => {
                  const count = distribution.counts[i] ?? 0;
                  return (
                    <div key={label}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{label}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-chart-2"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>14-day activity</CardTitle>
              <CardDescription>Total detections per day (all emotions)</CardDescription>
            </CardHeader>
            <CardContent>
              {!timeline ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <ul className="space-y-2 text-sm">
                  {timeline.dates.map((d) => {
                    const total = Object.values(timeline.datasets).reduce(
                      (acc, series) => acc + (series[timeline.dates.indexOf(d)] ?? 0),
                      0
                    );
                    return (
                      <li key={d} className="flex justify-between border-b border-border/50 py-1">
                        <span>{d}</span>
                        <span className="text-muted-foreground">{total} samples</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
