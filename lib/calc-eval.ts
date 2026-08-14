type Token =
  | { type: "num"; value: number }
  | { type: "op"; value: string }
  | { type: "paren"; value: "(" | ")" }
  | { type: "fn"; value: string }
  | { type: "const"; value: string }

const FUNCTIONS = new Set([
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "log",
  "ln",
  "sqrt",
  "abs",
  "floor",
  "ceil",
  "round",
  "exp",
])

const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E }

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const s = input.replace(/\s+/g, "")

  while (i < s.length) {
    const ch = s[i]

    if (/\d/.test(ch) || ch === ".") {
      let j = i
      while (j < s.length && (/[\d.]/.test(s[j]))) j++
      const raw = s.slice(i, j)
      const n = Number(raw)
      if (Number.isNaN(n)) throw new Error(`Invalid number: ${raw}`)
      tokens.push({ type: "num", value: n })
      i = j
      continue
    }

    if (/[+\-*/%^]/.test(ch)) {
      tokens.push({ type: "op", value: ch })
      i++
      continue
    }

    if (ch === "(" || ch === ")") {
      tokens.push({ type: "paren", value: ch })
      i++
      continue
    }

    if (/[a-z]/i.test(ch)) {
      let j = i
      while (j < s.length && /[a-z0-9_]/i.test(s[j])) j++
      const word = s.slice(i, j).toLowerCase()
      if (FUNCTIONS.has(word)) {
        tokens.push({ type: "fn", value: word })
      } else if (word in CONSTANTS) {
        tokens.push({ type: "const", value: word })
      } else {
        throw new Error(`Unknown identifier: ${word}`)
      }
      i = j
      continue
    }

    throw new Error(`Unexpected character: ${ch}`)
  }

  return tokens
}

function applyFn(name: string, arg: number, degrees: boolean): number {
  const x = degrees ? (arg * Math.PI) / 180 : arg
  switch (name) {
    case "sin":
      return Math.sin(x)
    case "cos":
      return Math.cos(x)
    case "tan":
      return Math.tan(x)
    case "asin":
      return Math.asin(x)
    case "acos":
      return Math.acos(x)
    case "atan":
      return Math.atan(x)
    case "log":
      return Math.log10(arg)
    case "ln":
      return Math.log(arg)
    case "sqrt":
      return Math.sqrt(arg)
    case "abs":
      return Math.abs(arg)
    case "floor":
      return Math.floor(arg)
    case "ceil":
      return Math.ceil(arg)
    case "round":
      return Math.round(arg)
    case "exp":
      return Math.exp(arg)
    default:
      throw new Error(`Unknown function: ${name}`)
  }
}

function toPostfix(tokens: Token[]): Token[] {
  const output: Token[] = []
  const stack: Token[] = []
  const prec: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "^": 3 }

  for (const tok of tokens) {
    if (tok.type === "num" || tok.type === "const") {
      output.push(tok)
      continue
    }
    if (tok.type === "fn") {
      stack.push(tok)
      continue
    }
    if (tok.type === "op") {
      while (stack.length) {
        const top = stack[stack.length - 1]
        if (top.type !== "op") break
        const topPrec = prec[top.value]
        const curPrec = prec[tok.value]
        const rightAssoc = tok.value === "^"
        if (topPrec > curPrec || (topPrec === curPrec && !rightAssoc)) {
          output.push(stack.pop()!)
        } else break
      }
      stack.push(tok)
      continue
    }
    if (tok.type === "paren") {
      if (tok.value === "(") {
        stack.push(tok)
      } else {
        while (stack.length) {
          const top = stack.pop()!
          if (top.type === "paren" && top.value === "(") break
          output.push(top)
        }
      }
    }
  }

  while (stack.length) {
    const top = stack.pop()!
    if (top.type === "paren") throw new Error("Mismatched parentheses")
    output.push(top)
  }

  return output
}

function evaluatePostfix(postfix: Token[], degrees: boolean): number {
  const stack: number[] = []

  for (const tok of postfix) {
    if (tok.type === "num") {
      stack.push(tok.value)
      continue
    }
    if (tok.type === "const") {
      stack.push(CONSTANTS[tok.value])
      continue
    }
    if (tok.type === "fn") {
      const arg = stack.pop()
      if (arg == null) throw new Error("Missing function argument")
      stack.push(applyFn(tok.value, arg, degrees))
      continue
    }
    if (tok.type === "op") {
      const b = stack.pop()
      const a = stack.pop()
      if (a == null || b == null) throw new Error("Missing operands")
      switch (tok.value) {
        case "+":
          stack.push(a + b)
          break
        case "-":
          stack.push(a - b)
          break
        case "*":
          stack.push(a * b)
          break
        case "/":
          if (b === 0) throw new Error("Division by zero")
          stack.push(a / b)
          break
        case "%":
          stack.push(a % b)
          break
        case "^":
          stack.push(Math.pow(a, b))
          break
      }
    }
  }

  if (stack.length !== 1) throw new Error("Invalid expression")
  return stack[0]
}

export function evaluate(expression: string, degrees = true): number {
  if (!expression.trim()) throw new Error("Empty expression")
  const tokens = tokenize(expression)
  const postfix = toPostfix(tokens)
  const result = evaluatePostfix(postfix, degrees)
  if (!Number.isFinite(result)) throw new Error("Result is not finite")
  return result
}
