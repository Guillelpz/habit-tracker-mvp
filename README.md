# Habit Tracker MVP

Mobile-first habit tracker (Expo + React Native + Supabase). See [PRD.md](./PRD.md) for product scope and [ARCHITECTURE.md](./ARCHITECTURE.md) for technical structure.

## Requirements

- **Node.js** (LTS recommended)
- **npm** (comes with Node)
- For Android emulator: **Android Studio** and a virtual device
- Optional: **Expo Go** on a phone for quick testing

## Install and run

```bash
npm install
npm start
```

Then press **`w`** for web, **`a`** for Android (with emulator running), or scan the QR code with **Expo Go**.

```bash
npm run web
npm run android
```

## Environment variables (Supabase)

The app reads Supabase settings from a **`.env`** file in the project root (see [ARCHITECTURE.md](./ARCHITECTURE.md)). Variables must use the `EXPO_PUBLIC_` prefix so Expo can inline them for the client.

### 1. Create a Supabase project

1. Open [Supabase](https://supabase.com) and sign in.
2. **New project** → choose organization, name, database password, and region.
3. Wait until the project finishes provisioning.

### 2. Enable email/password auth (MVP)

1. In the Supabase Dashboard, go to **Authentication** → **Providers**.
2. Open **Email** and ensure it is **enabled**.

### 3. Turn off email confirmation (MVP)

For MVP, users should be able to sign up and use the app immediately without clicking a confirmation link.

1. Go to **Authentication** → **Providers** → **Email** (or **Authentication** → **Sign In / Providers** depending on dashboard version).
2. **Disable** “Confirm email” / “Enable email confirmations” (wording varies).  
   If you prefer stricter production behavior later, you can re-enable confirmations and adjust the app flow.

### 4. Copy API credentials

1. In the Supabase Dashboard, open **Project Settings** (gear icon at the bottom of the left sidebar).
2. Click **API** in the settings menu (sometimes labeled alongside **Data API**).
3. Under **Project URL**, copy the URL → that value is `EXPO_PUBLIC_SUPABASE_URL` (looks like `https://xxxxxxxx.supabase.co`).
4. Scroll to **Project API keys**. Find the key named **`anon`** or **`public`** (the dashboard may show it as “anon” with role “anon” and note that it is safe to use in a browser). Click **Reveal** if needed, then **Copy**.
   - It is a long string starting with `eyJ…` (a JWT).  
   - **Do not** use the **`service_role`** key in the app—that one must stay server-side only.
5. Paste the URL and anon key into your `.env` as described below.

The **anon** key is safe to embed in the client when **Row Level Security** is enabled on your tables (planned in this project’s migrations).

### 5. Create your local `.env`

1. Copy the example file:

   ```bash
   copy .env.example .env
   ```

   On macOS/Linux: `cp .env.example .env`

2. Edit `.env` and paste your real URL and anon key (no quotes unless the value itself requires them).

3. Restart the Expo dev server after changing env vars (`Ctrl+C`, then `npm start`).

**Git:** `.env` is listed in `.gitignore` and must not be committed. Only [`.env.example`](./.env.example) is tracked as a template.

## Database migrations

SQL files live in [`supabase/migrations/`](./supabase/migrations/). Apply them **in order** (by filename timestamp) to your Supabase Postgres:

1. **SQL Editor** (Dashboard): open **SQL** → **New query**, paste a migration file, run.
2. **Supabase CLI**: with the project linked, use `supabase db push` per the [CLI docs](https://supabase.com/docs/guides/cli).

Apply [`20260321140000_rls_habits_and_completions.sql`](./supabase/migrations/20260321140000_rls_habits_and_completions.sql) **after** the table migrations. Until RLS is applied, treat the project as **not** production-safe.

### What the SQL Editor should show

For **DDL** migrations (`CREATE TABLE`, `CREATE INDEX`, `ALTER …`, RLS policies):

- A **success** state with **no result rows** is normal. Supabase often shows something like **“Success. No rows returned”** or a green success indicator with an empty table.
- You do **not** need a row count for these scripts.

If something fails, the editor shows a **PostgreSQL error** (e.g. `relation "habits" does not exist` if you ran `habit_completions` before `habits`). Fix the error, then re-run.

Optional sanity check after a migration:

```sql
select table_name from information_schema.tables
where table_schema = 'public' and table_name in ('habits', 'habit_completions');
```

You should see **two rows** (one per table) once both migrations are applied.

## Documentation

| File | Purpose |
|------|---------|
| [PRD.md](./PRD.md) | Product requirements |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | App structure and conventions |
| [TASKS.md](./TASKS.md) | Implementation task list |
| [AI_RULES.md](./AI_RULES.md) | Rules for AI-assisted changes |

## License

Private project.
