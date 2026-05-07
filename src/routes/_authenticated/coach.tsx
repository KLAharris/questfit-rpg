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

function WizardTowerBackground() {
  return (
    <div
      className="hidden md:block fixed inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-500"
      style={{ background: '#080C1A' }}
      aria-hidden="true"
    >
      {/* Subtle star field */}
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${(i * 37 + 11) % 100}%`,
            top: `${(i * 53 + 7) % 80}%`,
            width: i % 5 === 0 ? '2px' : '1px',
            height: i % 5 === 0 ? '2px' : '1px',
            opacity: 0.2 + (i % 4) * 0.1,
          }}
        />
      ))}

      {/* Floating magical orbs */}
      {[
        { left: '12%', top: '25%', size: 40, color: '#4C1D95', delay: 0 },
        { left: '80%', top: '20%', size: 56, color: '#312E81', delay: 1.2 },
        { left: '6%',  top: '55%', size: 30, color: '#5B21B6', delay: 0.7 },
        { left: '88%', top: '50%', size: 44, color: '#1E1B4B', delay: 2.0 },
        { left: '50%', top: '10%', size: 24, color: '#6D28D9', delay: 1.5 },
      ].map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: orb.left,
            top: orb.top,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            background: `radial-gradient(circle at 35% 35%, ${orb.color}cc, ${orb.color}44)`,
            boxShadow: `0 0 ${orb.size}px ${orb.size / 2}px ${orb.color}55, 0 0 ${orb.size * 2}px ${orb.color}22`,
            animation: `orb-float ${4 + i * 0.8}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}

      {/* Soft purple glow around center (chat area) */}
      <div
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(109,40,217,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Bookshelf SVG at bottom */}
      <svg
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '160px' }}
      >
        {/* Shelf boards */}
        <rect x="0" y="100" width="1440" height="8" fill="#1A1030" />
        <rect x="0" y="148" width="1440" height="12" fill="#1A1030" />
        {/* Books on shelf 1 */}
        <rect x="20"  y="55" width="18" height="46" fill="#2D1B69" rx="2" />
        <rect x="40"  y="62" width="14" height="39" fill="#1E3A5F" rx="2" />
        <rect x="56"  y="50" width="20" height="51" fill="#3B1F6B" rx="2" />
        <rect x="78"  y="60" width="16" height="41" fill="#1A3650" rx="2" />
        <rect x="96"  y="53" width="22" height="48" fill="#2A1A55" rx="2" />
        <rect x="120" y="65" width="12" height="36" fill="#3D2060" rx="2" />
        <rect x="134" y="58" width="18" height="43" fill="#1C3060" rx="2" />
        {/* Gap */}
        <rect x="200" y="52" width="20" height="49" fill="#2B1E5C" rx="2" />
        <rect x="222" y="60" width="15" height="41" fill="#1A2E55" rx="2" />
        <rect x="239" y="55" width="19" height="46" fill="#34196A" rx="2" />
        <rect x="260" y="63" width="14" height="38" fill="#1E3855" rx="2" />
        {/* Right side books */}
        <rect x="1100" y="56" width="19" height="45" fill="#2D1B69" rx="2" />
        <rect x="1121" y="63" width="15" height="38" fill="#1C2E60" rx="2" />
        <rect x="1138" y="50" width="22" height="51" fill="#3A1F65" rx="2" />
        <rect x="1162" y="61" width="16" height="40" fill="#1E3358" rx="2" />
        <rect x="1180" y="54" width="20" height="47" fill="#2A1A55" rx="2" />
        <rect x="1202" y="66" width="13" height="35" fill="#34196A" rx="2" />
        <rect x="1217" y="57" width="18" height="44" fill="#1A2E5A" rx="2" />
        <rect x="1237" y="52" width="21" height="49" fill="#2E1C60" rx="2" />
        <rect x="1260" y="62" width="15" height="39" fill="#1C3258" rx="2" />
        <rect x="1277" y="55" width="20" height="46" fill="#301A62" rx="2" />
        <rect x="1299" y="63" width="14" height="38" fill="#1E3060" rx="2" />
        <rect x="1315" y="56" width="19" height="45" fill="#2A1F58" rx="2" />
        {/* Shelf side panels */}
        <rect x="0"    y="55" width="14" height="106" fill="#150E2A" />
        <rect x="1426" y="55" width="14" height="106" fill="#150E2A" />
        {/* Books on lower shelf */}
        <rect x="20"  y="112" width="16" height="38" fill="#1C2A50" rx="2" />
        <rect x="38"  y="118" width="12" height="32" fill="#281655" rx="2" />
        <rect x="52"  y="113" width="18" height="37" fill="#1A2E58" rx="2" />
        <rect x="1100" y="112" width="16" height="38" fill="#1C2A50" rx="2" />
        <rect x="1118" y="118" width="12" height="32" fill="#281655" rx="2" />
        <rect x="1132" y="113" width="18" height="37" fill="#1A2E58" rx="2" />
      </svg>
    </div>
  );
}

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
    <div className="theme-active relative">
      <WizardTowerBackground />

      {/* Centered chat container */}
      <div
        className="relative z-10 flex flex-col h-screen pb-24 md:pb-0 md:max-w-[640px] md:mx-auto"
      >
        {/* Header */}
        <div className="px-5 pt-12 pb-4 border-b border-border bg-background md:bg-[#080C1A]/80 md:backdrop-blur-sm md:border-white/10 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-foreground text-primary grid place-items-center text-2xl shadow-card">
              🛡️
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight md:text-white">Sir Cadence</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 md:text-white/50">
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

        {/* Input — fixed on mobile, relative at bottom on desktop */}
        <form
          onSubmit={send}
          className="fixed bottom-[72px] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-3 pb-2 bg-background
            md:relative md:bottom-auto md:left-auto md:translate-x-0 md:max-w-none md:px-5 md:pb-5 md:bg-transparent"
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
    </div>
  );
}
