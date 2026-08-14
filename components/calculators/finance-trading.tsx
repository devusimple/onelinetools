"use client"

import { useState } from "react"
import { fmtMoney, fmtNum, fmtPct, parseNum } from "@/lib/calc-utils"
import { NumberField, ResultGrid, ResultRow, Formula } from "./shared"

export function StockProfitCalculator() {
  const [shares, setShares] = useState("")
  const [buy, setBuy] = useState("")
  const [sell, setSell] = useState("")
  const [commission, setCommission] = useState("")

  const s = parseNum(shares)
  const b = parseNum(buy)
  const e = parseNum(sell)
  const c = parseNum(commission) ?? 0

  const cost = s != null && b != null ? s * b : null
  const proceeds = s != null && e != null ? s * e : null
  const gross = cost != null && proceeds != null ? proceeds - cost : null
  const net = gross != null ? gross - c : null
  const pct = cost != null && net != null && cost !== 0 ? (net / cost) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="sp-shares" label="Shares" value={shares} onChange={setShares} placeholder="e.g. 100" />
        <NumberField id="sp-buy" label="Buy Price" value={buy} onChange={setBuy} placeholder="e.g. 45" />
        <NumberField id="sp-sell" label="Sell Price" value={sell} onChange={setSell} placeholder="e.g. 52" />
        <NumberField id="sp-commission" label="Total Commission (optional)" value={commission} onChange={setCommission} placeholder="e.g. 10" />
      </div>
      <Formula>Profit = (Sell − Buy) × Shares − Commission</Formula>
      <ResultGrid>
        <ResultRow label="Net Profit" value={fmtMoney(net)} hint={net != null && net < 0 ? "this is a loss" : undefined} />
        <ResultRow label="Return" value={fmtPct(pct)} />
        <ResultRow label="Total Cost" value={fmtMoney(cost)} />
        <ResultRow label="Total Proceeds" value={fmtMoney(proceeds)} />
      </ResultGrid>
    </div>
  )
}

export function CryptoProfitCalculator() {
  const [amount, setAmount] = useState("")
  const [buy, setBuy] = useState("")
  const [sell, setSell] = useState("")
  const [fees, setFees] = useState("")

  const a = parseNum(amount)
  const b = parseNum(buy)
  const e = parseNum(sell)
  const f = parseNum(fees) ?? 0

  const cost = a != null && b != null ? a * b : null
  const proceeds = a != null && e != null ? a * e : null
  const gross = cost != null && proceeds != null ? proceeds - cost : null
  const net = gross != null ? gross - f : null
  const pct = cost != null && net != null && cost !== 0 ? (net / cost) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="cp-amount" label="Amount (coins/tokens)" value={amount} onChange={setAmount} placeholder="e.g. 0.5" />
        <NumberField id="cp-buy" label="Buy Price" value={buy} onChange={setBuy} placeholder="e.g. 40000" />
        <NumberField id="cp-sell" label="Sell Price" value={sell} onChange={setSell} placeholder="e.g. 52000" />
        <NumberField id="cp-fees" label="Total Fees (optional)" value={fees} onChange={setFees} placeholder="e.g. 15" />
      </div>
      <Formula>Profit = (Sell − Buy) × Amount − Fees</Formula>
      <ResultGrid>
        <ResultRow label="Net Profit" value={fmtMoney(net)} hint={net != null && net < 0 ? "this is a loss" : undefined} />
        <ResultRow label="ROI" value={fmtPct(pct)} />
        <ResultRow label="Cost Basis" value={fmtMoney(cost)} />
        <ResultRow label="Proceeds" value={fmtMoney(proceeds)} />
      </ResultGrid>
    </div>
  )
}

export function ForexProfitCalculator() {
  const [lots, setLots] = useState("")
  const [pipValue, setPipValue] = useState("10")
  const [pips, setPips] = useState("")

  const l = parseNum(lots)
  const pv = parseNum(pipValue)
  const p = parseNum(pips)

  const profit = l != null && pv != null && p != null ? l * pv * p : null
  const riskPips = p != null ? Math.abs(p) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="fx-lots" label="Position Size (lots)" value={lots} onChange={setLots} placeholder="e.g. 1" />
        <NumberField id="fx-pips" label="Pips Gained / Lost" value={pips} onChange={setPips} placeholder="e.g. 50" />
        <NumberField id="fx-pipvalue" label="Pip Value per Lot" value={pipValue} onChange={setPipValue} placeholder="e.g. 10" />
      </div>
      <Formula>Profit = Lots × Pips × Pip Value</Formula>
      <ResultGrid>
        <ResultRow label="Profit / Loss" value={fmtMoney(profit)} hint={riskPips != null ? `${fmtNum(riskPips)} pips` : undefined} />
        <ResultRow label="Pip Value per Lot" value={fmtMoney(pv)} />
      </ResultGrid>
    </div>
  )
}

export function PositionSizeCalculator() {
  const [balance, setBalance] = useState("")
  const [riskPct, setRiskPct] = useState("1")
  const [stopDistance, setStopDistance] = useState("")

  const b = parseNum(balance)
  const r = parseNum(riskPct)
  const d = parseNum(stopDistance)

  const riskAmount = b != null && r != null ? (b * r) / 100 : null
  const units = riskAmount != null && d != null && d !== 0 ? riskAmount / d : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="ps-balance" label="Account Balance" value={balance} onChange={setBalance} placeholder="e.g. 10000" />
        <NumberField id="ps-risk" label="Risk per Trade" value={riskPct} onChange={setRiskPct} placeholder="e.g. 1" suffix="%" />
        <NumberField id="ps-stop" label="Stop Loss Distance (per unit)" value={stopDistance} onChange={setStopDistance} placeholder="e.g. 2" />
      </div>
      <Formula>Position Size = (Balance × Risk%) ÷ Stop Distance</Formula>
      <ResultGrid>
        <ResultRow label="Position Size (units/shares)" value={fmtNum(units)} hint={units != null ? `≈ ${fmtNum(units, 2)}` : undefined} />
        <ResultRow label="Dollar Risk" value={fmtMoney(riskAmount)} />
      </ResultGrid>
    </div>
  )
}

export function RiskRewardCalculator() {
  const [entry, setEntry] = useState("")
  const [stop, setStop] = useState("")
  const [target, setTarget] = useState("")

  const en = parseNum(entry)
  const st = parseNum(stop)
  const tg = parseNum(target)

  const risk = en != null && st != null ? Math.abs(en - st) : null
  const reward = en != null && tg != null ? Math.abs(tg - en) : null
  const ratio = risk != null && risk !== 0 && reward != null ? reward / risk : null
  const riskPct = risk != null && en != null && en !== 0 ? (risk / Math.abs(en)) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="rr-entry" label="Entry Price" value={entry} onChange={setEntry} placeholder="e.g. 100" />
        <NumberField id="rr-stop" label="Stop Loss Price" value={stop} onChange={setStop} placeholder="e.g. 95" />
        <NumberField id="rr-target" label="Take Profit Price" value={target} onChange={setTarget} placeholder="e.g. 115" />
      </div>
      <Formula>R:R = Reward ÷ Risk</Formula>
      <ResultGrid>
        <ResultRow label="Risk / Reward Ratio" value={ratio != null ? `1 : ${fmtNum(ratio, 2)}` : "—"} />
        <ResultRow label="Risk (per unit)" value={fmtNum(risk)} hint={riskPct != null ? `${fmtPct(riskPct)} of entry` : undefined} />
        <ResultRow label="Reward (per unit)" value={fmtNum(reward)} />
      </ResultGrid>
    </div>
  )
}

export function CompoundTradingCalculator() {
  const [capital, setCapital] = useState("")
  const [returnPct, setReturnPct] = useState("")
  const [trades, setTrades] = useState("")

  const c = parseNum(capital)
  const r = parseNum(returnPct)
  const n = parseNum(trades)

  const fv = c != null && r != null && n != null ? c * Math.pow(1 + r / 100, n) : null
  const profit = fv != null && c != null ? fv - c : null
  const totalReturn = c != null && fv != null && c !== 0 ? ((fv - c) / c) * 100 : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="ct-capital" label="Starting Capital" value={capital} onChange={setCapital} placeholder="e.g. 1000" />
        <NumberField id="ct-return" label="Return per Trade" value={returnPct} onChange={setReturnPct} placeholder="e.g. 5" suffix="%" />
        <NumberField id="ct-trades" label="Number of Trades" value={trades} onChange={setTrades} placeholder="e.g. 20" />
      </div>
      <Formula>FV = Capital × (1 + return%)^trades</Formula>
      <ResultGrid>
        <ResultRow label="Final Value" value={fmtMoney(fv)} />
        <ResultRow label="Total Profit" value={fmtMoney(profit)} />
        <ResultRow label="Total Return" value={fmtPct(totalReturn, 2)} />
      </ResultGrid>
    </div>
  )
}
