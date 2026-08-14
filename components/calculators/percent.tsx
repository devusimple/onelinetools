"use client"

import { useMemo, useState } from "react"
import { fmtNum, fmtPct, parseNum } from "@/lib/calc-utils"
import { NumberField, SelectField, ResultGrid, ResultRow, Formula } from "./shared"

export function PercentageCalculator() {
  const [mode, setMode] = useState("what-is")
  const [a, setA] = useState("")
  const [b, setB] = useState("")

  const av = parseNum(a)
  const bv = parseNum(b)

  const result = useMemo(() => {
    switch (mode) {
      case "what-is": {
        const p = av
        const n = bv
        if (p == null || n == null) return null
        return {
          primary: `What is ${p}% of ${n}?`,
          value: (p / 100) * n,
          extra: [
            { label: "Result", value: fmtNum((p / 100) * n) },
            { label: "Calculation", value: `${fmtNum(p)} ÷ 100 × ${fmtNum(n)}` },
          ],
        }
      }
      case "what-percent": {
        const part = av
        const whole = bv
        if (part == null || whole == null || whole === 0) return null
        return {
          primary: `${part} is what % of ${whole}?`,
          value: (part / whole) * 100,
          extra: [
            { label: "Percentage", value: fmtPct((part / whole) * 100) },
            { label: "Calculation", value: `${fmtNum(part)} ÷ ${fmtNum(whole)} × 100` },
          ],
        }
      }
      case "of-what": {
        const p = av
        const n = bv
        if (p == null || n == null || p === 0) return null
        return {
          primary: `${n} is ${p}% of what?`,
          value: (n / p) * 100,
          extra: [
            { label: "Base Number", value: fmtNum((n / p) * 100) },
            { label: "Calculation", value: `${fmtNum(n)} ÷ ${fmtNum(p)} × 100` },
          ],
        }
      }
      default:
        return null
    }
  }, [mode, av, bv])

  return (
    <div className="flex flex-col gap-6">
      <SelectField
        id="pct-mode"
        label="Mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: "what-is", label: "What is X% of Y?" },
          { value: "what-percent", label: "X is what % of Y?" },
          { value: "of-what", label: "X is Y% of what?" },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="pct-a" label={mode === "what-is" || mode === "of-what" ? "Percent" : "Value"} value={a} onChange={setA} placeholder="e.g. 20" suffix={mode === "what-is" || mode === "of-what" ? "%" : undefined} />
        <NumberField id="pct-b" label={mode === "what-is" ? "Number" : mode === "what-percent" ? "Whole" : "Result"} value={b} onChange={setB} placeholder="e.g. 150" />
      </div>
      {result ? (
        <>
          <Formula>{result.primary}</Formula>
          <ResultGrid>
            {result.extra.map((r) => (
              <ResultRow key={r.label} label={r.label} value={r.value} />
            ))}
          </ResultGrid>
        </>
      ) : null}
    </div>
  )
}

export function PercentageIncreaseCalculator() {
  const [oldV, setOldV] = useState("")
  const [newV, setNewV] = useState("")

  const oldN = parseNum(oldV)
  const newN = parseNum(newV)

  const increase = oldN != null && newN != null ? newN - oldN : null
  const pct = oldN != null && newN != null && oldN !== 0 ? (increase! / oldN) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="inc-old" label="Original Value" value={oldV} onChange={setOldV} placeholder="e.g. 100" />
        <NumberField id="inc-new" label="New Value" value={newV} onChange={setNewV} placeholder="e.g. 150" />
      </div>
      <Formula>Increase % = (New − Original) ÷ Original × 100</Formula>
      <ResultGrid>
        <ResultRow label="Increase" value={fmtNum(increase)} hint="new − original" />
        <ResultRow label="Percentage Increase" value={fmtPct(pct)} />
      </ResultGrid>
    </div>
  )
}

export function PercentageDecreaseCalculator() {
  const [oldV, setOldV] = useState("")
  const [newV, setNewV] = useState("")

  const oldN = parseNum(oldV)
  const newN = parseNum(newV)

  const decrease = oldN != null && newN != null ? oldN - newN : null
  const pct = oldN != null && newN != null && oldN !== 0 ? (decrease! / oldN) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="dec-old" label="Original Value" value={oldV} onChange={setOldV} placeholder="e.g. 150" />
        <NumberField id="dec-new" label="New Value" value={newV} onChange={setNewV} placeholder="e.g. 120" />
      </div>
      <Formula>Decrease % = (Original − New) ÷ Original × 100</Formula>
      <ResultGrid>
        <ResultRow label="Decrease" value={fmtNum(decrease)} hint="original − new" />
        <ResultRow label="Percentage Decrease" value={fmtPct(pct)} />
      </ResultGrid>
    </div>
  )
}

export function PercentDifferenceCalculator() {
  const [v1, setV1] = useState("")
  const [v2, setV2] = useState("")

  const a = parseNum(v1)
  const b = parseNum(v2)

  const diff = a != null && b != null ? Math.abs(a - b) : null
  const avg = a != null && b != null ? (a + b) / 2 : null
  const pct = diff != null && avg ? (diff / avg) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="pd-v1" label="Value 1" value={v1} onChange={setV1} placeholder="e.g. 80" />
        <NumberField id="pd-v2" label="Value 2" value={v2} onChange={setV2} placeholder="e.g. 100" />
      </div>
      <Formula>Percent Difference = |V₁ − V₂| ÷ ((V₁ + V₂) ÷ 2) × 100</Formula>
      <ResultGrid>
        <ResultRow label="Absolute Difference" value={fmtNum(diff)} />
        <ResultRow label="Average" value={fmtNum(avg)} />
        <ResultRow label="Percent Difference" value={fmtPct(pct)} />
      </ResultGrid>
    </div>
  )
}

export function PercentErrorCalculator() {
  const [obs, setObs] = useState("")
  const [trueV, setTrueV] = useState("")

  const o = parseNum(obs)
  const t = parseNum(trueV)

  const error = o != null && t != null ? Math.abs(o - t) : null
  const pct = error != null && t ? (error / Math.abs(t)) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="pe-obs" label="Observed Value" value={obs} onChange={setObs} placeholder="e.g. 95" />
        <NumberField id="pe-true" label="True Value" value={trueV} onChange={setTrueV} placeholder="e.g. 100" />
      </div>
      <Formula>Percent Error = |Observed − True| ÷ |True| × 100</Formula>
      <ResultGrid>
        <ResultRow label="Absolute Error" value={fmtNum(error)} />
        <ResultRow label="Percent Error" value={fmtPct(pct)} />
      </ResultGrid>
    </div>
  )
}
