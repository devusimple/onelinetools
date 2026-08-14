"use client"

import { useState } from "react"
import { fmtMoney, fmtNum, parseNum } from "@/lib/calc-utils"
import { compoundFV } from "@/lib/finance-utils"
import { NumberField, SelectField, ResultGrid, ResultRow, Formula } from "./shared"

export const compoundFreqOptions = [
  { value: "1", label: "Yearly" },
  { value: "2", label: "Half-yearly" },
  { value: "4", label: "Quarterly" },
  { value: "12", label: "Monthly" },
  { value: "365", label: "Daily" },
]

export function SimpleInterestCalculator() {
  const [principal, setPrincipal] = useState("")
  const [rate, setRate] = useState("")
  const [years, setYears] = useState("")

  const p = parseNum(principal)
  const r = parseNum(rate)
  const t = parseNum(years)

  const interest = p != null && r != null && t != null ? (p * r * t) / 100 : null
  const total = p != null && interest != null ? p + interest : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="si-principal" label="Principal" value={principal} onChange={setPrincipal} placeholder="e.g. 10000" />
        <NumberField id="si-rate" label="Rate (per year)" value={rate} onChange={setRate} placeholder="e.g. 5" suffix="%" />
        <NumberField id="si-years" label="Time" value={years} onChange={setYears} placeholder="e.g. 3" suffix="years" />
      </div>
      <Formula>SI = P × r × t ÷ 100</Formula>
      <ResultGrid>
        <ResultRow label="Simple Interest" value={fmtMoney(interest)} />
        <ResultRow label="Total Amount" value={fmtMoney(total)} hint="principal + interest" />
      </ResultGrid>
    </div>
  )
}

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("")
  const [rate, setRate] = useState("")
  const [freq, setFreq] = useState("12")
  const [years, setYears] = useState("")

  const p = parseNum(principal)
  const r = parseNum(rate)
  const f = parseNum(freq) ?? 1
  const t = parseNum(years)

  const total = p != null && r != null && t != null ? compoundFV(p, r, f, t) : null
  const interest = total != null && p != null ? total - p : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="ci-principal" label="Principal" value={principal} onChange={setPrincipal} placeholder="e.g. 10000" />
        <NumberField id="ci-rate" label="Annual Rate" value={rate} onChange={setRate} placeholder="e.g. 8" suffix="%" />
        <SelectField id="ci-freq" label="Compounding" value={freq} onChange={setFreq} options={compoundFreqOptions} />
        <NumberField id="ci-years" label="Time" value={years} onChange={setYears} placeholder="e.g. 5" suffix="years" />
      </div>
      <Formula>A = P × (1 + r/n)^(n×t)</Formula>
      <ResultGrid>
        <ResultRow label="Future Amount" value={fmtMoney(total)} />
        <ResultRow label="Compound Interest" value={fmtMoney(interest)} />
      </ResultGrid>
    </div>
  )
}

export function InterestRateCalculator() {
  const [principal, setPrincipal] = useState("")
  const [interest, setInterest] = useState("")
  const [years, setYears] = useState("")

  const p = parseNum(principal)
  const i = parseNum(interest)
  const t = parseNum(years)

  const rate = p != null && i != null && t != null && p !== 0 ? (i * 100) / (p * t) : null
  const total = p != null && i != null ? p + i : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="ir-principal" label="Principal" value={principal} onChange={setPrincipal} placeholder="e.g. 20000" />
        <NumberField id="ir-interest" label="Interest Earned" value={interest} onChange={setInterest} placeholder="e.g. 3000" />
        <NumberField id="ir-years" label="Time" value={years} onChange={setYears} placeholder="e.g. 2" suffix="years" />
      </div>
      <Formula>Rate = Interest × 100 ÷ (Principal × Time)</Formula>
      <ResultGrid>
        <ResultRow label="Annual Interest Rate" value={rate != null ? `${fmtNum(rate, 4)}%` : "—"} />
        <ResultRow label="Total Amount" value={fmtMoney(total)} />
      </ResultGrid>
    </div>
  )
}

export function PrincipalCalculator() {
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("")
  const [years, setYears] = useState("")

  const a = parseNum(amount)
  const r = parseNum(rate)
  const t = parseNum(years)

  const principal =
    a != null && r != null && t != null ? a / (1 + (r * t) / 100) : null
  const interest = principal != null ? a! - principal : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="pc-amount" label="Future Amount" value={amount} onChange={setAmount} placeholder="e.g. 11500" />
        <NumberField id="pc-rate" label="Rate (per year)" value={rate} onChange={setRate} placeholder="e.g. 5" suffix="%" />
        <NumberField id="pc-years" label="Time" value={years} onChange={setYears} placeholder="e.g. 3" suffix="years" />
      </div>
      <Formula>Principal = Amount ÷ (1 + r×t/100)</Formula>
      <ResultGrid>
        <ResultRow label="Principal Needed" value={fmtMoney(principal)} />
        <ResultRow label="Interest Earned" value={fmtMoney(interest)} />
      </ResultGrid>
    </div>
  )
}

export function FutureValueCalculator() {
  const [pv, setPv] = useState("")
  const [rate, setRate] = useState("")
  const [freq, setFreq] = useState("12")
  const [years, setYears] = useState("")

  const p = parseNum(pv)
  const r = parseNum(rate)
  const f = parseNum(freq) ?? 1
  const t = parseNum(years)

  const fv = p != null && r != null && t != null ? compoundFV(p, r, f, t) : null
  const growth = fv != null && p != null ? fv - p : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="fv-present" label="Present Value" value={pv} onChange={setPv} placeholder="e.g. 5000" />
        <NumberField id="fv-rate" label="Annual Rate" value={rate} onChange={setRate} placeholder="e.g. 7" suffix="%" />
        <SelectField id="fv-freq" label="Compounding" value={freq} onChange={setFreq} options={compoundFreqOptions} />
        <NumberField id="fv-years" label="Years" value={years} onChange={setYears} placeholder="e.g. 10" />
      </div>
      <Formula>FV = PV × (1 + r/n)^(n×t)</Formula>
      <ResultGrid>
        <ResultRow label="Future Value" value={fmtMoney(fv)} />
        <ResultRow label="Total Growth" value={fmtMoney(growth)} />
      </ResultGrid>
    </div>
  )
}

export function PresentValueCalculator() {
  const [fv, setFv] = useState("")
  const [rate, setRate] = useState("")
  const [freq, setFreq] = useState("12")
  const [years, setYears] = useState("")

  const f = parseNum(fv)
  const r = parseNum(rate)
  const n = parseNum(freq) ?? 1
  const t = parseNum(years)

  const pv = f != null && r != null && t != null ? compoundFV(f, r, n, -t) : null
  const discount = pv != null && f != null ? f - pv : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="pv-future" label="Future Value" value={fv} onChange={setFv} placeholder="e.g. 10000" />
        <NumberField id="pv-rate" label="Discount Rate" value={rate} onChange={setRate} placeholder="e.g. 6" suffix="%" />
        <SelectField id="pv-freq" label="Compounding" value={freq} onChange={setFreq} options={compoundFreqOptions} />
        <NumberField id="pv-years" label="Years" value={years} onChange={setYears} placeholder="e.g. 5" />
      </div>
      <Formula>PV = FV ÷ (1 + r/n)^(n×t)</Formula>
      <ResultGrid>
        <ResultRow label="Present Value" value={fmtMoney(pv)} />
        <ResultRow label="Discount Amount" value={fmtMoney(discount)} />
      </ResultGrid>
    </div>
  )
}
