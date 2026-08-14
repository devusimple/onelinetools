"use client"

import { useState } from "react"
import { MONTHS, WEEKDAYS, isoString, monthGrid, sameDay, today } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import { NumberField, ResultGrid, ResultRow, Formula } from "./shared"

function CalendarGrid({
  year,
  month,
  highlightToday = false,
}: {
  year: number
  month: number
  highlightToday?: boolean
}) {
  const cells = monthGrid(year, month)
  const t = highlightToday ? today() : null

  return (
    <div className="w-full">
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) =>
          d ? (
            <div
              key={i}
              className={`flex h-9 items-center justify-center rounded-md border border-input text-sm ${
                t && sameDay(d, t) ? "bg-primary font-semibold text-primary-foreground" : "bg-card"
              }`}
            >
              {d.getDate()}
            </div>
          ) : (
            <div key={i} className="h-9" />
          )
        )}
      </div>
    </div>
  )
}

export function CalendarGenerator() {
  const now = today()
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth()))

  const y = Number(year)
  const m = Number(month)
  const valid = Number.isInteger(y) && y > 0 && y < 10000 && Number.isInteger(m) && m >= 0 && m <= 11

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="cg-year" label="Year" value={year} onChange={setYear} placeholder="e.g. 2026" />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="cg-month">
            Month
          </label>
          <select
            id="cg-month"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {MONTHS.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Formula>Calendar for {valid ? `${MONTHS[m]} ${y}` : "the selected month"}</Formula>
      <div className="rounded-md border border-border p-3">
        <CalendarGrid year={y} month={m} highlightToday={valid} />
      </div>
    </div>
  )
}

export function MonthlyCalendar() {
  const now = today()
  const [cursor, setCursor] = useState(() => ({ year: now.getFullYear(), month: now.getMonth() }))

  const shift = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  const backToToday = () => setCursor({ year: now.getFullYear(), month: now.getMonth() })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => shift(-1)}>
          Previous
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => shift(1)}>
          Next
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={backToToday}>
          Today
        </Button>
        <span className="text-base font-semibold">{MONTHS[cursor.month]} {cursor.year}</span>
      </div>
      <CalendarGrid year={cursor.year} month={cursor.month} highlightToday />
    </div>
  )
}

export function YearlyCalendar() {
  const now = today()
  const [year, setYear] = useState(now.getFullYear())

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setYear((y) => y - 1)}>
          Previous
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setYear((y) => y + 1)}>
          Next
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setYear(now.getFullYear())}>
          This Year
        </Button>
        <span className="text-base font-semibold">{year}</span>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {MONTHS.map((name, m) => (
          <div key={name} className="rounded-md border border-border p-3">
            <p className="mb-2 text-sm font-semibold">
              {name} {year}
            </p>
            <CalendarGrid year={year} month={m} highlightToday />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PrintableCalendar() {
  const now = today()
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth()))

  const y = Number(year)
  const m = Number(month)
  const valid = Number.isInteger(y) && y > 0 && y < 10000 && Number.isInteger(m) && m >= 0 && m <= 11

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="pc-year" label="Year" value={year} onChange={setYear} placeholder="e.g. 2026" />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="pc-month">
            Month
          </label>
          <select
            id="pc-month"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {MONTHS.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Formula>Printable {valid ? `${MONTHS[m]} ${y}` : "month"} calendar</Formula>
        <Button type="button" onClick={() => window.print()}>
          Print
        </Button>
      </div>
      <div className="rounded-md border border-border p-3" id="printable-calendar">
        <h3 className="mb-3 text-center text-lg font-bold">{MONTHS[m]} {y}</h3>
        <CalendarGrid year={y} month={m} />
      </div>
      <ResultGrid>
        <ResultRow label="First Day" value={valid ? WEEKDAYS[new Date(y, m, 1).getDay() === 0 ? 6 : new Date(y, m, 1).getDay() - 1] : "—"} />
        <ResultRow label="Last Day" value={valid ? WEEKDAYS[new Date(y, m + 1, 0).getDay() === 0 ? 6 : new Date(y, m + 1, 0).getDay() - 1] : "—"} />
        <ResultRow label="Today" value={isoString(now)} />
      </ResultGrid>
    </div>
  )
}
