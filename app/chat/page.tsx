"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiFetch } from "@/lib/api";

type ChatTurn = { role: "user" | "bot"; content: string };

type ChatResponse = { reply: string };

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<{ messages: ChatTurn[] }>("/api/chat/messages")
      .then((d) => setTurns(d.messages))
      .catch(() => setTurns([]));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  const send = async () => {
    if (!message.trim()) return;
    const userText = message.trim();
    setTurns((prev) => [...prev, { role: "user", content: userText }]);
    setMessage("");
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<ChatResponse>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: userText }),
      });
      setTurns((prev) => [...prev, { role: "bot", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assistant</h1>
        <p className="mt-2 text-muted-foreground">Emotion-aware chat backed by your FastAPI service.</p>
      </div>

      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="border-b border-border/60">
          <CardTitle>Conversation</CardTitle>
          <CardDescription>Messages are persisted per account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3 p-0">
          <ScrollArea className="h-[min(420px,50vh)] px-4 py-3">
            <div className="space-y-3">
              {turns.map((turn, i) => (
                <div
                  key={`${turn.role}-${i}`}
                  className={
                    turn.role === "user"
                      ? "ml-8 rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "mr-8 rounded-2xl bg-muted px-3 py-2 text-sm"
                  }
                >
                  {turn.content}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
          <div className="flex gap-2 border-t border-border/60 p-3">
            <Input
              placeholder="Type a message…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), void send())}
            />
            <Button size="icon" onClick={send} disabled={loading} aria-label="Send">
              <Send className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Chat error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
