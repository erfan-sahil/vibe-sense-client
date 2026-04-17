"use client";

import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";

type JournalEntry = {
  id: string;
  audio_emotion: string;
  confidence: number;
  text_note: string;
  tags: string[];
  created_at: string;
};

type JournalResponse = {
  entries: JournalEntry[];
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<JournalResponse>("/api/journal/entries?limit=30")
      .then((data) => setEntries(data.entries))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mood journal</h1>
        <p className="mt-2 text-muted-foreground">Entries stored with detected vocal emotion.</p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load journal</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Recent entries</CardTitle>
          <CardDescription>Newest first</CardDescription>
        </CardHeader>
        <CardContent>
          {entries === null ? (
            <div className="space-y-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No journal rows yet.</p>
          ) : (
            <ScrollArea className="h-[min(560px,65vh)] pr-4">
              <div className="space-y-4">
                {entries.map((entry) => (
                  <article key={entry.id} className="rounded-xl border border-border/60 bg-card/40 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{entry.audio_emotion}</Badge>
                      <span className="text-xs text-muted-foreground">{(entry.confidence * 100).toFixed(1)}%</span>
                      <span className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-sm">{entry.text_note || "—"}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
