import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Lock } from "lucide-react";
import { getAchievements } from "@/lib/quest.functions";
import { ACHIEVEMENTS_STALE } from "@/lib/query-keys";

export const Route = createFileRoute("/_authenticated/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — QuestFit" },
      { name: "description", content: "Unlock badges as you level up your hero." },
    ],
  }),
  component: AchievementsPage,
});

function GrandHallBackground() {
  return (
    <div
      className="hidden md:block fixed inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-500"
      style={{ background: '#120818' }}
      aria-hidden="true"
    >
      {/* Subtle radial spotlight behind grid */}
      <div
        className="absolute"
        style={{
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70vw',
          height: '70vw',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(200,162,39,0.18) 0%, transparent 70%)',
          animation: 'spotlight-breathe 4s ease-in-out infinite',
        }}
      />

      {/* Hanging banners */}
      {[15, 35, 50, 65, 85].map((left, i) => (
        <div key={i} className="absolute top-0" style={{ left: `${left}%` }}>
          <div
            className="w-8 rounded-b-lg"
            style={{
              height: `${60 + (i % 3) * 20}px`,
              background: i % 2 === 0
                ? 'linear-gradient(180deg, #2A0A3A, #4A1060)'
                : 'linear-gradient(180deg, #1A0828, #3A0850)',
              borderLeft: '2px solid rgba(200,162,39,0.4)',
              borderRight: '2px solid rgba(200,162,39,0.4)',
              borderBottom: '2px solid rgba(200,162,39,0.4)',
            }}
          >
            <div className="w-full h-1 bg-[#C8A227]/50 mt-2" />
            <div className="w-4 h-4 mx-auto mt-3 border border-[#C8A227]/40 rotate-45" />
          </div>
          {/* Rope */}
          <div className="w-px h-4 bg-[#C8A227]/30 mx-auto" style={{ marginTop: '-2px' }} />
        </div>
      ))}

      {/* Gold accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8A227]/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8A227]/30 to-transparent" />

      {/* Floating sparkles */}
      {[10, 25, 40, 55, 70, 85].map((left, i) => (
        <div
          key={i}
          className="absolute text-[#C8A227] text-sm select-none"
          style={{
            left: `${left}%`,
            top: `${20 + (i % 4) * 15}%`,
            animation: `sparkle-spin ${3 + i * 0.6}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
            opacity: 0,
          }}
        >
          ✦
        </div>
      ))}

      {/* Corner gold elements */}
      <div
        className="absolute top-20 left-8 w-12 h-12 border-2 border-[#C8A227]/25 rotate-45"
        style={{ boxShadow: '0 0 12px rgba(200,162,39,0.15)' }}
      />
      <div
        className="absolute top-20 right-8 w-12 h-12 border-2 border-[#C8A227]/25 rotate-45"
        style={{ boxShadow: '0 0 12px rgba(200,162,39,0.15)' }}
      />
    </div>
  );
}

function AchievementsSkeleton() {
  return (
    <div className="px-5 pt-12 pb-6 space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-20 rounded bg-muted animate-pulse" />
        <div className="h-8 w-44 rounded bg-muted animate-pulse" />
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] rounded-3xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function AchievementsPage() {
  const fn = useServerFn(getAchievements);
  const { data, isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => fn(),
    staleTime: ACHIEVEMENTS_STALE,
  });

  if (isLoading || !data) {
    return <AchievementsSkeleton />;
  }

  const unlocked = data.filter((d: any) => d.unlocked).length;

  return (
    <div className="theme-active relative min-h-screen">
      <GrandHallBackground />

      <div className="relative z-10 px-5 md:px-8 pt-12 pb-6 md:max-w-[1100px] md:mx-auto">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold md:text-white/50">Hall of Fame</p>
        <h1 className="font-display text-3xl font-bold mt-1 md:text-white">Achievements</h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-white/50">
          <span className="font-bold text-foreground md:text-white">{unlocked}</span> / {data.length} unlocked
        </p>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.map((b: any) => (
            <div
              key={b.name}
              className={`rounded-3xl p-4 aspect-[4/5] flex flex-col items-center justify-center text-center transition-all ${
                b.unlocked
                  ? "bg-card shadow-glow"
                  : "bg-muted opacity-70"
              }`}
            >
              <div
                className={`h-16 w-16 rounded-2xl grid place-items-center text-3xl mb-3 ${
                  b.unlocked ? "bg-primary" : "bg-card grayscale"
                }`}
              >
                {b.unlocked ? b.icon : <Lock className="h-6 w-6 text-muted-foreground" />}
              </div>
              <p className={`font-display font-bold text-sm ${!b.unlocked && "text-muted-foreground"}`}>
                {b.name}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
