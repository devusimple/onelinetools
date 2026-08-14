"use client"

import { useEffect, useState } from "react"
import { MONTHS, WEEKDAY_FULL, isoString, parseDate } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import { DateField, NumberField, SelectField, ResultGrid, ResultRow, Formula } from "./shared"

function useClock(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

function parseEpochToMs(value: string): number | null {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return Math.abs(n) > 1e12 ? Math.round(n) : Math.round(n * 1000)
}

function copyText(text: string, setDone: (v: boolean) => void) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      setDone(true)
      setTimeout(() => setDone(false), 1200)
    })
    .catch(() => undefined)
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  return (
    <Button type="button" variant="outline" size="sm" onClick={() => copyText(text, setDone)}>
      {done ? "Copied" : "Copy"}
    </Button>
  )
}

export function UnixTimestampConverter() {
  const [ts, setTs] = useState("")

  const ms = parseEpochToMs(ts)
  const date = ms != null ? new Date(ms) : null
  const valid = date != null && !Number.isNaN(date.getTime())

  return (
    <div className="flex flex-col gap-6">
      <NumberField id="utc-ts" label="Unix Timestamp (seconds or milliseconds)" value={ts} onChange={setTs} placeholder="e.g. 1700000000" />
      <Formula>Timestamps after 1e12 are treated as milliseconds</Formula>
      <ResultGrid>
        <ResultRow label="UTC" value={valid ? date.toUTCString() : "—"} />
        <ResultRow label="ISO" value={valid ? date.toISOString() : "—"} />
        <ResultRow label="Local" value={valid ? date.toLocaleString() : "—"} />
        <ResultRow
          label="Weekday"
          value={valid ? WEEKDAY_FULL[date.getDay() === 0 ? 6 : date.getDay() - 1] : "—"}
        />
        <ResultRow
          label="Milliseconds"
          value={valid ? String(date.getTime()) : "—"}
          hint={valid ? `interpreted as ${ms !== null && Math.abs(Number(ts)) > 1e12 ? "ms" : "seconds"}` : undefined}
        />
      </ResultGrid>
    </div>
  )
}

export function UnixTimestampGenerator() {
  const now = useClock(500)
  const [date, setDate] = useState("")

  const d = parseDate(date)
  const epochForDate = d != null ? Math.floor(d.getTime() / 1000) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md border border-border p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Current Unix time</p>
          <CopyButton text={String(Math.floor(now.getTime() / 1000))} />
        </div>
        <p className="mt-1 font-mono text-3xl font-bold tabular-nums">{Math.floor(now.getTime() / 1000)}</p>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          {now.getTime()} ms &middot; {now.toISOString()}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="utg-date">
          Or: convert a date to a timestamp
        </label>
        <div className="flex items-center gap-2">
          <input
            id="utg-date"
            type="date"
            className="flex h-10 flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <CopyButton text={epochForDate != null ? String(epochForDate) : ""} />
        </div>
        <p className="font-mono text-sm">{epochForDate != null ? epochForDate : "—"}</p>
      </div>
      <Formula>Live generator with one-click copy</Formula>
    </div>
  )
}

export function IsoDateConverter() {
  const [iso, setIso] = useState("")

  const date = iso ? new Date(iso) : null
  const valid = date != null && !Number.isNaN(date.getTime())

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="iso-in">
          ISO 8601 String
        </label>
        <input
          id="iso-in"
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="e.g. 2026-08-14T10:30:00.000Z"
          value={iso}
          onChange={(e) => setIso(e.target.value)}
        />
      </div>
      <Formula>Parses any ISO string the browser understands</Formula>
      <ResultGrid>
        <ResultRow label="Valid?" value={valid ? "Yes" : "—"} />
        <ResultRow label="UTC" value={valid ? date.toUTCString() : "—"} />
        <ResultRow label="Local" value={valid ? date.toLocaleString() : "—"} />
        <ResultRow label="ISO" value={valid ? date.toISOString() : "—"} />
        <ResultRow
          label="Local Offset"
          value={valid ? `UTC${-new Date().getTimezoneOffset() / 60 >= 0 ? "+" : ""}${-new Date().getTimezoneOffset() / 60}` : "—"}
        />
      </ResultGrid>
    </div>
  )
}

export function EpochConverter() {
  const [epoch, setEpoch] = useState("")
  const [date, setDate] = useState("")

  const ms = parseEpochToMs(epoch)
  const dateFromEpoch = ms != null ? new Date(ms) : null
  const validEpoch = dateFromEpoch != null && !Number.isNaN(dateFromEpoch.getTime())

  const d = parseDate(date)
  const epochFromDate = d != null ? Math.floor(d.getTime() / 1000) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="ec-epoch">
            Epoch → Date
          </label>
          <input
            id="ec-epoch"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="e.g. 1700000000"
            value={epoch}
            onChange={(e) => setEpoch(e.target.value)}
          />
          <p className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-sm">
            {validEpoch ? dateFromEpoch.toUTCString() : "—"}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="ec-date">
            Date → Epoch
          </label>
          <input
            id="ec-date"
            type="date"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <p className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-sm">
            {epochFromDate != null ? epochFromDate : "—"}
          </p>
        </div>
      </div>
      <Formula>Seconds since 1970-01-01T00:00:00Z</Formula>
    </div>
  )
}

export function QuarterCalculator() {
  const [date, setDate] = useState("")

  const d = parseDate(date)
  const q = d != null ? Math.floor(d.getMonth() / 3) + 1 : null
  const qStart = d != null ? new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1) : null
  const qEnd = d != null ? new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3 + 3, 0) : null
  const dayOfQuarter = d != null && qStart != null ? Math.round((d.getTime() - qStart.getTime()) / 86400000) + 1 : null
  const daysInQuarter = qStart != null && qEnd != null ? Math.round((qEnd.getTime() - qStart.getTime()) / 86400000) + 1 : null

  return (
    <div className="flex flex-col gap-6">
      <DateField id="q-date" label="Date" value={date} onChange={setDate} />
      <Formula>Calendar quarter information</Formula>
      <ResultGrid>
        <ResultRow label="Quarter" value={q != null ? `Q${q}` : "—"} hint={d != null ? `${d.getFullYear()}` : undefined} />
        <ResultRow label="Quarter Start" value={qStart ? isoString(qStart) : "—"} />
        <ResultRow label="Quarter End" value={qEnd ? isoString(qEnd) : "—"} />
        <ResultRow label="Day of Quarter" value={dayOfQuarter != null ? `${dayOfQuarter} of ${daysInQuarter}` : "—"} />
      </ResultGrid>
    </div>
  )
}

export function FiscalYearCalculator() {
  const [date, setDate] = useState("")
  const [startMonth, setStartMonth] = useState("6")

  const d = parseDate(date)
  const sm = Number(startMonth)
  const validMonth = Number.isInteger(sm) && sm >= 0 && sm <= 11

  const fyStart = d != null && validMonth ? new Date(d.getFullYear(), sm, 1) : null
  const fyLabel = d != null && validMonth ? (d.getMonth() >= sm ? d.getFullYear() + 1 : d.getFullYear()) : null
  const fyStartDate = fyStart != null ? fyStart : null
  const fyEndDate = fyStartDate != null ? new Date(fyStartDate.getFullYear() + 1, sm, 0) : null
  const dayOfFy = fyStartDate != null && d != null ? Math.round((d.getTime() - fyStartDate.getTime()) / 86400000) + 1 : null
  const daysInFy = fyStartDate != null && fyEndDate != null ? Math.round((fyEndDate.getTime() - fyStartDate.getTime()) / 86400000) + 1 : null
  const fyQuarter = dayOfFy != null ? Math.min(4, Math.ceil(dayOfFy / (daysInFy ? daysInFy / 4 : 91))) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField id="fy-date" label="Date" value={date} onChange={setDate} />
        <SelectField
          id="fy-start"
          label="Fiscal Year Starts In"
          value={startMonth}
          onChange={setStartMonth}
          options={MONTHS.map((name, i) => ({ value: String(i), label: name }))}
        />
      </div>
      <Formula>Fiscal year based on the starting month</Formula>
      <ResultGrid>
        <ResultRow label="Fiscal Year" value={fyLabel != null ? `FY ${String(fyLabel % 100).padStart(2, "0")}` : "—"} />
        <ResultRow label="FY Start" value={fyStartDate ? isoString(fyStartDate) : "—"} />
        <ResultRow label="FY End" value={fyEndDate ? isoString(fyEndDate) : "—"} />
        <ResultRow label="Day of FY" value={dayOfFy != null ? `${dayOfFy} of ${daysInFy}` : "—"} />
        <ResultRow label="Fiscal Quarter" value={fyQuarter != null ? `Q${fyQuarter}` : "—"} />
      </ResultGrid>
    </div>
  )
}

const FORMATS = [
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  { value: "YYYY/MM/DD", label: "YYYY/MM/DD" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "Mon DD, YYYY", label: "Mon DD, YYYY (Aug 14, 2026)" },
  { value: "Month DD, YYYY", label: "Month DD, YYYY (August 14, 2026)" },
  { value: "DD Mon YYYY", label: "DD Mon YYYY (14 Aug 2026)" },
  { value: "Long", label: "Long (Friday, August 14, 2026)" },
  { value: "ISO", label: "ISO (2026-08-14)" },
]

function formatDate(d: Date, fmt: string): string {
  const y = d.getFullYear()
  const mo = d.getMonth()
  const dd = d.getDate()
  const mon = MONTHS[mo].slice(0, 3)
  const weekday = WEEKDAY_FULL[d.getDay() === 0 ? 6 : d.getDay() - 1]
  const pad = (n: number) => String(n).padStart(2, "0")
  switch (fmt) {
    case "YYYY-MM-DD":
      return `${y}-${pad(mo + 1)}-${pad(dd)}`
    case "YYYY/MM/DD":
      return `${y}/${pad(mo + 1)}/${pad(dd)}`
    case "MM/DD/YYYY":
      return `${pad(mo + 1)}/${pad(dd)}/${y}`
    case "DD/MM/YYYY":
      return `${pad(dd)}/${pad(mo + 1)}/${y}`
    case "Mon DD, YYYY":
      return `${mon} ${dd}, ${y}`
    case "Month DD, YYYY":
      return `${MONTHS[mo]} ${dd}, ${y}`
    case "DD Mon YYYY":
      return `${pad(dd)} ${mon} ${y}`
    case "Long":
      return `${weekday}, ${MONTHS[mo]} ${dd}, ${y}`
    case "ISO":
      return isoString(d)
    default:
      return isoString(d)
  }
}

export function DateFormatConverter() {
  const [date, setDate] = useState("")
  const [fmt, setFmt] = useState("YYYY-MM-DD")

  const d = parseDate(date)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField id="df-date" label="Date" value={date} onChange={setDate} />
        <SelectField id="df-fmt" label="Output Format" value={fmt} onChange={setFmt} options={FORMATS} />
      </div>
      <Formula>Reformat a date into a different convention</Formula>
      <ResultGrid>
        <ResultRow label="Formatted" value={d ? formatDate(d, fmt) : "—"} />
        <ResultRow label="Weekday" value={d ? WEEKDAY_FULL[d.getDay() === 0 ? 6 : d.getDay() - 1] : "—"} />
      </ResultGrid>
    </div>
  )
}
