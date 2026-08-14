export function parseNum(value: string): number | null {
  if (value == null) return null
  const v = value.trim().replace(/,/g, "")
  if (v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function clean(n: number): number {
  return Object.is(n, -0) ? 0 : n
}

export function fmtNum(n: number | null | undefined, maxDigits = 10): string {
  if (n == null || Number.isNaN(n)) return "—"
  if (!Number.isFinite(n)) return n > 0 ? "∞" : "-∞"
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxDigits,
  }).format(clean(n))
}

export function fmtMoney(n: number | null | undefined, currency = "USD"): string {
  if (n == null || Number.isNaN(n)) return "—"
  if (!Number.isFinite(n)) return n > 0 ? "∞" : "-∞"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(clean(n))
}

export function fmtPct(n: number | null | undefined, maxDigits = 4): string {
  if (n == null || Number.isNaN(n)) return "—"
  if (!Number.isFinite(n)) return n > 0 ? "∞" : "-∞"
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxDigits,
  }).format(clean(n))}%`
}

export function parseList(input: string): number[] {
  return input
    .split(/[\n,;\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n))
}

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a))
  b = Math.abs(Math.round(b))
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a || 1
}

export function simplifyFraction(num: number, den: number): [number, number] {
  if (den === 0) return [num, 0]
  const g = gcd(num, den)
  const n = clean(num / g)
  const d = clean(den / g)
  if (d < 0) return [-n, -d]
  return [n, d]
}

export function toMoneyString(value: string): string {
  return value.replace(/[^0-9.]/g, "")
}

export function toTimeString(value: string): string {
  const m = value.match(/(\d{1,2}):(\d{2})/)
  if (!m) return ""
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return ""
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`
}

export function minutesToHM(minutes: number): string {
  const m = Math.round(minutes)
  const h = Math.floor(Math.abs(m) / 60)
  const rem = Math.abs(m) % 60
  const sign = m < 0 ? "-" : ""
  return `${sign}${h}h ${String(rem).padStart(2, "0")}m`
}
