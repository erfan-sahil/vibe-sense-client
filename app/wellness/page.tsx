"use client";

import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";

type CheckinResponse = {
  score: number;
  emotion: string;
  confidence: number;
  streak: number;
  alert: Record<string, unknown> | string | null;
};

type Overview = {
  timeline: unknown;
  streak: number;
  alert: Record<string, unknown> | string | null;
  report: unknown;
};

export default function WellnessPage() {
  const [payload, setPayload] = useState(
    '{"predicted_label":"Neutral","confidence":0.7,"probabilities":{"Neutral":0.7}}'
  );
  const [result, setResult] = useState<CheckinResponse | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Overview>("/api/wellness/overview")
      .then(setOverview)
      .catch(() => setOverview(null));
  }, []);

  const handleCheckin = async () => {
    try {
      setError("");
      const parsed = JSON.parse(payload);
      const data = await apiFetch<CheckinResponse>("/api/wellness/checkin", {
        method: "POST",
        body: JSON.stringify(parsed),
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check-in failed");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wellness</h1>
        <p className="mt-2 text-muted-foreground">Voice check-ins and a snapshot of your last 30 days.</p>
      </div>

      {overview ? (
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Negative-emotion streak: {overview.streak}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {overview.alert ? <pre className="overflow-x-auto rounded-md bg-muted/50 p-3 text-xs">{JSON.stringify(overview.alert, null, 2)}</pre> : <p>No alert right now.</p>}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>New check-in</CardTitle>
          <CardDescription>Payload matches the wellness API (dominant label + confidence + probabilities).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="well-json">JSON body</Label>
            <Textarea id="well-json" className="min-h-32 font-mono text-xs" value={payload} onChange={(e) => setPayload(e.target.value)} />
          </div>
          <Button onClick={handleCheckin}>Submit check-in</Button>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle>Score {result.score}</CardTitle>
            <CardDescription>
              {result.emotion} · {(result.confidence * 100).toFixed(1)}% — streak {result.streak}
            </CardDescription>
          </CardHeader>
          {result.alert ? (
            <CardContent>
              <pre className="rounded-md bg-muted/50 p-3 text-xs">{JSON.stringify(result.alert, null, 2)}</pre>
            </CardContent>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
