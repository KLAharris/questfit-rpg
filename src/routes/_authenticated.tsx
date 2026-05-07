import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Home, Swords, Trophy, MessageSquare, Sword } from "lucide-react";
import { useAuth } from "@/auth-context";
import { getStats, getAchievements } from "@/lib/quest.functions";
import { STATS_STALE, ACHIEVEMENTS_STALE } from "@/lib/query-keys";
import { xpIntoLevel, XP_PER_LEVEL } from "@/lib/xp";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

const TABS = [
  { to: "/",             mobileLabel: "Home",   desktopLabel: "Home",         Icon: Home },
  { to: "/log",          mobileLabel: "Quest",  desktopLabel: "Quest Log",    Icon: Swords },
  { to: "/achievements", mobileLabel: "Badges", desktopLabel: "Achievements", Icon: Trophy },
  { to: "/coach",        mobileLabel: "Coach",  desktopLabel: "Coach",        Icon: MessageSquare },
] as const;

function AuthenticatedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const statsFn = useServerFn(getStats);
  const achievementsFn = useServerFn(getAchievements);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    qc.prefetchQuery({ queryKey: ["stats"], queryFn: () => statsFn(), staleTime: STATS_STALE });
    qc.prefetchQuery({ queryKey: ["achievements"], queryFn: () => achievementsFn(), staleTime: ACHIEVEMENTS_STALE });
  }, [isAuthenticated, qc, statsFn, achievementsFn]);

  const { data: statsData } = useQuery({
    queryKey: ["stats"],
    queryFn: () => statsFn(),
    staleTime: STATS_STALE,
    enabled: isAuthenticated,
  });

  const prefetchFor = (to: string) => {
    if (to === "/") {
      qc.prefetchQuery({ queryKey: ["stats"], queryFn: () => statsFn(), staleTime: STATS_STALE });
    } else if (to === "/achievements") {
      qc.prefetchQuery({ queryKey: ["achievements"], queryFn: () => achievementsFn(), staleTime: ACHIEVEMENTS_STALE });
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const profile = (statsData as any)?.profile;
  const xpInto = profile ? xpIntoLevel(profile.xp) : 0;
  const xpPct = profile ? Math.round((xpInto / XP_PER_LEVEL) * 100) : 0;

  return (
    <div className="min-h-screen md:flex">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 bg-[#0F0F1A] border-r border-[#2A2A3A] z-30">
        {/* Logo */}
        <div className="px-6 py-6 flex items-center gap-2.5">
          <Sword className="h-6 w-6 text-[#C8FF00]" />
          <span className="font-display font-bold text-lg text-[#C8FF00] tracking-tight">QuestFit</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {TABS.map(({ to, desktopLabel, Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                preload="intent"
                onMouseEnter={() => prefetchFor(to)}
                onFocus={() => prefetchFor(to)}
                className="block"
              >
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    active
                      ? "bg-[#C8FF00] text-[#0A0A0A]"
                      : "text-white/55 hover:text-white/90 hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.5 : 2} />
                  <span className="font-semibold text-sm">{desktopLabel}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Character mini card */}
        <div className="px-4 pb-6">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-[#C8FF00] grid place-items-center font-display font-bold text-[#0A0A0A] text-sm shrink-0">
                {profile?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm leading-tight truncate">
                  {profile?.name ?? "Hero"}
                </p>
                <p className="text-white/45 text-xs truncate">{profile?.title ?? "Adventurer"}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/35 font-semibold uppercase tracking-wider">Level</span>
              <span className="bg-[#C8FF00] text-[#0A0A0A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {profile?.level ?? 1}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#C8FF00] transition-all"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-white/30">{xpInto} / {XP_PER_LEVEL} XP</p>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="md:pl-60 flex-1 min-h-screen pb-24 md:pb-0">
        <Outlet />
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-40">
        <div className="grid grid-cols-4 gap-1">
          {TABS.map(({ to, mobileLabel, Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                preload="intent"
                onMouseEnter={() => prefetchFor(to)}
                onTouchStart={() => prefetchFor(to)}
                onFocus={() => prefetchFor(to)}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`h-9 w-9 grid place-items-center rounded-xl transition-colors ${
                    active ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-semibold">{mobileLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
