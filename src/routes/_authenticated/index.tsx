import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";
import { LogOut } from "lucide-react";
import { getStats } from "@/lib/quest.functions";
import { XP_PER_LEVEL, xpIntoLevel } from "@/lib/xp";
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
  return (
    <div
      className="hidden md:block fixed inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-500"
      style={{ background: '#0F0F1A' }}
      aria-hidden="true"
    >
      {/* Stone wall texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(255,255,255,0.025) 47px, rgba(255,255,255,0.025) 48px),' +
            'repeating-linear-gradient(90deg, transparent, transparent 71px, rgba(255,255,255,0.02) 71px, rgba(255,255,255,0.02) 72px)',
        }}
      />

      {/* Lime particles drifting upward */}
      {[12, 22, 35, 48, 61, 74, 83, 91].map((left, i) => (
        <div
          key={i}
          className="absolute bottom-0 w-1 h-1 rounded-full bg-[#C8FF00]"
          style={{
            left: `${left}%`,
            animation: `particle-rise ${6 + i * 1.1}s ease-in infinite`,
            animationDelay: `${i * 0.85}s`,
            ['--drift' as any]: `${i % 2 === 0 ? 20 : -20}px`,
            opacity: 0,
          }}
        />
      ))}

      {/* Left torch */}
      <div className="absolute" style={{ left: '8%', top: '35%' }}>
        <div
          className="w-3 h-8 rounded-t-full"
          style={{
            background: 'radial-gradient(ellipse at 50% 80%, #FF8C00, #FF4500, transparent)',
            animation: 'torch-flicker 1.8s ease-in-out infinite',
            filter: 'blur(1px)',
            boxShadow: '0 0 20px 8px rgba(255,140,0,0.35), 0 0 40px 16px rgba(255,100,0,0.15)',
          }}
        />
        <div className="w-2 h-5 bg-[#3A2A1A] mx-auto rounded-b" />
      </div>

      {/* Right torch */}
      <div className="absolute" style={{ right: '8%', top: '35%' }}>
        <div
          className="w-3 h-8 rounded-t-full"
          style={{
            background: 'radial-gradient(ellipse at 50% 80%, #FF8C00, #FF4500, transparent)',
            animation: 'torch-flicker 2.1s ease-in-out infinite',
            animationDelay: '0.4s',
            filter: 'blur(1px)',
            boxShadow: '0 0 20px 8px rgba(255,140,0,0.35), 0 0 40px 16px rgba(255,100,0,0.15)',
          }}
        />
        <div className="w-2 h-5 bg-[#3A2A1A] mx-auto rounded-b" />
      </div>

      {/* Castle SVG silhouette at bottom */}
      <svg
        viewBox="0 0 1440 260"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '260px' }}
      >
        {/* Ground */}
        <rect x="0" y="220" width="1440" height="40" fill="#141422" />
        {/* Left tower */}
        <rect x="40" y="70" width="120" height="190" fill="#161628" />
        <rect x="40" y="50" width="22" height="26" fill="#161628" />
        <rect x="72" y="50" width="22" height="26" fill="#161628" />
        <rect x="104" y="50" width="22" height="26" fill="#161628" />
        <rect x="136" y="50" width="22" height="26" fill="#161628" />
        <line x1="90" y1="10" x2="90" y2="52" stroke="#C8FF00" strokeWidth="2" opacity="0.65" />
        <polygon points="90,10 118,22 90,34" fill="#C8FF00" opacity="0.65" />
        {/* Left wall */}
        <rect x="160" y="155" width="360" height="105" fill="#131321" />
        <rect x="168" y="135" width="18" height="24" fill="#131321" />
        <rect x="198" y="135" width="18" height="24" fill="#131321" />
        <rect x="228" y="135" width="18" height="24" fill="#131321" />
        <rect x="258" y="135" width="18" height="24" fill="#131321" />
        <rect x="288" y="135" width="18" height="24" fill="#131321" />
        <rect x="318" y="135" width="18" height="24" fill="#131321" />
        <rect x="348" y="135" width="18" height="24" fill="#131321" />
        <rect x="378" y="135" width="18" height="24" fill="#131321" />
        <rect x="408" y="135" width="18" height="24" fill="#131321" />
        <rect x="438" y="135" width="18" height="24" fill="#131321" />
        <rect x="468" y="135" width="18" height="24" fill="#131321" />
        {/* Center gate tower */}
        <rect x="520" y="75" width="200" height="185" fill="#161628" />
        <rect x="520" y="53" width="24" height="28" fill="#161628" />
        <rect x="555" y="53" width="24" height="28" fill="#161628" />
        <rect x="590" y="53" width="24" height="28" fill="#161628" />
        <rect x="625" y="53" width="24" height="28" fill="#161628" />
        <rect x="660" y="53" width="24" height="28" fill="#161628" />
        <rect x="695" y="53" width="24" height="28" fill="#161628" />
        {/* Gate arch */}
        <path d="M 565 260 L 565 178 Q 620 138 675 178 L 675 260 Z" fill="#0A0A14" />
        {/* Center flag */}
        <line x1="620" y1="12" x2="620" y2="55" stroke="#C8FF00" strokeWidth="2.5" opacity="0.9" />
        <polygon points="620,12 656,26 620,40" fill="#C8FF00" opacity="0.9" />
        {/* Right wall */}
        <rect x="720" y="155" width="360" height="105" fill="#131321" />
        <rect x="728" y="135" width="18" height="24" fill="#131321" />
        <rect x="758" y="135" width="18" height="24" fill="#131321" />
        <rect x="788" y="135" width="18" height="24" fill="#131321" />
        <rect x="818" y="135" width="18" height="24" fill="#131321" />
        <rect x="848" y="135" width="18" height="24" fill="#131321" />
        <rect x="878" y="135" width="18" height="24" fill="#131321" />
        <rect x="908" y="135" width="18" height="24" fill="#131321" />
        <rect x="938" y="135" width="18" height="24" fill="#131321" />
        <rect x="968" y="135" width="18" height="24" fill="#131321" />
        <rect x="998" y="135" width="18" height="24" fill="#131321" />
        <rect x="1028" y="135" width="18" height="24" fill="#131321" />
        {/* Right tower */}
        <rect x="1080" y="70" width="120" height="190" fill="#161628" />
        <rect x="1080" y="50" width="22" height="26" fill="#161628" />
        <rect x="1112" y="50" width="22" height="26" fill="#161628" />
        <rect x="1144" y="50" width="22" height="26" fill="#161628" />
        <rect x="1176" y="50" width="22" height="26" fill="#161628" />
        <line x1="1140" y1="10" x2="1140" y2="52" stroke="#C8FF00" strokeWidth="2" opacity="0.65" />
        <polygon points="1140,10 1168,22 1140,34" fill="#C8FF00" opacity="0.65" />
        {/* Far side mini towers */}
        <rect x="0" y="130" width="42" height="130" fill="#12121F" />
        <rect x="1398" y="130" width="42" height="130" fill="#12121F" />
      </svg>
    </div>
  );
}

function HomePage() {
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
