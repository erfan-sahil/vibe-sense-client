"use client";

import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";

type HistoryRecord = {
  id: string;
  predicted_label: string;
  confidence: number;
  source: string;
  created_at: string;
};

type HistoryResponse = {
  records: HistoryRecord[];
  total: number;
};

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<HistoryResponse>("/api/history?limit=50")
      .then((data) => setRecords(data.records))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="mt-2 text-muted-foreground">Past detections tied to your signed-in session.</p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load history</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Recent records</CardTitle>
          <CardDescription>Newest first</CardDescription>
        </CardHeader>
        <CardContent>
          {records === null ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : records.length === 0 ? (
            <p className="text-sm text-muted-foreground">No records yet. Run a detection while logged in.</p>
          ) : (
            <ScrollArea className="h-[min(480px,60vh)] pr-4">
              <ul className="space-y-3">
                {records.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{r.predicted_label}</Badge>
                      <span className="text-muted-foreground">{(r.confidence * 100).toFixed(1)}%</span>
                      <span className="text-muted-foreground">{r.source}</span>
                    </div>
                    <time className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</time>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
