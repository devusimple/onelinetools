"use client"

import { useMemo, useState } from "react"
import { fmtNum, gcd, parseNum, simplifyFraction } from "@/lib/calc-utils"
import { NumberField, SelectField, ResultGrid, ResultRow, Formula } from "./shared"

export function FractionCalculator() {
  const [n1, setN1] = useState("")
  const [d1, setD1] = useState("")
  const [n2, setN2] = useState("")
  const [d2, setD2] = useState("")
  const [op, setOp] = useState("+")

  const a = parseNum(n1)
  const b = parseNum(d1)
  const c = parseNum(n2)
  const d = parseNum(d2)

  const result = useMemo(() => {
    if (a == null || b == null || c == null || d == null || b === 0 || d === 0) return null
    let num = 0
    let den = 1
    switch (op) {
      case "+":
        num = a * d + c * b
        den = b * d
        break
      case "-":
        num = a * d - c * b
        den = b * d
        break
      case "*":
        num = a * c
        den = b * d
        break
      case "/":
        if (c === 0) return null
        num = a * d
        den = b * c
        break
    }
    const [sn, sd] = simplifyFraction(num, den)
    return { sn, sd, decimal: num / den }
  }, [a, b, c, d, op])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr_auto] items-end">
        <div className="grid grid-cols-2 gap-2">
          <NumberField id="f1-n" label="A Numerator" value={n1} onChange={setN1} placeholder="1" />
          <NumberField id="f1-d" label="A Denominator" value={d1} onChange={setD1} placeholder="2" />
        </div>
        <div className="pb-2 text-2xl font-semibold">{op}</div>
        <div className="grid grid-cols-2 gap-2">
          <NumberField id="f2-n" label="B Numerator" value={n2} onChange={setN2} placeholder="3" />
          <NumberField id="f2-d" label="B Denominator" value={d2} onChange={setD2} placeholder="4" />
        </div>
        <div className="pb-2">
          <SelectField
            id="frac-op"
            label="Operation"
            value={op}
            onChange={setOp}
            options={[
              { value: "+", label: "Add" },
              { value: "-", label: "Subtract" },
              { value: "*", label: "Multiply" },
              { value: "/", label: "Divide" },
            ]}
            className="w-28"
          />
        </div>
      </div>
      <Formula>A ÷ B = ? (in lowest terms)</Formula>
      <ResultGrid>
        <ResultRow
          label="Result (Fraction)"
          value={result ? `${fmtNum(result.sn)}${result.sd === 1 ? "" : ` / ${fmtNum(result.sd)}`}` : "—"}
          hint={result ? `simplified (gcd ${gcd(result.sn, result.sd)})` : undefined}
        />
        <ResultRow label="Result (Decimal)" value={result ? fmtNum(result.decimal) : "—"} />
      </ResultGrid>
    </div>
  )
}

export function DecimalCalculator() {
  const [a, setA] = useState("")
  const [b, setB] = useState("")
  const [op, setOp] = useState("+")

  const av = parseNum(a)
  const bv = parseNum(b)

  const result = useMemo(() => {
    if (av == null || bv == null) return null
    switch (op) {
      case "+":
        return av + bv
      case "-":
        return av - bv
      case "*":
        return av * bv
      case "/":
        return bv === 0 ? null : av / bv
      case "^":
        return Math.pow(av, bv)
      default:
        return null
    }
  }, [av, bv, op])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="dc-a" label="First Number" value={a} onChange={setA} placeholder="e.g. 0.75" />
        <NumberField id="dc-b" label="Second Number" value={b} onChange={setB} placeholder="e.g. 1.5" />
        <SelectField
          id="dc-op"
          label="Operation"
          value={op}
          onChange={setOp}
          options={[
            { value: "+", label: "Add" },
            { value: "-", label: "Subtract" },
            { value: "*", label: "Multiply" },
            { value: "/", label: "Divide" },
            { value: "^", label: "Power" },
          ]}
        />
      </div>
      <Formula>Perform arithmetic on decimal numbers</Formula>
      <ResultGrid>
        <ResultRow label="Result" value={result != null ? fmtNum(result) : "—"} hint={op === "/" && bv === 0 ? "cannot divide by zero" : undefined} />
      </ResultGrid>
    </div>
  )
}

export function RatioCalculator() {
  const [a, setA] = useState("4")
  const [b, setB] = useState("6")
  const [c, setC] = useState("")
  const [d, setD] = useState("8")

  const av = parseNum(a)
  const bv = parseNum(b)
  const cv = parseNum(c)
  const dv = parseNum(d)

  const missing = [av, bv, cv, dv].filter((v) => v == null).length

  const solved = useMemo(() => {
    const values = [av, bv, cv, dv]
    const empty = values.findIndex((v) => v == null)
    if (values.filter((v) => v == null).length !== 1) return null
    const [A, B, C, D] = values
    switch (empty) {
      case 0:
        return D !== 0 ? { index: 0, value: (B! * C!) / D! } : null
      case 1:
        return C !== 0 ? { index: 1, value: (A! * D!) / C! } : null
      case 2:
        return B !== 0 ? { index: 2, value: (A! * D!) / B! } : null
      case 3:
        return A !== 0 ? { index: 3, value: (B! * C!) / A! } : null
      default:
        return null
    }
  }, [av, bv, cv, dv])

  const [sn, sd] = simplifyFraction(av ?? 0, bv ?? 1)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] items-center">
        <div className="grid grid-cols-2 gap-2">
          <NumberField id="r-a" label="A" value={a} onChange={setA} placeholder="A" />
          <NumberField id="r-b" label="B" value={b} onChange={setB} placeholder="B" />
        </div>
        <div className="pb-2 text-lg font-semibold text-muted-foreground">=</div>
        <div className="grid grid-cols-2 gap-2">
          <NumberField id="r-c" label="C" value={c} onChange={setC} placeholder="?" />
          <NumberField id="r-d" label="D" value={d} onChange={setD} placeholder="D" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Leave exactly one of A, B, C, D empty to solve for it. A:B = C:D
      </p>
      <Formula>A:B = C:D</Formula>
      <ResultGrid>
        <ResultRow
          label="Simplified Ratio"
          value={`${fmtNum(sn)} : ${fmtNum(sd)}`}
          hint={`from ${fmtNum(av ?? 0)} : ${fmtNum(bv ?? 1)}`}
        />
        <ResultRow
          label={solved ? ["A", "B", "C", "D"][solved.index] : "Missing Term"}
          value={solved ? fmtNum(solved.value) : missing === 1 ? "—" : "Fill exactly one gap"}
          hint={solved ? `solved from the other three` : undefined}
        />
      </ResultGrid>
    </div>
  )
}

export function ProportionCalculator() {
  const [a, setA] = useState("2")
  const [b, setB] = useState("5")
  const [c, setC] = useState("8")
  const [d, setD] = useState("")

  const av = parseNum(a)
  const bv = parseNum(b)
  const cv = parseNum(c)
  const dv = parseNum(d)

  const solved = useMemo(() => {
    const values = [av, bv, cv, dv]
    const empty = values.findIndex((v) => v == null)
    if (values.filter((v) => v == null).length !== 1) return null
    const [A, B, C, D] = values
    switch (empty) {
      case 0:
        return B !== 0 ? { index: 0, value: (C! * D!) / B! } : null
      case 1:
        return A !== 0 ? { index: 1, value: (B! * C!) / D! } : null
      case 2:
        return D !== 0 ? { index: 2, value: (A! * D!) / B! } : null
      case 3:
        return C !== 0 ? { index: 3, value: (B! * C!) / A! } : null
      default:
        return null
    }
  }, [av, bv, cv, dv])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <NumberField id="p-a" label="a" value={a} onChange={setA} placeholder="a" />
        <NumberField id="p-b" label="b" value={b} onChange={setB} placeholder="b" />
        <NumberField id="p-c" label="c" value={c} onChange={setC} placeholder="c" />
        <NumberField id="p-d" label="d" value={d} onChange={setD} placeholder="?" />
      </div>
      <p className="text-xs text-muted-foreground">
        Solve a ÷ b = c ÷ d. Leave exactly one value empty.
      </p>
      <Formula>a ÷ b = c ÷ d</Formula>
      <ResultGrid>
        <ResultRow
          label="Missing Value"
          value={solved ? fmtNum(solved.value) : "Fill exactly one gap"}
          hint={solved ? `term ${["a", "b", "c", "d"][solved.index]}` : undefined}
        />
        <ResultRow
          label="Check"
          value={
            av != null && bv != null && cv != null && dv != null
              ? `${(av / bv).toFixed(4)} = ${(cv / dv).toFixed(4)}`
              : "—"
          }
        />
      </ResultGrid>
    </div>
  )
}
