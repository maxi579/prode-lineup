# ⚽ Prode LineUp — World Cup 2026

🇪🇸 [Leer en español](README.es.md)

A World Cup 2026 prediction game I built for the employees of **LineUp**. It was used throughout the whole tournament: each participant submitted predictions, competed on a live leaderboard, and whoever had the most points at the end won an official Argentina jersey. (*Prode* is the Argentine name for this kind of prediction pool.)

🔗 **Interactive demo:** [maxi579.github.io/prode-lineup](https://maxi579.github.io/prode-lineup/) — with the real World Cup 2026 results and sample players, no login required.

## Features

- **Google sign-in** (Supabase Auth) and user profiles.
- **Per-match predictions** that lock automatically 15 minutes before kickoff.
- **Scoring system:** 3 points for the exact score, 1 point for the right winner or draw.
- **Live leaderboard** with points, exact scores and correct results for every player.
- **Standings for all 12 groups** and the **full knockout bracket** — round of 32, round of 16, quarterfinals, semifinals, third place and final, including penalty shootouts.
- **Social wall** where players post messages.
- Responsive, mobile-first design.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Vite |
| Backend / DB | Supabase (PostgreSQL + Auth) |
| Hosting | Vercel (production), GitHub Pages (demo) |
| Icons / flags | lucide-react, flag-icons |

## Problems I solved

- **Supabase's 1,000-row limit:** as predictions grew, the leaderboard silently stopped counting some of them. I fixed it by paginating queries in 1,000-row pages (`src/context/MatchContext.jsx`).
- **Live maintenance:** during the tournament I added knockout fixtures as they were decided and fixed kickoff times and venues — without taking the app down.
- **Penalty shootouts:** the bracket records who advances on penalties when a knockout match ends in a draw.

## Project structure

```
src/
├── components/   # Dashboard, MatchCard, Leaderboard, GroupTables, Wall, Prizes...
├── context/      # AuthContext (session) and MatchContext (matches, predictions, scoring)
├── data/         # fixtures.json (all 104 matches) and resultados.json (real results)
└── lib/          # Supabase client and demo mode
```

## Demo mode

`npm run build:demo` builds a version in `dist-demo/` that doesn't use Supabase: it signs you in as a guest, reads the real results from `src/data/resultados.json` and fills the leaderboard with made-up players (predictions generated from a fixed seed, so the leaderboard is always the same). No data from the real participants is published. It's ready for GitHub Pages (`/prode-lineup/` base path and a `404.html` for client-side routes).

## Running locally

```bash
npm install
cp .env.example .env   # fill in your Supabase project settings
npm run dev
```

Required variables:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

Built by [Máximo Nuñez](https://maxi579.github.io).
