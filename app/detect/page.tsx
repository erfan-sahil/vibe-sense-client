"use client";

import { useMemo, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const MIME_EXTENSION_MAP: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/wave": "wav",
  "audio/x-wav": "wav",
};

type PredictResponse = {
  predicted_label: string;
  confidence: number;
  probabilities: Record<string, number>;
};

export default function DetectPage() {
  const [mode, setMode] = useState<"upload" | "live">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PredictResponse | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const sorted = useMemo(() => {
    if (!result) return [] as [string, number][];
    return Object.entries(result.probabilities).sort((a, b) => b[1] - a[1]);
  }, [result]);

  const stopMicrophone = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    setRecording(false);
  };

  const startRecording = async () => {
    setError("");
    setResult(null);
    setRecordedFile(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const supportsWebm = MediaRecorder.isTypeSupported("audio/webm");
      const mediaRecorder = supportsWebm
        ? new MediaRecorder(stream, { mimeType: "audio/webm" })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      });

      mediaRecorder.addEventListener("stop", () => {
        if (chunksRef.current.length === 0) {
          stopMicrophone();
          setError("No audio recorded. Please try again.");
          return;
        }
        const normalizedMimeType = mediaRecorder.mimeType.split(";")[0].trim().toLowerCase();
        const mimeType = normalizedMimeType || "audio/webm";
        const extension = MIME_EXTENSION_MAP[mimeType] ?? "webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const liveFile = new File([blob], `live-${Date.now()}.${extension}`, { type: mimeType });
        setRecordedFile(liveFile);
        stopMicrophone();
      });

      mediaRecorder.start();
      setRecording(true);
    } catch (e) {
      stopMicrophone();
      setError(e instanceof Error ? e.message : "Microphone access failed.");
    }
  };

  const finishRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const selectedFile = mode === "upload" ? file : recordedFile;
    if (!selectedFile) {
      setError(mode === "upload" ? "Choose an audio file first." : "Record audio first.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      setResult((await response.json()) as PredictResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Detect emotion</h1>
        <p className="mt-2 text-muted-foreground">
          WAV, MP3, WebM, or OGG — up to 10&nbsp;MB. Sign in on the API to save history automatically.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload</CardTitle>
          <CardDescription>Choose upload mode or record live from your microphone.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={mode === "upload" ? "default" : "outline"}
                onClick={() => {
                  setMode("upload");
                  setError("");
                  setResult(null);
                }}
              >
                Upload mode
              </Button>
              <Button
                type="button"
                variant={mode === "live" ? "default" : "outline"}
                onClick={() => {
                  setMode("live");
                  setError("");
                  setResult(null);
                }}
              >
                Live mode
              </Button>
            </div>

            {mode === "upload" ? (
            <div className="space-y-2">
              <Label htmlFor="audio">Audio file</Label>
              <Input
                id="audio"
                type="file"
                accept="audio/wav,audio/mpeg,audio/webm,audio/ogg,.wav,.mp3,.webm,.ogg"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            ) : (
              <div className="space-y-3 rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">
                  Record a short clip, then run live detection.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={startRecording} disabled={recording || loading}>
                    Start recording
                  </Button>
                  <Button type="button" variant="secondary" onClick={finishRecording} disabled={!recording || loading}>
                    Stop recording
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {recording
                    ? "Recording in progress..."
                    : recordedFile
                      ? `Recorded clip ready (${(recordedFile.size / 1024).toFixed(0)} KB)`
                      : "No recording yet."}
                </p>
              </div>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Analyzing…" : mode === "upload" ? "Run detection" : "Run live detection"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {result ? (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Result</CardTitle>
              <CardDescription>Top class and full distribution</CardDescription>
            </div>
            <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary">
              {result.predicted_label} · {(result.confidence * 100).toFixed(1)}%
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {sorted.map(([label, value]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="text-muted-foreground">{(value * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.max(value * 100, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
