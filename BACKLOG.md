# Backlog

Deferred improvements and future features (see PRD.md / ARCHITECTURE.md for scope).

---

## Improvements

- **Expo Go on Android: connectivity and environment** — If the app still fails to load after auth storage fixes: verify same LAN / tunnel mode, Expo Go version, and Android “cleared data” for Expo Go. Document in README when patterns emerge.
- **Habit list: manual reorder** — User-defined order with persistence (larger scope than name/recent sort; deferred).

---

## Future Features

_Add ideas here when you prioritize post-MVP work. Completed Task 4.12 (archived list + restore) lives in `app/archived.tsx` — see `PROJECT_STATE.md`._

- **Home screen quick completion** — Checkboxes (or similar) on the habits list to mark today’s completion without opening detail, plus a **Completed** section listing habits completed for the current day (or week for week-granularity habits). Requires product rules (what “today” means per frequency type, week-mode behavior, and possibly extra queries). Extends PRD §5 “Daily overview” but is not in MVP v1 scope as specified.
- **Archive from edit screen** — Optional duplicate entry point to archive a habit from `app/habit/edit/[id].tsx` (detail header already exposes Archive).
- **Permanent delete** — Not in PRD (archive only for MVP); add only if product decides otherwise.
