"use client"

import { useMemo, useState } from "react"
import { fmtMoney, fmtNum, parseNum } from "@/lib/calc-utils"
import { emi } from "@/lib/finance-utils"
import {
  NumberField,
  SelectField,
  ResultGrid,
  ResultRow,
  Formula,
} from "./shared"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

const termOptions = [
  { value: "10", label: "10 years" },
  { value: "15", label: "15 years" },
  { value: "20", label: "20 years" },
  { value: "25", label: "25 years" },
  { value: "30", label: "30 years" },
]

export function MortgageCalculator() {
  const [price, setPrice] = useState("")
  const [downPct, setDownPct] = useState("20")
  const [rate, setRate] = useState("")
  const [term, setTerm] = useState("30")

  const p = parseNum(price)
  const dp = parseNum(downPct)
  const r = parseNum(rate)
  const t = parseNum(term)

  const down = p != null && dp != null ? (p * dp) / 100 : null
  const loan = p != null && down != null ? p - down : null
  const months = t != null ? t * 12 : null
  const payment = loan != null && r != null && months != null ? emi(loan, r, months) : null
  const total = payment != null && months != null ? payment * months : null
  const interest = total != null && loan != null ? total - loan : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="mtg-price" label="Home Price" value={price} onChange={setPrice} placeholder="e.g. 300000" />
        <NumberField id="mtg-down" label="Down Payment" value={downPct} onChange={setDownPct} placeholder="e.g. 20" suffix="%" />
        <NumberField id="mtg-rate" label="Interest Rate" value={rate} onChange={setRate} placeholder="e.g. 6.5" suffix="%" />
        <SelectField id="mtg-term" label="Term" value={term} onChange={setTerm} options={termOptions} />
      </div>
      <Formula>M = P×r×(1+r)ⁿ ÷ ((1+r)ⁿ − 1)</Formula>
      <ResultGrid>
        <ResultRow label="Loan Amount" value={fmtMoney(loan)} hint={`${fmtMoney(down)} down payment`} />
        <ResultRow label="Monthly Payment" value={fmtMoney(payment)} hint="principal + interest" />
        <ResultRow label="Total Interest" value={fmtMoney(interest)} />
        <ResultRow label="Total Paid" value={fmtMoney(total)} hint={`${fmtNum(months ?? 0)} months`} />
      </ResultGrid>
    </div>
  )
}

export function HomeAffordabilityCalculator() {
  const [income, setIncome] = useState("")
  const [dti, setDti] = useState("28")
  const [down, setDown] = useState("")
  const [rate, setRate] = useState("")
  const [term, setTerm] = useState("30")

  const i = parseNum(income)
  const d = parseNum(dti)
  const dp = parseNum(down) ?? 0
  const r = parseNum(rate)
  const t = parseNum(term)

  const maxPayment = i != null && d != null ? (i * d) / 100 : null
  const months = t != null ? t * 12 : null
  const maxLoan =
    maxPayment != null && r != null && months != null && r !== 0
      ? (maxPayment / (r / 100 / 12)) * (1 - Math.pow(1 + r / 100 / 12, -months))
      : maxPayment != null && months != null
        ? maxPayment * months
        : null
  const maxPrice = maxLoan != null ? maxLoan + dp : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="aff-income" label="Gross Monthly Income" value={income} onChange={setIncome} placeholder="e.g. 8000" />
        <NumberField id="aff-dti" label="Max DTI" value={dti} onChange={setDti} placeholder="e.g. 28" suffix="%" />
        <NumberField id="aff-down" label="Down Payment (optional)" value={down} onChange={setDown} placeholder="e.g. 50000" />
        <NumberField id="aff-rate" label="Interest Rate" value={rate} onChange={setRate} placeholder="e.g. 6.5" suffix="%" />
        <SelectField id="aff-term" label="Term" value={term} onChange={setTerm} options={termOptions} />
      </div>
      <Formula>Max loan = payment × (1 − (1+r)⁻ⁿ) ÷ r</Formula>
      <ResultGrid>
        <ResultRow label="Max Monthly Payment" value={fmtMoney(maxPayment)} hint="income × DTI" />
        <ResultRow label="Max Loan Amount" value={fmtMoney(maxLoan)} />
        <ResultRow label="Max Home Price" value={fmtMoney(maxPrice)} hint={dp ? `incl. ${fmtMoney(dp)} down` : undefined} />
      </ResultGrid>
    </div>
  )
}

export function RentVsBuyCalculator() {
  const [rent, setRent] = useState("")
  const [price, setPrice] = useState("")
  const [downPct, setDownPct] = useState("20")
  const [rate, setRate] = useState("")
  const [term, setTerm] = useState("30")
  const [years, setYears] = useState("10")
  const [propertyCost, setPropertyCost] = useState("")

  const rentM = parseNum(rent)
  const p = parseNum(price)
  const dp = parseNum(downPct)
  const r = parseNum(rate)
  const t = parseNum(term)
  const y = parseNum(years)
  const pc = parseNum(propertyCost) ?? 0

  const down = p != null && dp != null ? (p * dp) / 100 : null
  const loan = p != null && down != null ? p - down : null
  const months = t != null ? t * 12 : null
  const mortgage = loan != null && r != null && months != null ? emi(loan, r, months) : null
  const ownMonthly = mortgage != null ? mortgage + pc : null
  const totalMonths = y != null ? y * 12 : null
  const totalRent = rentM != null && totalMonths != null ? rentM * totalMonths : null
  const totalOwn = ownMonthly != null && totalMonths != null ? ownMonthly * totalMonths + (down ?? 0) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="rvb-rent" label="Monthly Rent" value={rent} onChange={setRent} placeholder="e.g. 1800" />
        <NumberField id="rvb-price" label="Home Price" value={price} onChange={setPrice} placeholder="e.g. 350000" />
        <NumberField id="rvb-down" label="Down Payment" value={downPct} onChange={setDownPct} placeholder="e.g. 20" suffix="%" />
        <NumberField id="rvb-rate" label="Mortgage Rate" value={rate} onChange={setRate} placeholder="e.g. 6.5" suffix="%" />
        <NumberField id="rvb-years" label="Compare Over (years)" value={years} onChange={setYears} placeholder="e.g. 10" />
        <NumberField id="rvb-prop" label="Monthly Property Costs" value={propertyCost} onChange={setPropertyCost} placeholder="e.g. 400" />
        <SelectField id="rvb-term" label="Mortgage Term" value={term} onChange={setTerm} options={termOptions} />
      </div>
      <Formula>Own = Mortgage + Property Costs; compare totals over N years</Formula>
      <ResultGrid>
        <ResultRow label="Monthly Rent" value={fmtMoney(rentM)} />
        <ResultRow label="Monthly Own" value={fmtMoney(ownMonthly)} hint={mortgage != null ? `P&I ${fmtMoney(mortgage)} + ${fmtMoney(pc)}` : undefined} />
        <ResultRow label="Total Rent Paid" value={fmtMoney(totalRent)} hint={y != null ? `over ${fmtNum(y)} years` : undefined} />
        <ResultRow label="Total Ownership Cost" value={fmtMoney(totalOwn)} hint={down != null ? `incl. ${fmtMoney(down)} down` : undefined} />
      </ResultGrid>
    </div>
  )
}

export function DownPaymentCalculator() {
  const [price, setPrice] = useState("")
  const [pct, setPct] = useState("20")

  const p = parseNum(price)
  const d = parseNum(pct)

  const down = p != null && d != null ? (p * d) / 100 : null
  const loan = p != null && down != null ? p - down : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="dp-price" label="Home Price" value={price} onChange={setPrice} placeholder="e.g. 400000" />
        <NumberField id="dp-pct" label="Down Payment" value={pct} onChange={setPct} placeholder="e.g. 20" suffix="%" />
      </div>
      <Formula>Down = Price × %; Loan = Price − Down</Formula>
      <ResultGrid>
        <ResultRow label="Down Payment" value={fmtMoney(down)} />
        <ResultRow label="Loan Amount" value={fmtMoney(loan)} />
      </ResultGrid>
    </div>
  )
}

function simulatePayoff(
  balance: number,
  annualRatePct: number,
  payment: number
): { stuck: boolean; months: number; totalInterest: number; bal: number } | null {
  if (balance <= 0 || payment <= 0) return null
  let bal = balance
  let months = 0
  let totalInterest = 0
  const monthlyRate = annualRatePct / 100 / 12
  while (bal > 0 && months < 1200) {
    months++
    const interest = bal * monthlyRate
    totalInterest += interest
    const principal = payment - interest
    if (principal <= 0) return { stuck: true, months, totalInterest, bal }
    bal -= principal
  }
  if (bal > 0) return { stuck: true, months, totalInterest, bal }
  return { stuck: false, months, totalInterest, bal: 0 }
}

function useLoanState() {
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("")
  const [term, setTerm] = useState("5")

  const a = parseNum(amount)
  const r = parseNum(rate)
  const t = parseNum(term)
  const months = t != null ? t * 12 : null
  const payment = a != null && r != null && months != null ? emi(a, r, months) : null
  const total = payment != null && months != null ? payment * months : null
  const interest = total != null && a != null ? total - a : null

  return {
    amount,
    setAmount,
    rate,
    setRate,
    term,
    setTerm,
    a,
    r,
    t,
    months,
    payment,
    total,
    interest,
  }
}

export function LoanCalculator() {
  const s = useLoanState()
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="loan-amount" label="Loan Amount" value={s.amount} onChange={s.setAmount} placeholder="e.g. 50000" />
        <NumberField id="loan-rate" label="Interest Rate" value={s.rate} onChange={s.setRate} placeholder="e.g. 8" suffix="%" />
        <NumberField id="loan-term" label="Term" value={s.term} onChange={s.setTerm} placeholder="e.g. 5" suffix="years" />
      </div>
      <Formula>EMI = P×r×(1+r)ⁿ ÷ ((1+r)ⁿ − 1)</Formula>
      <ResultGrid>
        <ResultRow label="Monthly Payment" value={fmtMoney(s.payment)} />
        <ResultRow label="Total Interest" value={fmtMoney(s.interest)} />
        <ResultRow label="Total Repaid" value={fmtMoney(s.total)} />
      </ResultGrid>
    </div>
  )
}

export function EmiCalculator() {
  const s = useLoanState()
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="emi-principal" label="Principal" value={s.amount} onChange={s.setAmount} placeholder="e.g. 2000000" />
        <NumberField id="emi-rate" label="Interest Rate" value={s.rate} onChange={s.setRate} placeholder="e.g. 9" suffix="%" />
        <NumberField id="emi-term" label="Term" value={s.term} onChange={s.setTerm} placeholder="e.g. 20" suffix="years" />
      </div>
      <Formula>EMI = P×r×(1+r)ⁿ ÷ ((1+r)ⁿ − 1)</Formula>
      <ResultGrid>
        <ResultRow label="Monthly EMI" value={fmtMoney(s.payment)} />
        <ResultRow label="Total Interest" value={fmtMoney(s.interest)} />
        <ResultRow label="Total Payment" value={fmtMoney(s.total)} />
      </ResultGrid>
    </div>
  )
}

export function AutoLoanCalculator() {
  const [price, setPrice] = useState("")
  const [down, setDown] = useState("")
  const [rate, setRate] = useState("")
  const [term, setTerm] = useState("5")

  const p = parseNum(price)
  const d = parseNum(down) ?? 0
  const r = parseNum(rate)
  const t = parseNum(term)

  const loan = p != null ? p - d : null
  const months = t != null ? t * 12 : null
  const payment = loan != null && r != null && months != null ? emi(loan, r, months) : null
  const total = payment != null && months != null ? payment * months : null
  const interest = total != null && loan != null ? total - loan : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="al-price" label="Vehicle Price" value={price} onChange={setPrice} placeholder="e.g. 35000" />
        <NumberField id="al-down" label="Down Payment" value={down} onChange={setDown} placeholder="e.g. 5000" />
        <NumberField id="al-rate" label="Interest Rate" value={rate} onChange={setRate} placeholder="e.g. 6" suffix="%" />
        <NumberField id="al-term" label="Term" value={term} onChange={setTerm} placeholder="e.g. 5" suffix="years" />
      </div>
      <Formula>EMI on (price − down) over term</Formula>
      <ResultGrid>
        <ResultRow label="Monthly Payment" value={fmtMoney(payment)} hint={loan != null ? `on ${fmtMoney(loan)} financed` : undefined} />
        <ResultRow label="Total Interest" value={fmtMoney(interest)} />
        <ResultRow label="Total Paid" value={fmtMoney(total)} />
      </ResultGrid>
    </div>
  )
}

export function StudentLoanCalculator() {
  const s = useLoanState()
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="sl-amount" label="Loan Amount" value={s.amount} onChange={s.setAmount} placeholder="e.g. 30000" />
        <NumberField id="sl-rate" label="Interest Rate" value={s.rate} onChange={s.setRate} placeholder="e.g. 5" suffix="%" />
        <NumberField id="sl-term" label="Term" value={s.term} onChange={s.setTerm} placeholder="e.g. 10" suffix="years" />
      </div>
      <Formula>EMI = P×r×(1+r)ⁿ ÷ ((1+r)ⁿ − 1)</Formula>
      <ResultGrid>
        <ResultRow label="Monthly Payment" value={fmtMoney(s.payment)} />
        <ResultRow label="Total Interest" value={fmtMoney(s.interest)} />
        <ResultRow label="Total Repaid" value={fmtMoney(s.total)} />
      </ResultGrid>
    </div>
  )
}

export function PersonalLoanCalculator() {
  const s = useLoanState()
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="pl-amount" label="Loan Amount" value={s.amount} onChange={s.setAmount} placeholder="e.g. 100000" />
        <NumberField id="pl-rate" label="Interest Rate" value={s.rate} onChange={s.setRate} placeholder="e.g. 11" suffix="%" />
        <NumberField id="pl-term" label="Term" value={s.term} onChange={s.setTerm} placeholder="e.g. 5" suffix="years" />
      </div>
      <Formula>EMI = P×r×(1+r)ⁿ ÷ ((1+r)ⁿ − 1)</Formula>
      <ResultGrid>
        <ResultRow label="Monthly Payment" value={fmtMoney(s.payment)} />
        <ResultRow label="Total Interest" value={fmtMoney(s.interest)} />
        <ResultRow label="Total Repaid" value={fmtMoney(s.total)} />
      </ResultGrid>
    </div>
  )
}

export function BusinessLoanCalculator() {
  const s = useLoanState()
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="bl-amount" label="Loan Amount" value={s.amount} onChange={s.setAmount} placeholder="e.g. 500000" />
        <NumberField id="bl-rate" label="Interest Rate" value={s.rate} onChange={s.setRate} placeholder="e.g. 10" suffix="%" />
        <NumberField id="bl-term" label="Term" value={s.term} onChange={s.setTerm} placeholder="e.g. 7" suffix="years" />
      </div>
      <Formula>EMI = P×r×(1+r)ⁿ ÷ ((1+r)ⁿ − 1)</Formula>
      <ResultGrid>
        <ResultRow label="Monthly Payment" value={fmtMoney(s.payment)} />
        <ResultRow label="Total Interest" value={fmtMoney(s.interest)} />
        <ResultRow label="Total Repaid" value={fmtMoney(s.total)} />
      </ResultGrid>
    </div>
  )
}

export function LoanPayoffCalculator() {
  const [balance, setBalance] = useState("")
  const [rate, setRate] = useState("")
  const [payment, setPayment] = useState("")

  const b = parseNum(balance)
  const r = parseNum(rate)
  const p = parseNum(payment)

  const result =
    b != null && r != null && p != null ? simulatePayoff(b, r, p) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="lpo-balance" label="Current Balance" value={balance} onChange={setBalance} placeholder="e.g. 15000" />
        <NumberField id="lpo-rate" label="Annual Rate" value={rate} onChange={setRate} placeholder="e.g. 12" suffix="%" />
        <NumberField id="lpo-payment" label="Monthly Payment" value={payment} onChange={setPayment} placeholder="e.g. 500" />
      </div>
      <Formula>Simulate months until balance = 0</Formula>
      <ResultGrid>
        <ResultRow label="Payoff Time" value={result ? `${fmtNum(result.months)} months` : "—"} hint={result ? `≈ ${fmtNum(result.months / 12, 1)} years` : undefined} />
        <ResultRow label="Total Interest" value={fmtMoney(result?.totalInterest)} />
        <ResultRow label="Warning" value={result?.stuck ? "Payment doesn't cover interest" : "—"} hint="balance will grow" />
      </ResultGrid>
    </div>
  )
}

export function AmortizationCalculator() {
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("")
  const [term, setTerm] = useState("10")

  const a = parseNum(amount)
  const r = parseNum(rate)
  const t = parseNum(term)

  const schedule = useMemo(() => {
    if (a == null || r == null || t == null || a <= 0 || t <= 0) return null
    const months = t * 12
    const payment = emi(a, r, months)
    const monthlyRate = r / 100 / 12
    const rows: { month: number; payment: number; interest: number; principal: number; balance: number }[] = []
    let bal = a
    for (let m = 1; m <= months; m++) {
      const interest = bal * monthlyRate
      const principal = payment - interest
      bal = Math.max(0, bal - principal)
      rows.push({ month: m, payment, interest, principal, balance: bal })
    }
    return { rows, payment }
  }, [a, r, t])

  const totalInterest = schedule ? schedule.rows.reduce((s, r) => s + r.interest, 0) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="am-amount" label="Loan Amount" value={amount} onChange={setAmount} placeholder="e.g. 100000" />
        <NumberField id="am-rate" label="Interest Rate" value={rate} onChange={setRate} placeholder="e.g. 6" suffix="%" />
        <NumberField id="am-term" label="Term" value={term} onChange={setTerm} placeholder="e.g. 10" suffix="years" />
      </div>
      {schedule ? (
        <>
          <Formula>Monthly Payment: {fmtMoney(schedule.payment)}</Formula>
          <ResultGrid>
            <ResultRow label="Total Interest" value={fmtMoney(totalInterest)} />
            <ResultRow label="Total Paid" value={fmtMoney(schedule.rows.reduce((s, r) => s + r.payment, 0))} />
          </ResultGrid>
          <div className="max-h-96 overflow-y-auto border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.rows.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell>{row.month}</TableCell>
                    <TableCell>{fmtMoney(row.payment)}</TableCell>
                    <TableCell>{fmtMoney(row.interest)}</TableCell>
                    <TableCell>{fmtMoney(row.principal)}</TableCell>
                    <TableCell>{fmtMoney(row.balance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : null}
    </div>
  )
}

export function CreditCardInterestCalculator() {
  const [balance, setBalance] = useState("")
  const [apr, setApr] = useState("")
  const [payment, setPayment] = useState("")

  const b = parseNum(balance)
  const a = parseNum(apr)
  const p = parseNum(payment)

  const result =
    b != null && a != null && p != null ? simulatePayoff(b, a, p) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="cc-balance" label="Card Balance" value={balance} onChange={setBalance} placeholder="e.g. 5000" />
        <NumberField id="cc-apr" label="APR" value={apr} onChange={setApr} placeholder="e.g. 22" suffix="%" />
        <NumberField id="cc-payment" label="Monthly Payment" value={payment} onChange={setPayment} placeholder="e.g. 250" />
      </div>
      <Formula>Simulate months until balance = 0</Formula>
      <ResultGrid>
        <ResultRow label="Months to Pay Off" value={result ? fmtNum(result.months) : "—"} hint={result ? `≈ ${fmtNum(result.months / 12, 1)} years` : undefined} />
        <ResultRow label="Total Interest Paid" value={fmtMoney(result?.totalInterest)} />
        <ResultRow label="Total Paid" value={b != null && result?.totalInterest != null ? fmtMoney(b + result.totalInterest) : "—"} />
        <ResultRow label="Warning" value={result?.stuck ? "payment doesn't cover interest" : "—"} />
      </ResultGrid>
    </div>
  )
}

export function CreditCardPayoffCalculator() {
  const [balance, setBalance] = useState("")
  const [apr, setApr] = useState("")
  const [months, setMonths] = useState("24")

  const b = parseNum(balance)
  const a = parseNum(apr)
  const m = parseNum(months)

  const payment = b != null && a != null && m != null && m > 0 ? emi(b, a, m) : null
  const total = payment != null && m != null ? payment * m : null
  const interest = total != null && b != null ? total - b : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="ccp-balance" label="Card Balance" value={balance} onChange={setBalance} placeholder="e.g. 5000" />
        <NumberField id="ccp-apr" label="APR" value={apr} onChange={setApr} placeholder="e.g. 22" suffix="%" />
        <NumberField id="ccp-months" label="Target Payoff (months)" value={months} onChange={setMonths} placeholder="e.g. 24" />
      </div>
      <Formula>Payment = EMI over target months</Formula>
      <ResultGrid>
        <ResultRow label="Required Monthly Payment" value={fmtMoney(payment)} />
        <ResultRow label="Total Interest" value={fmtMoney(interest)} />
        <ResultRow label="Total Paid" value={fmtMoney(total)} />
      </ResultGrid>
    </div>
  )
}

interface DebtRow {
  id: number
  name: string
  balance: string
  rate: string
  payment: string
}

export function DebtSnowballCalculator() {
  const [strategy, setStrategy] = useState("snowball")
  const [extra, setExtra] = useState("")
  const [rows, setRows] = useState<DebtRow[]>([
    { id: 1, name: "Card A", balance: "4000", rate: "22", payment: "150" },
    { id: 2, name: "Card B", balance: "2000", rate: "18", payment: "100" },
  ])

  const updateRow = (id: number, patch: Partial<DebtRow>) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)))

  const removeRow = (id: number) =>
    setRows((r) => (r.length > 1 ? r.filter((row) => row.id !== id) : r))

  const addRow = () =>
    setRows((r) => [...r, { id: Date.now() + Math.random(), name: "", balance: "", rate: "", payment: "" }])

  const result = useMemo(() => {
    const parsed = rows
      .map((r) => ({
        name: r.name.trim() || "Debt",
        balance: parseNum(r.balance),
        rate: parseNum(r.rate),
        payment: parseNum(r.payment),
      }))
      .filter((r): r is { name: string; balance: number; rate: number; payment: number } =>
        r.balance != null && r.rate != null && r.payment != null
      )
    if (parsed.length === 0 || parsed.some((d) => d.balance <= 0 || d.payment <= 0)) return null
    const e = parseNum(extra) ?? 0
    const ordered = [...parsed]
    if (strategy === "snowball") ordered.sort((a, b) => a.balance - b.balance)
    else ordered.sort((a, b) => b.rate - a.rate)

    const list = ordered.map((d) => ({ ...d, bal: d.balance }))
    let months = 0
    let totalInterest = 0
    const timeline: { month: number; name: string }[] = []

    while (months < 1200) {
      const active = list.filter((d) => d.bal > 0)
      if (active.length === 0) break
      months++
      const target = active[0]
      for (const d of list) {
        if (d.bal <= 0) continue
        const interest = (d.bal * d.rate) / 100 / 12
        totalInterest += interest
        d.bal += interest
        let payment = d.payment
        if (d === target) payment += e
        if (payment >= d.bal) {
          d.bal = 0
          timeline.push({ month: months, name: d.name })
        } else {
          d.bal -= payment
        }
      }
    }
    const notPaid = list.filter((d) => d.bal > 0)
    if (notPaid.length > 0) return { stuck: true, months, totalInterest, timeline }
    return { stuck: false, months, totalInterest, timeline }
  }, [rows, strategy, extra])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id="ds-strategy"
          label="Strategy"
          value={strategy}
          onChange={setStrategy}
          options={[
            { value: "snowball", label: "Snowball — smallest balance first" },
            { value: "avalanche", label: "Avalanche — highest rate first" },
          ]}
        />
        <NumberField id="ds-extra" label="Extra Monthly Payment" value={extra} onChange={setExtra} placeholder="e.g. 100" />
      </div>
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.id} className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto] sm:items-end">
            <div className="flex flex-col gap-2">
              <Label>Debt</Label>
              <Input value={row.name} placeholder="e.g. Card A" onChange={(e) => updateRow(row.id, { name: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Balance</Label>
              <Input inputMode="decimal" value={row.balance} placeholder="0" onChange={(e) => updateRow(row.id, { balance: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Rate %</Label>
              <Input inputMode="decimal" value={row.rate} placeholder="0" onChange={(e) => updateRow(row.id, { rate: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Min Payment</Label>
              <Input inputMode="decimal" value={row.payment} placeholder="0" onChange={(e) => updateRow(row.id, { payment: e.target.value })} />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Remove debt"
              disabled={rows.length === 1}
              onClick={() => removeRow(row.id)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
      <div>
        <Button type="button" variant="outline" onClick={addRow}>
          Add Debt
        </Button>
      </div>
      <Formula>Pay minimums on all debts, funnel extra into one at a time</Formula>
      {result ? (
        <ResultGrid>
          <ResultRow label="Debt-Free In" value={`${fmtNum(result.months)} months`} hint={result.months ? `≈ ${fmtNum(result.months / 12, 1)} years` : undefined} />
          <ResultRow label="Total Interest" value={fmtMoney(result.totalInterest)} />
          <ResultRow label="Status" value={result.stuck ? "Will not be paid off with current payments" : "Plan complete"} />
        </ResultGrid>
      ) : null}
    </div>
  )
}
