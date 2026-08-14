"use client"

import { useMemo, useState } from "react"
import { fmtMoney, fmtNum, fmtPct, parseList, parseNum } from "@/lib/calc-utils"
import {
  annuityFV,
  annuityFVAdvance,
  irr,
  npv,
  xirr,
} from "@/lib/finance-utils"
import {
  NumberField,
  ListField,
  ResultGrid,
  ResultRow,
  Formula,
} from "./shared"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function RoiCalculator() {
  const [investment, setInvestment] = useState("")
  const [profit, setProfit] = useState("")

  const i = parseNum(investment)
  const p = parseNum(profit)

  const roi = i != null && p != null && i !== 0 ? (p / i) * 100 : null
  const finalValue = i != null && p != null ? i + p : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="roi-invest" label="Amount Invested" value={investment} onChange={setInvestment} placeholder="e.g. 10000" />
        <NumberField id="roi-profit" label="Profit" value={profit} onChange={setProfit} placeholder="e.g. 2500" />
      </div>
      <Formula>ROI = Profit ÷ Investment × 100</Formula>
      <ResultGrid>
        <ResultRow label="ROI" value={fmtPct(roi)} hint={roi != null && roi < 0 ? "this is a loss" : undefined} />
        <ResultRow label="Final Value" value={fmtMoney(finalValue)} />
      </ResultGrid>
    </div>
  )
}

export function RoeCalculator() {
  const [income, setIncome] = useState("")
  const [equity, setEquity] = useState("")

  const i = parseNum(income)
  const e = parseNum(equity)

  const roe = i != null && e != null && e !== 0 ? (i / e) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="roe-income" label="Net Income" value={income} onChange={setIncome} placeholder="e.g. 500000" />
        <NumberField id="roe-equity" label="Shareholders' Equity" value={equity} onChange={setEquity} placeholder="e.g. 2500000" />
      </div>
      <Formula>ROE = Net Income ÷ Shareholders&apos; Equity × 100</Formula>
      <ResultGrid>
        <ResultRow label="Return on Equity" value={fmtPct(roe)} />
      </ResultGrid>
    </div>
  )
}

export function RoaCalculator() {
  const [income, setIncome] = useState("")
  const [assets, setAssets] = useState("")

  const i = parseNum(income)
  const a = parseNum(assets)

  const roa = i != null && a != null && a !== 0 ? (i / a) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="roa-income" label="Net Income" value={income} onChange={setIncome} placeholder="e.g. 400000" />
        <NumberField id="roa-assets" label="Total Assets" value={assets} onChange={setAssets} placeholder="e.g. 5000000" />
      </div>
      <Formula>ROA = Net Income ÷ Total Assets × 100</Formula>
      <ResultGrid>
        <ResultRow label="Return on Assets" value={fmtPct(roa)} />
      </ResultGrid>
    </div>
  )
}

export function InvestmentReturnCalculator() {
  const [initial, setInitial] = useState("")
  const [final, setFinal] = useState("")

  const i = parseNum(initial)
  const f = parseNum(final)

  const gain = i != null && f != null ? f - i : null
  const pct = gain != null && i != null && i !== 0 ? (gain / i) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="retr-initial" label="Initial Investment" value={initial} onChange={setInitial} placeholder="e.g. 15000" />
        <NumberField id="retr-final" label="Final Value" value={final} onChange={setFinal} placeholder="e.g. 21000" />
      </div>
      <Formula>Return = (Final − Initial) ÷ Initial × 100</Formula>
      <ResultGrid>
        <ResultRow label="Gain / Loss" value={fmtMoney(gain)} />
        <ResultRow label="Total Return" value={fmtPct(pct)} />
      </ResultGrid>
    </div>
  )
}

export function InvestmentGrowthCalculator() {
  const [initial, setInitial] = useState("")
  const [monthly, setMonthly] = useState("")
  const [rate, setRate] = useState("")
  const [years, setYears] = useState("")

  const p = parseNum(initial)
  const c = parseNum(monthly)
  const r = parseNum(rate)
  const t = parseNum(years)

  const months = t != null ? t * 12 : null
  const lumpsumFV = p != null && r != null && months != null ? p * Math.pow(1 + r / 100 / 12, months) : null
  const contribFV = c != null && r != null && months != null ? annuityFV(c, r ?? 0, months) : null
  const total = lumpsumFV != null && contribFV != null ? lumpsumFV + contribFV : null
  const invested = p != null && c != null && months != null ? p + c * months : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="ig-initial" label="Initial Investment" value={initial} onChange={setInitial} placeholder="e.g. 5000" />
        <NumberField id="ig-monthly" label="Monthly Contribution" value={monthly} onChange={setMonthly} placeholder="e.g. 200" />
        <NumberField id="ig-rate" label="Annual Return" value={rate} onChange={setRate} placeholder="e.g. 10" suffix="%" />
        <NumberField id="ig-years" label="Years" value={years} onChange={setYears} placeholder="e.g. 10" />
      </div>
      <Formula>Growth = Lumpsum FV + Annuity FV</Formula>
      <ResultGrid>
        <ResultRow label="Future Value" value={fmtMoney(total)} />
        <ResultRow label="Total Invested" value={fmtMoney(invested)} />
        <ResultRow label="Growth" value={fmtMoney(total != null && invested != null ? total - invested : null)} />
      </ResultGrid>
    </div>
  )
}

export function SipCalculator() {
  const [monthly, setMonthly] = useState("")
  const [rate, setRate] = useState("")
  const [years, setYears] = useState("")

  const c = parseNum(monthly)
  const r = parseNum(rate)
  const t = parseNum(years)

  const months = t != null ? t * 12 : null
  const fv = c != null && r != null && months != null ? annuityFVAdvance(c, r, months) : null
  const invested = c != null && months != null ? c * months : null
  const gains = fv != null && invested != null ? fv - invested : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="sip-monthly" label="Monthly Investment" value={monthly} onChange={setMonthly} placeholder="e.g. 5000" />
        <NumberField id="sip-rate" label="Expected Return" value={rate} onChange={setRate} placeholder="e.g. 12" suffix="%" />
        <NumberField id="sip-years" label="Duration" value={years} onChange={setYears} placeholder="e.g. 15" suffix="years" />
      </div>
      <Formula>FV = Monthly × ((1 + r)ⁿ − 1) ÷ r × (1 + r)</Formula>
      <ResultGrid>
        <ResultRow label="Future Value" value={fmtMoney(fv)} />
        <ResultRow label="Total Invested" value={fmtMoney(invested)} />
        <ResultRow label="Estimated Gains" value={fmtMoney(gains)} />
      </ResultGrid>
    </div>
  )
}

export function LumpsumCalculator() {
  const [principal, setPrincipal] = useState("")
  const [rate, setRate] = useState("")
  const [years, setYears] = useState("")

  const p = parseNum(principal)
  const r = parseNum(rate)
  const t = parseNum(years)

  const fv = p != null && r != null && t != null ? p * Math.pow(1 + r / 100, t) : null
  const gain = fv != null && p != null ? fv - p : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="ls-principal" label="Lumpsum Investment" value={principal} onChange={setPrincipal} placeholder="e.g. 100000" />
        <NumberField id="ls-rate" label="Expected Return" value={rate} onChange={setRate} placeholder="e.g. 10" suffix="%" />
        <NumberField id="ls-years" label="Duration" value={years} onChange={setYears} placeholder="e.g. 10" suffix="years" />
      </div>
      <Formula>FV = P × (1 + r)ᵗ</Formula>
      <ResultGrid>
        <ResultRow label="Future Value" value={fmtMoney(fv)} />
        <ResultRow label="Estimated Gains" value={fmtMoney(gain)} />
      </ResultGrid>
    </div>
  )
}

export function CagrCalculator() {
  const [initial, setInitial] = useState("")
  const [final, setFinal] = useState("")
  const [years, setYears] = useState("")

  const i = parseNum(initial)
  const f = parseNum(final)
  const t = parseNum(years)

  const cagr = i != null && f != null && t != null && i !== 0 ? Math.pow(f / i, 1 / t) - 1 : null
  const totalReturn = i != null && f != null && i !== 0 ? (f / i - 1) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="cagr-initial" label="Initial Value" value={initial} onChange={setInitial} placeholder="e.g. 50000" />
        <NumberField id="cagr-final" label="Final Value" value={final} onChange={setFinal} placeholder="e.g. 120000" />
        <NumberField id="cagr-years" label="Years" value={years} onChange={setYears} placeholder="e.g. 5" />
      </div>
      <Formula>CAGR = (Final ÷ Initial)^(1÷Years) − 1</Formula>
      <ResultGrid>
        <ResultRow label="CAGR" value={fmtPct(cagr, 4)} />
        <ResultRow label="Total Return" value={fmtPct(totalReturn, 2)} />
      </ResultGrid>
    </div>
  )
}

interface XirrRow {
  id: number
  date: string
  amount: string
}

export function XirrCalculator() {
  const [rows, setRows] = useState<XirrRow[]>([
    { id: 1, date: "2023-01-01", amount: "-10000" },
    { id: 2, date: "2024-01-01", amount: "12000" },
  ])

  const updateRow = (id: number, patch: Partial<XirrRow>) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)))

  const addRow = () =>
    setRows((r) => [...r, { id: Date.now() + Math.random(), date: "", amount: "" }])

  const removeRow = (id: number) =>
    setRows((r) => (r.length > 1 ? r.filter((row) => row.id !== id) : r))

  const result = useMemo(() => {
    const parsed = rows
      .map((row) => ({
        date: row.date ? new Date(row.date + "T00:00:00").getTime() : null,
        amount: parseNum(row.amount),
      }))
      .filter((r): r is { date: number; amount: number } => r.date != null && r.amount != null)
      .sort((a, b) => a.date - b.date)
    if (parsed.length < 2) return null
    const base = parsed[0].date
    const flows = parsed.map((r) => ({ amount: r.amount, days: (r.date - base) / 86400000 }))
    const rate = xirr(flows)
    return { rate, totalInvested: parsed.filter((r) => r.amount < 0).reduce((s, r) => s + r.amount, 0) }
  }, [rows])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="flex flex-col gap-2">
              <Label>Date</Label>
              <Input type="date" value={row.date} onChange={(e) => updateRow(row.id, { date: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Cash Flow (negative = invest)</Label>
              <Input
                inputMode="decimal"
                value={row.amount}
                placeholder="e.g. -10000"
                onChange={(e) => updateRow(row.id, { amount: e.target.value })}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Remove cash flow"
              disabled={rows.length === 1}
              onClick={() => removeRow(row.id)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" onClick={addRow}>
        Add Cash Flow
      </Button>
      <Formula>XIRR = annualized rate where NPV of dated cash flows = 0</Formula>
      <ResultGrid>
        <ResultRow label="XIRR" value={fmtPct(result?.rate, 4)} hint="annualized return" />
        <ResultRow label="Total Invested" value={fmtMoney(result ? -result.totalInvested : null)} />
      </ResultGrid>
    </div>
  )
}

export function IrrCalculator() {
  const [input, setInput] = useState("-10000, 3000, 4000, 5000, 2000")

  const flows = useMemo(() => parseList(input), [input])
  const rate = useMemo(() => irr(flows), [flows])
  const nvpv = rate != null ? npv(rate, flows) : null

  return (
    <div className="flex flex-col gap-6">
      <ListField
        id="irr-flows"
        label="Cash Flows (negative = invest, positive = return)"
        value={input}
        onChange={setInput}
        placeholder="e.g. -10000, 3000, 4000, 5000"
      />
      <Formula>IRR = discount rate where NPV = 0</Formula>
      <ResultGrid>
        <ResultRow label="IRR" value={fmtPct(rate, 4)} hint={flows.length < 2 ? "enter at least 2 cash flows" : undefined} />
        <ResultRow label="Net Present Value" value={fmtMoney(nvpv)} />
      </ResultGrid>
    </div>
  )
}

export function NpvCalculator() {
  const [rate, setRate] = useState("10")
  const [investment, setInvestment] = useState("")
  const [flows, setFlows] = useState("")

  const r = parseNum(rate)
  const inv = parseNum(investment)
  const list = useMemo(() => parseList(flows), [flows])

  const npvValue = useMemo(() => {
    if (r == null || inv == null) return null
    return -inv + npv(r / 100, list)
  }, [r, inv, list])

  const discountedInflows = useMemo(() => {
    if (r == null) return null
    return npv(r / 100, list)
  }, [r, list])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="npv-rate" label="Discount Rate" value={rate} onChange={setRate} placeholder="e.g. 10" suffix="%" />
        <NumberField id="npv-invest" label="Initial Investment" value={investment} onChange={setInvestment} placeholder="e.g. 50000" />
        <div className="sm:col-span-2">
          <ListField
            id="npv-flows"
            label="Cash Flows per Period"
            value={flows}
            onChange={setFlows}
            placeholder="e.g. 15000, 20000, 25000, 20000"
          />
        </div>
      </div>
      <Formula>NPV = −Investment + Σ CFₜ ÷ (1 + r)ᵗ</Formula>
      <ResultGrid>
        <ResultRow label="NPV" value={fmtMoney(npvValue)} hint={npvValue != null ? (npvValue >= 0 ? "profitable" : "not profitable") : undefined} />
        <ResultRow label="Present Value of Inflows" value={fmtMoney(discountedInflows)} />
      </ResultGrid>
    </div>
  )
}

export function DividendCalculator() {
  const [shares, setShares] = useState("")
  const [perShare, setPerShare] = useState("")

  const s = parseNum(shares)
  const d = parseNum(perShare)

  const total = s != null && d != null ? s * d : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="div-shares" label="Number of Shares" value={shares} onChange={setShares} placeholder="e.g. 200" />
        <NumberField id="div-per" label="Dividend per Share" value={perShare} onChange={setPerShare} placeholder="e.g. 1.5" />
      </div>
      <Formula>Dividend = Shares × Dividend per Share</Formula>
      <ResultGrid>
        <ResultRow label="Total Dividend" value={fmtMoney(total)} hint={s != null ? `${fmtNum(s)} shares` : undefined} />
      </ResultGrid>
    </div>
  )
}

export function DividendYieldCalculator() {
  const [perShare, setPerShare] = useState("")
  const [price, setPrice] = useState("")

  const d = parseNum(perShare)
  const p = parseNum(price)

  const yieldPct = d != null && p != null && p !== 0 ? (d / p) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="dy-per" label="Annual Dividend per Share" value={perShare} onChange={setPerShare} placeholder="e.g. 2" />
        <NumberField id="dy-price" label="Current Price" value={price} onChange={setPrice} placeholder="e.g. 40" />
      </div>
      <Formula>Dividend Yield = Dividend ÷ Price × 100</Formula>
      <ResultGrid>
        <ResultRow label="Dividend Yield" value={fmtPct(yieldPct)} />
      </ResultGrid>
    </div>
  )
}
