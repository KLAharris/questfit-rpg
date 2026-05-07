# QuestFit

A mobile-first fitness RPG tracker that turns your workouts into quests.

## What it does

- **XP system** — every logged workout earns XP and levels you up through RPG titles (Rookie → Apprentice → Iron Warrior → Champion → Titan → Mythic → Legend).
- **Stats** — Strength, Endurance, and Agility grow based on the type of workout you complete.
- **Quest Log** — log Strength, Cardio, or Flexibility workouts with sets, reps, and weight. Hit a personal record and you unlock a PR banner.
- **Achievements** — collect badges like First Quest, Iron Will, Titan, and PR Machine.
- **Streak counter** — keep a daily streak alive with a 🔥 card on the home dashboard.
- **AI Coach** — chat with Sir Cadence, your in-app fitness coach.

## Tech stack

- **React 19** + **TanStack Start** (file-based routing, server functions, SSR)
- **Tailwind CSS v4** with semantic design tokens (lime `#C8FF00` accent, Space Grotesk + Inter)
- **Supabase** (via Lovable Cloud) — auth, Postgres with RLS, profile triggers
- **TanStack Query** for caching, **Recharts** for the weekly chart, **framer-motion** for XP / level-up animations, **Zod** for validation, **sonner** for toasts

Designed mobile-first at a 430px max width.
