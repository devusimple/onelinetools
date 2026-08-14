"use client"

import { useState } from "react"
import { fmtNum } from "@/lib/calc-utils"
import { SelectField, ResultGrid, ResultRow, Formula } from "./shared"

const BASE_OPTIONS = [
  { value: "2", label: "Binary (base 2)" },
  { value: "8", label: "Octal (base 8)" },
  { value: "10", label: "Decimal (base 10)" },
  { value: "16", label: "Hexadecimal (base 16)" },
]

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz"

function parseBaseString(input: string, base: number): bigint | null {
  const s = input.trim().toLowerCase()
  if (!s) return null
  if (s === "-") return null
  const neg = s.startsWith("-")
  const body = neg ? s.slice(1) : s
  let n = BigInt(0)
  for (const ch of body) {
    const d = DIGITS.indexOf(ch)
    if (d < 0 || d >= base) return null
    n = n * BigInt(base) + BigInt(d)
  }
  return neg ? -n : n
}

function toBaseString(n: bigint, base: number): string {
  if (n === BigInt(0)) return "0"
  const neg = n < BigInt(0)
  let v = neg ? -n : n
  let out = ""
  while (v > BigInt(0)) {
    out = DIGITS[Number(v % BigInt(base))] + out
    v /= BigInt(base)
  }
  return (neg ? "-" : "") + out
}

function groupDigits(s: string): string {
  const neg = s.startsWith("-")
  const body = neg ? s.slice(1) : s
  const parts = body.split("")
  let out = ""
  let count = 0
  for (let i = parts.length - 1; i >= 0; i--) {
    out = parts[i] + out
    count++
    if (count % 4 === 0 && i !== 0) out = " " + out
  }
  return (neg ? "-" : "") + out
}

function BaseConverter({ defaultFrom = "10", defaultTo = "16" }: { defaultFrom?: string; defaultTo?: string }) {
  const [value, setValue] = useState("")
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)

  const n = parseBaseString(value, Number(from))
  const result = n != null ? toBaseString(n, Number(to)) : null
  const bin = n != null ? toBaseString(n, 2) : null
  const oct = n != null ? toBaseString(n, 8) : null
  const dec = n != null ? toBaseString(n, 10) : null
  const hex = n != null ? toBaseString(n, 16).toUpperCase() : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor={`${from}-${to}-value`}>
            Input
          </label>
          <input
            id={`${from}-${to}-value`}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="e.g. 255"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <SelectField id={`${from}-${to}-from`} label="From Base" value={from} onChange={setFrom} options={BASE_OPTIONS} />
        <SelectField id={`${from}-${to}-to`} label="To Base" value={to} onChange={setTo} options={BASE_OPTIONS} />
      </div>
      <Formula>Converts between binary, octal, decimal and hexadecimal</Formula>
      <ResultGrid>
        <ResultRow label="Result" value={result != null ? groupDigits(result) : "—"} />
        <ResultRow label="Binary" value={bin != null ? groupDigits(bin) : "—"} />
        <ResultRow label="Octal" value={oct != null ? groupDigits(oct) : "—"} />
        <ResultRow label="Decimal" value={dec != null ? groupDigits(dec) : "—"} />
        <ResultRow label="Hexadecimal" value={hex != null ? groupDigits(hex) : "—"} />
      </ResultGrid>
    </div>
  )
}

export function DecimalToBinaryConverter() {
  return <BaseConverter defaultFrom="10" defaultTo="2" />
}
export function BinaryToDecimalConverter() {
  return <BaseConverter defaultFrom="2" defaultTo="10" />
}
export function DecimalToHexConverter() {
  return <BaseConverter defaultFrom="10" defaultTo="16" />
}
export function HexToDecimalConverter() {
  return <BaseConverter defaultFrom="16" defaultTo="10" />
}
export function DecimalToOctalConverter() {
  return <BaseConverter defaultFrom="10" defaultTo="8" />
}

const ROMAN_VALUES: [string, number][] = [
  ["M", 1000],
  ["CM", 900],
  ["D", 500],
  ["CD", 400],
  ["C", 100],
  ["XC", 90],
  ["L", 50],
  ["XL", 40],
  ["X", 10],
  ["IX", 9],
  ["V", 5],
  ["IV", 4],
  ["I", 1],
]

function toRoman(n: number): string | null {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return null
  let value = n
  let out = ""
  for (const [sym, v] of ROMAN_VALUES) {
    while (value >= v) {
      out += sym
      value -= v
    }
  }
  return out
}

function fromRoman(input: string): number | null {
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
  const s = input.trim().toUpperCase()
  if (!s) return null
  let total = 0
  for (let i = 0; i < s.length; i++) {
    const cur = map[s[i]]
    if (cur === undefined) return null
    const next = map[s[i + 1]]
    total += next !== undefined && next > cur ? -cur : cur
  }
  return total >= 1 && total <= 3999 ? total : null
}

export function RomanNumeralConverter() {
  const [number, setNumber] = useState("")
  const [roman, setRoman] = useState("")

  const num = Number(number)
  const validNum = number.trim() !== "" && Number.isInteger(num)
  const romanFromNum = validNum ? toRoman(num) : null
  const numFromRoman = roman ? fromRoman(roman) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="roman-num">
            Decimal (1–3999)
          </label>
          <input
            id="roman-num"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="e.g. 1999"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="roman-str">
            Roman Numerals
          </label>
          <input
            id="roman-str"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="e.g. MCMXCIX"
            value={roman}
            onChange={(e) => setRoman(e.target.value)}
          />
        </div>
      </div>
      <Formula>Works in both directions, values 1 to 3999</Formula>
      <ResultGrid>
        <ResultRow label="Decimal → Roman" value={romanFromNum ?? "—"} hint={validNum && romanFromNum == null ? "must be 1–3999" : undefined} />
        <ResultRow label="Roman → Decimal" value={numFromRoman != null ? fmtNum(numFromRoman) : "—"} />
      </ResultGrid>
    </div>
  )
}
