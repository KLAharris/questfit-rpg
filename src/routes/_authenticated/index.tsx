import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";
import { LogOut } from "lucide-react";
import { getStats } from "@/lib/quest.functions";
import { XP_PER_LEVEL, xpIntoLevel } from "@/lib/xp";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — QuestFit" },
      { name: "description", content: "Your hero stats, weekly activity and progress to next level." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const fn = useServerFn(getStats);
  const { data, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: () => fn(),
  });

  if (isLoading || !data) {
    return <div className="p-6 text-sm text-muted-foreground">Loading your hero…</div>;
  }
  const { profile, weekly, recent } = data as any;
  const xpInto = xpIntoLevel(profile.xp);
  const xpPct = (xpInto / XP_PER_LEVEL) * 100;

  return (
    <div className="px-5 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Hero</p>
          <h1 className="font-display text-3xl font-bold mt-1">{profile.name}</h1>
          <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-foreground text-background text-xs font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {profile.title}
          </span>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="h-10 w-10 grid place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Level + XP card */}
      <div className="mt-6 rounded-3xl bg-card p-5 shadow-card relative overflow-hidden border-l-4 border-primary">
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

      {/* Stats */}
      <h2 className="mt-7 mb-3 font-display text-lg font-bold">Stats</h2>
      <div className="space-y-3">
        <StatCard label="Strength" icon="💪" value={profile.strength} colorVar="--strength" />
        <StatCard label="Endurance" icon="🏃" value={profile.endurance} colorVar="--endurance" />
        <StatCard label="Agility" icon="⚡" value={profile.agility} colorVar="--agility" />
      </div>

      {/* Weekly chart */}
      <h2 className="mt-7 mb-3 font-display text-lg font-bold">This week</h2>
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

      {/* Recent */}
      {recent.length > 0 && (
        <>
          <h2 className="mt-7 mb-3 font-display text-lg font-bold">Recent quests</h2>
          <div className="space-y-2">
            {recent.map((r: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
                <div>
                  <p className="font-semibold text-sm">{r.exercise}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {r.type} · {r.sets}×{r.reps}{r.weight > 0 ? ` · ${r.weight}kg` : ""}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.date).toLocaleDateString(undefined, { weekday: "short" })}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, colorVar }: { label: string; value: number; colorVar: string }) {
  const pct = Math.min(100, value);
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold">{label}</p>
        <p className="font-display font-bold text-lg">{value}</p>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: `var(${colorVar})` }} />
      </div>
    </div>
  );
}
