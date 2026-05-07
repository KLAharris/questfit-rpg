import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

export const Route = createFileRoute("/_authenticated/coach")({
  head: () => ({
    meta: [
      { title: "AI Coach — QuestFit" },
      { name: "description", content: "Chat with Sir Cadence, your AI fitness coach." },
    ],
  }),
  component: CoachPage,
});

interface Msg { from: "coach" | "user"; text: string }

const STARTERS: Msg[] = [
  { from: "coach", text: "Greetings, hero. I am Sir Cadence, your training companion. ⚔️" },
  { from: "coach", text: "Tell me — what quest shall we conquer today?" },
];

const REPLIES = [
  "A noble pursuit. Push hard but listen to your body.",
  "Aye, that path leads to greatness. Keep your form sharp.",
  "Rest is part of the quest. Recover well, hero.",
  "Excellent. Stack small wins and the legend will follow.",
];

function CoachPage() {
  const [messages, setMessages] = useState<Msg[]>(STARTERS);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { from: "coach", text: REPLIES[Math.floor(Math.random() * REPLIES.length)] }]);
    }, 700);
  };

  return (
    <div className="flex flex-col h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 border-b border-border bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-foreground text-primary grid place-items-center text-2xl shadow-card">
            🛡️
          </div>
          <div>
            <p className="font-display text-lg font-bold leading-tight">Sir Cadence</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> AI Coach
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[78%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed ${
                m.from === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md font-medium"
                  : "bg-card text-foreground rounded-bl-md shadow-card"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={send}
        className="fixed bottom-[72px] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-3 pb-2 bg-background"
      >
        <div className="flex items-center gap-2 bg-card rounded-full pl-5 pr-2 py-2 shadow-card">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your coach…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button
            type="submit"
            className="h-10 w-10 grid place-items-center rounded-full bg-primary text-primary-foreground"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
