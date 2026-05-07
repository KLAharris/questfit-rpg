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

// ── Scene data ────────────────────────────────────────────────────────────────

const TORCHES = [
  { side: "left",  top: 62, pos: 6,  scale: 1.35, delay: 0.00 },
  { side: "left",  top: 51, pos: 17, scale: 0.95, delay: 0.35 },
  { side: "left",  top: 43, pos: 27, scale: 0.65, delay: 0.70 },
  { side: "right", top: 62, pos: 6,  scale: 1.35, delay: 0.18 },
  { side: "right", top: 51, pos: 17, scale: 0.95, delay: 0.52 },
  { side: "right", top: 43, pos: 27, scale: 0.65, delay: 0.88 },
] as const;

const EMBERS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  torchIdx: i % TORCHES.length,
  delay: (i * 0.55) % 5.5,
  duration: 2.2 + (i % 5) * 0.7,
  drift: ((i % 7) - 3) * 9,
  drift2: ((i % 5) - 2) * -7,
  size: 1.5 + (i % 3) * 0.8,
  color: i % 3 === 0 ? "#FFD000" : i % 3 === 1 ? "#FF8800" : "#FFEE88",
}));

const GOD_RAY_ANGLES = [-50, -32, -16, -6, 6, 16, 32, 50] as const;

// ── Knight silhouette ─────────────────────────────────────────────────────────

function KnightSilhouette() {
  const legL: React.CSSProperties = {
    transformBox: "fill-box",
    transformOrigin: "50% 0%",
    animation: "leg-fwd 0.68s ease-in-out infinite",
  };
  const legR: React.CSSProperties = {
    transformBox: "fill-box",
    transformOrigin: "50% 0%",
    animation: "leg-bck 0.68s ease-in-out infinite",
  };
  const armL: React.CSSProperties = {
    transformBox: "fill-box",
    transformOrigin: "50% 0%",
    animation: "arm-bck 0.68s ease-in-out infinite",
  };
  const armR: React.CSSProperties = {
    transformBox: "fill-box",
    transformOrigin: "50% 0%",
    animation: "arm-fwd 0.68s ease-in-out infinite",
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "47%",
        left: "50%",
        animation: "knight-bob 0.68s ease-in-out infinite",
        filter:
          "drop-shadow(0 0 14px rgba(255,180,60,0.55)) drop-shadow(0 3px 6px rgba(0,0,0,0.95))",
        zIndex: 5,
      }}
    >
      <svg
        viewBox="0 0 44 80"
        width="36"
        height="64"
        style={{ overflow: "visible", display: "block" }}
      >
        {/* Helmet */}
        <ellipse cx="22" cy="8" rx="10" ry="9" fill="#0d0b09" />
        {/* Plume */}
        <path
          d="M15 3 Q22 -5 29 3"
          stroke="#0d0b09"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        {/* Visor slit */}
        <rect x="16" y="7" width="12" height="3" rx="1.5" fill="#1c1812" />
        {/* Neck */}
        <rect x="18" y="17" width="8" height="5" rx="1" fill="#0d0b09" />
        {/* Torso */}
        <path d="M12 22 L32 22 L34 44 L10 44 Z" fill="#0d0b09" />
        {/* Pauldrons */}
        <ellipse cx="10" cy="23" rx="6" ry="4" fill="#0d0b09" />
        <ellipse cx="34" cy="23" rx="6" ry="4" fill="#0d0b09" />

        {/* Left arm + shield */}
        <g style={armL}>
          <rect x="4" y="23" width="8" height="16" rx="2" fill="#0d0b09" />
          <path
            d="M2 22 L2 36 L7 44 L12 36 L12 22 Z"
            fill="#080604"
            stroke="#1c1812"
            strokeWidth="0.6"
          />
        </g>

        {/* Right arm + sword */}
        <g style={armR}>
          <rect x="32" y="23" width="8" height="14" rx="2" fill="#0d0b09" />
          <rect x="38" y="10" width="3" height="32" rx="1.5" fill="#14120e" />
          <rect x="34" y="26" width="11" height="3" rx="1" fill="#14120e" />
        </g>

        {/* Left leg */}
        <g style={legL}>
          <rect x="12" y="44" width="9" height="22" rx="2" fill="#0d0b09" />
          <ellipse cx="17" cy="66" rx="7" ry="4" fill="#080604" />
        </g>

        {/* Right leg */}
        <g style={legR}>
          <rect x="23" y="44" width="9" height="22" rx="2" fill="#0d0b09" />
          <ellipse cx="27" cy="66" rx="7" ry="4" fill="#080604" />
        </g>
      </svg>
    </div>
  );
}

// ── Throne room background ────────────────────────────────────────────────────

function ThroneRoomBackground() {
  return (
    <div
      className="hidden md:block fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #060403 0%, #0e0b07 38%, #0d0906 62%, #080604 100%)",
        }}
      />

      {/* 2. Stone floor with perspective grid */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "-20%",
          right: "-20%",
          height: "54%",
          transformOrigin: "bottom center",
          transform: "perspective(600px) rotateX(-52deg)",
          backgroundImage: `
            linear-gradient(rgba(95,68,32,0.45) 1px, transparent 1px),
            linear-gradient(90deg, rgba(95,68,32,0.45) 1px, transparent 1px)
          `,
          backgroundSize: "80px 58px",
          backgroundColor: "#130f09",
        }}
      />
      {/* Floor fade at screen bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "18%",
          background: "linear-gradient(to top, #080604, transparent)",
        }}
      />

      {/* 3. Corridor wall darkness — left & right */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(to right, #060403 0%, #0f0b07 26%, transparent 42%),
            linear-gradient(to left,  #060403 0%, #0f0b07 26%, transparent 42%)
          `,
        }}
      />

      {/* 4. Throne golden glow (vanishing point) */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(255,200,65,0.92) 0%, rgba(255,140,18,0.48) 26%, rgba(180,90,5,0.14) 55%, transparent 72%)",
          filter: "blur(7px)",
          animation: "throne-pulse 2.6s ease-in-out infinite",
        }}
      />
      {/* Bright core */}
      <div
        style={{
          position: "absolute",
          top: "33.5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(255,248,200,1) 0%, rgba(255,210,90,0.88) 42%, transparent 70%)",
          animation: "throne-pulse 1.7s ease-in-out infinite",
        }}
      />

      {/* 5. God rays from throne */}
      {GOD_RAY_ANGLES.map((angle, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "36%",
            left: "50%",
            width: "3px",
            height: "75vh",
            transformOrigin: "top center",
            transform: `translateX(-50%) rotate(${angle}deg)`,
            background:
              "linear-gradient(to bottom, rgba(255,200,65,0.32), transparent)",
            filter: "blur(10px)",
            animation: `god-ray-breathe ${2.0 + i * 0.25}s ease-in-out infinite`,
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}

      {/* 6. Torch ambient glow blobs */}
      {TORCHES.map((t, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${t.top}%`,
            [t.side === "left" ? "left" : "right"]: `${t.pos}%`,
            width: `${100 * t.scale}px`,
            height: `${82 * t.scale}px`,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(255,145,28,0.78) 0%, rgba(255,88,8,0.30) 45%, transparent 70%)",
            filter: "blur(8px)",
            animation: `torch-flicker ${0.75 + (i % 4) * 0.18}s ease-in-out infinite`,
            animationDelay: `${t.delay}s`,
          }}
        />
      ))}

      {/* 7. Torch flame shapes */}
      {TORCHES.map((t, i) => (
        <div
          key={`flame-${i}`}
          style={{
            position: "absolute",
            top: `calc(${t.top}% - ${16 * t.scale}px)`,
            [t.side === "left" ? "left" : "right"]: `${t.pos}%`,
            width: `${11 * t.scale}px`,
            height: `${18 * t.scale}px`,
            transform: "translateX(-50%)",
            background:
              "linear-gradient(to top, #FF5500, #FFB300, rgba(255,242,180,0.90))",
            borderRadius: "50% 50% 22% 22% / 60% 60% 40% 40%",
            filter: "blur(1.5px)",
            boxShadow: `0 0 ${8 * t.scale}px rgba(255,138,0,0.90)`,
            animation: `torch-flicker ${0.44 + (i % 5) * 0.12}s ease-in-out infinite`,
            animationDelay: `${t.delay + 0.1}s`,
          }}
        />
      ))}

      {/* 8. Ember particles */}
      {EMBERS.map((e) => {
        const t = TORCHES[e.torchIdx];
        return (
          <div
            key={e.id}
            style={
              {
                position: "absolute",
                top: `${t.top}%`,
                [t.side === "left" ? "left" : "right"]: `${t.pos}%`,
                width: `${e.size}px`,
                height: `${e.size}px`,
                borderRadius: "50%",
                background: e.color,
                transform: "translate(-50%, -50%)",
                "--edrift": `${e.drift}px`,
                "--edrift2": `${e.drift2}px`,
                animation: `ember-rise ${e.duration}s ease-out infinite`,
                animationDelay: `${e.delay}s`,
              } as React.CSSProperties
            }
          />
        );
      })}

      {/* 9. Knight silhouette */}
      <KnightSilhouette />

      {/* 10. Vignette edges */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 30%, rgba(0,0,0,0.80) 100%)",
        }}
      />

      {/* 11. Ceiling gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "30%",
          background:
            "linear-gradient(to bottom, #060402, rgba(6,4,2,0.88) 50%, transparent)",
        }}
      />
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────────

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
    <div className="relative min-h-screen">
      <ThroneRoomBackground />

      <div className="relative z-10 px-5 md:px-8 pt-12 pb-6 md:max-w-[1100px] md:mx-auto">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold md:text-[#C8A227]/80">
          Hall of Fame
        </p>
        <h1 className="font-display text-3xl font-bold mt-1 md:text-white">
          Achievements
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-white/50">
          <span className="font-bold text-foreground md:text-[#CCFF00]">{unlocked}</span>{" "}
          <span className="md:text-white/50">/ {data.length} unlocked</span>
        </p>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.map((b: any) => (
            <div
              key={b.name}
              className={`rounded-3xl p-4 aspect-[4/5] flex flex-col items-center justify-center text-center transition-all ${
                b.unlocked
                  ? "bg-card shadow-glow ach-card-unlocked"
                  : "bg-muted opacity-70 ach-card-locked"
              }`}
            >
              <div
                className={`h-16 w-16 rounded-2xl grid place-items-center text-3xl mb-3 ${
                  b.unlocked ? "bg-primary ach-icon-unlocked" : "bg-card grayscale ach-icon-locked"
                }`}
              >
                {b.unlocked ? (
                  b.icon
                ) : (
                  <Lock className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <p
                className={`font-display font-bold text-sm ${
                  b.unlocked ? "ach-name-unlocked" : "text-muted-foreground ach-name-locked"
                }`}
              >
                {b.name}
              </p>
              <p
                className={`text-[11px] text-muted-foreground mt-1 leading-snug ${
                  b.unlocked ? "ach-desc-unlocked" : "ach-desc-locked"
                }`}
              >
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
