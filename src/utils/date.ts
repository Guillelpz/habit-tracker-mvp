const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toIsoDateStringLocal(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function assertValidMonthInput(month: number): void {
  // This codebase uses JS month indexing (0-11) for navigation state.
  if (!Number.isInteger(month) || month < 0 || month > 11) {
    throw new Error(`Invalid month "${month}". Expected integer 0-11.`);
  }
}

function assertValidYearInput(year: number): void {
  if (!Number.isInteger(year) || year < 1 || year > 9999) {
    throw new Error(`Invalid year "${year}". Expected integer 1-9999.`);
  }
}

export function getTodayDateString(): string {
  return toIsoDateStringLocal(new Date());
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
  assertValidYearInput(year);
  assertValidMonthInput(month);

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  return {
    start: toIsoDateStringLocal(startDate),
    end: toIsoDateStringLocal(endDate),
  };
}

/**
 * Inclusive `YYYY-MM-DD` range for the full Sunday-first calendar grid (see `getDaysInMonth`).
 * Includes leading/trailing days from adjacent months. Use when loading completions for the month
 * view so every visible cell can match `habit_completions.completed_on` (day or week-start rows).
 */
export function getMonthGridRange(year: number, month: number): { start: string; end: string } {
  const days = getDaysInMonth(year, month);
  const first = days[0];
  const last = days[days.length - 1];
  return {
    start: toIsoDateStringLocal(first),
    end: toIsoDateStringLocal(last),
  };
}

/** Inclusive calendar range for a Gregorian year (local), as YYYY-MM-DD. */
export function getYearRange(year: number): { start: string; end: string } {
  assertValidYearInput(year);
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
}

/**
 * Returns the calendar grid days for a given month, including leading/trailing
 * days from adjacent months to fill out full weeks (Sunday-first).
 */
export function getDaysInMonth(year: number, month: number): Date[] {
  assertValidYearInput(year);
  assertValidMonthInput(month);

  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  const leadingDays = firstOfMonth.getDay(); // 0=Sun..6=Sat
  const totalDaysInMonth = lastOfMonth.getDate();

  const totalCells = Math.ceil((leadingDays + totalDaysInMonth) / 7) * 7;
  const gridStart = new Date(year, month, 1 - leadingDays);

  const days: Date[] = [];
  for (let i = 0; i < totalCells; i += 1) {
    days.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  }

  return days;
}

export function formatDateForDisplay(dateStr: string): string {
  if (!ISO_DATE_RE.test(dateStr)) {
    throw new Error(`Invalid date string "${dateStr}". Expected YYYY-MM-DD.`);
  }

  const [y, m, d] = dateStr.split("-").map((part) => Number(part));
  const date = new Date(y, m - 1, d);

  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

export function isSameDay(a: string, b: string): boolean {
  if (!ISO_DATE_RE.test(a) || !ISO_DATE_RE.test(b)) {
    return false;
  }
  return a === b;
}

export function toDateString(date: Date): string {
  return toIsoDateStringLocal(date);
}

export function parseDateString(dateStr: string): Date {
  if (!ISO_DATE_RE.test(dateStr)) {
    throw new Error(`Invalid date string "${dateStr}". Expected YYYY-MM-DD.`);
  }

  const [y, m, d] = dateStr.split("-").map((part) => Number(part));
  return new Date(y, m - 1, d);
}

/**
 * Canonical start of the calendar week containing `dateStr`, as `YYYY-MM-DD` in the **local**
 * calendar (same approach as `getTodayDateString` / `parseDateString`).
 *
 * **Week starts on Sunday** (0–6 `Date#getDay()`), matching `getDaysInMonth` (Sunday-first month
 * grids). Store this value in `habit_completions.completed_on` when using week-level completion.
 */
export function getWeekStartDateString(dateStr: string): string {
  const d = parseDateString(dateStr);
  const daysSinceSunday = d.getDay();
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - daysSinceSunday);
  return toIsoDateStringLocal(start);
}

