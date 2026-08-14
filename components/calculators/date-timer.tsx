"use client"

import { useEffect, useRef, useState } from "react"
import { fmtNum } from "@/lib/calc-utils"
import { beep } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import { NumberField, ResultGrid, ResultRow } from "./shared"

function fmtHms(totalMs: number): string {
  const totalS = Math.max(0, Math.floor(totalMs / 1000))
  const h = Math.floor(totalS / 3600)
  const m = Math.floor((totalS % 3600) / 60)
  const s = totalS % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

function fmtHmsTenths(totalMs: number): string {
  const totalCs = Math.max(0, Math.floor(totalMs / 10))
  const h = Math.floor(totalCs / 360000)
  const m = Math.floor((totalCs % 360000) / 6000)
  const s = Math.floor((totalCs % 6000) / 100)
  const cs = totalCs % 100
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`
}

export function Stopwatch() {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [laps, setLaps] = useState<number[]>([])
  const baseRef = useRef(0)
  const startRef = useRef(0)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setElapsed(baseRef.current + (Date.now() - startRef.current)), 50)
    return () => clearInterval(id)
  }, [running])

  const start = () => {
    startRef.current = Date.now()
    setRunning(true)
  }
  const stop = () => {
    baseRef.current = elapsed
    setRunning(false)
  }
  const reset = () => {
    setRunning(false)
    setElapsed(0)
    setLaps([])
    baseRef.current = 0
  }
  const lap = () => setLaps((l) => [elapsed, ...l])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={running ? stop : start} variant={running ? "secondary" : "default"}>
          {running ? "Stop" : "Start"}
        </Button>
        <Button type="button" variant="outline" onClick={lap} disabled={!running}>
          Lap
        </Button>
        <Button type="button" variant="outline" onClick={reset}>
          Reset
        </Button>
      </div>
      <p className="text-center font-mono text-5xl font-bold tabular-nums">{fmtHmsTenths(elapsed)}</p>
      {laps.length > 0 && (
        <div className="max-h-48 overflow-y-auto rounded-md border border-border p-3">
          <p className="mb-2 text-sm font-medium">Laps</p>
          <ul className="space-y-1">
            {laps.map((l, i) => (
              <li key={i} className="flex justify-between font-mono text-sm">
                <span>Lap {laps.length - i}</span>
                <span>{fmtHmsTenths(l)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function PomodoroTimer() {
  const [workMin, setWorkMin] = useState("25")
  const [breakMin, setBreakMin] = useState("5")
  const [mode, setMode] = useState<"work" | "break">("work")
  const [remainingS, setRemainingS] = useState(25 * 60)
  const [rounds, setRounds] = useState(0)
  const [running, setRunning] = useState(false)
  const endAtRef = useRef(0)

  const workS = Math.max(1, Math.round(Number(workMin) * 60) || 25 * 60)
  const breakS = Math.max(1, Math.round(Number(breakMin) * 60) || 5 * 60)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const now = Date.now()
      if (now >= endAtRef.current) {
        beep(3)
        if (mode === "work") {
          setRounds((r) => r + 1)
          setMode("break")
          endAtRef.current = now + breakS * 1000
        } else {
          setMode("work")
          endAtRef.current = now + workS * 1000
        }
      }
      setRemainingS(Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000)))
    }, 200)
    return () => clearInterval(id)
  }, [running, mode, workS, breakS])

  const start = () => {
    endAtRef.current = Date.now() + remainingS * 1000
    setRunning(true)
  }
  const pause = () => {
    setRunning(false)
    setRemainingS(Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000)))
  }
  const reset = () => {
    setRunning(false)
    setMode("work")
    setRounds(0)
    setRemainingS(workS)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="pomo-work" label="Work (minutes)" value={workMin} onChange={setWorkMin} placeholder="25" />
        <NumberField id="pomo-break" label="Break (minutes)" value={breakMin} onChange={setBreakMin} placeholder="5" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={running ? pause : start} variant={running ? "secondary" : "default"}>
          {running ? "Pause" : "Start"}
        </Button>
        <Button type="button" variant="outline" onClick={reset}>
          Reset
        </Button>
      </div>
      <p className={`text-center font-mono text-5xl font-bold tabular-nums ${mode === "break" ? "text-primary" : ""}`}>
        {fmtHms(remainingS * 1000)}
      </p>
      <ResultGrid>
        <ResultRow label="Phase" value={mode === "work" ? "Work" : "Break"} />
        <ResultRow label="Completed Rounds" value={fmtNum(rounds)} />
      </ResultGrid>
    </div>
  )
}

export function IntervalTimer() {
  const [workSec, setWorkSec] = useState("30")
  const [restSec, setRestSec] = useState("10")
  const [totalRounds, setTotalRounds] = useState("4")
  const [phase, setPhase] = useState<"work" | "rest">("work")
  const [round, setRound] = useState(1)
  const [remainingS, setRemainingS] = useState(30)
  const [running, setRunning] = useState(false)
  const endAtRef = useRef(0)

  const wS = Math.max(1, Math.round(Number(workSec)) || 30)
  const rS = Math.max(1, Math.round(Number(restSec)) || 10)
  const rounds = Math.max(1, Math.round(Number(totalRounds)) || 4)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const now = Date.now()
      if (now >= endAtRef.current) {
        beep(2)
        if (phase === "work") {
          if (round >= rounds) {
            setRunning(false)
            setRound(1)
            setPhase("work")
            setRemainingS(wS)
            beep(4)
            return
          }
          setRound((r) => r + 1)
          setPhase("rest")
          endAtRef.current = now + rS * 1000
        } else {
          setPhase("work")
          endAtRef.current = now + wS * 1000
        }
      }
      setRemainingS(Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000)))
    }, 200)
    return () => clearInterval(id)
  }, [running, phase, round, rounds, wS, rS])

  const start = () => {
    endAtRef.current = Date.now() + remainingS * 1000
    setRunning(true)
  }
  const pause = () => {
    setRunning(false)
    setRemainingS(Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000)))
  }
  const reset = () => {
    setRunning(false)
    setPhase("work")
    setRound(1)
    setRemainingS(wS)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField id="it-work" label="Work (seconds)" value={workSec} onChange={setWorkSec} placeholder="30" />
        <NumberField id="it-rest" label="Rest (seconds)" value={restSec} onChange={setRestSec} placeholder="10" />
        <NumberField id="it-rounds" label="Rounds" value={totalRounds} onChange={setTotalRounds} placeholder="4" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={running ? pause : start} variant={running ? "secondary" : "default"}>
          {running ? "Pause" : "Start"}
        </Button>
        <Button type="button" variant="outline" onClick={reset}>
          Reset
        </Button>
      </div>
      <p className={`text-center font-mono text-5xl font-bold tabular-nums ${phase === "rest" ? "text-primary" : ""}`}>
        {fmtHms(remainingS * 1000)}
      </p>
      <ResultGrid>
        <ResultRow label="Phase" value={phase === "work" ? "Work" : "Rest"} />
        <ResultRow label="Round" value={`${fmtNum(round)} / ${fmtNum(rounds)}`} />
      </ResultGrid>
    </div>
  )
}

export function OnlineAlarm() {
  const [alarmTime, setAlarmTime] = useState("")
  const [armed, setArmed] = useState(false)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const beepedRef = useRef(false)

  const target = (() => {
    if (!alarmTime || !alarmTime.includes(":")) return null
    const [hh, mm] = alarmTime.split(":").map(Number)
    if (!Number.isInteger(hh) || !Number.isInteger(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) return null
    const d = new Date()
    d.setHours(hh, mm, 0, 0)
    if (d.getTime() <= nowMs) d.setDate(d.getDate() + 1)
    return d
  })()

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 250)
    return () => clearInterval(id)
  }, [])

  const ringing = armed && target != null && nowMs >= target.getTime()

  useEffect(() => {
    if (ringing && !beepedRef.current) {
      beepedRef.current = true
      beep(5)
    }
    if (!ringing) beepedRef.current = false
  }, [ringing])

  const remainingS = armed && target && !ringing ? Math.max(0, Math.ceil((target.getTime() - nowMs) / 1000)) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground" htmlFor="alarm-time">
          Alarm Time (24-hour)
        </label>
        <input
          id="alarm-time"
          type="time"
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={alarmTime}
          onChange={(e) => setAlarmTime(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={() => { setArmed(true) }} disabled={!target || ringing}>
          {ringing ? "Ringing" : "Set Alarm"}
        </Button>
        <Button type="button" variant="outline" onClick={() => { setArmed(false) }}>
          Stop
        </Button>
      </div>
      <p className="text-center text-lg">
        {ringing ? "Ring! Ring! Ring!" : remainingS != null ? `Sounds in ${fmtHms(remainingS * 1000)}` : "—"}
      </p>
      <ResultGrid>
        <ResultRow label="Status" value={ringing ? "Ringing" : armed ? "Armed" : "Off"} />
        <ResultRow label="Next Alarm" value={target ? target.toLocaleTimeString() : "—"} />
      </ResultGrid>
    </div>
  )
}
