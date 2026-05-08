export interface DailyQuestDef {
  id: number;
  exercise: string;
  sets: string;
  type: "strength" | "cardio" | "flexibility";
  xp: number;
}

const STRENGTH_POOL: DailyQuestDef[] = [
  { id: 1, exercise: "Push-ups",  sets: "3×10",     type: "strength", xp: 50 },
  { id: 2, exercise: "Squats",    sets: "3×15",     type: "strength", xp: 50 },
  { id: 3, exercise: "Lunges",    sets: "3×10",     type: "strength", xp: 50 },
  { id: 4, exercise: "Plank",     sets: "3×30 sec", type: "strength", xp: 40 },
  { id: 5, exercise: "Dips",      sets: "3×10",     type: "strength", xp: 50 },
];

const CARDIO_POOL: DailyQuestDef[] = [
  { id: 6,  exercise: "Walk",           sets: "10 min",  type: "cardio", xp: 30 },
  { id: 7,  exercise: "Jump rope",      sets: "5 min",   type: "cardio", xp: 40 },
  { id: 8,  exercise: "Jumping jacks",  sets: "3×20",    type: "cardio", xp: 35 },
  { id: 9,  exercise: "Jog",            sets: "15 min",  type: "cardio", xp: 45 },
];

const FLEX_POOL: DailyQuestDef[] = [
  { id: 10, exercise: "Full body stretch", sets: "5 min",  type: "flexibility", xp: 30 },
  { id: 11, exercise: "Yoga",              sets: "10 min", type: "flexibility", xp: 35 },
  { id: 12, exercise: "Foam rolling",      sets: "5 min",  type: "flexibility", xp: 30 },
];

function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDailyQuests(): [DailyQuestDef, DailyQuestDef, DailyQuestDef] {
  const seed = parseInt(todayKey().replace(/-/g, ""), 10);
  const rand = seededRandom(seed);
  return [
    STRENGTH_POOL[Math.floor(rand() * STRENGTH_POOL.length)],
    CARDIO_POOL[Math.floor(rand() * CARDIO_POOL.length)],
    FLEX_POOL[Math.floor(rand() * FLEX_POOL.length)],
  ];
}

export const DAILY_STORAGE_KEY = "questfit-daily-done";

export function readDoneExercises(): Set<string> {
  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    if (!raw) return new Set();
    const { date, exercises } = JSON.parse(raw) as { date: string; exercises: string[] };
    if (date !== todayKey()) return new Set();
    return new Set(exercises.map((e: string) => e.toLowerCase()));
  } catch {
    return new Set();
  }
}

export function markDailyQuestDone(exerciseName: string): void {
  try {
    const today = todayKey();
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    let exercises: string[] = [];
    if (raw) {
      const parsed = JSON.parse(raw) as { date: string; exercises: string[] };
      if (parsed.date === today) exercises = parsed.exercises;
    }
    const lower = exerciseName.toLowerCase();
    if (!exercises.map((e) => e.toLowerCase()).includes(lower)) {
      exercises.push(exerciseName);
    }
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify({ date: today, exercises }));
  } catch {
    // localStorage unavailable — silently skip
  }
}
