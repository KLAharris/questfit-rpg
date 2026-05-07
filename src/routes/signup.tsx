import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — QuestFit" },
      { name: "description", content: "Start your fitness quest with QuestFit." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate({ to: "/" });
  }, [isAuthenticated, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        data: { name: name || email.split("@")[0] },
      },
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Quest accepted! Check your email to confirm.");
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-10">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-primary grid place-items-center text-lg">⚔️</div>
          <span className="font-display text-2xl font-bold">QuestFit</span>
        </div>
        <h1 className="mt-8 font-display text-3xl font-bold">Begin your quest</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create your hero in 30 seconds.</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Hero name</span>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={40}
            className="rounded-2xl bg-input px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Demo Hero"
          />
        </label>
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
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl bg-input px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="At least 6 characters"
          />
        </label>
        <button
          type="submit" disabled={submitting}
          className="mt-2 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create Account"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already a hero?{" "}
        <Link to="/login" className="font-semibold text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
