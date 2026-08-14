"use client"

import { useState } from "react"
import { fmtMoney, fmtNum, parseNum } from "@/lib/calc-utils"
import { NumberField, SelectField, ResultGrid, ResultRow, Formula } from "./shared"

export function SalaryCalculator() {
  const [amount, setAmount] = useState("")
  const [period, setPeriod] = useState("annual")
  const [hoursPerWeek, setHoursPerWeek] = useState("40")
  const [daysPerWeek, setDaysPerWeek] = useState("5")

  const a = parseNum(amount)
  const h = parseNum(hoursPerWeek)
  const d = parseNum(daysPerWeek)

  const annual =
    a != null ? (period === "annual" ? a : period === "monthly" ? a * 12 : a * 52)
    : null
  const monthly = annual != null ? annual / 12 : null
  const biweekly = annual != null ? annual / 26 : null
  const weekly = annual != null ? annual / 52 : null
  const daily = annual != null && d ? annual / (52 * d) : null
  const hourly = annual != null && h ? annual / (52 * h) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="sa-amount" label="Salary Amount" value={amount} onChange={setAmount} placeholder="e.g. 60000" />
        <SelectField
          id="sa-period"
          label="Pay Period"
          value={period}
          onChange={setPeriod}
          options={[
            { value: "annual", label: "Per year" },
            { value: "monthly", label: "Per month" },
            { value: "weekly", label: "Per week" },
          ]}
        />
        <NumberField id="sa-hours" label="Hours per Week" value={hoursPerWeek} onChange={setHoursPerWeek} placeholder="e.g. 40" />
        <NumberField id="sa-days" label="Working Days per Week" value={daysPerWeek} onChange={setDaysPerWeek} placeholder="e.g. 5" />
      </div>
      <Formula>Annual = pay × periods per year</Formula>
      <ResultGrid>
        <ResultRow label="Annual" value={fmtMoney(annual)} />
        <ResultRow label="Monthly" value={fmtMoney(monthly)} />
        <ResultRow label="Biweekly" value={fmtMoney(biweekly)} />
        <ResultRow label="Weekly" value={fmtMoney(weekly)} />
        <ResultRow label="Daily" value={fmtMoney(daily)} hint={`${fmtNum(d)} days/week`} />
        <ResultRow label="Hourly" value={fmtMoney(hourly)} hint={`${fmtNum(h)} hours/week`} />
      </ResultGrid>
    </div>
  )
}

export function HourlyWageCalculator() {
  const [salary, setSalary] = useState("")
  const [period, setPeriod] = useState("annual")
  const [hours, setHours] = useState("40")
  const [weeks, setWeeks] = useState("52")

  const s = parseNum(salary)
  const h = parseNum(hours)
  const w = parseNum(weeks)

  const annual = s != null ? (period === "annual" ? s : s * 12) : null
  const hourly = annual != null && h && w ? annual / (w * h) : null
  const weekly = annual != null && w ? annual / w : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="hw-salary" label="Salary Amount" value={salary} onChange={setSalary} placeholder="e.g. 55000" />
        <SelectField
          id="hw-period"
          label="Pay Period"
          value={period}
          onChange={setPeriod}
          options={[
            { value: "annual", label: "Per year" },
            { value: "monthly", label: "Per month" },
          ]}
        />
        <NumberField id="hw-hours" label="Hours per Week" value={hours} onChange={setHours} placeholder="e.g. 40" />
        <NumberField id="hw-weeks" label="Paid Weeks per Year" value={weeks} onChange={setWeeks} placeholder="e.g. 52" />
      </div>
      <Formula>Hourly = Annual ÷ (Weeks × Hours)</Formula>
      <ResultGrid>
        <ResultRow label="Hourly Wage" value={fmtMoney(hourly)} />
        <ResultRow label="Weekly Pay" value={fmtMoney(weekly)} />
        <ResultRow label="Annual Salary" value={fmtMoney(annual)} />
      </ResultGrid>
    </div>
  )
}

export function OvertimeCalculator() {
  const [rate, setRate] = useState("")
  const [regularHours, setRegularHours] = useState("")
  const [otHours, setOtHours] = useState("")
  const [multiplier, setMultiplier] = useState("1.5")

  const r = parseNum(rate)
  const rh = parseNum(regularHours)
  const oh = parseNum(otHours)
  const m = parseNum(multiplier)

  const regularPay = r != null && rh != null ? r * rh : null
  const otPay = r != null && oh != null && m != null ? r * oh * m : null
  const total = regularPay != null && otPay != null ? regularPay + otPay : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="ot-rate" label="Hourly Rate" value={rate} onChange={setRate} placeholder="e.g. 25" />
        <NumberField id="ot-reg" label="Regular Hours" value={regularHours} onChange={setRegularHours} placeholder="e.g. 40" />
        <NumberField id="ot-oh" label="Overtime Hours" value={otHours} onChange={setOtHours} placeholder="e.g. 8" />
        <NumberField id="ot-mult" label="Overtime Multiplier" value={multiplier} onChange={setMultiplier} placeholder="e.g. 1.5" suffix="×" />
      </div>
      <Formula>Overtime Pay = Rate × Overtime Hours × Multiplier</Formula>
      <ResultGrid>
        <ResultRow label="Regular Pay" value={fmtMoney(regularPay)} />
        <ResultRow label="Overtime Pay" value={fmtMoney(otPay)} />
        <ResultRow label="Total Pay" value={fmtMoney(total)} />
      </ResultGrid>
    </div>
  )
}

export function AnnualSalaryCalculator() {
  const [rate, setRate] = useState("")
  const [period, setPeriod] = useState("monthly")
  const [months, setMonths] = useState("12")

  const r = parseNum(rate)
  const m = parseNum(months)

  const annual = r != null ? (period === "monthly" ? r * (m ?? 0) : r * 52) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="as-rate" label="Pay Amount" value={rate} onChange={setRate} placeholder="e.g. 5000" />
        <SelectField
          id="as-period"
          label="Pay Period"
          value={period}
          onChange={setPeriod}
          options={[
            { value: "monthly", label: "Per month" },
            { value: "weekly", label: "Per week" },
          ]}
        />
        {period === "monthly" ? (
          <NumberField id="as-months" label="Paid Months per Year" value={months} onChange={setMonths} placeholder="e.g. 12" />
        ) : null}
      </div>
      <Formula>Annual = Monthly × Months (or Weekly × 52)</Formula>
      <ResultGrid>
        <ResultRow label="Annual Salary" value={fmtMoney(annual)} />
        <ResultRow label="Monthly Equivalent" value={fmtMoney(annual != null ? annual / 12 : null)} />
      </ResultGrid>
    </div>
  )
}

export function MonthlySalaryCalculator() {
  const [annual, setAnnual] = useState("")

  const a = parseNum(annual)
  const monthly = a != null ? a / 12 : null

  return (
    <div className="flex flex-col gap-6">
      <NumberField id="ms-annual" label="Annual Salary" value={annual} onChange={setAnnual} placeholder="e.g. 72000" />
      <Formula>Monthly = Annual ÷ 12</Formula>
      <ResultGrid>
        <ResultRow label="Monthly Salary" value={fmtMoney(monthly)} />
        <ResultRow label="Weekly Equivalent" value={fmtMoney(monthly != null ? monthly / 4.33 : null)} />
      </ResultGrid>
    </div>
  )
}

export function DailyWageCalculator() {
  const [monthly, setMonthly] = useState("")
  const [days, setDays] = useState("26")

  const m = parseNum(monthly)
  const d = parseNum(days)

  const daily = m != null && d ? m / d : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="dw-monthly" label="Monthly Salary" value={monthly} onChange={setMonthly} placeholder="e.g. 52000" />
        <NumberField id="dw-days" label="Working Days per Month" value={days} onChange={setDays} placeholder="e.g. 26" />
      </div>
      <Formula>Daily Wage = Monthly ÷ Working Days</Formula>
      <ResultGrid>
        <ResultRow label="Daily Wage" value={fmtMoney(daily)} />
        <ResultRow label="Monthly Salary" value={fmtMoney(m)} />
      </ResultGrid>
    </div>
  )
}

export function NetSalaryCalculator() {
  const [gross, setGross] = useState("")
  const [tax, setTax] = useState("")
  const [insurance, setInsurance] = useState("")
  const [other, setOther] = useState("")

  const g = parseNum(gross)
  const t = parseNum(tax)
  const i = parseNum(insurance)
  const o = parseNum(other)

  const totalDeductions = (t ?? 0) + (i ?? 0) + (o ?? 0)
  const net = g != null ? g - totalDeductions : null
  const taxPct = g ? ((t ?? 0) / g) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="ns-gross" label="Gross Salary" value={gross} onChange={setGross} placeholder="e.g. 50000" />
        <NumberField id="ns-tax" label="Income Tax" value={tax} onChange={setTax} placeholder="e.g. 5000" />
        <NumberField id="ns-ins" label="Insurance / Social" value={insurance} onChange={setInsurance} placeholder="e.g. 1500" />
        <NumberField id="ns-other" label="Other Deductions" value={other} onChange={setOther} placeholder="e.g. 800" />
      </div>
      <Formula>Net = Gross − (Tax + Insurance + Other)</Formula>
      <ResultGrid>
        <ResultRow label="Total Deductions" value={fmtMoney(totalDeductions)} />
        <ResultRow label="Net Salary" value={fmtMoney(net)} hint={taxPct != null ? `tax is ${fmtNum(taxPct)}% of gross` : undefined} />
      </ResultGrid>
    </div>
  )
}

export function GrossSalaryCalculator() {
  const [net, setNet] = useState("")
  const [deductions, setDeductions] = useState("")

  const n = parseNum(net)
  const d = parseNum(deductions)

  const gross = n != null && d != null ? n + d : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="gs-net" label="Net Salary" value={net} onChange={setNet} placeholder="e.g. 42000" />
        <NumberField id="gs-ded" label="Total Deductions" value={deductions} onChange={setDeductions} placeholder="e.g. 8000" />
      </div>
      <Formula>Gross = Net + Total Deductions</Formula>
      <ResultGrid>
        <ResultRow label="Gross Salary" value={fmtMoney(gross)} />
        <ResultRow label="Net Salary" value={fmtMoney(n)} />
      </ResultGrid>
    </div>
  )
}

export function TakeHomePayCalculator() {
  const [gross, setGross] = useState("")
  const [taxPct, setTaxPct] = useState("")
  const [deductions, setDeductions] = useState("")

  const g = parseNum(gross)
  const tp = parseNum(taxPct)
  const d = parseNum(deductions)

  const tax = g != null && tp != null ? (g * tp) / 100 : null
  const takeHome = g != null ? g - (tax ?? 0) - (d ?? 0) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="th-gross" label="Gross Pay" value={gross} onChange={setGross} placeholder="e.g. 60000" />
        <NumberField id="th-tax" label="Tax Rate" value={taxPct} onChange={setTaxPct} placeholder="e.g. 20" suffix="%" />
        <NumberField id="th-ded" label="Other Deductions" value={deductions} onChange={setDeductions} placeholder="e.g. 2000" />
      </div>
      <Formula>Take-home = Gross − Tax − Deductions</Formula>
      <ResultGrid>
        <ResultRow label="Income Tax" value={fmtMoney(tax)} />
        <ResultRow label="Take-Home Pay" value={fmtMoney(takeHome)} />
      </ResultGrid>
    </div>
  )
}
