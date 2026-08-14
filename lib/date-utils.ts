export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
export const WEEKDAY_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function parseLines(input: string): string[] {
  return input
    .split(/[\n,;\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

export function parseDate(value: string): Date | null {
  if (!value) return null
  const d = new Date(value + "T00:00:00")
  return Number.isNaN(d.getTime()) ? null : d
}

export function parseDateTime(value: string): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function today(): Date {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate())
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function addDays(d: Date, days: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + days)
  return r
}

export function addMonths(d: Date, months: number): Date {
  const r = new Date(d)
  const day = r.getDate()
  r.setDate(1)
  r.setMonth(r.getMonth() + months)
  const lastDay = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate()
  r.setDate(Math.min(day, lastDay))
  return r
}

export function addYears(d: Date, years: number): Date {
  const r = new Date(d)
  const day = r.getDate()
  r.setDate(1)
  r.setMonth(r.getMonth() + years * 12)
  const lastDay = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate()
  r.setDate(Math.min(day, lastDay))
  return r
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function diffDays(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime()
  return Math.round(ms / 86400000)
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export interface Ymd {
  years: number
  months: number
  days: number
}

export function diffYmd(from: Date, to: Date): Ymd {
  const a = startOfDay(from)
  const b = startOfDay(to)
  if (b.getTime() < a.getTime()) return diffYmd(b, a)
  let years = b.getFullYear() - a.getFullYear()
  let months = b.getMonth() - a.getMonth()
  let days = b.getDate() - a.getDate()
  if (days < 0) {
    months--
    days += daysInMonth(b.getFullYear(), b.getMonth() - 1)
  }
  if (months < 0) {
    years--
    months += 12
  }
  return { years, months, days }
}

export function getWeekday(d: Date): string {
  return WEEKDAY_FULL[d.getDay() === 0 ? 6 : d.getDay() - 1]
}

export function isoWeekInfo(d: Date): { week: number; year: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { week, year: date.getUTCFullYear() }
}

export function businessDaysBetween(from: Date, to: Date, holidays: string[] = []): number {
  let start = startOfDay(from)
  const end = startOfDay(to)
  if (end.getTime() < start.getTime())
    return businessDaysBetween(to, from, holidays)
  const holidaySet = new Set(holidays.map((h) => (h || "").slice(0, 10)))
  let count = 0
  let guard = 0
  while (start.getTime() <= end.getTime() && guard < 10000) {
    guard++
    const dow = start.getDay()
    const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`
    if (dow !== 0 && dow !== 6 && !holidaySet.has(key)) count++
    start = addDays(start, 1)
  }
  return count
}

export function isoString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function monthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1)
  const offset = first.getDay() === 0 ? 6 : first.getDay() - 1
  const total = daysInMonth(year, month)
  const cells: (Date | null)[] = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let day = 1; day <= total; day++) cells.push(new Date(year, month, day))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export function toYmd(d: Date): string {
  return `${pad(d.getFullYear())}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function zoneOffsetMinutes(tz: string, date = new Date()): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    const parts = Object.fromEntries(
      dtf
        .formatToParts(date)
        .filter((p) => p.type !== "literal" && p.type !== "dayPeriod")
        .map((p) => [p.type, Number(p.value)])
    )
    const utcWall = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour % 24,
      parts.minute,
      parts.second
    )
    return Math.round((utcWall - date.getTime()) / 60000)
  } catch {
    return 0
  }
}

export function wallToUtcMs(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  s: number,
  tz: string
): number {
  const asUtc = Date.UTC(y, mo - 1, d, h, mi, s)
  const off1 = zoneOffsetMinutes(tz, new Date(asUtc))
  let utc = asUtc - off1 * 60000
  const off2 = zoneOffsetMinutes(tz, new Date(utc))
  if (off1 !== off2) utc = asUtc - off2 * 60000
  return utc
}

export function parseTimeInput(value: string): { h: number; m: number } | null {
  if (!value || !value.includes(":")) return null
  const [hh, mm] = value.split(":").map(Number)
  if (!Number.isInteger(hh) || !Number.isInteger(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59)
    return null
  return { h: hh, m: mm }
}

export function formatInZone(date: Date, tz: string): string {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour12: true,
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    })
    return dtf.format(date)
  } catch {
    return "Invalid zone"
  }
}

export function formatTimeInZone(date: Date, tz: string, withSeconds = false): string {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
      ...(withSeconds ? { second: "2-digit" as const } : {}),
    })
    return dtf.format(date)
  } catch {
    return "--"
  }
}

export interface ZoneInfo {
  label: string
  tz: string
}

export const COMMON_ZONES: ZoneInfo[] = [
  { label: "Los Angeles", tz: "America/Los_Angeles" },
  { label: "Denver", tz: "America/Denver" },
  { label: "Chicago", tz: "America/Chicago" },
  { label: "New York", tz: "America/New_York" },
  { label: "Toronto", tz: "America/Toronto" },
  { label: "Sao Paulo", tz: "America/Sao_Paulo" },
  { label: "Buenos Aires", tz: "America/Argentina/Buenos_Aires" },
  { label: "London", tz: "Europe/London" },
  { label: "Paris", tz: "Europe/Paris" },
  { label: "Berlin", tz: "Europe/Berlin" },
  { label: "Istanbul", tz: "Europe/Istanbul" },
  { label: "Moscow", tz: "Europe/Moscow" },
  { label: "Dubai", tz: "Asia/Dubai" },
  { label: "Karachi", tz: "Asia/Karachi" },
  { label: "Delhi", tz: "Asia/Kolkata" },
  { label: "Dhaka", tz: "Asia/Dhaka" },
  { label: "Bangkok", tz: "Asia/Bangkok" },
  { label: "Singapore", tz: "Asia/Singapore" },
  { label: "Hong Kong", tz: "Asia/Hong_Kong" },
  { label: "Tokyo", tz: "Asia/Tokyo" },
  { label: "Seoul", tz: "Asia/Seoul" },
  { label: "Sydney", tz: "Australia/Sydney" },
  { label: "Auckland", tz: "Pacific/Auckland" },
]

export function beep(count = 3) {
  try {
    type WindowWithAudio = Window & { webkitAudioContext?: typeof AudioContext }
    const Ctor = window.AudioContext ?? (window as WindowWithAudio).webkitAudioContext
    if (!Ctor) return
    const ctx = new Ctor()
    const notes = [880, 880, 660]
    for (let i = 0; i < Math.min(count, notes.length); i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = notes[i]
      const t = ctx.currentTime + i * 0.35
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.35)
    }
    setTimeout(() => ctx.close(), notes.length * 350 + 300)
  } catch {
    /* audio unavailable */
  }
}