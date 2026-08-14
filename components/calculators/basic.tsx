"use client"

import { useMemo, useState } from "react"
import { evaluate } from "@/lib/calc-eval"
import { fmtNum } from "@/lib/calc-utils"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function sanitize(expr: string): string {
  return expr.replace(/[^0-9+\-*/.%()^]/g, "")
}

export function BasicCalculator() {
  const [expr, setExpr] = useState("")
  const [justEvaluated, setJustEvaluated] = useState(false)

  const result = useMemo(() => {
    try {
      if (!expr.trim()) return ""
      return fmtNum(evaluate(expr))
    } catch {
      return "Error"
    }
  }, [expr])

  const append = (token: string) => {
    setJustEvaluated(false)
    if (justEvaluated && /[0-9]/.test(token)) {
      setExpr(token)
    } else {
      setExpr((e) => sanitize(e + token))
    }
  }

  const evaluateExpr = () => {
    try {
      const value = evaluate(expr)
      setExpr(String(cleanForInput(value)))
      setJustEvaluated(true)
    } catch {
      setExpr("Error")
    }
  }

  const clear = () => {
    setExpr("")
    setJustEvaluated(false)
  }

  const backspace = () => {
    setJustEvaluated(false)
    setExpr((e) => e.slice(0, -1))
  }

  const toggleSign = () => {
    setJustEvaluated(false)
    if (!expr) return
    if (expr.startsWith("-")) setExpr(expr.slice(1))
    else setExpr(`-${expr}`)
  }

  const percent = () => {
    append("/100")
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const k = e.key
    if (/[\d+\-*/.%]/.test(k)) {
      append(k)
    } else if (k === "Enter") {
      e.preventDefault()
      evaluateExpr()
    } else if (k === "Backspace") {
      backspace()
    } else if (k === "Escape") {
      clear()
    } else if (k === "(" || k === ")") {
      append(k)
    }
  }

  const key = (
    value: string,
    label: React.ReactNode,
    onClick: () => void,
    className?: string
  ) => (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={cn("h-12 w-full text-base", className)}
      onClick={onClick}
    >
      {label}
    </Button>
  )

  return (
    <div className="flex flex-col gap-4">
      <input
        data-slot="input"
        className="h-14 w-full rounded-none border border-transparent border-b-input bg-transparent px-4 text-right font-mono text-2xl font-semibold outline-none focus-visible:border-b-ring"
        value={justEvaluated ? expr : expr}
        onKeyDown={onKeyDown}
        onChange={(e) => {
          setJustEvaluated(false)
          setExpr(sanitize(e.target.value))
        }}
        placeholder="0"
        aria-label="Expression"
      />
      <div className="h-6 text-right font-mono text-sm text-muted-foreground">
        {result && result !== expr ? result : ""}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {key("C", "C", clear, "bg-muted")}
        {key("⌫", "⌫", backspace, "bg-muted")}
        {key("%", "%", percent, "bg-muted")}
        {key("÷", "÷", () => append("/"), "bg-muted")}
        {key("7", "7", () => append("7"))}
        {key("8", "8", () => append("8"))}
        {key("9", "9", () => append("9"))}
        {key("×", "×", () => append("*"), "bg-muted")}
        {key("4", "4", () => append("4"))}
        {key("5", "5", () => append("5"))}
        {key("6", "6", () => append("6"))}
        {key("−", "−", () => append("-"), "bg-muted")}
        {key("1", "1", () => append("1"))}
        {key("2", "2", () => append("2"))}
        {key("3", "3", () => append("3"))}
        {key("+", "+", () => append("+"), "bg-muted")}
        {key("±", "±", toggleSign, "bg-muted")}
        {key("0", "0", () => append("0"))}
        {key(".", ".", () => append("."))}
        {key("=", "=", evaluateExpr, "bg-primary text-primary-foreground hover:bg-primary/90")}
      </div>
    </div>
  )
}

function cleanForInput(n: number): number {
  return Object.is(n, -0) ? 0 : n
}
