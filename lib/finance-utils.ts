export function compoundFV(
  principal: number,
  ratePct: number,
  periodsPerYear: number,
  years: number
): number {
  const r = ratePct / 100 / periodsPerYear
  return principal * Math.pow(1 + r, periodsPerYear * years)
}

export function annuityFV(monthly: number, annualRatePct: number, months: number): number {
  const r = annualRatePct / 100 / 12
  if (r === 0) return monthly * months
  return monthly * ((Math.pow(1 + r, months) - 1) / r)
}

export function annuityFVAdvance(
  monthly: number,
  annualRatePct: number,
  months: number
): number {
  return annuityFV(monthly, annualRatePct, months) * (1 + annualRatePct / 100 / 12)
}

export function emi(principal: number, annualRatePct: number, months: number): number {
  if (months <= 0) return 0
  const r = annualRatePct / 100 / 12
  if (r === 0) return principal / months
  const x = Math.pow(1 + r, months)
  return (principal * r * x) / (x - 1)
}

export function npv(rate: number, cashflows: number[]): number {
  return cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + rate, i), 0)
}

export function irr(cashflows: number[]): number | null {
  if (cashflows.length < 2) return null
  const hasPos = cashflows.some((c) => c > 0)
  const hasNeg = cashflows.some((c) => c < 0)
  if (!hasPos || !hasNeg) return null
  let rate = 0.1
  for (let iter = 0; iter < 200; iter++) {
    const f = npv(rate, cashflows)
    if (Math.abs(f) < 1e-9) return rate
    const df = (npv(rate + 1e-6, cashflows) - f) / 1e-6
    if (Math.abs(df) < 1e-14) return rate
    const next = rate - f / df
    if (!Number.isFinite(next)) return null
    rate = next
  }
  return Number.isFinite(rate) ? rate : null
}

export function xirr(flows: { amount: number; days: number }[]): number | null {
  if (flows.length < 2) return null
  const hasPos = flows.some((f) => f.amount > 0)
  const hasNeg = flows.some((f) => f.amount < 0)
  if (!hasPos || !hasNeg) return null
  const npvDays = (rate: number) =>
    flows.reduce((acc, f) => acc + f.amount / Math.pow(1 + rate, f.days / 365), 0)
  let rate = 0.1
  for (let iter = 0; iter < 200; iter++) {
    const f = npvDays(rate)
    if (Math.abs(f) < 1e-9) return rate
    const df = (npvDays(rate + 1e-6) - f) / 1e-6
    if (Math.abs(df) < 1e-14) return rate
    const next = rate - f / df
    if (!Number.isFinite(next)) return null
    rate = next
  }
  return Number.isFinite(rate) ? rate : null
}

export function monthsToReachGoal(
  current: number,
  monthly: number,
  annualRatePct: number,
  goal: number
): number | null {
  if (goal <= current) return 0
  const r = annualRatePct / 100 / 12
  if (r === 0) {
    if (monthly <= 0) return null
    return Math.ceil((goal - current) / monthly)
  }
  const X = (goal + monthly / r) / (current + monthly / r)
  if (X <= 1) return monthly > 0 ? Math.ceil((goal - current) / monthly) : null
  const n = Math.log(X) / Math.log(1 + r)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.ceil(n)
}
