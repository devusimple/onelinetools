"use client"

import { useMemo, useState } from "react"
import { fmtMoney, fmtNum, parseNum } from "@/lib/calc-utils"
import { NumberField, ListField, ResultGrid, ResultRow, Formula } from "./shared"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"

interface CostItem {
  id: number
  name: string
  amount: string
}

const newItem = (): CostItem => ({ id: Date.now() + Math.random(), name: "", amount: "" })

export function ExpenseCalculator() {
  const [income, setIncome] = useState("")
  const [input, setInput] = useState("")

  const amounts = useMemo(
    () =>
      input
        .split(/[\n,;\s]+/)
        .map((t) => t.trim())
        .filter(Boolean)
        .map(Number)
        .filter((n) => Number.isFinite(n)),
    [input]
  )
  const total = amounts.reduce((a, b) => a + b, 0)
  const average = amounts.length ? total / amounts.length : null
  const inc = parseNum(income)
  const pct = inc ? (total / inc) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <NumberField id="ex-income" label="Monthly Income (optional)" value={income} onChange={setIncome} placeholder="e.g. 5000" />
      <ListField
        id="ex-list"
        label="Expense Amounts"
        value={input}
        onChange={setInput}
        placeholder={"e.g.\n500\n1200\n350"}
      />
      <Formula>Total = Σ expenses</Formula>
      <ResultGrid>
        <ResultRow label="Total Expenses" value={fmtMoney(total)} hint={`${amounts.length} items`} />
        <ResultRow label="Average Expense" value={fmtMoney(average)} />
        <ResultRow label="% of Income" value={pct != null ? `${fmtNum(pct)}%` : "—"} hint={inc != null ? "expenses ÷ income" : "add income to see %" } />
        <ResultRow label="Remaining Income" value={inc != null ? fmtMoney(inc - total) : "—"} />
      </ResultGrid>
    </div>
  )
}

export function BudgetCalculator() {
  const [income, setIncome] = useState("")
  const [expenses, setExpenses] = useState("")
  const [savingsGoal, setSavingsGoal] = useState("")

  const i = parseNum(income)
  const e = parseNum(expenses)
  const g = parseNum(savingsGoal)

  const remaining = i != null && e != null ? i - e : null
  const pct = i ? ((e ?? 0) / i) * 100 : null
  const onTrack = remaining != null && g != null ? remaining - g : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="bg-income" label="Monthly Income" value={income} onChange={setIncome} placeholder="e.g. 6000" />
        <NumberField id="bg-exp" label="Monthly Expenses" value={expenses} onChange={setExpenses} placeholder="e.g. 4200" />
        <NumberField id="bg-goal" label="Monthly Savings Goal (optional)" value={savingsGoal} onChange={setSavingsGoal} placeholder="e.g. 800" />
      </div>
      <Formula>Surplus = Income − Expenses</Formula>
      <ResultGrid>
        <ResultRow label="Surplus / Deficit" value={fmtMoney(remaining)} hint={remaining != null && remaining < 0 ? "you are overspending" : undefined} />
        <ResultRow label="Expense Ratio" value={pct != null ? `${fmtNum(pct)}%` : "—"} hint="expenses ÷ income" />
        <ResultRow label="vs Savings Goal" value={onTrack != null ? fmtMoney(onTrack) : "—"} hint={onTrack != null ? (onTrack >= 0 ? "on track" : "short of goal") : undefined} />
      </ResultGrid>
    </div>
  )
}

export function SavingsCalculator() {
  const [income, setIncome] = useState("")
  const [expenses, setExpenses] = useState("")
  const [months, setMonths] = useState("12")

  const i = parseNum(income)
  const e = parseNum(expenses)
  const m = parseNum(months)

  const monthly = i != null && e != null ? i - e : null
  const total = monthly != null && m != null ? monthly * m : null
  const rate = i ? ((monthly ?? 0) / i) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="sv-income" label="Monthly Income" value={income} onChange={setIncome} placeholder="e.g. 5000" />
        <NumberField id="sv-exp" label="Monthly Expenses" value={expenses} onChange={setExpenses} placeholder="e.g. 3500" />
        <NumberField id="sv-months" label="Duration (months)" value={months} onChange={setMonths} placeholder="e.g. 12" />
      </div>
      <Formula>Saved = (Income − Expenses) × Months</Formula>
      <ResultGrid>
        <ResultRow label="Monthly Savings" value={fmtMoney(monthly)} />
        <ResultRow label="Total Saved" value={fmtMoney(total)} hint={`${fmtNum(m ?? 0)} months`} />
        <ResultRow label="Savings Rate" value={rate != null ? `${fmtNum(rate)}%` : "—"} hint="savings ÷ income" />
      </ResultGrid>
    </div>
  )
}

export function CostCalculator() {
  const [items, setItems] = useState<CostItem[]>([newItem(), newItem(), newItem()])

  const updateItem = (id: number, patch: Partial<CostItem>) =>
    setItems((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  const removeItem = (id: number) => setItems((rows) => rows.filter((r) => r.id !== id))

  const totals = useMemo(() => {
    let sum = 0
    let count = 0
    for (const item of items) {
      const n = parseNum(item.amount)
      if (n != null) {
        sum += n
        count++
      }
    }
    return { sum, count }
  }, [items])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <div className="flex flex-col gap-2">
              <Label>Item</Label>
              <Input
                value={item.name}
                placeholder="e.g. Materials"
                onChange={(e) => updateItem(item.id, { name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Cost</Label>
              <Input
                inputMode="decimal"
                className="sm:w-36"
                value={item.amount}
                placeholder="0.00"
                onChange={(e) => updateItem(item.id, { amount: e.target.value })}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Remove item"
              onClick={() => removeItem(item.id)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => setItems((rows) => [...rows, newItem()])}>
          Add Item
        </Button>
      </div>
      <Formula>Total Cost = Σ item costs</Formula>
      <ResultGrid>
        <ResultRow label="Total Cost" value={fmtMoney(totals.sum)} hint={`${totals.count} costed items`} />
        <ResultRow label="Average Item Cost" value={fmtMoney(totals.count ? totals.sum / totals.count : null)} />
      </ResultGrid>
    </div>
  )
}
