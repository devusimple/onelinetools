"use client"

import { useMemo, useState } from "react"
import { fmtMoney, fmtNum, fmtPct, parseNum } from "@/lib/calc-utils"
import { NumberField, SelectField, ResultGrid, ResultRow, Formula } from "./shared"

export function MarkupCalculator() {
  const [mode, setMode] = useState("from-percent")
  const [cost, setCost] = useState("")
  const [a, setA] = useState("")

  const costN = parseNum(cost)
  const aN = parseNum(a)

  const result = useMemo(() => {
    if (costN == null || aN == null) return null
    if (mode === "from-percent") {
      const price = costN * (1 + aN / 100)
      const markup = price - costN
      return {
        price,
        markup,
        percent: aN,
        extra: [
          { label: "Selling Price", value: fmtMoney(price) },
          { label: "Markup Amount", value: fmtMoney(markup) },
          { label: "Margin", value: fmtPct((markup / price) * 100) },
        ],
      }
    }
    const price = costN + aN
    const percent = costN ? (aN / costN) * 100 : null
    return {
      price,
      markup: aN,
      percent,
      extra: [
        { label: "Selling Price", value: fmtMoney(price) },
        { label: "Markup %", value: fmtPct(percent) },
        { label: "Margin", value: fmtPct((aN / price) * 100) },
      ],
    }
  }, [mode, costN, aN])

  return (
    <div className="flex flex-col gap-6">
      <SelectField
        id="mk-mode"
        label="Mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: "from-percent", label: "Find price from cost + markup %" },
          { value: "from-amount", label: "Find markup % from cost + price" },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="mk-cost" label="Cost Price" value={cost} onChange={setCost} placeholder="e.g. 80" />
        <NumberField
          id="mk-a"
          label={mode === "from-percent" ? "Markup %" : "Selling Price"}
          value={a}
          onChange={setA}
          placeholder="e.g. 25"
          suffix={mode === "from-percent" ? "%" : undefined}
        />
      </div>
      {result ? (
        <>
          <Formula>Markup % = (Price − Cost) ÷ Cost × 100</Formula>
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

export function MarginCalculator() {
  const [mode, setMode] = useState("from-price")
  const [cost, setCost] = useState("")
  const [a, setA] = useState("")

  const costN = parseNum(cost)
  const aN = parseNum(a)

  const result = useMemo(() => {
    if (costN == null || aN == null) return null
    if (mode === "from-price") {
      if (aN >= 100) return null
      const price = costN / (1 - aN / 100)
      const profit = price - costN
      return {
        extra: [
          { label: "Selling Price", value: fmtMoney(price) },
          { label: "Profit", value: fmtMoney(profit) },
          { label: "Markup", value: fmtPct((profit / costN) * 100) },
        ],
      }
    }
    const price = aN
    const margin = price ? ((price - costN) / price) * 100 : null
    return {
      extra: [
        { label: "Margin %", value: fmtPct(margin) },
        { label: "Profit", value: fmtMoney(price - costN) },
        { label: "Markup", value: fmtPct(price !== costN ? ((price - costN) / costN) * 100 : null) },
      ],
    }
  }, [mode, costN, aN])

  return (
    <div className="flex flex-col gap-6">
      <SelectField
        id="mg-mode"
        label="Mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: "from-price", label: "Find price from cost + margin %" },
          { value: "from-cost", label: "Find margin % from cost + price" },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="mg-cost" label="Cost Price" value={cost} onChange={setCost} placeholder="e.g. 60" />
        <NumberField
          id="mg-a"
          label={mode === "from-price" ? "Margin %" : "Selling Price"}
          value={a}
          onChange={setA}
          placeholder="e.g. 40"
          suffix={mode === "from-price" ? "%" : undefined}
        />
      </div>
      {result ? (
        <>
          <Formula>Margin % = (Price − Cost) ÷ Price × 100</Formula>
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

export function ProfitCalculator() {
  const [revenue, setRevenue] = useState("")
  const [cost, setCost] = useState("")

  const r = parseNum(revenue)
  const c = parseNum(cost)
  const profit = r != null && c != null ? r - c : null
  const margin = profit != null && r ? (profit / r) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="pf-rev" label="Revenue" value={revenue} onChange={setRevenue} placeholder="e.g. 5000" />
        <NumberField id="pf-cost" label="Total Costs" value={cost} onChange={setCost} placeholder="e.g. 3200" />
      </div>
      <Formula>Profit = Revenue − Total Costs</Formula>
      <ResultGrid>
        <ResultRow label="Profit" value={fmtMoney(profit)} hint={profit != null && profit < 0 ? "This is a loss" : undefined} />
        <ResultRow label="Profit Margin" value={fmtPct(margin)} hint="profit ÷ revenue" />
      </ResultGrid>
    </div>
  )
}

export function LossCalculator() {
  const [cost, setCost] = useState("")
  const [sell, setSell] = useState("")

  const c = parseNum(cost)
  const s = parseNum(sell)
  const loss = c != null && s != null ? c - s : null
  const pct = loss != null && c ? (loss / c) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="ls-cost" label="Cost Price" value={cost} onChange={setCost} placeholder="e.g. 1000" />
        <NumberField id="ls-sell" label="Selling Price" value={sell} onChange={setSell} placeholder="e.g. 850" />
      </div>
      <Formula>Loss = Cost − Selling Price</Formula>
      <ResultGrid>
        <ResultRow label="Loss Amount" value={fmtMoney(loss)} hint={loss != null && loss < 0 ? "No loss — this is a profit" : undefined} />
        <ResultRow label="Loss %" value={fmtPct(pct)} hint="loss ÷ cost" />
      </ResultGrid>
    </div>
  )
}

export function BreakEvenCalculator() {
  const [fixed, setFixed] = useState("")
  const [price, setPrice] = useState("")
  const [variable, setVariable] = useState("")

  const f = parseNum(fixed)
  const p = parseNum(price)
  const v = parseNum(variable)

  const contribution = p != null && v != null ? p - v : null
  const units = contribution && contribution > 0 && f != null ? Math.ceil(f / contribution) : null
  const revenue = units != null && p != null ? units * p : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="be-fixed" label="Fixed Costs" value={fixed} onChange={setFixed} placeholder="e.g. 10000" />
        <NumberField id="be-price" label="Price per Unit" value={price} onChange={setPrice} placeholder="e.g. 50" />
        <NumberField id="be-var" label="Variable Cost per Unit" value={variable} onChange={setVariable} placeholder="e.g. 30" />
      </div>
      <Formula>Break-even Units = Fixed Costs ÷ (Price − Variable Cost)</Formula>
      <ResultGrid>
        <ResultRow label="Contribution per Unit" value={fmtMoney(contribution)} />
        <ResultRow label="Break-even Units" value={fmtNum(units)} hint="units to sell" />
        <ResultRow label="Break-even Revenue" value={fmtMoney(revenue)} />
      </ResultGrid>
    </div>
  )
}

export function UnitPriceCalculator() {
  const [total, setTotal] = useState("")
  const [units, setUnits] = useState("")

  const t = parseNum(total)
  const u = parseNum(units)
  const unit = t != null && u ? t / u : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="up-total" label="Total Cost" value={total} onChange={setTotal} placeholder="e.g. 120" />
        <NumberField id="up-units" label="Number of Units" value={units} onChange={setUnits} placeholder="e.g. 24" />
      </div>
      <Formula>Unit Price = Total Cost ÷ Units</Formula>
      <ResultGrid>
        <ResultRow label="Unit Price" value={fmtMoney(unit)} hint={t != null && u ? `${fmtNum(u)} units` : undefined} />
        <ResultRow label="Total Cost" value={fmtMoney(t)} />
      </ResultGrid>
    </div>
  )
}

export function PricePerQuantityCalculator() {
  const [total, setTotal] = useState("")
  const [qty, setQty] = useState("")
  const [qtyUnit, setQtyUnit] = useState("1")

  const t = parseNum(total)
  const q = parseNum(qty)
  const per = t != null && q ? t / q : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="pq-total" label="Total Price" value={total} onChange={setTotal} placeholder="e.g. 36" />
        <NumberField id="pq-qty" label="Quantity" value={qty} onChange={setQty} placeholder="e.g. 12" />
      </div>
      <SelectField
        id="pq-unit"
        label="Quantity Unit"
        value={qtyUnit}
        onChange={setQtyUnit}
        options={[
          { value: "1", label: "Per item" },
          { value: "kg", label: "Per kilogram" },
          { value: "g", label: "Per gram" },
          { value: "L", label: "Per liter" },
          { value: "mL", label: "Per milliliter" },
          { value: "m", label: "Per meter" },
          { value: "m2", label: "Per square meter" },
        ]}
      />
      <Formula>Price per unit = Total Price ÷ Quantity</Formula>
      <ResultGrid>
        <ResultRow
          label={`Price per ${qtyUnit === "1" ? "item" : qtyUnit}`}
          value={fmtMoney(per)}
          hint={t != null && q ? `${fmtNum(q)} × price` : undefined}
        />
        <ResultRow label="Total Price" value={fmtMoney(t)} />
      </ResultGrid>
    </div>
  )
}
