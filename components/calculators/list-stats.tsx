"use client"

import { useMemo, useState } from "react"
import { fmtNum, parseList } from "@/lib/calc-utils"
import { ListField, ResultGrid, ResultRow, Formula } from "./shared"

export interface ListStats {
  n: number
  sum: number
  mean: number
  median: number
  modes: number[]
  min: number
  max: number
  range: number
  variancePop: number
  varianceSample: number
  stdPop: number
  stdSample: number
  sorted: number[]
}

export function computeStats(list: number[]): ListStats {
  const sorted = [...list].sort((a, b) => a - b)
  const n = sorted.length
  const sum = sorted.reduce((a, b) => a + b, 0)
  const mean = n ? sum / n : NaN

  let median = NaN
  if (n) {
    const mid = Math.floor(n / 2)
    median = n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  }

  const freq = new Map<number, number>()
  for (const v of sorted) freq.set(v, (freq.get(v) ?? 0) + 1)
  let maxFreq = 0
  for (const f of freq.values()) maxFreq = Math.max(maxFreq, f)
  const modes =
    maxFreq > 1 ? [...freq.entries()].filter(([, f]) => f === maxFreq).map(([v]) => v) : []

  const variancePop = n
    ? sorted.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n
    : NaN
  const varianceSample = n > 1
    ? sorted.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (n - 1)
    : NaN

  return {
    n,
    sum,
    mean,
    median,
    modes,
    min: n ? sorted[0] : NaN,
    max: n ? sorted[n - 1] : NaN,
    range: n ? sorted[n - 1] - sorted[0] : NaN,
    variancePop,
    varianceSample,
    stdPop: Math.sqrt(variancePop),
    stdSample: Math.sqrt(varianceSample),
    sorted,
  }
}

function useListState() {
  const [input, setInput] = useState("")
  const list = useMemo(() => parseList(input), [input])
  const stats = useMemo(() => computeStats(list), [list])
  return { input, setInput, list, stats }
}

export function AverageCalculator() {
  const { input, setInput, stats } = useListState()
  return (
    <div className="flex flex-col gap-6">
      <ListField
        id="avg-list"
        label="Numbers"
        value={input}
        onChange={setInput}
        placeholder="e.g. 10, 20, 30, 40"
      />
      <Formula>Average = Sum ÷ Count</Formula>
      <ResultGrid>
        <ResultRow label="Average" value={fmtNum(stats.mean)} hint={`${stats.n} values`} />
        <ResultRow label="Sum" value={fmtNum(stats.sum)} />
      </ResultGrid>
    </div>
  )
}

export function MeanCalculator() {
  const { input, setInput, stats } = useListState()
  return (
    <div className="flex flex-col gap-6">
      <ListField
        id="mean-list"
        label="Numbers"
        value={input}
        onChange={setInput}
        placeholder="e.g. 5, 10, 15, 20"
      />
      <Formula>Mean = Σx ÷ n</Formula>
      <ResultGrid>
        <ResultRow label="Mean (Arithmetic)" value={fmtNum(stats.mean)} hint={`${stats.n} values`} />
        <ResultRow label="Total (Σx)" value={fmtNum(stats.sum)} />
      </ResultGrid>
    </div>
  )
}

export function MedianCalculator() {
  const { input, setInput, stats } = useListState()
  return (
    <div className="flex flex-col gap-6">
      <ListField
        id="median-list"
        label="Numbers"
        value={input}
        onChange={setInput}
        placeholder="e.g. 3, 1, 4, 1, 5"
      />
      <Formula>Median = middle value of sorted data</Formula>
      <ResultGrid>
        <ResultRow label="Median" value={fmtNum(stats.median)} hint={`${stats.n} values`} />
        <ResultRow label="Sorted Data" value={stats.sorted.map(fmtNum).join(", ")} />
      </ResultGrid>
    </div>
  )
}

export function ModeCalculator() {
  const { input, setInput, stats } = useListState()
  return (
    <div className="flex flex-col gap-6">
      <ListField
        id="mode-list"
        label="Numbers"
        value={input}
        onChange={setInput}
        placeholder="e.g. 2, 2, 3, 3, 3, 4"
      />
      <Formula>Mode = most frequent value(s)</Formula>
      <ResultGrid>
        <ResultRow
          label="Mode"
          value={
            stats.modes.length
              ? stats.modes.map(fmtNum).join(", ")
              : "No mode (all values unique)"
          }
        />
        <ResultRow label="Count" value={fmtNum(stats.n)} hint="values entered" />
      </ResultGrid>
    </div>
  )
}

export function RangeCalculator() {
  const { input, setInput, stats } = useListState()
  return (
    <div className="flex flex-col gap-6">
      <ListField
        id="range-list"
        label="Numbers"
        value={input}
        onChange={setInput}
        placeholder="e.g. 12, 45, 67, 23, 90"
      />
      <Formula>Range = Max − Min</Formula>
      <ResultGrid>
        <ResultRow label="Range" value={fmtNum(stats.range)} />
        <ResultRow label="Minimum" value={fmtNum(stats.min)} />
        <ResultRow label="Maximum" value={fmtNum(stats.max)} />
      </ResultGrid>
    </div>
  )
}

export function StandardDeviationCalculator() {
  const { input, setInput, stats } = useListState()
  return (
    <div className="flex flex-col gap-6">
      <ListField
        id="stddev-list"
        label="Numbers"
        value={input}
        onChange={setInput}
        placeholder="e.g. 10, 12, 23, 23, 16"
      />
      <Formula>σ = √(Σ(x − μ)² / n)</Formula>
      <ResultGrid>
        <ResultRow label="Standard Deviation (Sample)" value={fmtNum(stats.stdSample)} />
        <ResultRow label="Standard Deviation (Population)" value={fmtNum(stats.stdPop)} />
        <ResultRow label="Mean" value={fmtNum(stats.mean)} />
        <ResultRow label="Count" value={fmtNum(stats.n)} />
      </ResultGrid>
    </div>
  )
}

export function VarianceCalculator() {
  const { input, setInput, stats } = useListState()
  return (
    <div className="flex flex-col gap-6">
      <ListField
        id="variance-list"
        label="Numbers"
        value={input}
        onChange={setInput}
        placeholder="e.g. 10, 12, 23, 23, 16"
      />
      <Formula>Variance = Σ(x − μ)² / n</Formula>
      <ResultGrid>
        <ResultRow label="Variance (Sample)" value={fmtNum(stats.varianceSample)} />
        <ResultRow label="Variance (Population)" value={fmtNum(stats.variancePop)} />
        <ResultRow label="Std Dev (Sample)" value={fmtNum(stats.stdSample)} />
        <ResultRow label="Mean" value={fmtNum(stats.mean)} />
      </ResultGrid>
    </div>
  )
}
