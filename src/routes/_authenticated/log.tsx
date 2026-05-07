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
  const drips = [
    { left: 'calc(240px + 30px)', dur: '5.2s', delay: '0s',   h: '62vh' },
    { left: 'calc(240px + 120px)',dur: '4.1s', delay: '1.8s', h: '55vh' },
    { left: '30%', dur: '6.0s', delay: '0.7s', h: '70vh' },
    { left: '40%', dur: '4.8s', delay: '3.2s', h: '58vh' },
    { left: '52%', dur: '5.5s', delay: '1.2s', h: '65vh' },
    { left: '63%', dur: '3.9s', delay: '4.1s', h: '50vh' },
    { left: '75%', dur: '6.3s', delay: '2.4s', h: '72vh' },
    { left: '87%', dur: '4.6s', delay: '0.5s', h: '60vh' },
  ];

  const embers = [5, 12, 19, 27, 35, 43, 51, 59, 66, 73, 81, 88, 94].map((left, i) => ({
    left:   `${left}%`,
    dur:    `${3.4 + (i * 0.58) % 2.8}s`,
    delay:  `${(i * 0.52) % 3.8}s`,
    size:   i % 4 === 0 ? 4 : 3,
    color:  i % 3 === 0 ? '#FFAA00' : i % 3 === 1 ? '#FF6600' : '#FF4400',
    driftA: i % 2 === 0 ?  18 : -16,
    driftB: i % 2 === 0 ? -10 :  14,
  }));

  return (
    <div
      className="hidden md:block fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ background: '#08080F' }}
      aria-hidden="true"
    >
      {/* ── Stone brick texture ── */}
      <div className="absolute inset-0" style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 43px, rgba(255,255,255,0.022) 43px, rgba(255,255,255,0.022) 44px),' +
          'repeating-linear-gradient(90deg, transparent, transparent 63px, rgba(255,255,255,0.016) 63px, rgba(255,255,255,0.016) 64px)',
      }} />

      {/* ── Dungeon arch at top — stone ceiling with arch cut-out ── */}
      <svg
        viewBox="0 0 1440 230"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '230px' }}
      >
        {/* Ceiling fill — the arch opening is the gap in the bottom edge */}
        <path d="M 0 0 L 1440 0 L 1440 230 L 980 230 Q 720 95 460 230 L 0 230 Z" fill="#0B0B14" />

        {/* Alternating brick rows */}
        {Array.from({ length: 26 }, (_, k) => (
          <rect key={`a${k}`} x={k * 56}      y="0"  width="52" height="36" fill={k%2===0?'#0D0D18':'#0E0E1A'} stroke="#07070E" strokeWidth="1" />
        ))}
        {Array.from({ length: 27 }, (_, k) => (
          <rect key={`b${k}`} x={k * 56 - 28} y="36" width="52" height="36" fill={k%2===0?'#0C0C16':'#0D0D18'} stroke="#06060D" strokeWidth="1" />
        ))}
        {Array.from({ length: 26 }, (_, k) => (
          <rect key={`c${k}`} x={k * 56}      y="72" width="52" height="36" fill={k%2===0?'#0D0D18':'#0E0E1A'} stroke="#07070E" strokeWidth="1" />
        ))}
        {Array.from({ length: 27 }, (_, k) => (
          <rect key={`d${k}`} x={k * 56 - 28} y="108" width="52" height="36" fill={k%2===0?'#0C0C16':'#0D0D18'} stroke="#06060D" strokeWidth="1" />
        ))}

        {/* Left stone pillar */}
        <rect x="390" y="0" width="72" height="230" fill="#090912" stroke="#06060D" strokeWidth="1" />
        {/* Right stone pillar */}
        <rect x="978" y="0" width="72" height="230" fill="#090912" stroke="#06060D" strokeWidth="1" />

        {/* Arch inner shadow (depth) */}
        <path d="M 460 230 Q 720 95 980 230" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="32" />
        {/* Arch outer molding */}
        <path d="M 460 230 Q 720 95 980 230" fill="none" stroke="#1E1E30" strokeWidth="10" />
        {/* Arch inner highlight */}
        <path d="M 460 230 Q 720 95 980 230" fill="none" stroke="#2A2A42" strokeWidth="4" />

        {/* Keystone */}
        <polygon points="712,90 720,68 728,90 724,98 716,98" fill="#1A1A2C" stroke="#282840" strokeWidth="1.5" />
        <line x1="720" y1="68" x2="720" y2="58" stroke="#28284044" strokeWidth="2" />
      </svg>

      {/* ── Left chain ── */}
      <div style={{
        position: 'absolute', top: 0, left: '7%',
        transformOrigin: 'top center',
        animation: 'chain-sway 5.5s ease-in-out infinite',
        willChange: 'transform',
      }}>
        <svg width="28" height="240" viewBox="0 0 28 240">
          {Array.from({ length: 12 }, (_, k) => (
            k % 2 === 0
              ? <ellipse key={k} cx="14" cy={k*20+9} rx="9"   ry="4.5" fill="none" stroke="#303050" strokeWidth="2" />
              : <ellipse key={k} cx="14" cy={k*20+9} rx="4.5" ry="9"   fill="none" stroke="#2C2C4A" strokeWidth="2" />
          ))}
        </svg>
      </div>

      {/* ── Right chain ── */}
      <div style={{
        position: 'absolute', top: 0, right: '7%',
        transformOrigin: 'top center',
        animation: 'chain-sway 7s ease-in-out infinite',
        animationDelay: '1.3s',
        willChange: 'transform',
      }}>
        <svg width="28" height="240" viewBox="0 0 28 240">
          {Array.from({ length: 12 }, (_, k) => (
            k % 2 === 0
              ? <ellipse key={k} cx="14" cy={k*20+9} rx="9"   ry="4.5" fill="none" stroke="#303050" strokeWidth="2" />
              : <ellipse key={k} cx="14" cy={k*20+9} rx="4.5" ry="9"   fill="none" stroke="#2C2C4A" strokeWidth="2" />
          ))}
        </svg>
      </div>

      {/* ── Corner rune symbols (4 different runes) ── */}
      {([
        { pos: { top: '28%',    left: 'calc(240px + 24px)' }, char: 'ᚱ', dur: '2.8s', delay: '0s'   },
        { pos: { top: '28%',    right: '4%'               }, char: 'ᚢ', dur: '3.4s', delay: '0.7s' },
        { pos: { bottom: '18%', left: 'calc(240px + 24px)' }, char: 'ᚦ', dur: '3.0s', delay: '1.4s' },
        { pos: { bottom: '18%', right: '4%'               }, char: 'ᚨ', dur: '2.6s', delay: '2.1s' },
      ] as const).map((r, i) => (
        <div key={i} style={{
          position: 'absolute',
          ...r.pos,
          fontSize: 34,
          color: '#7C3AED',
          fontFamily: 'serif',
          lineHeight: 1,
          animation: `rune-pulse ${r.dur} ease-in-out ${r.delay} infinite`,
          willChange: 'opacity, filter',
          userSelect: 'none',
        }}>
          {r.char}
        </div>
      ))}

      {/* ── Water drips from ceiling ── */}
      {drips.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: d.left,
          top: 0,
          width: 3,
          height: 9,
          borderRadius: '0 0 60% 60%',
          background: 'rgba(88,110,185,0.65)',
          animation: `water-drip ${d.dur} ease-in ${d.delay} infinite`,
          willChange: 'transform, opacity',
          ['--drip-h' as any]: d.h,
          opacity: 0,
        }} />
      ))}

      {/* ── Lava glow at bottom ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px',
        background: 'linear-gradient(to top, rgba(185,45,0,0.48) 0%, rgba(110,18,0,0.22) 50%, transparent 100%)',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '95px',
        background: 'radial-gradient(ellipse 85% 100% at 50% 100%, rgba(255,115,0,0.72) 0%, rgba(200,40,0,0.35) 55%, transparent 100%)',
        animation: 'lava-pulse 2.8s ease-in-out infinite',
        willChange: 'opacity',
      }} />
      {/* Hot surface line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '6px',
        background: 'linear-gradient(90deg, #CC2200, #FF7700, #FF4400, #FF9900, #FF3300, #FF7700, #CC2200)',
        opacity: 0.78,
        animation: 'lava-pulse 1.9s ease-in-out infinite',
        animationDelay: '0.6s',
        willChange: 'opacity',
      }} />

      {/* ── Ember particles rising from lava ── */}
      {embers.map((e, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: e.left,
          bottom: 0,
          width: e.size,
          height: e.size,
          borderRadius: '50%',
          background: e.color,
          boxShadow: `0 0 4px ${e.color}`,
          animation: `ember-rise ${e.dur} ease-out ${e.delay} infinite`,
          willChange: 'transform, opacity',
          ['--edrift' as any]:  `${e.driftA}px`,
          ['--edrift2' as any]: `${e.driftB}px`,
          opacity: 0,
        }} />
      ))}
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
