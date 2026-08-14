"use client"

import { useMemo, useState } from "react"
import { evaluate } from "@/lib/calc-eval"
import { fmtNum } from "@/lib/calc-utils"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function sanitize(expr: string): string {
  return expr.replace(/[^0-9+\-*/.%()^a-z]/gi, "")
}

export function ScientificCalculator() {
  const [expr, setExpr] = useState("")
  const [degrees, setDegrees] = useState(true)
  const [justEvaluated, setJustEvaluated] = useState(false)

  const result = useMemo(() => {
    try {
      if (!expr.trim()) return ""
      return fmtNum(evaluate(expr, degrees))
    } catch {
      return "Error"
    }
  }, [expr, degrees])

  const append = (token: string) => {
    setJustEvaluated(false)
    setExpr((e) => (justEvaluated ? token : sanitize(e + token)))
  }

  const wrap = (fn: string) => {
    append(`${fn}(`)
  }

  const evaluateExpr = () => {
    try {
      const value = evaluate(expr, degrees)
      setExpr(Object.is(value, -0) ? "0" : String(value))
      setJustEvaluated(true)
    } catch {
      setExpr("Error")
    }
  }

  const key = (
    value: React.ReactNode,
    label: React.ReactNode,
    onClick: () => void,
    className?: string
  ) => (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("h-10 w-full text-sm", className)}
      onClick={onClick}
    >
      {label}
    </Button>
  )

  const keys: React.ReactNode[] = []

  keys.push(key("sin", "sin", () => wrap("sin"), "bg-muted"))
  keys.push(key("cos", "cos", () => wrap("cos"), "bg-muted"))
  keys.push(key("tan", "tan", () => wrap("tan"), "bg-muted"))
  keys.push(key("⌫", "⌫", () => setExpr((e) => e.slice(0, -1)), "bg-muted"))
  keys.push(key("ln", "ln", () => wrap("ln"), "bg-muted"))
  keys.push(key("log", "log", () => wrap("log"), "bg-muted"))
  keys.push(key("sqrt", "√", () => wrap("sqrt"), "bg-muted"))
  keys.push(key("^", "^", () => append("^"), "bg-muted"))
  keys.push(key("asin", "sin⁻¹", () => wrap("asin"), "bg-muted"))
  keys.push(key("acos", "cos⁻¹", () => wrap("acos"), "bg-muted"))
  keys.push(key("atan", "tan⁻¹", () => wrap("atan"), "bg-muted"))
  keys.push(key("exp", "eˣ", () => wrap("exp"), "bg-muted"))
  keys.push(key("pi", "π", () => append("pi"), "bg-muted"))
  keys.push(key("e", "e", () => append("e"), "bg-muted"))
  keys.push(key("abs", "|x|", () => wrap("abs"), "bg-muted"))
  keys.push(key("(", "(", () => append("("), "bg-muted"))
  keys.push(key("C", "C", () => setExpr(""), "bg-muted"))
  keys.push(key(")", ")", () => append(")"), "bg-muted"))
  keys.push(key("%", "%", () => append("%"), "bg-muted"))
  keys.push(key("÷", "÷", () => append("/"), "bg-muted"))
  keys.push(key("7", "7", () => append("7")))
  keys.push(key("8", "8", () => append("8")))
  keys.push(key("9", "9", () => append("9")))
  keys.push(key("×", "×", () => append("*"), "bg-muted"))
  keys.push(key("4", "4", () => append("4")))
  keys.push(key("5", "5", () => append("5")))
  keys.push(key("6", "6", () => append("6")))
  keys.push(key("−", "−", () => append("-"), "bg-muted"))
  keys.push(key("1", "1", () => append("1")))
  keys.push(key("2", "2", () => append("2")))
  keys.push(key("3", "3", () => append("3")))
  keys.push(key("+", "+", () => append("+"), "bg-muted"))
  keys.push(key(".", ".", () => append(".")))
  keys.push(key("0", "0", () => append("0")))
  keys.push(key("00", "00", () => append("00")))
  keys.push(key("=", "=", evaluateExpr, "bg-primary text-primary-foreground hover:bg-primary/90"))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Angle mode
        </span>
        <div className="flex gap-1">
          {["DEG", "RAD"].map((mode) => (
            <Button
              key={mode}
              type="button"
              variant={degrees === (mode === "DEG") ? "default" : "outline"}
              size="xs"
              className="h-7 px-3 text-[11px]"
              onClick={() => setDegrees(mode === "DEG")}
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>
      <input
        data-slot="input"
        className="h-14 w-full rounded-none border border-transparent border-b-input bg-transparent px-4 text-right font-mono text-2xl font-semibold outline-none focus-visible:border-b-ring"
        value={expr}
        onChange={(e) => {
          setJustEvaluated(false)
          setExpr(sanitize(e.target.value))
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") evaluateExpr()
        }}
        placeholder="0"
        aria-label="Expression"
      />
      <div className="h-6 text-right font-mono text-sm text-muted-foreground">
        {result && result !== expr ? result : ""}
      </div>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-7 md:grid-cols-6 lg:grid-cols-7">
        {keys}
      </div>
    </div>
  )
}
