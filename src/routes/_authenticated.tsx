import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Home, Swords, Trophy, MessageSquare } from "lucide-react";
import { useAuth } from "@/auth-context";
import { getStats, getAchievements } from "@/lib/quest.functions";
import { STATS_STALE, ACHIEVEMENTS_STALE } from "@/lib/query-keys";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

const TABS = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/log", label: "Quest", Icon: Swords },
  { to: "/achievements", label: "Badges", Icon: Trophy },
  { to: "/coach", label: "Coach", Icon: MessageSquare },
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

  // Warm both caches as soon as we're in the shell
  useEffect(() => {
    if (!isAuthenticated) return;
    qc.prefetchQuery({ queryKey: ["stats"], queryFn: () => statsFn(), staleTime: STATS_STALE });
    qc.prefetchQuery({ queryKey: ["achievements"], queryFn: () => achievementsFn(), staleTime: ACHIEVEMENTS_STALE });
  }, [isAuthenticated, qc, statsFn, achievementsFn]);

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

  return (
    <div className="min-h-screen pb-24">
      <Outlet />
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-40">
        <div className="grid grid-cols-4 gap-1">
          {TABS.map(({ to, label, Icon }) => {
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
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
