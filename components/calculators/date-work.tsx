"use client"

import { useState } from "react"
import { fmtNum } from "@/lib/calc-utils"
import {
  addDays,
  businessDaysBetween,
  diffDays,
  isoString,
  parseDate,
  parseLines,
  startOfDay,
} from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import { DateField, ListField, NumberField, ResultGrid, ResultRow, Formula } from "./shared"

function computeEndDate(start: Date | null, n: number, holidays: string[]): Date | null {
  if (!start || !Number.isInteger(n) || n < 0) return null
  const holidaySet = new Set(holidays.map((h) => (h || "").slice(0, 10)))
  let d = start
  let added = 0
  let guard = 0
  while (added < n && guard < 4000) {
    guard++
    d = addDays(d, 1)
    const dow = d.getDay()
    const key = isoString(d)
    if (dow !== 0 && dow !== 6 && !holidaySet.has(key)) added++
  }
  return d
}

function computeRange(a: Date | null, b: Date | null, step: string): string[] {
  if (!a || !b) return []
  const start = a.getTime() <= b.getTime() ? a : b
  const end = a.getTime() <= b.getTime() ? b : a
  const out: string[] = []
  let d = startOfDay(start)
  let guard = 0
  while (d.getTime() <= end.getTime() && guard < 10000) {
    guard++
    out.push(isoString(d))
    d = addDays(d, step === "week" ? 7 : step === "month" ? 28 : 1)
  }
  return out
}

export function BusinessDaysCalculator() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [holidays, setHolidays] = useState("")

  const a = parseDate(from)
  const b = parseDate(to)
  const count = a != null && b != null ? businessDaysBetween(a, b, parseLines(holidays)) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField id="bd-from" label="Start Date" value={from} onChange={setFrom} />
        <DateField id="bd-to" label="End Date" value={to} onChange={setTo} />
      </div>
      <ListField
        id="bd-holidays"
        label="Holidays (one per line, YYYY-MM-DD)"
        value={holidays}
        onChange={setHolidays}
        placeholder={"2026-01-01\n2026-12-25"}
      />
      <Formula>Working days between two dates, excluding weekends and holidays</Formula>
      <ResultGrid>
        <ResultRow label="Business Days" value={count != null ? fmtNum(count) : "—"} />
        <ResultRow
          label="Calendar Days"
          value={a != null && b != null ? fmtNum(Math.abs(diffDays(a, b)) + 1) : "—"}
        />
      </ResultGrid>
    </div>
  )
}

export function WorkingDaysCalculator() {
  const [start, setStart] = useState("")
  const [count, setCount] = useState("")
  const [holidays, setHolidays] = useState("")

  const s = parseDate(start)
  const n = Number(count)

  const endDate = computeEndDate(s, n, parseLines(holidays))

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField id="wd-start" label="Start Date" value={start} onChange={setStart} />
        <NumberField id="wd-count" label="Number of Working Days" value={count} onChange={setCount} placeholder="e.g. 20" />
      </div>
      <ListField
        id="wd-holidays"
        label="Holidays (one per line, YYYY-MM-DD)"
        value={holidays}
        onChange={setHolidays}
        placeholder={"2026-01-01\n2026-12-25"}
      />
      <Formula>End date = start date + N working days</Formula>
      <ResultGrid>
        <ResultRow label="End Date" value={endDate ? isoString(endDate) : "—"} />
      </ResultGrid>
    </div>
  )
}

export function WorkingHoursCalculator() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [hours, setHours] = useState("8")
  const [holidays, setHolidays] = useState("")

  const a = parseDate(from)
  const b = parseDate(to)
  const perDay = Number(hours)
  const days = a != null && b != null ? businessDaysBetween(a, b, parseLines(holidays)) : null
  const total = days != null && Number.isFinite(perDay) ? days * perDay : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField id="wh-from" label="Start Date" value={from} onChange={setFrom} />
        <DateField id="wh-to" label="End Date" value={to} onChange={setTo} />
        <NumberField id="wh-hours" label="Hours per Day" value={hours} onChange={setHours} placeholder="e.g. 8" />
      </div>
      <ListField
        id="wh-holidays"
        label="Holidays (one per line, YYYY-MM-DD)"
        value={holidays}
        onChange={setHolidays}
        placeholder={"2026-01-01\n2026-12-25"}
      />
      <Formula>Total hours = business days × hours per day</Formula>
      <ResultGrid>
        <ResultRow label="Working Days" value={days != null ? fmtNum(days) : "—"} />
        <ResultRow label="Total Hours" value={total != null ? fmtNum(total, 2) : "—"} />
      </ResultGrid>
    </div>
  )
}

export function DateRangeGenerator() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [step, setStep] = useState("day")
  const [copied, setCopied] = useState(false)

  const a = parseDate(from)
  const b = parseDate(to)
  const range = computeRange(a, b, step)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(range.join("\n"))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField id="rg-from" label="Start Date" value={from} onChange={setFrom} />
        <DateField id="rg-to" label="End Date" value={to} onChange={setTo} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="rg-step">
          Step
        </label>
        <select
          id="rg-step"
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={step}
          onChange={(e) => setStep(e.target.value)}
        >
          <option value="day">Every day</option>
          <option value="week">Every week (7 days)</option>
          <option value="month">Every 4 weeks</option>
        </select>
      </div>
      <Formula>{range.length} dates generated</Formula>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Dates</span>
          <Button type="button" variant="outline" size="sm" onClick={handleCopy} disabled={range.length === 0}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <textarea
          readOnly
          value={range.join("\n")}
          rows={10}
          className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    </div>
  )
}
