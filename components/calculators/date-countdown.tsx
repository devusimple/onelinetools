"use client"

import { useEffect, useState } from "react"
import { fmtNum } from "@/lib/calc-utils"
import { beep, isoString, parseDate, today } from "@/lib/date-utils"
import { ResultGrid, ResultRow, Formula } from "./shared"

function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

export function BirthdayCountdown() {
  const [birth, setBirth] = useState("")
  const now = useNow()
  const t = today()

  const b = parseDate(birth)

  let nextBirthday: Date | null = null
  let ageAtBirthday: number | null = null
  let daysUntil: number | null = null

  if (b) {
    const thisYear = new Date(t.getFullYear(), b.getMonth(), b.getDate())
    nextBirthday = thisYear.getTime() < t.getTime() ? new Date(t.getFullYear() + 1, b.getMonth(), b.getDate()) : thisYear
    daysUntil = Math.ceil((startOf(nextBirthday) - startOf(t)) / 86400000)
    ageAtBirthday = nextBirthday.getFullYear() - b.getFullYear()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="bc-birth">
          Date of Birth
        </label>
        <input
          id="bc-birth"
          type="date"
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
        />
      </div>
      <Formula>Time until the next birthday</Formula>
      <ResultGrid>
        <ResultRow label="Next Birthday" value={nextBirthday ? isoString(nextBirthday) : "—"} />
        <ResultRow label="Days Until" value={daysUntil != null ? fmtNum(daysUntil) : "—"} />
        <ResultRow label="Turns" value={ageAtBirthday != null ? `${fmtNum(ageAtBirthday)} years old` : "—"} />
        <ResultRow label="Now" value={now.toLocaleTimeString()} />
      </ResultGrid>
    </div>
  )
}

function startOf(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

export function EventCountdown() {
  const [name, setName] = useState("My Event")
  const [when, setWhen] = useState("")
  const now = useNow()

  const target = when ? new Date(when) : null
  const valid = target != null && !Number.isNaN(target.getTime())
  const diff = valid ? target.getTime() - now.getTime() : null
  const active = diff != null && diff > 0

  const days = active ? Math.floor(diff / 86400000) : null
  const hours = active ? Math.floor((diff % 86400000) / 3600000) : null
  const minutes = active ? Math.floor((diff % 3600000) / 60000) : null
  const seconds = active ? Math.floor((diff % 60000) / 1000) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="ec-name">
            Event Name
          </label>
          <input
            id="ec-name"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="ec-when">
            Date &amp; Time
          </label>
          <input
            id="ec-when"
            type="datetime-local"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
        </div>
      </div>
      <Formula>{name || "Event"} countdown</Formula>
      <ResultGrid>
        <ResultRow
          label="Status"
          value={!valid ? "—" : active ? "Counting down" : "Already started"}
        />
        <ResultRow label="Days" value={days != null ? fmtNum(days) : "—"} />
        <ResultRow label="Hours" value={hours != null ? fmtNum(hours) : "—"} />
        <ResultRow label="Minutes" value={minutes != null ? fmtNum(minutes) : "—"} />
        <ResultRow label="Seconds" value={seconds != null ? fmtNum(seconds) : "—"} />
      </ResultGrid>
    </div>
  )
}

export function CountdownTimer() {
  const [when, setWhen] = useState("")
  const now = useNow(250)

  const target = when ? new Date(when) : null
  const valid = target != null && !Number.isNaN(target.getTime())
  const diff = valid ? target.getTime() - now.getTime() : null
  const active = diff != null && diff > 0
  const reached = valid && diff != null && diff <= 0

  useEffect(() => {
    if (reached) beep(3)
  }, [reached])

  const days = active ? Math.floor(diff / 86400000) : null
  const hours = active ? Math.floor((diff % 86400000) / 3600000) : null
  const minutes = active ? Math.floor((diff % 3600000) / 60000) : null
  const seconds = active ? Math.floor((diff % 60000) / 1000) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="ct-when">
          Target Date &amp; Time
        </label>
        <input
          id="ct-when"
          type="datetime-local"
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
        />
      </div>
      <Formula>Live countdown to the target moment</Formula>
      <ResultGrid>
        <ResultRow
          label="Status"
          value={!valid ? "—" : reached ? "Time&apos;s up" : "Counting down"}
        />
        <ResultRow label="Days" value={days != null ? fmtNum(days) : "—"} />
        <ResultRow label="Hours" value={hours != null ? fmtNum(hours) : "—"} />
        <ResultRow label="Minutes" value={minutes != null ? fmtNum(minutes) : "—"} />
        <ResultRow label="Seconds" value={seconds != null ? fmtNum(seconds) : "—"} />
      </ResultGrid>
    </div>
  )
}
