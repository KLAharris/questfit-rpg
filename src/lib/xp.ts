export const XP_PER_LEVEL = 1000;

export function levelFromXp(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpIntoLevel(xp: number) {
  return xp % XP_PER_LEVEL;
}

const TITLES: Array<{ level: number; title: string }> = [
  { level: 20, title: "Legend" },
  { level: 15, title: "Mythic" },
  { level: 10, title: "Titan" },
  { level: 7, title: "Champion" },
  { level: 5, title: "Iron Warrior" },
  { level: 3, title: "Apprentice" },
  { level: 1, title: "Rookie" },
];

export function titleForLevel(level: number) {
  return TITLES.find((t) => level >= t.level)?.title ?? "Rookie";
}

export function xpForType(type: "strength" | "cardio" | "flexibility") {
  if (type === "strength") return 120;
  if (type === "cardio") return 100;
  return 80;
}

export const ACHIEVEMENT_DEFS = [
  { name: "First Quest", description: "Log your first workout", icon: "🗡️" },
  { name: "Iron Will", description: "7-day workout streak", icon: "🔥" },
  { name: "Titan", description: "Reach level 10", icon: "⛰️" },
  { name: "PR Machine", description: "Set 10 personal records", icon: "🏆" },
] as const;
