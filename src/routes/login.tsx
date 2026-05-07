import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — QuestFit" },
      { name: "description", content: "Sign in to QuestFit and continue your quest." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate({ to: "/" });
  }, [isAuthenticated, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back, hero.");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-10">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-primary grid place-items-center text-lg">⚔️</div>
          <span className="font-display text-2xl font-bold">QuestFit</span>
        </div>
        <h1 className="mt-8 font-display text-3xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Continue your quest.</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Email</span>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl bg-input px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="hero@quest.fit"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Password</span>
          <input
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl bg-input px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••••••"
          />
        </label>
        <button
          type="submit" disabled={submitting}
          className="mt-2 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/signup" className="font-semibold text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  );
}
