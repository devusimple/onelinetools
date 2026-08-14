"use client"

import { useState } from "react"
import { fmtMoney, fmtNum, fmtPct, parseNum } from "@/lib/calc-utils"
import { annuityFV, monthsToReachGoal } from "@/lib/finance-utils"
import { NumberField, ResultGrid, ResultRow, Formula } from "./shared"

export function InflationCalculator() {
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("")
  const [years, setYears] = useState("")

  const a = parseNum(amount)
  const r = parseNum(rate)
  const t = parseNum(years)

  const future = a != null && r != null && t != null ? a * Math.pow(1 + r / 100, t) : null
  const increase = future != null && a != null ? future - a : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="inf-amount" label="Current Cost" value={amount} onChange={setAmount} placeholder="e.g. 100" />
        <NumberField id="inf-rate" label="Inflation Rate" value={rate} onChange={setRate} placeholder="e.g. 6" suffix="%" />
        <NumberField id="inf-years" label="Years" value={years} onChange={setYears} placeholder="e.g. 10" />
      </div>
      <Formula>Future Cost = Amount × (1 + rate)ᵗ</Formula>
      <ResultGrid>
        <ResultRow label="Future Cost" value={fmtMoney(future)} />
        <ResultRow label="Increase" value={fmtMoney(increase)} hint={increase != null ? `${fmtPct(increase != null && a != null ? (increase / a) * 100 : null, 1)} total` : undefined} />
      </ResultGrid>
    </div>
  )
}

export function PurchasingPowerCalculator() {
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("")
  const [years, setYears] = useState("")

  const a = parseNum(amount)
  const r = parseNum(rate)
  const t = parseNum(years)

  const value = a != null && r != null && t != null ? a / Math.pow(1 + r / 100, t) : null
  const loss = value != null && a != null ? a - value : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="pp-amount" label="Future Amount" value={amount} onChange={setAmount} placeholder="e.g. 100000" />
        <NumberField id="pp-rate" label="Inflation Rate" value={rate} onChange={setRate} placeholder="e.g. 6" suffix="%" />
        <NumberField id="pp-years" label="Years" value={years} onChange={setYears} placeholder="e.g. 10" />
      </div>
      <Formula>Purchasing Power = Amount ÷ (1 + rate)ᵗ</Formula>
      <ResultGrid>
        <ResultRow label="Value Today" value={fmtMoney(value)} />
        <ResultRow label="Purchasing Power Lost" value={fmtMoney(loss)} hint={loss != null ? `${fmtPct(a != null && loss != null ? (loss / a) * 100 : null, 1)} of the amount` : undefined} />
      </ResultGrid>
    </div>
  )
}

export function NetWorthCalculator() {
  const [assets, setAssets] = useState("")
  const [liabilities, setLiabilities] = useState("")

  const a = parseNum(assets)
  const l = parseNum(liabilities)

  const netWorth = a != null && l != null ? a - l : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="nw-assets" label="Total Assets" value={assets} onChange={setAssets} placeholder="e.g. 250000" />
        <NumberField id="nw-liab" label="Total Liabilities" value={liabilities} onChange={setLiabilities} placeholder="e.g. 80000" />
      </div>
      <Formula>Net Worth = Assets − Liabilities</Formula>
      <ResultGrid>
        <ResultRow label="Net Worth" value={fmtMoney(netWorth)} hint={netWorth != null && netWorth < 0 ? "liabilities exceed assets" : undefined} />
        <ResultRow label="Asset Ratio" value={a != null && l != null && l !== 0 ? `${fmtNum((a / l), 2)}×` : "—"} hint="assets ÷ liabilities" />
      </ResultGrid>
    </div>
  )
}

export function DebtToIncomeCalculator() {
  const [debt, setDebt] = useState("")
  const [income, setIncome] = useState("")

  const d = parseNum(debt)
  const i = parseNum(income)

  const dti = d != null && i != null && i !== 0 ? (d / i) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="dti-debt" label="Monthly Debt Payments" value={debt} onChange={setDebt} placeholder="e.g. 1500" />
        <NumberField id="dti-income" label="Gross Monthly Income" value={income} onChange={setIncome} placeholder="e.g. 5000" />
      </div>
      <Formula>DTI = Debt Payments ÷ Income × 100</Formula>
      <ResultGrid>
        <ResultRow
          label="Debt-to-Income Ratio"
          value={fmtPct(dti)}
          hint={dti != null ? (dti > 43 ? "high — lenders may hesitate" : dti > 36 ? "moderate" : "healthy") : undefined}
        />
      </ResultGrid>
    </div>
  )
}

export function SavingsGoalCalculator() {
  const [goal, setGoal] = useState("")
  const [current, setCurrent] = useState("")
  const [monthly, setMonthly] = useState("")
  const [rate, setRate] = useState("")

  const g = parseNum(goal)
  const c = parseNum(current) ?? 0
  const m = parseNum(monthly) ?? 0
  const r = parseNum(rate) ?? 0

  const months = g != null ? monthsToReachGoal(c, m, r, g) : null
  const years = months != null ? months / 12 : null
  const fv = m > 0 || c > 0 ? c * Math.pow(1 + r / 100 / 12, months ?? 0) + annuityFV(m, r, months ?? 0) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="sg-goal" label="Savings Goal" value={goal} onChange={setGoal} placeholder="e.g. 500000" />
        <NumberField id="sg-current" label="Current Savings" value={current} onChange={setCurrent} placeholder="e.g. 50000" />
        <NumberField id="sg-monthly" label="Monthly Contribution" value={monthly} onChange={setMonthly} placeholder="e.g. 15000" />
        <NumberField id="sg-rate" label="Annual Return" value={rate} onChange={setRate} placeholder="e.g. 8" suffix="%" />
      </div>
      <Formula>Years = solve FV(current, monthly, rate) = goal</Formula>
      <ResultGrid>
        <ResultRow label="Time to Reach Goal" value={months != null ? `${fmtNum(months)} months` : "—"} hint={years != null ? `≈ ${fmtNum(years, 1)} years` : undefined} />
        <ResultRow label="Projected Value" value={fmtMoney(fv)} />
      </ResultGrid>
    </div>
  )
}

export function EmergencyFundCalculator() {
  const [monthlyExpenses, setMonthlyExpenses] = useState("")
  const [targetMonths, setTargetMonths] = useState("6")
  const [current, setCurrent] = useState("")

  const e = parseNum(monthlyExpenses)
  const m = parseNum(targetMonths)
  const c = parseNum(current)

  const target = e != null && m != null ? e * m : null
  const monthsCovered = target != null && c != null && e != null && e !== 0 ? c / e : null
  const shortfall = target != null && c != null ? target - c : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="ef-expenses" label="Monthly Expenses" value={monthlyExpenses} onChange={setMonthlyExpenses} placeholder="e.g. 40000" />
        <NumberField id="ef-months" label="Target Months" value={targetMonths} onChange={setTargetMonths} placeholder="e.g. 6" />
        <NumberField id="ef-current" label="Current Savings (optional)" value={current} onChange={setCurrent} placeholder="e.g. 120000" />
      </div>
      <Formula>Target Fund = Monthly Expenses × Months</Formula>
      <ResultGrid>
        <ResultRow label="Emergency Fund Target" value={fmtMoney(target)} />
        <ResultRow label="Months Covered Now" value={monthsCovered != null ? `${fmtNum(monthsCovered, 1)}` : "—"} hint="savings ÷ monthly expenses" />
        <ResultRow label="Still Needed" value={fmtMoney(shortfall)} hint={shortfall != null && shortfall <= 0 ? "goal reached" : undefined} />
      </ResultGrid>
    </div>
  )
}

export function FireCalculator() {
  const [expenses, setExpenses] = useState("")
  const [current, setCurrent] = useState("")
  const [monthly, setMonthly] = useState("")
  const [rate, setRate] = useState("")
  const [swr, setSwr] = useState("4")

  const e = parseNum(expenses)
  const c = parseNum(current) ?? 0
  const m = parseNum(monthly) ?? 0
  const r = parseNum(rate) ?? 0
  const s = parseNum(swr) ?? 4

  const fireNumber = e != null ? (e / s) * 100 : null
  const months = fireNumber != null ? monthsToReachGoal(c, m, r, fireNumber) : null
  const yearlyWithdrawal = fireNumber != null && s != null ? (fireNumber * s) / 100 : null
  const progress = fireNumber != null && fireNumber !== 0 ? (c / fireNumber) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="fire-expenses" label="Annual Expenses" value={expenses} onChange={setExpenses} placeholder="e.g. 480000" />
        <NumberField id="fire-swr" label="Safe Withdrawal Rate" value={swr} onChange={setSwr} placeholder="e.g. 4" suffix="%" />
        <NumberField id="fire-current" label="Current Savings" value={current} onChange={setCurrent} placeholder="e.g. 200000" />
        <NumberField id="fire-monthly" label="Monthly Saving" value={monthly} onChange={setMonthly} placeholder="e.g. 30000" />
        <NumberField id="fire-rate" label="Expected Return" value={rate} onChange={setRate} placeholder="e.g. 8" suffix="%" />
      </div>
      <Formula>FIRE Number = Annual Expenses ÷ SWR</Formula>
      <ResultGrid>
        <ResultRow label="FIRE Number" value={fmtMoney(fireNumber)} hint={`withdraw ${fmtNum(s, 1)}% per year`} />
        <ResultRow label="Years to FIRE" value={months != null ? `${fmtNum(months / 12, 1)} years` : "—"} hint={months != null ? `${fmtNum(months)} months` : undefined} />
        <ResultRow label="Yearly Withdrawal" value={fmtMoney(yearlyWithdrawal)} />
        <ResultRow label="Progress" value={fmtPct(progress)} />
      </ResultGrid>
    </div>
  )
}

export function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState("")
  const [retireAge, setRetireAge] = useState("")
  const [current, setCurrent] = useState("")
  const [monthly, setMonthly] = useState("")
  const [rate, setRate] = useState("")

  const ca = parseNum(currentAge)
  const ra = parseNum(retireAge)
  const c = parseNum(current) ?? 0
  const m = parseNum(monthly) ?? 0
  const r = parseNum(rate) ?? 0

  const years = ca != null && ra != null ? Math.max(0, ra - ca) : null
  const months = years != null ? years * 12 : null
  const fv = months != null ? c * Math.pow(1 + r / 100 / 12, months) + annuityFV(m, r, months) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="ret-current-age" label="Current Age" value={currentAge} onChange={setCurrentAge} placeholder="e.g. 30" suffix="yrs" />
        <NumberField id="ret-retire-age" label="Retirement Age" value={retireAge} onChange={setRetireAge} placeholder="e.g. 60" suffix="yrs" />
        <NumberField id="ret-current" label="Current Savings" value={current} onChange={setCurrent} placeholder="e.g. 500000" />
        <NumberField id="ret-monthly" label="Monthly Contribution" value={monthly} onChange={setMonthly} placeholder="e.g. 20000" />
        <NumberField id="ret-rate" label="Expected Return" value={rate} onChange={setRate} placeholder="e.g. 8" suffix="%" />
      </div>
      <Formula>Projected = Current × growth + Annuity(monthly)</Formula>
      <ResultGrid>
        <ResultRow label="Projected Savings" value={fmtMoney(fv)} hint={years != null ? `over ${fmtNum(years)} years` : undefined} />
        <ResultRow label="Yearly Withdrawal (4% rule)" value={fmtMoney(fv != null ? fv * 0.04 : null)} />
      </ResultGrid>
    </div>
  )
}

export function RetirementSavingsCalculator() {
  const [current, setCurrent] = useState("")
  const [monthly, setMonthly] = useState("")
  const [rate, setRate] = useState("")
  const [years, setYears] = useState("")

  const c = parseNum(current) ?? 0
  const m = parseNum(monthly) ?? 0
  const r = parseNum(rate) ?? 0
  const t = parseNum(years)

  const months = t != null ? t * 12 : null
  const fv = months != null ? c * Math.pow(1 + r / 100 / 12, months) + annuityFV(m, r, months) : null
  const invested = c + (m ?? 0) * (months ?? 0)
  const gains = fv != null ? fv - invested : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="rs-current" label="Current Savings" value={current} onChange={setCurrent} placeholder="e.g. 100000" />
        <NumberField id="rs-monthly" label="Monthly Contribution" value={monthly} onChange={setMonthly} placeholder="e.g. 15000" />
        <NumberField id="rs-rate" label="Expected Return" value={rate} onChange={setRate} placeholder="e.g. 7" suffix="%" />
        <NumberField id="rs-years" label="Years to Retirement" value={years} onChange={setYears} placeholder="e.g. 25" />
      </div>
      <Formula>FV = Current × growth + Annuity(monthly)</Formula>
      <ResultGrid>
        <ResultRow label="Retirement Corpus" value={fmtMoney(fv)} />
        <ResultRow label="Total Invested" value={fmtMoney(invested)} />
        <ResultRow label="Estimated Gains" value={fmtMoney(gains)} />
      </ResultGrid>
    </div>
  )
}

export function PensionCalculator() {
  const [contribution, setContribution] = useState("")
  const [matchPct, setMatchPct] = useState("")
  const [rate, setRate] = useState("")
  const [years, setYears] = useState("")

  const c = parseNum(contribution) ?? 0
  const mp = parseNum(matchPct) ?? 0
  const r = parseNum(rate) ?? 0
  const t = parseNum(years)

  const monthlyTotal = c * (1 + mp / 100)
  const months = t != null ? t * 12 : null
  const fv = months != null ? annuityFV(monthlyTotal, r, months) : null
  const contributed = months != null ? monthlyTotal * months : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="pn-contrib" label="Monthly Contribution" value={contribution} onChange={setContribution} placeholder="e.g. 10000" />
        <NumberField id="pn-match" label="Employer Match" value={matchPct} onChange={setMatchPct} placeholder="e.g. 50" suffix="%" />
        <NumberField id="pn-rate" label="Expected Return" value={rate} onChange={setRate} placeholder="e.g. 7" suffix="%" />
        <NumberField id="pn-years" label="Years" value={years} onChange={setYears} placeholder="e.g. 30" />
      </div>
      <Formula>Monthly = Contribution × (1 + match%)</Formula>
      <ResultGrid>
        <ResultRow label="Pension Value at Retirement" value={fmtMoney(fv)} />
        <ResultRow label="Total Contributed" value={fmtMoney(contributed)} hint="incl. employer match" />
        <ResultRow label="Monthly with Match" value={fmtMoney(monthlyTotal)} />
      </ResultGrid>
    </div>
  )
}
