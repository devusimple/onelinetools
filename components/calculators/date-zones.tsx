"use client"

import { useEffect, useState } from "react"
import {
  COMMON_ZONES,
  formatInZone,
  formatTimeInZone,
  parseTimeInput,
  wallToUtcMs,
  zoneOffsetMinutes,
  type ZoneInfo,
} from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import { ResultGrid, ResultRow, Formula } from "./shared"

function useClock(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

function ZoneSelect({
  id,
  value,
  onChange,
  zones = COMMON_ZONES,
  label,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  zones?: ZoneInfo[]
  label: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {zones.map((z) => (
          <option key={z.tz} value={z.tz}>
            {z.label} ({z.tz})
          </option>
        ))}
      </select>
    </div>
  )
}

export function WorldClock() {
  const now = useClock(1000)
  const [selected, setSelected] = useState<string[]>([
    "America/New_York",
    "Europe/London",
    "Asia/Tokyo",
    "Asia/Dhaka",
  ])
  const [custom, setCustom] = useState("")

  const toggle = (tz: string) =>
    setSelected((s) => (s.includes(tz) ? s.filter((x) => x !== tz) : [...s, tz]))

  const shown = [...selected, ...(custom ? [custom] : [])]

  return (
    <div className="flex flex-col gap-6">
      <Formula>Current time across time zones</Formula>
      <div className="flex flex-wrap gap-2">
        {COMMON_ZONES.map((z) => (
          <button
            key={z.tz}
            type="button"
            onClick={() => toggle(z.tz)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              selected.includes(z.tz)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-foreground hover:bg-muted"
            }`}
          >
            {z.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="wc-custom">
          Custom time zone
        </label>
        <input
          id="wc-custom"
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="e.g. Asia/Kathmandu"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {shown.length === 0 && <p className="text-sm text-muted-foreground">Pick some zones above.</p>}
        {shown.map((tz) => (
          <div key={tz} className="rounded-md border border-border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{tz}</p>
              <p className="text-xs text-muted-foreground">
                UTC{zoneOffsetMinutes(tz, now) / 60 >= 0 ? "+" : ""}
                {zoneOffsetMinutes(tz, now) / 60}
              </p>
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatTimeInZone(now, tz)}</p>
            <p className="text-xs text-muted-foreground">{formatInZone(now, tz)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TimeZoneConverter() {
  const [from, setFrom] = useState("America/New_York")
  const [to, setTo] = useState("Asia/Tokyo")
  const [when, setWhen] = useState("")
  const [dateLabel, setDateLabel] = useState(() => new Date().toISOString().slice(0, 16))

  const base = when ? new Date(when) : new Date(dateLabel)
  const validBase = !Number.isNaN(base.getTime())
  const result = validBase ? formatInZone(base, to) : null
  const fromTime = validBase ? formatInZone(base, from) : null
  const diffMin = zoneOffsetMinutes(to, base) - zoneOffsetMinutes(from, base)

  const toggleNow = () => {
    setWhen("")
    setDateLabel(new Date().toISOString().slice(0, 16))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <ZoneSelect id="tzc-from" label="From Zone" value={from} onChange={setFrom} />
        <ZoneSelect id="tzc-to" label="To Zone" value={to} onChange={setTo} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="tzc-when">
            Date &amp; Time in From Zone
          </label>
          <input
            id="tzc-when"
            type="datetime-local"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
          <Button type="button" variant="outline" size="sm" onClick={toggleNow}>
            Use Current Time
          </Button>
        </div>
      </div>
      <Formula>Converted to the target zone</Formula>
      <ResultGrid>
        <ResultRow label={`In ${from}`} value={fromTime ?? "—"} />
        <ResultRow label={`In ${to}`} value={result ?? "—"} />
        <ResultRow
          label="Time Difference"
          value={`${diffMin >= 0 ? "+" : ""}${(diffMin / 60).toFixed(1)} h`}
        />
      </ResultGrid>
    </div>
  )
}

export function MeetingTimeConverter() {
  const now = useClock(1000)
  const [myZone, setMyZone] = useState("America/New_York")
  const [time, setTime] = useState("")
  const [targets, setTargets] = useState<string[]>(["Asia/Tokyo", "Europe/London"])

  const todayRef = now
  const parsed = parseTimeInput(time)
  const meetingUtc = parsed
    ? wallToUtcMs(
        todayRef.getFullYear(),
        todayRef.getMonth() + 1,
        todayRef.getDate(),
        parsed.h,
        parsed.m,
        0,
        myZone
      )
    : null

  const toggle = (tz: string) =>
    setTargets((s) => (s.includes(tz) ? s.filter((x) => x !== tz) : [...s, tz]))

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <ZoneSelect id="mtc-zone" label="Your Time Zone" value={myZone} onChange={setMyZone} />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="mtc-time">
            Meeting Time
          </label>
          <input
            id="mtc-time"
            type="time"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>
      <Formula>Add invitee time zones</Formula>
      <div className="flex flex-wrap gap-2">
        {COMMON_ZONES.map((z) => (
          <button
            key={z.tz}
            type="button"
            onClick={() => toggle(z.tz)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              targets.includes(z.tz)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-foreground hover:bg-muted"
            }`}
          >
            {z.label}
          </button>
        ))}
      </div>
      <ResultGrid>
        <ResultRow
          label={`In ${myZone}`}
          value={parsed ? formatTimeInZone(meetingUtc ? new Date(meetingUtc) : new Date(), myZone) : "—"}
          hint={parsed ? `Date: ${formatInZone(meetingUtc ? new Date(meetingUtc) : new Date(), myZone)}` : undefined}
        />
        {targets.map((tz) => (
          <ResultRow
            key={tz}
            label={`In ${tz}`}
            value={meetingUtc ? formatTimeInZone(new Date(meetingUtc), tz) : "—"}
            hint={meetingUtc ? `Date: ${formatInZone(new Date(meetingUtc), tz)}` : undefined}
          />
        ))}
      </ResultGrid>
    </div>
  )
}

export function UtcConverter() {
  const now = useClock(1000)
  const [localToUtc, setLocalToUtc] = useState("")
  const [utcToLocal, setUtcToLocal] = useState("")

  const localDate = localToUtc ? new Date(localToUtc) : null
  const utcFromLocal = localDate && !Number.isNaN(localDate.getTime()) ? localDate.toISOString() : null

  const utcDate = utcToLocal ? new Date(utcToLocal + "Z") : null
  const localFromUtc = utcDate && !Number.isNaN(utcDate.getTime()) ? utcDate.toLocaleString() : null

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md border border-border p-4">
        <p className="text-sm text-muted-foreground">Current UTC time</p>
        <p className="mt-1 font-mono text-3xl font-bold tabular-nums">
          {now.toISOString().slice(0, 19).replace("T", " ")}
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="uc-local">
            Local Time → UTC
          </label>
          <input
            id="uc-local"
            type="datetime-local"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={localToUtc}
            onChange={(e) => setLocalToUtc(e.target.value)}
          />
          <p className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-sm">
            {utcFromLocal ?? "—"}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="uc-utc">
            UTC → Local Time
          </label>
          <input
            id="uc-utc"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="YYYY-MM-DD HH:MM"
            value={utcToLocal}
            onChange={(e) => setUtcToLocal(e.target.value)}
          />
          <p className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-sm">
            {localFromUtc ?? "—"}
          </p>
        </div>
      </div>
      <Formula>First value converts local to UTC; second converts UTC to local</Formula>
    </div>
  )
}
