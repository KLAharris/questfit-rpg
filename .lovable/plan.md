# QuestFit — Mobile-first Fitness RPG

A clean, minimal RPG-themed fitness tracker. Mobile-first (max-width 430px, centered), white/light-gray base, vibrant lime `#C8FF00` accent. Bold Space Grotesk headings, Inter body. Bottom tab nav with 4 tabs.

## Tech

- React + TanStack Start + Tailwind v4 (tokens in `src/styles.css`, oklch)
- Lovable Cloud (Supabase): Email + Password auth, RLS, profile trigger
- Recharts (weekly bar chart), framer-motion (XP popup / PR banner), zod, sonner
- Server functions via `createServerFn` + `requireSupabaseAuth` (no edge functions)

## Routes

```text
src/routes/
  __root.tsx               shell + providers
  login.tsx                Email/password sign in
  signup.tsx               Email/password sign up
  _authenticated.tsx       Auth guard + bottom-tab layout (Outlet)
  _authenticated/index.tsx          Home / Character Dashboard
  _authenticated/log.tsx            Quest Log (log workout)
  _authenticated/achievements.tsx   Badge grid
  _authenticated/coach.tsx          AI Coach chat
```

Each route gets its own `head()` metadata. Bottom tab bar (Home · Quest Log · Achievements · Coach) is rendered in `_authenticated.tsx`.

## Design tokens (src/styles.css, light only)

- `--background` near-white, `--card` white, `--muted` light gray
- `--primary` lime `#C8FF00` with dark `--primary-foreground`
- `--accent-strength`, `--accent-endurance`, `--accent-agility` (distinct hues for stat bars)
- Soft shadows (`--shadow-card`), 1rem radius default, 1.5rem for hero cards
- Fonts: Space Grotesk (headings, weights 600/700), Inter (body)

## Pages

1. **Home** — greeting + name, RPG title chip, big level badge, XP progress bar to next level, 3 stat cards (Strength / Endurance / Agility) with colored progress bars + scores, weekly Recharts bar chart Sun–Sat of workout count, recent workouts list.
2. **Quest Log** — segmented type selector (Strength / Cardio / Flexibility), exercise name, sets, reps, weight (kg). Zod-validated. "Complete Quest" CTA. On submit: animated `+XP` popup (framer-motion); if PR, "PR Unlocked!" banner; if level up, title-change toast.
3. **Achievements** — 2-col badge grid. Unlocked = colorful + lime glow ring. Locked = grayscale + lock icon + hint. Definitions: First Quest, Iron Will (7-day streak), Titan (Lvl 10), PR Machine (10 PRs).
4. **AI Coach** — chat bubble UI with knight avatar + name ("Sir Cadence"), input + send button, static placeholder responses. Botnoi integration noted as TODO.

## Database (Lovable Cloud)

Tables (all with RLS — owner-only read/write):
- `profiles` — id (=auth.uid), name, level int default 1, xp int default 0, title text default 'Rookie', strength int default 10, endurance int default 10, agility int default 10
- `workouts` — id, user_id, type ('strength'|'cardio'|'flexibility'), exercise, sets, reps, weight numeric, date timestamptz default now()
- `personal_records` — id, user_id, exercise, best_weight, best_reps, unique(user_id, exercise)
- `achievements` — id, user_id, badge_name, unlocked_at; unique(user_id, badge_name)

Trigger: `on auth.users insert` → insert profile row (Rookie, lvl 1).

## Server functions

All protected by `requireSupabaseAuth`:
- `getStats` → profile + last-7-days workout counts (Sun–Sat) + recent workouts
- `logWorkout(input)` → insert workout, compute XP, check PR, bump stat, level up, unlock achievements; returns `{ xpGained, prUnlocked, leveledUp, newTitle, unlockedBadges }`
- `checkPR(exercise, weight, reps)` → boolean check
- `getAchievements` → all definitions with locked/unlocked + unlocked_at

## XP & level system

- XP: Strength 120, Cardio 100, Flexibility 80 (jittered ±20 within 80–150 band). PR bonus +100.
- Stat bumps: matching stat +2 per workout (+1 extra on PR).
- Level: `floor(xp / 1000) + 1`.
- Titles: 1 Rookie · 3 Apprentice · 5 Iron Warrior · 7 Champion · 10 Titan · 15 Mythic · 20 Legend.

## Demo seed (run after signup of "demo")

For the first user that signs up (or via a one-shot seed server function the user can trigger from Home if profile is empty), seed:
- Profile: name "Demo Hero", level 5, xp 4200, title "Iron Warrior", strength 78, endurance 54, agility 61
- 10 workouts spread across the last 7 days (mix of strength/cardio/flexibility)
- Achievements: "First Quest", "Iron Will" unlocked

I'll wire seeding as a server function that runs automatically when a freshly-created profile has 0 workouts, so the demo data appears on first load.

## Implementation order

1. Enable Lovable Cloud → migration: tables, RLS, profile trigger
2. Design tokens + fonts in `src/styles.css`; install Space Grotesk + Inter via Google Fonts link
3. Auth pages (`login`, `signup`) + `_authenticated` guard + bottom tab layout
4. Server functions (`getStats`, `logWorkout`, `checkPR`, `getAchievements`, `seedDemo`)
5. Home dashboard (cards + Recharts chart)
6. Quest Log form + animated XP popup + PR banner
7. Achievements grid
8. AI Coach static chat
9. Auto-seed demo on empty profile; QA at 390px viewport
