# PRD - Habit Tracker MVP

## 1. Product Overview

This project is a mobile-first habit tracking app built primarily as a testbed for an AI-assisted MVP development system using Cursor.

The product goal is not only to create a usable app, but to establish a repeatable workflow for rapidly building future MVPs with AI handling most implementation work while the human primarily reviews, tests, and guides decisions.

The app should allow authenticated users to create habits, assign a color to each habit, and track completions on a calendar view. The primary UX value is visual: each habit should have a clear month-based calendar showing completed days in the habit’s associated color.

The app should be built mobile-first for Android, but the architecture should remain compatible with web so it can also be used in a browser, including by iPhone users if needed.

---

## 2. Goals

### Primary goals
- Build a usable habit tracker MVP
- Use Cursor in a structured, repeatable, AI-first workflow
- Establish a reusable process for future MVP app creation
- Keep implementation fast, simple, explicit, and easy for AI to extend

### Secondary goals
- Maintain compatibility with Expo web
- Use Supabase as the backend for auth and persistence
- Keep the app architecture reusable for future projects

---

## 3. Non-Goals

The following are explicitly out of scope for MVP v1:

- reminders or notifications
- social features
- streak gamification
- advanced analytics
- offline-first sync
- widgets
- native iOS release
- habit sharing
- team/family functionality
- partial progress tracking (e.g. 2/3 reps, minutes, quantity-based habits)
- complex categories/tags
- advanced onboarding

---

## 4. Target User

### Primary user
A single user who wants to track habits visually through a calendar interface.

### Initial usage context
The first real user is the product creator themself. However, the product should still be built as a proper multi-user app with authentication and user-specific data isolation.

---

## 5. Core User Stories

### Authentication
- As a user, I want to sign up and sign in so my habits are securely stored.
- As a user, I want my data to be private and only visible to me.

### Habit management
- As a user, I want to create a habit with a name and color.
- As a user, I want to edit a habit’s basic information.
- As a user, I want to archive a habit instead of deleting it permanently.

### Frequency
- As a user, I want to define a habit with a weekly or custom frequency.
- As a user, I want the app to know on which days a habit is expected.

### Completion tracking
- As a user, I want to mark a habit as completed for a specific day.
- As a user, I want to unmark a day if I made a mistake.
- As a user, I want completion to be binary: done or not done.

### Calendar visibility
- As a user, I want each habit to have its own classic month calendar grid.
- As a user, I want completed days to appear in that habit’s assigned color.
- As a user, I want to navigate across months to review history.

### Daily overview
- As a user, I want to see my habits in a list.
- As a user, I want to find a habit quickly when the list grows (e.g. filter by name and choose a simple sort order).
- As a user, I want the app to emphasize the calendar/history view rather than only a checklist.

---

## 6. MVP Feature Scope

## Included in MVP v1

### Auth
- Email/password sign up
- Email/password sign in
- Sign out
- Session persistence

### Habit CRUD
- Create habit
- Edit habit
- Archive habit
- List active habits

### Habit properties
- Name
- Color
- Frequency configuration

### Frequency model
The app should support:
- weekly habits
- custom frequency rules, represented in a way that is simple enough for MVP implementation

A practical MVP approach is:
- store target weekdays as an array or equivalent structure
- support simple schedules like Mon/Wed/Fri or every day

### Completion tracking
- mark completion for a given date
- unmark completion for a given date
- store one completion record per habit per date

### Calendar UI
- classic month grid per habit
- completed dates displayed in the habit color
- ability to browse previous and next months

### Main app structure
- habits list screen (including optional client-side search and sort to scale the list UX without changing the data model)
- habit detail screen with calendar
- create/edit habit flow
- auth screens

Week-level weekly habits and custom habit colors are specified in §16 and are **implemented** in the current codebase (see `PROJECT_STATE.md`, tasks F.1–F.11).

---

## 7. Excluded from MVP v1

Not included initially:
- push notifications
- Apple Health / Google Fit integration
- charts and advanced stats
- streak calculations beyond simple display, if any
- bulk editing
- habit groups
- custom icons beyond simple defaults unless trivial
- collaborative features
- import/export

---

## 8. UX Principles

- Mobile-first
- Simple and clear over feature-rich
- Calendar visibility is the core value
- Low cognitive load
- Fast interaction for marking completion
- Architecture should avoid platform-specific UI choices that break web usability
- Prefer explicit navigation and conventional patterns over clever custom interactions

---

## 9. Functional Requirements

### Auth
- Users must be able to create an account with email and password
- Users must be able to sign in and out
- User data must be scoped to the authenticated user only

### Habits
- Users must be able to create a habit
- A habit must have a name
- A habit must have an associated color
- A habit must support a frequency definition
- Users must be able to edit or archive a habit

### Completions
- Users must be able to mark a habit as complete for a date
- Users must be able to remove that completion
- There must be at most one completion record per habit per date per user

### Calendar
- Each habit must show a month grid
- Completed days must be visibly highlighted in the habit color
- Users must be able to move between months

### Main flow
- After sign-in, users should land on their habits list
- From the habit list, users should be able to open a habit detail view
- The habits list may offer simple search and sort (client-side) to support longer lists without changing server contracts
- The habit detail view should center on the calendar and completion history

---

## 10. Suggested Screens

### 1. Auth screen(s)
- Sign in
- Sign up

### 2. Habits home screen
- list of active habits
- optional search-by-name and sort (e.g. name, recently created) on the client
- quick entry to create a new habit
- each habit card should visually hint at its color

### 3. Create/Edit habit screen
- name input
- color picker
- frequency selection

### 4. Habit detail screen
- habit title
- current month calendar
- month navigation
- tap day to mark/unmark completion where appropriate

### 5. Archived habits screen
Optional for MVP if simple, otherwise archive can exist without dedicated UI initially

---

## 11. Data Model (Product-Level)

### User
Authenticated user managed by Supabase Auth

### Habit
Represents a user-defined habit

Fields:
- id
- user_id
- name
- color
- frequency_type
- frequency_config
- created_at
- updated_at
- archived_at

### HabitCompletion
Represents completion of a habit on a specific date

Fields:
- id
- user_id
- habit_id
- completed_on
- created_at

Constraint:
- one unique completion per habit per date per user

---

## 12. Assumptions

- Users are authenticated
- The first version is binary completion only
- Frequency logic should remain simple enough for AI to implement reliably
- The visual calendar is more important than analytics
- Android is the primary native target
- Web compatibility is desirable but not the main optimization target

---

## 13. Risks / Complexity Areas

- date handling and timezone correctness
- frequency modeling without overengineering
- calendar UI consistency across mobile and web
- keeping Cursor aligned across multiple implementation steps
- avoiding architecture drift during iterative AI coding

---

## 14. Success Criteria for MVP

The MVP is successful if:
- a user can sign up and sign in
- a user can create habits with a name, color, and frequency
- a user can open a habit and see a month calendar
- a user can mark and unmark completed days
- completed days visibly appear in the habit color
- data persists correctly in Supabase
- the app is usable on Android and reasonably usable on web
- the project process is structured enough to reuse for future MVPs

---

## 15. Delivery Philosophy

This MVP should prioritize:
- speed
- clarity
- AI-friendliness
- maintainability
- reusable structure for future app generation

The implementation should avoid premature complexity and prefer explicit patterns that are easier for AI tools to generate, review, and extend.

---

## 16. MVP v2 — Week-level weekly habits & custom colors

**Implementation status:** Shipped in the current app (`PROJECT_STATE.md`: tasks F.1–F.11). The section below remains the product specification.

### 16.1 Scope (included)

- **Week-level completion for weekly habits**: For habits that use weekly frequency, the user can choose a mode where the calendar does not require tapping individual days. Instead, the user taps an entire **calendar week** (week row); that week is highlighted in the habit color. Tapping again removes the completion for that week.
- **Custom habit color**: When creating or editing a habit, the user can set a **custom color** (e.g. hex) in addition to—or instead of—fixed palette choices.

### 16.2 Explicitly not included (v2)

- Partial weeks, per-day overrides, or mixing day-level and week-level completion **on the same habit**
- Week numbering UX beyond what a normal month grid needs (no ISO week picker separate from the calendar)
- Color themes, gradients, or multiple colors per habit
- Changing completion granularity after the habit is created (deferred unless trivial; otherwise document as one-time choice at create)

### 16.3 User-facing behavior

- On create/edit, weekly habits can opt into **“complete by week”** (wording TBD): the habit detail calendar shows week rows as the primary tap targets; completing a week colors that full week in the habit color.
- Uncompleting a week clears that week’s completion.
- Create/edit habit: fixed color chips remain available; user can also choose a **custom color** (e.g. system color picker or hex input—implementation choice within MVP simplicity).
- List and calendar views use the chosen color (preset or custom) consistently.

### 16.4 Affected areas (product)

- Habit create/edit: frequency option for weekly + week-level completion; color UI extended for custom values.
- Habit detail calendar: layout/interaction for week-level taps when that mode is selected; completion logic aligned with storage rules.
- Validation: accept custom hex (or chosen format) for `color`.

### 16.5 Risks / complexity

- **Week boundaries**: Define one rule for “which week a day belongs to” (e.g. week starting Monday or Sunday) and use it consistently in UI and storage.
- **Storage vs. UX**: Decide whether a week completion is one stored value per week (e.g. canonical week-start date) or multiple day rows; keep RLS and uniqueness rules simple.
- **Custom color**: Contrast/accessibility on the calendar grid is a minor UX risk; optional guardrails (e.g. contrast hint) are out of scope unless quick.