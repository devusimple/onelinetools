"use client"

import { useMemo, useState } from "react"
import { minutesToHM, parseNum } from "@/lib/calc-utils"
import { NumberField, ResultGrid, ResultRow, Formula } from "./shared"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

function toMinutes(value: string): number | null {
  const m = value.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return null
  return h * 60 + min
}

function hoursBetween(start: number, end: number): number {
  if (end >= start) return (end - start) / 60
  return (end + 1440 - start) / 60
}

export function WorkHoursCalculator() {
  const [start, setStart] = useState("09:00")
  const [end, setEnd] = useState("17:00")
  const [breakMin, setBreakMin] = useState("30")

  const s = toMinutes(start)
  const e = toMinutes(end)
  const b = parseNum(breakMin)

  const raw = s != null && e != null ? hoursBetween(s, e) : null
  const worked = raw != null ? raw - (b ?? 0) / 60 : null
  const minutes = worked != null ? worked * 60 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="wh-start">Start Time</Label>
          <Input id="wh-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="wh-end">End Time</Label>
          <Input id="wh-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <NumberField id="wh-break" label="Break (minutes)" value={breakMin} onChange={setBreakMin} placeholder="e.g. 30" suffix="min" />
      </div>
      <Formula>Hours = (End − Start) − Break</Formula>
      <ResultGrid>
        <ResultRow label="Hours Worked" value={minutes != null ? `${(Math.floor(Math.abs(minutes) / 60))}h ${String(Math.round(Math.abs(minutes) % 60)).padStart(2, "0")}m` : "—"} hint={worked != null ? `${worked.toFixed(2)} hours` : undefined} />
        <ResultRow label="Gross Hours" value={raw != null ? `${raw.toFixed(2)}h` : "—"} hint="before break" />
      </ResultGrid>
    </div>
  )
}

interface TimeCardRow {
  id: number
  start: string
  end: string
  breakMin: string
}

export function TimeCardCalculator() {
  const [rows, setRows] = useState<TimeCardRow[]>([
    { id: 1, start: "09:00", end: "17:00", breakMin: "30" },
  ])

  const addRow = () =>
    setRows((r) => [...r, { id: Date.now(), start: "09:00", end: "17:00", breakMin: "30" }])

  const updateRow = (id: number, patch: Partial<TimeCardRow>) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)))

  const removeRow = (id: number) => setRows((r) => (r.length > 1 ? r.filter((row) => row.id !== id) : r))

  const totals = useMemo(() => {
    let totalMinutes = 0
    let grossMinutes = 0
    let count = 0
    for (const row of rows) {
      const s = toMinutes(row.start)
      const e = toMinutes(row.end)
      const b = parseNum(row.breakMin) ?? 0
      if (s == null || e == null) continue
      const raw = hoursBetween(s, e)
      grossMinutes += raw * 60
      totalMinutes += raw * 60 - b
      count++
    }
    return { totalMinutes, grossMinutes, count }
  }, [rows])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <div className="flex flex-col gap-2">
              <Label>Start</Label>
              <Input
                type="time"
                value={row.start}
                onChange={(e) => updateRow(row.id, { start: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>End</Label>
              <Input
                type="time"
                value={row.end}
                onChange={(e) => updateRow(row.id, { end: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Break (min)</Label>
              <Input
                inputMode="numeric"
                value={row.breakMin}
                onChange={(e) => updateRow(row.id, { breakMin: e.target.value })}
              />
            </div>
            <div className="flex items-end pb-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Remove day"
                disabled={rows.length === 1}
                onClick={() => removeRow(row.id)}
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" onClick={addRow}>
        Add Day
      </Button>
      <Formula>Total = Σ (End − Start − Break)</Formula>
      <ResultGrid>
        <ResultRow label="Total Hours" value={minutesToHM(totals.totalMinutes)} hint={`${(totals.totalMinutes / 60).toFixed(2)} hours`} />
        <ResultRow label="Gross Hours" value={minutesToHM(totals.grossMinutes)} hint="before breaks" />
        <ResultRow label="Days Logged" value={String(totals.count)} />
      </ResultGrid>
    </div>
  )
}
