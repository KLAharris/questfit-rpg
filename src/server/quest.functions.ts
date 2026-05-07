import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { levelFromXp, titleForLevel, xpForType, ACHIEVEMENT_DEFS } from "@/lib/xp";

type WorkoutType = "strength" | "cardio" | "flexibility";

// ----- Demo seed -----
async function seedDemoIfEmpty(supabase: any, userId: string) {
  const { count } = await supabase
    .from("workouts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if ((count ?? 0) > 0) return;

  await supabase
    .from("profiles")
    .update({
      name: "Demo Hero",
      level: 5,
      xp: 4200,
      title: "Iron Warrior",
      strength: 78,
      endurance: 54,
      agility: 61,
    })
    .eq("id", userId);

  const samples: Array<{ type: WorkoutType; exercise: string; sets: number; reps: number; weight: number; daysAgo: number }> = [
    { type: "strength", exercise: "Bench Press", sets: 4, reps: 8, weight: 70, daysAgo: 0 },
    { type: "cardio", exercise: "Running", sets: 1, reps: 1, weight: 0, daysAgo: 0 },
    { type: "strength", exercise: "Deadlift", sets: 3, reps: 5, weight: 110, daysAgo: 1 },
    { type: "flexibility", exercise: "Yoga Flow", sets: 1, reps: 1, weight: 0, daysAgo: 1 },
    { type: "cardio", exercise: "Cycling", sets: 1, reps: 1, weight: 0, daysAgo: 2 },
    { type: "strength", exercise: "Squat", sets: 5, reps: 5, weight: 95, daysAgo: 3 },
    { type: "flexibility", exercise: "Stretch", sets: 1, reps: 1, weight: 0, daysAgo: 4 },
    { type: "cardio", exercise: "Running", sets: 1, reps: 1, weight: 0, daysAgo: 5 },
    { type: "strength", exercise: "Pull-ups", sets: 4, reps: 10, weight: 0, daysAgo: 5 },
    { type: "strength", exercise: "Overhead Press", sets: 3, reps: 8, weight: 45, daysAgo: 6 },
  ];
  const now = Date.now();
  await supabase.from("workouts").insert(
    samples.map((s) => ({
      user_id: userId,
      type: s.type,
      exercise: s.exercise,
      sets: s.sets,
      reps: s.reps,
      weight: s.weight,
      date: new Date(now - s.daysAgo * 86400000).toISOString(),
    }))
  );
  await supabase.from("achievements").upsert(
    [
      { user_id: userId, badge_name: "First Quest" },
      { user_id: userId, badge_name: "Iron Will" },
    ],
    { onConflict: "user_id,badge_name" }
  );
}

// ----- getStats -----
export const getStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;

    await seedDemoIfEmpty(supabase, userId);

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: weekRows } = await supabase
      .from("workouts")
      .select("date,type,exercise,sets,reps,weight")
      .eq("user_id", userId)
      .gte("date", sevenDaysAgo)
      .order("date", { ascending: false });

    // Build Sun..Sat counts ending today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekly: Array<{ day: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      weekly.push({ day: dayLabels[d.getDay()], count: 0 });
    }
    (weekRows ?? []).forEach((r: any) => {
      const d = new Date(r.date);
      const diff = Math.floor((today.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400000);
      if (diff >= 0 && diff <= 6) {
        const idx = 6 - diff;
        if (weekly[idx]) weekly[idx].count += 1;
      }
    });

    const recent = (weekRows ?? []).slice(0, 5);
    return { profile, weekly, recent };
  });

// ----- logWorkout -----
const logSchema = z.object({
  type: z.enum(["strength", "cardio", "flexibility"]),
  exercise: z.string().trim().min(1).max(80),
  sets: z.number().int().min(1).max(50),
  reps: z.number().int().min(1).max(500),
  weight: z.number().min(0).max(1000),
});

export const logWorkout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => logSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;

    // 1. Insert workout
    const { error: insertErr } = await supabase.from("workouts").insert({
      user_id: userId,
      type: data.type,
      exercise: data.exercise,
      sets: data.sets,
      reps: data.reps,
      weight: data.weight,
    });
    if (insertErr) throw new Error(insertErr.message);

    // 2. PR check
    let prUnlocked = false;
    const { data: existingPR } = await supabase
      .from("personal_records")
      .select("*")
      .eq("user_id", userId)
      .eq("exercise", data.exercise)
      .maybeSingle();

    if (!existingPR) {
      prUnlocked = data.weight > 0 || data.reps > 0;
      await supabase.from("personal_records").insert({
        user_id: userId,
        exercise: data.exercise,
        best_weight: data.weight,
        best_reps: data.reps,
      });
    } else if (data.weight > existingPR.best_weight || (data.weight === existingPR.best_weight && data.reps > existingPR.best_reps)) {
      prUnlocked = true;
      await supabase
        .from("personal_records")
        .update({ best_weight: data.weight, best_reps: data.reps, updated_at: new Date().toISOString() })
        .eq("id", existingPR.id);
    }

    // 3. Compute XP & stat bumps
    let xpGained = xpForType(data.type);
    if (prUnlocked) xpGained += 100;

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (!profile) throw new Error("Profile missing");

    const oldLevel = profile.level;
    const newXp = profile.xp + xpGained;
    const newLevel = levelFromXp(newXp);
    const newTitle = titleForLevel(newLevel);
    const statBump = prUnlocked ? 3 : 2;
    const updates: any = {
      xp: newXp,
      level: newLevel,
      title: newTitle,
    };
    if (data.type === "strength") updates.strength = profile.strength + statBump;
    if (data.type === "cardio") updates.endurance = profile.endurance + statBump;
    if (data.type === "flexibility") updates.agility = profile.agility + statBump;

    await supabase.from("profiles").update(updates).eq("id", userId);

    // 4. Achievement unlocks
    const unlockedBadges: string[] = [];
    async function unlock(name: string) {
      const { data: existing } = await supabase
        .from("achievements")
        .select("id")
        .eq("user_id", userId)
        .eq("badge_name", name)
        .maybeSingle();
      if (existing) return;
      await supabase.from("achievements").insert({ user_id: userId, badge_name: name });
      unlockedBadges.push(name);
    }

    // First Quest
    const { count: workoutCount } = await supabase
      .from("workouts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((workoutCount ?? 0) >= 1) await unlock("First Quest");

    // Iron Will - 7 distinct days in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: recent } = await supabase
      .from("workouts")
      .select("date")
      .eq("user_id", userId)
      .gte("date", sevenDaysAgo);
    const distinctDays = new Set((recent ?? []).map((r: any) => new Date(r.date).toDateString())).size;
    if (distinctDays >= 7) await unlock("Iron Will");

    // Titan
    if (newLevel >= 10) await unlock("Titan");

    // PR Machine
    const { count: prCount } = await supabase
      .from("personal_records")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((prCount ?? 0) >= 10) await unlock("PR Machine");

    return {
      xpGained,
      prUnlocked,
      leveledUp: newLevel > oldLevel,
      newTitle: newLevel > oldLevel ? newTitle : null,
      unlockedBadges,
    };
  });

// ----- getAchievements -----
export const getAchievements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { data } = await supabase.from("achievements").select("*").eq("user_id", userId);
    const unlocked = new Map<string, string>();
    (data ?? []).forEach((r: any) => unlocked.set(r.badge_name, r.unlocked_at));
    return ACHIEVEMENT_DEFS.map((def) => ({
      ...def,
      unlocked: unlocked.has(def.name),
      unlocked_at: unlocked.get(def.name) ?? null,
    }));
  });
