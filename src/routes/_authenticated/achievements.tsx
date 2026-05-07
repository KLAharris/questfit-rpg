import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Lock } from "lucide-react";
import { getAchievements } from "@/server/quest.functions";

export const Route = createFileRoute("/_authenticated/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — QuestFit" },
      { name: "description", content: "Unlock badges as you level up your hero." },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const fn = useServerFn(getAchievements);
  const { data, isLoading } = useQuery({ queryKey: ["achievements"], queryFn: () => fn() });

  if (isLoading || !data) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  const unlocked = data.filter((d: any) => d.unlocked).length;

  return (
    <div className="px-5 pt-12 pb-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Hall of Fame</p>
      <h1 className="font-display text-3xl font-bold mt-1">Achievements</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        <span className="font-bold text-foreground">{unlocked}</span> / {data.length} unlocked
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
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
  );
}
