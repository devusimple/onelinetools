"use client"

import { useState } from "react"
import { fmtNum } from "@/lib/calc-utils"
import {
  addDays,
  addMonths,
  addYears,
  diffDays,
  diffYmd,
  getWeekday,
  isLeapYear,
  isoString,
  isoWeekInfo,
  parseDate,
  today,
} from "@/lib/date-utils"
import { DateField, NumberField, ResultGrid, ResultRow, Formula } from "./shared"

export function AgeCalculator() {
  const [birth, setBirth] = useState("")

  const b = parseDate(birth)
  const now = today()
  const d = b != null ? diffYmd(b, now) : null
  const totalDays = b != null ? Math.abs(diffDays(b, now)) : null

  return (
    <div className="flex flex-col gap-6">
      <DateField id="age-birth" label="Date of Birth" value={birth} onChange={setBirth} />
      <Formula>Age as of today</Formula>
      <ResultGrid>
        <ResultRow
          label="Age"
          value={
            d
              ? `${fmtNum(d.years)}y ${fmtNum(d.months)}m ${fmtNum(d.days)}d`
              : "—"
          }
          hint={totalDays != null ? `${fmtNum(totalDays)} days in total` : undefined}
        />
        <ResultRow label="Next Birthday" value="—" hint="see Birthday Countdown" />
      </ResultGrid>
    </div>
  )
}

export function DateDifferenceCalculator() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const a = parseDate(from)
  const b = parseDate(to)
  const d = a != null && b != null ? diffYmd(a, b) : null
  const days = a != null && b != null ? Math.abs(diffDays(a, b)) : null
  const weeks = days != null ? days / 7 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField id="dd-from" label="From Date" value={from} onChange={setFrom} />
        <DateField id="dd-to" label="To Date" value={to} onChange={setTo} />
      </div>
      <Formula>Difference in years, months and days</Formula>
      <ResultGrid>
        <ResultRow
          label="Difference"
          value={d ? `${fmtNum(d.years)}y ${fmtNum(d.months)}m ${fmtNum(d.days)}d` : "—"}
        />
        <ResultRow label="Total Days" value={days != null ? fmtNum(days) : "—"} />
        <ResultRow label="Total Weeks" value={weeks != null ? fmtNum(weeks, 2) : "—"} />
        <ResultRow label="Total Months (approx)" value={weeks != null ? fmtNum(weeks * 12 / 52, 2) : "—"} />
      </ResultGrid>
    </div>
  )
}

export function DaysBetweenDatesCalculator() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const a = parseDate(from)
  const b = parseDate(to)
  const days = a != null && b != null ? Math.abs(diffDays(a, b)) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField id="db-from" label="Start Date" value={from} onChange={setFrom} />
        <DateField id="db-to" label="End Date" value={to} onChange={setTo} />
      </div>
      <Formula>Days = End − Start</Formula>
      <ResultGrid>
        <ResultRow label="Days Between" value={days != null ? fmtNum(days) : "—"} />
        <ResultRow label="Weeks" value={days != null ? fmtNum(days / 7, 2) : "—"} />
      </ResultGrid>
    </div>
  )
}

export function DaysUntilDateCalculator() {
  const [target, setTarget] = useState("")

  const t = parseDate(target)
  const now = today()
  const days = t != null ? diffDays(now, t) : null

  return (
    <div className="flex flex-col gap-6">
      <DateField id="du-target" label="Target Date" value={target} onChange={setTarget} />
      <Formula>Days = Target − Today</Formula>
      <ResultGrid>
        <ResultRow
          label="Days Until"
          value={days != null ? fmtNum(days) : "—"}
          hint={days != null ? (days >= 0 ? "in the future" : "already past") : undefined}
        />
      </ResultGrid>
    </div>
  )
}

export function DaysSinceDateCalculator() {
  const [past, setPast] = useState("")

  const p = parseDate(past)
  const now = today()
  const days = p != null ? diffDays(p, now) : null

  return (
    <div className="flex flex-col gap-6">
      <DateField id="ds-past" label="Past Date" value={past} onChange={setPast} />
      <Formula>Days = Today − Past Date</Formula>
      <ResultGrid>
        <ResultRow
          label="Days Since"
          value={days != null ? fmtNum(days) : "—"}
          hint={days != null ? (days >= 0 ? "in the past" : "in the future") : undefined}
        />
      </ResultGrid>
    </div>
  )
}

export function AddDaysToDateCalculator() {
  const [date, setDate] = useState("")
  const [days, setDays] = useState("")

  const d = parseDate(date)
  const n = Number(days)
  const result = d != null && Number.isFinite(n) ? addDays(d, n) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField id="ad-date" label="Date" value={date} onChange={setDate} />
        <NumberField id="ad-days" label="Days to Add" value={days} onChange={setDays} placeholder="e.g. 45" />
      </div>
      <Formula>Result = Date + Days</Formula>
      <ResultGrid>
        <ResultRow label="Resulting Date" value={result ? isoString(result) : "—"} hint={result ? getWeekday(result) : undefined} />
      </ResultGrid>
    </div>
  )
}

export function SubtractDaysFromDateCalculator() {
  const [date, setDate] = useState("")
  const [days, setDays] = useState("")

  const d = parseDate(date)
  const n = Number(days)
  const result = d != null && Number.isFinite(n) ? addDays(d, -n) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField id="sd-date" label="Date" value={date} onChange={setDate} />
        <NumberField id="sd-days" label="Days to Subtract" value={days} onChange={setDays} placeholder="e.g. 30" />
      </div>
      <Formula>Result = Date − Days</Formula>
      <ResultGrid>
        <ResultRow label="Resulting Date" value={result ? isoString(result) : "—"} hint={result ? getWeekday(result) : undefined} />
      </ResultGrid>
    </div>
  )
}

export function AddMonthsToDateCalculator() {
  const [date, setDate] = useState("")
  const [months, setMonths] = useState("")

  const d = parseDate(date)
  const n = Number(months)
  const result = d != null && Number.isFinite(n) ? addMonths(d, n) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField id="am-date" label="Date" value={date} onChange={setDate} />
        <NumberField id="am-months" label="Months to Add" value={months} onChange={setMonths} placeholder="e.g. 6" />
      </div>
      <Formula>Result = Date + Months</Formula>
      <ResultGrid>
        <ResultRow label="Resulting Date" value={result ? isoString(result) : "—"} hint={result ? getWeekday(result) : undefined} />
      </ResultGrid>
    </div>
  )
}

export function AddYearsToDateCalculator() {
  const [date, setDate] = useState("")
  const [years, setYears] = useState("")

  const d = parseDate(date)
  const n = Number(years)
  const result = d != null && Number.isFinite(n) ? addYears(d, n) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField id="ay-date" label="Date" value={date} onChange={setDate} />
        <NumberField id="ay-years" label="Years to Add" value={years} onChange={setYears} placeholder="e.g. 5" />
      </div>
      <Formula>Result = Date + Years</Formula>
      <ResultGrid>
        <ResultRow label="Resulting Date" value={result ? isoString(result) : "—"} hint={result ? getWeekday(result) : undefined} />
      </ResultGrid>
    </div>
  )
}

export function DayOfWeekCalculator() {
  const [date, setDate] = useState("")

  const d = parseDate(date)
  const weekday = d ? getWeekday(d) : null

  return (
    <div className="flex flex-col gap-6">
      <DateField id="dw-date" label="Date" value={date} onChange={setDate} />
      <Formula>Find the weekday of a date</Formula>
      <ResultGrid>
        <ResultRow
          label="Day of the Week"
          value={weekday ?? "—"}
          hint={weekday === "Saturday" || weekday === "Sunday" ? "weekend" : "weekday"}
        />
      </ResultGrid>
    </div>
  )
}

export function WeekNumberCalculator() {
  const [date, setDate] = useState("")

  const d = parseDate(date)
  const info = d ? isoWeekInfo(d) : null

  return (
    <div className="flex flex-col gap-6">
      <DateField id="wn-date" label="Date" value={date} onChange={setDate} />
      <Formula>ISO week number</Formula>
      <ResultGrid>
        <ResultRow label="Week Number" value={info ? String(info.week) : "—"} />
        <ResultRow label="ISO Year" value={info ? String(info.year) : "—"} />
      </ResultGrid>
    </div>
  )
}

export function WeekdayCalculator() {
  const [date, setDate] = useState("")

  const d = parseDate(date)
  const weekday = d ? getWeekday(d) : null
  const weekend = weekday === "Saturday" || weekday === "Sunday"

  return (
    <div className="flex flex-col gap-6">
      <DateField id="wd-date" label="Date" value={date} onChange={setDate} />
      <Formula>Identify the weekday</Formula>
      <ResultGrid>
        <ResultRow label="Weekday" value={weekday ?? "—"} />
        <ResultRow label="Type" value={weekday ? (weekend ? "Weekend" : "Working day") : "—"} />
      </ResultGrid>
    </div>
  )
}

export function LeapYearChecker() {
  const [year, setYear] = useState("")

  const y = Number(year)
  const valid = year.trim() !== "" && Number.isInteger(y) && y > 0 && y < 10000
  const leap = valid ? isLeapYear(y) : null

  return (
    <div className="flex flex-col gap-6">
      <NumberField id="ly-year" label="Year" value={year} onChange={setYear} placeholder="e.g. 2024" />
      <Formula>Leap = divisible by 4, not by 100, unless by 400</Formula>
      <ResultGrid>
        <ResultRow
          label="Leap Year?"
          value={valid ? (leap ? "Yes" : "No") : "—"}
          hint={valid ? `${y} has ${leap ? 366 : 365} days` : undefined}
        />
      </ResultGrid>
    </div>
  )
}

export function AgeAtSpecificDateCalculator() {
  const [birth, setBirth] = useState("")
  const [asOf, setAsOf] = useState("")

  const b = parseDate(birth)
  const a = parseDate(asOf)
  const d = b != null && a != null ? diffYmd(b, a) : null
  const totalDays = b != null && a != null ? Math.abs(diffDays(b, a)) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField id="as-birth" label="Date of Birth" value={birth} onChange={setBirth} />
        <DateField id="as-date" label="Age as of" value={asOf} onChange={setAsOf} />
      </div>
      <Formula>Age on a specific date</Formula>
      <ResultGrid>
        <ResultRow
          label="Age"
          value={d ? `${fmtNum(d.years)}y ${fmtNum(d.months)}m ${fmtNum(d.days)}d` : "—"}
          hint={totalDays != null ? `${fmtNum(totalDays)} days` : undefined}
        />
      </ResultGrid>
    </div>
  )
}
