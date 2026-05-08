import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";
import { LogOut } from "lucide-react";
import { getStats } from "@/lib/quest.functions";
import { XP_PER_LEVEL, xpIntoLevel } from "@/lib/xp";
import {
  getDailyQuests,
  readDoneExercises,
  type DailyQuestDef,
} from "@/lib/daily-quests";
import { supabase } from "@/integrations/supabase/client";
import { STATS_STALE } from "@/lib/query-keys";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — QuestFit" },
      { name: "description", content: "Your hero stats, weekly activity and progress to next level." },
    ],
  }),
  component: HomePage,
});

function Skel({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted ${className}`} />;
}

function HomeSkeleton() {
  return (
    <div className="px-5 pt-12 pb-6 space-y-6">
      <div className="space-y-2">
        <Skel className="h-3 w-16" />
        <Skel className="h-8 w-40" />
        <Skel className="h-6 w-28 rounded-full" />
      </div>
      <Skel className="h-32 w-full rounded-3xl" />
      <div className="space-y-3">
        <Skel className="h-20 w-full" />
        <Skel className="h-20 w-full" />
        <Skel className="h-20 w-full" />
      </div>
      <Skel className="h-44 w-full rounded-3xl" />
    </div>
  );
}

function CastleBackground() {
  const stars = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
      left:  `${(i * 37.7  + 11.3) % 100}%`,
      top:   `${(i * 53.1  +  7.9) % 88}%`,
      size:   i % 7 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1,
      delay: `${(i * 0.23) % 4}s`,
      dur:   `${2 + (i * 0.31) % 3}s`,
    })), []);

  /* Lime particles — 5 per torch, split left/right */
  const leftParticles  = useMemo(() => Array.from({ length: 5 }, (_, i) => ({ delay: `${i * 0.65}s`, dur: `${3.2 + i * 0.7}s`, drift: i % 2 === 0 ? 14 : -14 })), []);
  const rightParticles = useMemo(() => Array.from({ length: 5 }, (_, i) => ({ delay: `${i * 0.55 + 0.3}s`, dur: `${3.5 + i * 0.6}s`, drift: i % 2 === 0 ? -14 : 14 })), []);

  return (
    <div
      className="hidden md:block fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ background: '#0A0A1A' }}
      aria-hidden="true"
    >
      {/* ── 80 twinkling stars ── */}
      {stars.map((s, i) => (
        <div key={i} className="absolute rounded-full bg-white" style={{
          left: s.left, top: s.top,
          width: s.size, height: s.size,
          animation: `twinkle ${s.dur} ease-in-out ${s.delay} infinite`,
          willChange: 'transform, opacity',
        }} />
      ))}

      {/* ── Moon top-right with soft halo ── */}
      <div className="absolute rounded-full" style={{
        top: '7%', right: '9%',
        width: 88, height: 88,
        background: 'radial-gradient(circle at 38% 38%, #FFFCE8, #E8E8F5 55%, #C8C8E0)',
        animation: 'moon-glow 5s ease-in-out infinite',
        willChange: 'box-shadow',
      }} />
      {/* moon craters */}
      <div className="absolute rounded-full" style={{ top: 'calc(7% + 16px)', right: 'calc(9% + 14px)', width: 15, height: 15, background: '#B8B8D8', opacity: 0.22 }} />
      <div className="absolute rounded-full" style={{ top: 'calc(7% + 40px)', right: 'calc(9% + 30px)', width: 9,  height: 9,  background: '#B8B8D8', opacity: 0.16 }} />
      <div className="absolute rounded-full" style={{ top: 'calc(7% + 26px)', right: 'calc(9% + 52px)', width: 6,  height: 6,  background: '#B8B8D8', opacity: 0.14 }} />

      {/* ── 3 clouds drifting left→right ── */}
      {([
        { top: '11%', dur: '50s', delay: '0s',    opacity: 0.11, scale: 1.0 },
        { top: '17%', dur: '68s', delay: '-23s',  opacity: 0.08, scale: 0.72 },
        { top: '7%',  dur: '85s', delay: '-48s',  opacity: 0.07, scale: 0.5  },
      ] as const).map((c, i) => (
        <div key={i} style={{
          position: 'absolute', top: c.top, left: 0,
          animation: `cloud-drift ${c.dur} linear ${c.delay} infinite`,
          willChange: 'transform',
          opacity: c.opacity,
          transform: `scale(${c.scale})`,
          transformOrigin: 'left center',
        }}>
          <svg viewBox="0 0 260 90" width="260" height="90">
            <ellipse cx="130" cy="68" rx="110" ry="22" fill="white" />
            <ellipse cx="85"  cy="54" rx="52"  ry="32" fill="white" />
            <ellipse cx="130" cy="46" rx="65"  ry="38" fill="white" />
            <ellipse cx="175" cy="56" rx="48"  ry="28" fill="white" />
          </svg>
        </div>
      ))}

      {/* ── 3 ravens flying at different speeds & heights ── */}
      {([
        { top: '21%', dur: '26s', delay: '0s',   bobDur: '0.44s', flip: false },
        { top: '30%', dur: '36s', delay: '-12s',  bobDur: '0.56s', flip: true  },
        { top: '16%', dur: '46s', delay: '-30s',  bobDur: '0.50s', flip: false },
      ] as const).map((r, i) => (
        <div key={i} style={{
          position: 'absolute', top: r.top,
          animation: `raven-fly ${r.dur} linear ${r.delay} infinite`,
          willChange: 'transform',
        }}>
          <div style={{
            animation: `raven-bob ${r.bobDur} ease-in-out infinite`,
            willChange: 'transform',
            transform: r.flip ? 'scaleX(-1)' : undefined,
          }}>
            {/* Raven SVG — simple winged silhouette */}
            <svg viewBox="0 0 90 36" width="72" height="29" style={{ display: 'block' }}>
              {/* left wing */}
              <path d="M 43 18 C 30 9, 16 14, 2 11 C 14 14, 28 17, 40 20 Z" fill="#1A1A2E" />
              {/* right wing */}
              <path d="M 47 18 C 60 9, 74 14, 88 11 C 76 14, 62 17, 50 20 Z" fill="#1A1A2E" />
              {/* body */}
              <ellipse cx="45" cy="19" rx="8" ry="4.5" fill="#1A1A2E" />
              {/* head */}
              <ellipse cx="52" cy="14" rx="5.5" ry="4.5" fill="#1A1A2E" />
              {/* beak */}
              <path d="M 56.5 13 L 63 14.5 L 56.5 16 Z" fill="#1A1A2E" />
              {/* tail feathers */}
              <path d="M 38 21 C 32 27, 28 30, 25 29" stroke="#1A1A2E" strokeWidth="2"   fill="none" strokeLinecap="round" />
              <path d="M 38 21 C 34 28, 31 31, 29 30" stroke="#1A1A2E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      ))}

      {/* ── Left torch on wall ── */}
      {/* glow halo */}
      <div style={{
        position: 'absolute', left: 'calc(20% - 35px)', bottom: '148px',
        width: 70, height: 70, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,160,0,0.55) 0%, rgba(255,80,0,0.22) 45%, transparent 70%)',
        animation: 'torch-flicker 1.75s ease-in-out infinite',
        willChange: 'transform, opacity',
      }} />
      {/* flame */}
      <div style={{
        position: 'absolute', left: 'calc(20% - 5px)', bottom: '172px',
        width: 10, height: 16,
        background: 'radial-gradient(ellipse at 50% 85%, #FFE066, #FF7700)',
        borderRadius: '50% 50% 35% 35%',
        animation: 'torch-flicker 1.75s ease-in-out infinite',
        willChange: 'transform, opacity',
      }} />
      {/* handle */}
      <div style={{ position: 'absolute', left: 'calc(20% - 3px)', bottom: '148px', width: 6, height: 24, background: '#5A3A18', borderRadius: 3 }} />

      {/* ── Right torch on wall ── */}
      <div style={{
        position: 'absolute', left: 'calc(57% - 35px)', bottom: '148px',
        width: 70, height: 70, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,160,0,0.55) 0%, rgba(255,80,0,0.22) 45%, transparent 70%)',
        animation: 'torch-flicker 2.05s ease-in-out infinite',
        animationDelay: '0.45s',
        willChange: 'transform, opacity',
      }} />
      <div style={{
        position: 'absolute', left: 'calc(57% - 5px)', bottom: '172px',
        width: 10, height: 16,
        background: 'radial-gradient(ellipse at 50% 85%, #FFE066, #FF7700)',
        borderRadius: '50% 50% 35% 35%',
        animation: 'torch-flicker 2.05s ease-in-out infinite',
        animationDelay: '0.45s',
        willChange: 'transform, opacity',
      }} />
      <div style={{ position: 'absolute', left: 'calc(57% - 3px)', bottom: '148px', width: 6, height: 24, background: '#5A3A18', borderRadius: 3 }} />

      {/* ── Lime particles rising from left torch ── */}
      {leftParticles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: '20%', bottom: '172px',
          width: 3, height: 3, borderRadius: '50%', background: '#C8FF00',
          animation: `particle-rise ${p.dur} ease-in ${p.delay} infinite`,
          willChange: 'transform, opacity',
          ['--drift' as any]: `${p.drift}px`,
          opacity: 0,
        }} />
      ))}

      {/* ── Lime particles rising from right torch ── */}
      {rightParticles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: '57%', bottom: '172px',
          width: 3, height: 3, borderRadius: '50%', background: '#C8FF00',
          animation: `particle-rise ${p.dur} ease-in ${p.delay} infinite`,
          willChange: 'transform, opacity',
          ['--drift' as any]: `${p.drift}px`,
          opacity: 0,
        }} />
      ))}

      {/* ── Castle silhouette SVG ── */}
      <svg
        viewBox="0 0 1440 310"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '310px' }}
      >
        {/* Ground fill */}
        <rect x="0" y="270" width="1440" height="40" fill="#10101C" />

        {/* === FAR LEFT MINI TOWER === */}
        <rect x="0"  y="155" width="38" height="155" fill="#0E0E1A" />
        <rect x="0"  y="137" width="14" height="20"  fill="#0E0E1A" />
        <rect x="22" y="137" width="14" height="20"  fill="#0E0E1A" />

        {/* === LEFT OUTER TOWER === */}
        <rect x="50" y="100" width="120" height="210" fill="#141424" />
        <rect x="50"  y="80" width="22" height="24" fill="#141424" />
        <rect x="80"  y="80" width="22" height="24" fill="#141424" />
        <rect x="110" y="80" width="22" height="24" fill="#141424" />
        <rect x="140" y="80" width="22" height="24" fill="#141424" />
        {/* arrow slit */}
        <rect x="101" y="138" width="10" height="28" rx="5" fill="#09090F" />
        <rect x="101" y="195" width="10" height="22" rx="5" fill="#09090F" />
        {/* side flag */}
        <line x1="84"  y1="42" x2="84"  y2="82" stroke="#C8FF00" strokeWidth="1.5" opacity="0.55" />
        <polygon points="84,42 108,53 84,64" fill="#C8FF00" opacity="0.5" />

        {/* === LEFT WALL SECTION === */}
        <rect x="170" y="170" width="310" height="140" fill="#111120" />
        {/* battlements */}
        {Array.from({ length: 9 }, (_, k) => (
          <rect key={k} x={178 + k * 32} y="150" width="20" height="24" fill="#111120" />
        ))}
        {/* wall archer slits */}
        <rect x="246" y="192" width="9" height="26" rx="4" fill="#09090F" />
        <rect x="340" y="196" width="9" height="26" rx="4" fill="#09090F" />
        <rect x="434" y="192" width="9" height="26" rx="4" fill="#09090F" />

        {/* === MAIN KEEP — CENTER (tallest) === */}
        <rect x="480" y="55" width="260" height="255" fill="#161628" />
        {/* battlements */}
        {Array.from({ length: 8 }, (_, k) => (
          <rect key={k} x={488 + k * 30} y="32" width="20" height="28" fill="#161628" />
        ))}
        {/* tall windows */}
        <rect x="520" y="110" width="32" height="60" rx="16" fill="#09090F" />
        <rect x="590" y="110" width="32" height="60" rx="16" fill="#09090F" />
        <rect x="660" y="110" width="32" height="60" rx="16" fill="#09090F" />
        {/* drawbridge pointed arch */}
        <path d="M 548 310 L 548 216 Q 610 168 672 216 L 672 310 Z" fill="#09090F" />
        {/* portcullis grid */}
        {[568, 588, 608, 628, 648].map(x => (
          <line key={x} x1={x} y1="216" x2={x} y2="310" stroke="#12121E" strokeWidth="3.5" />
        ))}
        {[230, 252, 274, 296].map(y => (
          <line key={y} x1="548" y1={y} x2="672" y2={y} stroke="#12121E" strokeWidth="3.5" />
        ))}
        {/* ★ MAIN FLAG — lime, on tallest tower ★ */}
        <line x1="610" y1="0" x2="610" y2="34" stroke="#C8FF00" strokeWidth="2.5" />
        <polygon points="610,0 652,15 610,30" fill="#C8FF00" />

        {/* === RIGHT WALL SECTION === */}
        <rect x="740" y="170" width="310" height="140" fill="#111120" />
        {Array.from({ length: 9 }, (_, k) => (
          <rect key={k} x={748 + k * 32} y="150" width="20" height="24" fill="#111120" />
        ))}
        <rect x="806"  y="192" width="9" height="26" rx="4" fill="#09090F" />
        <rect x="900"  y="196" width="9" height="26" rx="4" fill="#09090F" />
        <rect x="994"  y="192" width="9" height="26" rx="4" fill="#09090F" />

        {/* === RIGHT OUTER TOWER === */}
        <rect x="1050" y="100" width="120" height="210" fill="#141424" />
        <rect x="1050" y="80" width="22" height="24" fill="#141424" />
        <rect x="1080" y="80" width="22" height="24" fill="#141424" />
        <rect x="1110" y="80" width="22" height="24" fill="#141424" />
        <rect x="1140" y="80" width="22" height="24" fill="#141424" />
        <rect x="1091" y="138" width="10" height="28" rx="5" fill="#09090F" />
        <rect x="1091" y="195" width="10" height="22" rx="5" fill="#09090F" />
        <line x1="1110" y1="42" x2="1110" y2="82" stroke="#C8FF00" strokeWidth="1.5" opacity="0.55" />
        <polygon points="1110,42 1134,53 1110,64" fill="#C8FF00" opacity="0.5" />

        {/* === FAR RIGHT MINI TOWER === */}
        <rect x="1402" y="155" width="38" height="155" fill="#0E0E1A" />
        <rect x="1402" y="137" width="14" height="20"  fill="#0E0E1A" />
        <rect x="1424" y="137" width="14" height="20"  fill="#0E0E1A" />

        {/* subtle stone mortar lines on main keep */}
        {[90, 130, 170, 210, 250].map(y => (
          <line key={y} x1="480" y1={y} x2="740" y2={y} stroke="#12121E" strokeWidth="1" opacity="0.6" />
        ))}
      </svg>
    </div>
  );
}

const TYPE_META = {
  strength:    { icon: "⚔️", label: "Strength",    accent: "#EF4444" },
  cardio:      { icon: "🏃", label: "Cardio",       accent: "#3B82F6" },
  flexibility: { icon: "🧘", label: "Flexibility",  accent: "#10B981" },
} as const;

function DailyQuestCard({
  quest,
  done,
  onStart,
}: {
  quest: DailyQuestDef;
  done: boolean;
  onStart: () => void;
}) {
  const meta = TYPE_META[quest.type];

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: done ? 0.65 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <span className="text-xl shrink-0" aria-hidden>{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 leading-tight truncate">{quest.exercise}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
            style={{ background: meta.accent }}
          >
            {meta.label}
          </span>
          <span className="text-xs text-gray-500">{quest.sets}</span>
        </div>
      </div>
      <span className="text-xs font-semibold shrink-0 text-gray-600">+{quest.xp} XP</span>
      {done ? (
        <span
          className="h-7 w-7 rounded-full grid place-items-center shrink-0"
          style={{ background: "#22C55E" }}
          aria-label="Completed"
        >
          <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6l3 3 5-5" />
          </svg>
        </span>
      ) : (
        <button
          onClick={onStart}
          className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-80"
          style={{ background: meta.accent }}
          aria-label={`Start ${quest.exercise}`}
        >
          Start →
        </button>
      )}
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const dailyQuests = useMemo(() => getDailyQuests(), []);
  const [doneExercises, setDoneExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDoneExercises(readDoneExercises());
  }, []);

  const startQuest = (quest: DailyQuestDef) => {
    sessionStorage.setItem(
      "questfit-prefill",
      JSON.stringify({ exercise: quest.exercise, type: quest.type, isDailyQuest: true }),
    );
    navigate({ to: "/log" });
  };

  const fn = useServerFn(getStats);
  const { data, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: () => fn(),
    staleTime: STATS_STALE,
  });

  if (isLoading || !data) {
    return <HomeSkeleton />;
  }
  const { profile, weekly, recent } = data as any;
  const xpInto = xpIntoLevel(profile.xp);
  const xpPct = (xpInto / XP_PER_LEVEL) * 100;

  return (
    <div className="theme-active relative min-h-screen">
      <CastleBackground />

      <div className="relative z-10 px-5 md:px-8 pt-12 pb-6 md:max-w-[1100px] md:mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold md:text-white/50">Hero</p>
            <h1 className="font-display text-3xl font-bold mt-1 md:text-white">{profile.name}</h1>
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-foreground text-background text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {profile.title}
            </span>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="h-10 w-10 grid place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground md:bg-white/10 md:text-white/60 md:hover:text-white"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Desktop 2-col grid / mobile single col */}
        <div className="mt-6 md:grid md:grid-cols-2 md:gap-4">
          {/* Left column: level + streak */}
          <div className="space-y-4">
            {/* Level + XP card */}
            <div className="rounded-3xl bg-card p-5 shadow-card relative overflow-hidden ring-1 ring-border">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground grid place-items-center font-display font-bold text-2xl shadow-glow">
                  {profile.level}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Level</p>
                  <p className="font-display text-xl font-bold">{xpInto} / {XP_PER_LEVEL} XP</p>
                </div>
              </div>
              <div className="mt-4 h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${xpPct}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{XP_PER_LEVEL - xpInto} XP to level {profile.level + 1}</p>
              <p className="mt-1 text-xs text-muted-foreground">Total XP: {profile.xp.toLocaleString()}</p>
            </div>

            {/* Streak */}
            <div className="rounded-3xl p-5 flex items-center gap-4 bg-amber-50 ring-1 ring-amber-200">
              <div className="h-14 w-14 rounded-2xl bg-amber-400/90 grid place-items-center text-3xl shadow-sm">
                🔥
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest text-amber-900/70 font-semibold">Current streak</p>
                <p className="font-display text-2xl font-bold text-amber-950">
                  {profile.current_streak ?? 0} {(profile.current_streak ?? 0) === 1 ? "day" : "days"}
                </p>
              </div>
              <p className="text-xs text-amber-900/70 font-semibold">Keep it alive!</p>
            </div>

            {/* Daily Quests */}
            <div>
              <h2 className="mb-3 font-display text-lg font-bold md:text-white mt-7 md:mt-0">
                Daily Quests
              </h2>
              <div className="space-y-2">
                {dailyQuests.map((q) => (
                  <DailyQuestCard
                    key={q.id}
                    quest={q}
                    done={doneExercises.has(q.exercise.toLowerCase())}
                    onStart={() => startQuest(q)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right column: stats + chart + recent */}
          <div className="space-y-4 mt-4 md:mt-0">
            {/* Stats */}
            <div>
              <h2 className="mb-3 font-display text-lg font-bold md:text-white mt-7 md:mt-0">Stats</h2>
              <div className="space-y-3">
                <StatCard label="Strength" icon="💪" value={profile.strength} colorVar="--strength" />
                <StatCard label="Endurance" icon="🏃" value={profile.endurance} colorVar="--endurance" />
                <StatCard label="Agility" icon="⚡" value={profile.agility} colorVar="--agility" />
              </div>
            </div>

            {/* Weekly chart */}
            <div>
              <h2 className="mb-3 font-display text-lg font-bold md:text-white mt-7 md:mt-0">This week</h2>
              <div className="rounded-3xl bg-card p-4 shadow-card">
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekly} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 600 }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 8, 8]} maxBarSize={28} minPointSize={6}>
                        {weekly.map((d: any, i: number) => {
                          const isToday = i === weekly.length - 1;
                          const empty = (d.count ?? 0) === 0;
                          const fill = empty
                            ? "color-mix(in oklab, var(--muted-foreground) 12%, transparent)"
                            : isToday
                              ? "var(--primary)"
                              : "#0A0A0A";
                          return <Cell key={i} fill={fill} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent quests */}
            {recent.length > 0 && (
              <div>
                <h2 className="mb-3 font-display text-lg font-bold md:text-white mt-7 md:mt-0">Recent quests</h2>
                <div className="space-y-2">
                  {recent.map((r: any, i: number) => {
                    const dot =
                      r.type === "strength" ? "bg-red-500" : r.type === "cardio" ? "bg-blue-500" : "bg-emerald-500";
                    const xp = r.type === "strength" ? 120 : r.type === "cardio" ? 100 : 80;
                    return (
                      <div key={i} className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${dot}`} />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{r.exercise}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {r.type} · {r.sets}×{r.reps}{r.weight > 0 ? ` · ${r.weight}kg` : ""}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground shrink-0 ml-2">
                          +{xp} XP · {new Date(r.date).toLocaleDateString(undefined, { weekday: "short" })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, icon, value, colorVar }: { label: string; icon: string; value: number; colorVar: string }) {
  const pct = Math.min(100, value);
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold flex items-center gap-2">
          <span aria-hidden>{icon}</span>
          {label}
        </p>
        <p className="font-display font-bold text-2xl">{value}</p>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: `var(${colorVar})` }} />
      </div>
    </div>
  );
}
