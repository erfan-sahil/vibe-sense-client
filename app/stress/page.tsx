"use client";

import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";

type StressResponse = {
  score: number;
  level: string;
  recommendation: { title?: string; tips?: string[]; level?: string } | null;
};

type SessionsResponse = { sessions: { avg_stress: number; peak_stress: number; duration_sec: number; created_at: string }[] };

export default function StressPage() {
  const [jsonInput, setJsonInput] = useState('{"Happy":0.2,"Neutral":0.5,"Sad":0.3}');
  const [result, setResult] = useState<StressResponse | null>(null);
  const [sessions, setSessions] = useState<SessionsResponse["sessions"] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<SessionsResponse>("/api/stress/sessions")
      .then((d) => setSessions(d.sessions))
      .catch(() => setSessions([]));
  }, []);

  const handleCompute = async () => {
    try {
      setError("");
      const probabilities = JSON.parse(jsonInput) as Record<string, number>;
      const data = await apiFetch<StressResponse>("/api/stress/compute", {
        method: "POST",
        body: JSON.stringify({ probabilities }),
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid request.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stress index</h1>
        <p className="mt-2 text-muted-foreground">
          Paste emotion probabilities (same keys as the model) to get a stress score and tips.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compute</CardTitle>
            <CardDescription>JSON object of label → probability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="prob-json">Probabilities</Label>
              <Textarea
                id="prob-json"
                className="min-h-36 font-mono text-xs"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
            </div>
            <Button onClick={handleCompute}>Calculate stress</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent sessions</CardTitle>
            <CardDescription>Last 10 saved monitoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {!sessions?.length ? (
              <p className="text-sm text-muted-foreground">No sessions yet (or not signed in).</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {sessions.map((s, i) => (
                  <li key={`${s.created_at}-${i}`} className="flex justify-between rounded-md border border-border/60 px-2 py-1.5">
                    <span>
                      avg {s.avg_stress} · peak {s.peak_stress}
                    </span>
                    <span className="text-muted-foreground">{s.duration_sec}s</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {result.level} <span className="text-muted-foreground">({result.score})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {result.recommendation?.title ? (
              <div>
                <p className="font-medium text-foreground">{result.recommendation.title}</p>
                <ul className="mt-2 list-inside list-disc">
                  {(result.recommendation.tips ?? []).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>Stress looks manageable.</p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
