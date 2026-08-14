"use client"

import { useState } from "react"
import { fmtMoney, parseNum } from "@/lib/calc-utils"
import { NumberField, SelectField, ResultGrid, ResultRow, Formula } from "./shared"

export function SplitBillCalculator() {
  const [total, setTotal] = useState("")
  const [people, setPeople] = useState("")
  const [tipPct, setTipPct] = useState("10")

  const t = parseNum(total)
  const p = parseNum(people)
  const tip = parseNum(tipPct)

  const tipAmt = t != null && tip != null ? (t * tip) / 100 : null
  const grand = t != null && tipAmt != null ? t + tipAmt : null
  const perPerson = grand != null && p ? grand / p : null
  const perPersonNoTip = t != null && p ? t / p : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="sb-total" label="Total Bill" value={total} onChange={setTotal} placeholder="e.g. 240" />
        <NumberField id="sb-people" label="Number of People" value={people} onChange={setPeople} placeholder="e.g. 4" />
        <NumberField id="sb-tip" label="Tip %" value={tipPct} onChange={setTipPct} placeholder="e.g. 10" suffix="%" />
      </div>
      <Formula>Per person = (Total + Tip) ÷ People</Formula>
      <ResultGrid>
        <ResultRow label="Tip Amount" value={fmtMoney(tipAmt)} />
        <ResultRow label="Total with Tip" value={fmtMoney(grand)} />
        <ResultRow label="Per Person" value={fmtMoney(perPerson)} hint="including tip" />
        <ResultRow label="Per Person (no tip)" value={fmtMoney(perPersonNoTip)} />
      </ResultGrid>
    </div>
  )
}

export function TipCalculator() {
  const [bill, setBill] = useState("")
  const [tipPct, setTipPct] = useState("15")
  const [people, setPeople] = useState("1")

  const b = parseNum(bill)
  const tp = parseNum(tipPct)
  const p = parseNum(people)

  const tip = b != null && tp != null ? (b * tp) / 100 : null
  const total = b != null && tip != null ? b + tip : null
  const perPerson = total != null && p ? total / p : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="tip-bill" label="Bill Amount" value={bill} onChange={setBill} placeholder="e.g. 80" />
        <NumberField id="tip-pct" label="Tip %" value={tipPct} onChange={setTipPct} placeholder="e.g. 15" suffix="%" />
        <NumberField id="tip-people" label="People" value={people} onChange={setPeople} placeholder="e.g. 2" />
      </div>
      <Formula>Tip = Bill × Tip% ÷ 100</Formula>
      <ResultGrid>
        <ResultRow label="Tip Amount" value={fmtMoney(tip)} />
        <ResultRow label="Total Bill" value={fmtMoney(total)} />
        <ResultRow label="Per Person" value={fmtMoney(perPerson)} hint="total ÷ people" />
      </ResultGrid>
    </div>
  )
}

export function DiscountCalculator() {
  const [price, setPrice] = useState("")
  const [pct, setPct] = useState("")

  const p = parseNum(price)
  const d = parseNum(pct)

  const savings = p != null && d != null ? (p * d) / 100 : null
  const finalPrice = p != null && savings != null ? p - savings : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="dc-price" label="Original Price" value={price} onChange={setPrice} placeholder="e.g. 200" />
        <NumberField id="dc-pct" label="Discount %" value={pct} onChange={setPct} placeholder="e.g. 25" suffix="%" />
      </div>
      <Formula>You Pay = Price × (100 − Discount%) ÷ 100</Formula>
      <ResultGrid>
        <ResultRow label="You Save" value={fmtMoney(savings)} />
        <ResultRow label="Final Price" value={fmtMoney(finalPrice)} />
      </ResultGrid>
    </div>
  )
}

export function SalePriceCalculator() {
  const [price, setPrice] = useState("")
  const [pct, setPct] = useState("")

  const p = parseNum(price)
  const d = parseNum(pct)

  const salePrice = p != null && d != null ? p - (p * d) / 100 : null
  const savings = p != null && salePrice != null ? p - salePrice : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="sp-price" label="Original Price" value={price} onChange={setPrice} placeholder="e.g. 500" />
        <NumberField id="sp-pct" label="Discount %" value={pct} onChange={setPct} placeholder="e.g. 30" suffix="%" />
      </div>
      <Formula>Sale Price = Original × (100 − Discount%) ÷ 100</Formula>
      <ResultGrid>
        <ResultRow label="Sale Price" value={fmtMoney(salePrice)} />
        <ResultRow label="Amount Saved" value={fmtMoney(savings)} />
      </ResultGrid>
    </div>
  )
}

export function OriginalPriceCalculator() {
  const [salePrice, setSalePrice] = useState("")
  const [pct, setPct] = useState("")

  const s = parseNum(salePrice)
  const d = parseNum(pct)

  const original = s != null && d != null && d < 100 ? s / (1 - d / 100) : null
  const savings = original != null && s != null ? original - s : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="op-sale" label="Sale Price" value={salePrice} onChange={setSalePrice} placeholder="e.g. 350" />
        <NumberField id="op-pct" label="Discount %" value={pct} onChange={setPct} placeholder="e.g. 30" suffix="%" />
      </div>
      <Formula>Original Price = Sale ÷ (100 − Discount%) × 100</Formula>
      <ResultGrid>
        <ResultRow label="Original Price" value={fmtMoney(original)} hint={d != null && d >= 100 ? "Discount must be < 100%" : undefined} />
        <ResultRow label="Amount Saved" value={fmtMoney(savings)} />
      </ResultGrid>
    </div>
  )
}

export function TaxCalculator() {
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("8")

  const a = parseNum(amount)
  const r = parseNum(rate)

  const tax = a != null && r != null ? (a * r) / 100 : null
  const total = a != null && tax != null ? a + tax : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="tx-amount" label="Amount" value={amount} onChange={setAmount} placeholder="e.g. 1000" />
        <NumberField id="tx-rate" label="Tax Rate" value={rate} onChange={setRate} placeholder="e.g. 8" suffix="%" />
      </div>
      <Formula>Tax = Amount × Rate ÷ 100</Formula>
      <ResultGrid>
        <ResultRow label="Tax Amount" value={fmtMoney(tax)} />
        <ResultRow label="Total (with tax)" value={fmtMoney(total)} />
      </ResultGrid>
    </div>
  )
}

export function GSTCalculator() {
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("18")
  const [mode, setMode] = useState("exclusive")

  const a = parseNum(amount)
  const r = parseNum(rate)

  const gst = a != null && r != null ? (mode === "exclusive" ? (a * r) / 100 : (a * r) / (100 + r)) : null
  const net = a != null ? (mode === "exclusive" ? a : a - gst!) : null
  const gross = a != null && gst != null ? (mode === "exclusive" ? a + gst : a) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="gst-amount" label={mode === "exclusive" ? "Net Amount" : "Gross Amount"} value={amount} onChange={setAmount} placeholder="e.g. 1000" />
        <NumberField id="gst-rate" label="GST Rate" value={rate} onChange={setRate} placeholder="e.g. 18" suffix="%" />
      </div>
      <SelectField
        id="gst-mode"
        label="Amount Includes GST?"
        value={mode}
        onChange={setMode}
        options={[
          { value: "exclusive", label: "No — GST is extra" },
          { value: "inclusive", label: "Yes — GST included" },
        ]}
      />
      <Formula>{mode === "exclusive" ? "GST = Net × Rate ÷ 100" : "GST = Gross × Rate ÷ (100 + Rate)"}</Formula>
      <ResultGrid>
        <ResultRow label="GST Amount" value={fmtMoney(gst)} />
        <ResultRow label="Net Amount" value={fmtMoney(net)} />
        <ResultRow label="Gross Amount" value={fmtMoney(gross)} />
      </ResultGrid>
    </div>
  )
}

export function VATCalculator() {
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("20")
  const [mode, setMode] = useState("exclusive")

  const a = parseNum(amount)
  const r = parseNum(rate)

  const vat = a != null && r != null ? (mode === "exclusive" ? (a * r) / 100 : (a * r) / (100 + r)) : null
  const net = a != null ? (mode === "exclusive" ? a : a - vat!) : null
  const gross = a != null && vat != null ? (mode === "exclusive" ? a + vat : a) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="vat-amount" label={mode === "exclusive" ? "Net Amount" : "Gross Amount"} value={amount} onChange={setAmount} placeholder="e.g. 500" />
        <NumberField id="vat-rate" label="VAT Rate" value={rate} onChange={setRate} placeholder="e.g. 20" suffix="%" />
      </div>
      <SelectField
        id="vat-mode"
        label="Amount Includes VAT?"
        value={mode}
        onChange={setMode}
        options={[
          { value: "exclusive", label: "No — VAT is extra" },
          { value: "inclusive", label: "Yes — VAT included" },
        ]}
      />
      <Formula>{mode === "exclusive" ? "VAT = Net × Rate ÷ 100" : "VAT = Gross × Rate ÷ (100 + Rate)"}</Formula>
      <ResultGrid>
        <ResultRow label="VAT Amount" value={fmtMoney(vat)} />
        <ResultRow label="Net Amount" value={fmtMoney(net)} />
        <ResultRow label="Gross Amount" value={fmtMoney(gross)} />
      </ResultGrid>
    </div>
  )
}

export function ServiceChargeCalculator() {
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("10")

  const a = parseNum(amount)
  const r = parseNum(rate)

  const charge = a != null && r != null ? (a * r) / 100 : null
  const total = a != null && charge != null ? a + charge : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="sc-amount" label="Bill Amount" value={amount} onChange={setAmount} placeholder="e.g. 2000" />
        <NumberField id="sc-rate" label="Service Charge %" value={rate} onChange={setRate} placeholder="e.g. 10" suffix="%" />
      </div>
      <Formula>Charge = Amount × Rate ÷ 100</Formula>
      <ResultGrid>
        <ResultRow label="Service Charge" value={fmtMoney(charge)} />
        <ResultRow label="Total to Pay" value={fmtMoney(total)} />
      </ResultGrid>
    </div>
  )
}

export function CommissionCalculator() {
  const [amount, setAmount] = useState("")
  const [rate, setRate] = useState("5")
  const [base, setBase] = useState("")

  const a = parseNum(amount)
  const r = parseNum(rate)
  const b = parseNum(base)

  const onSales = a != null && r != null ? (a * r) / 100 : null
  const total = onSales != null ? onSales + (b ?? 0) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="cm-amount" label="Sales Amount" value={amount} onChange={setAmount} placeholder="e.g. 50000" />
        <NumberField id="cm-rate" label="Commission Rate %" value={rate} onChange={setRate} placeholder="e.g. 5" suffix="%" />
        <NumberField id="cm-base" label="Base Salary (optional)" value={base} onChange={setBase} placeholder="e.g. 2000" />
      </div>
      <Formula>Commission = Sales × Rate ÷ 100</Formula>
      <ResultGrid>
        <ResultRow label="Commission Earned" value={fmtMoney(onSales)} />
        <ResultRow label="Total Earnings" value={fmtMoney(total)} hint="commission + base salary" />
      </ResultGrid>
    </div>
  )
}
