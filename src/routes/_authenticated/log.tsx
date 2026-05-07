import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { logWorkout } from "@/lib/quest.functions";

export const Route = createFileRoute("/_authenticated/log")({
  head: () => ({
    meta: [
      { title: "Quest Log — QuestFit" },
      { name: "description", content: "Log today's workout and earn XP." },
    ],
  }),
  component: LogPage,
});

const TYPES = [
  { value: "strength", label: "💪 Strength" },
  { value: "cardio", label: "🏃 Cardio" },
  { value: "flexibility", label: "🧘 Flexibility" },
] as const;

function DungeonBackground() {
  return (
    <div
      className="hidden md:block fixed inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-500"
      style={{ background: '#0A0A0F' }}
      aria-hidden="true"
    >
      {/* Stone brick pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.018) 39px, rgba(255,255,255,0.018) 40px),' +
            'repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,255,255,0.014) 59px, rgba(255,255,255,0.014) 60px)',
        }}
      />

      {/* Dungeon arch at top */}
      <svg
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '200px' }}
      >
        {/* Arch frame */}
        <path
          d="M 0 0 L 0 120 Q 100 180 200 120 L 200 0 Z"
          fill="#111118"
          opacity="0.9"
        />
        <path
          d="M 1240 0 L 1240 120 Q 1340 180 1440 120 L 1440 0 Z"
          fill="#111118"
          opacity="0.9"
        />
        {/* Stone blocks at top */}
        <rect x="0" y="0" width="1440" height="12" fill="#0D0D14" />
        <rect x="0" y="0" width="48" height="30" fill="#0E0E16" />
        <rect x="56" y="0" width="48" height="30" fill="#0D0D14" />
        <rect x="112" y="0" width="48" height="30" fill="#0E0E16" />
        <rect x="168" y="0" width="48" height="30" fill="#0D0D14" />
        <rect x="224" y="0" width="48" height="30" fill="#0E0E16" />
        <rect x="280" y="0" width="48" height="30" fill="#0D0D14" />
        <rect x="336" y="0" width="48" height="30" fill="#0E0E16" />
        <rect x="392" y="0" width="48" height="30" fill="#0D0D14" />
        <rect x="448" y="0" width="48" height="30" fill="#0E0E16" />
        <rect x="504" y="0" width="48" height="30" fill="#0D0D14" />
        <rect x="560" y="0" width="48" height="30" fill="#0E0E16" />
        <rect x="616" y="0" width="48" height="30" fill="#0D0D14" />
        <rect x="672" y="0" width="48" height="30" fill="#0E0E16" />
        <rect x="728" y="0" width="48" height="30" fill="#0D0D14" />
        <rect x="784" y="0" width="48" height="30" fill="#0E0E16" />
        <rect x="840" y="0" width="48" height="30" fill="#0D0D14" />
        <rect x="896" y="0" width="48" height="30" fill="#0E0E16" />
        <rect x="952" y="0" width="48" height="30" fill="#0D0D14" />
        <rect x="1008" y="0" width="48" height="30" fill="#0E0E16" />
        <rect x="1064" y="0" width="48" height="30" fill="#0D0D14" />
        <rect x="1120" y="0" width="48" height="30" fill="#0E0E16" />
        <rect x="1176" y="0" width="48" height="30" fill="#0D0D14" />
        <rect x="1232" y="0" width="48" height="30" fill="#0E0E16" />
        <rect x="1288" y="0" width="48" height="30" fill="#0D0D14" />
        <rect x="1344" y="0" width="48" height="30" fill="#0E0E16" />
        <rect x="1400" y="0" width="40" height="30" fill="#0D0D14" />
      </svg>

      {/* Corner rune elements */}
      {[
        { style: { top: '15%', left: '5%' } },
        { style: { top: '15%', right: '5%' } },
        { style: { bottom: '20%', left: '5%' } },
        { style: { bottom: '20%', right: '5%' } },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute text-[#7C3AED] text-2xl select-none"
          style={{
            ...pos.style,
            animation: `rune-pulse ${2.5 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.6}s`,
          }}
        >
          ᚱ
        </div>
      ))}

      {/* Mist at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '120px',
          background: 'linear-gradient(to top, rgba(20,10,40,0.7), transparent)',
          animation: 'mist-drift 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '80px',
          background: 'linear-gradient(to top, rgba(15,8,30,0.5), transparent)',
          animation: 'mist-drift 11s ease-in-out infinite',
          animationDelay: '2s',
        }}
      />
    </div>
  );
}

function LogPage() {
  const fn = useServerFn(logWorkout);
  const qc = useQueryClient();
  const [type, setType] = useState<(typeof TYPES)[number]["value"]>("strength");
  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState<{ xp: number; pr: boolean; level: string | null } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise.trim()) return toast.error("Name your quest first.");
    setSubmitting(true);
    try {
      const res = await fn({ data: { type, exercise: exercise.trim(), sets, reps, weight } });
      setPopup({ xp: res.xpGained, pr: res.prUnlocked, level: res.newTitle });
      setTimeout(() => setPopup(null), 2400);
      if (res.unlockedBadges.length > 0) {
        toast.success(`🏆 Achievement: ${res.unlockedBadges.join(", ")}`);
      }
      setExercise("");
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["achievements"] });
    } catch (err: any) {
      toast.error(err.message ?? "Quest failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="theme-active relative min-h-screen">
      <DungeonBackground />

      <div className="relative z-10 px-5 md:px-8 pt-12 pb-6 md:max-w-[560px] md:mx-auto">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold md:text-white/50">New entry</p>
        <h1 className="font-display text-3xl font-bold mt-1 md:text-white">Log a quest</h1>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 md:text-white/60">Type</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {TYPES.map((t) => (
                <button
                  type="button" key={t.value} onClick={() => setType(t.value)}
                  className={`flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-2xl text-[11px] leading-tight font-semibold transition-all min-w-0 ${
                    type === t.value
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "bg-card text-foreground shadow-card"
                  }`}
                >
                  <span className="text-base leading-none" aria-hidden>
                    {t.value === "strength" ? "💪" : t.value === "cardio" ? "🏃" : "🧘"}
                  </span>
                  <span className="truncate w-full">
                    {t.value === "strength" ? "Strength" : t.value === "cardio" ? "Cardio" : "Flexibility"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Field label="Exercise">
            <input
              type="text" value={exercise} onChange={(e) => setExercise(e.target.value)}
              placeholder="Bench Press"
              className="w-full rounded-2xl bg-card px-4 py-3.5 text-sm shadow-card outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Sets">
              <NumberInput value={sets} onChange={setSets} min={1} max={50} />
            </Field>
            <Field label="Reps">
              <NumberInput value={reps} onChange={setReps} min={1} max={500} />
            </Field>
            <Field label="Weight (kg)">
              <NumberInput value={weight} onChange={setWeight} min={0} max={1000} />
            </Field>
          </div>

          <button
            type="submit" disabled={submitting}
            className="w-full mt-4 rounded-2xl bg-primary py-4 font-display text-base font-bold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {submitting ? "Completing..." : "⚔️ Complete Quest"}
          </button>
        </form>

        <AnimatePresence>
          {popup && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed inset-0 z-50 grid place-items-center px-6 pointer-events-none"
            >
              <div className="bg-foreground text-background rounded-3xl px-8 py-7 shadow-glow text-center pointer-events-auto">
                <motion.p
                  initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 12 }}
                  className="font-display text-5xl font-bold text-primary"
                >
                  +{popup.xp} XP
                </motion.p>
                {popup.pr && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="mt-3 inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold"
                  >
                    🏆 PR UNLOCKED!
                  </motion.p>
                )}
                {popup.level && (
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="mt-3 text-sm font-semibold"
                  >
                    ⬆️ New title: {popup.level}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground mb-2 block md:text-white/60">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({ value, onChange, min, max }: { value: number; onChange: (n: number) => void; min: number; max: number }) {
  return (
    <input
      type="number" value={value} min={min} max={max}
      onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
      className="w-full rounded-2xl bg-card px-3 py-3.5 text-sm font-semibold shadow-card outline-none focus:ring-2 focus:ring-ring"
    />
  );
}
