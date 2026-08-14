"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { TextAreaInput, CopyButton } from "./text"
import { SelectField, Formula } from "./shared"
import { regexExplain, regexTest, regexExamples, REGEX_PRESETS } from "@/lib/dev-data"

function FlagToggle({ flags, onChange }: { flags: string; onChange: (f: string) => void }) {
  const items = [
    { v: "g", label: "global" },
    { v: "i", label: "ignore case" },
    { v: "m", label: "multiline" },
    { v: "s", label: "dotall" },
    { v: "u", label: "unicode" },
  ]
  const toggle = (v: string) => onChange(flags.includes(v) ? flags.replace(v, "") : flags + v)
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((it) => (
        <button
          key={it.v}
          type="button"
          onClick={() => toggle(it.v)}
          className={
            "h-8 rounded-md border px-3 font-mono text-xs shadow-sm " +
            (flags.includes(it.v) ? "border-primary bg-primary/10 text-primary" : "border-input bg-transparent text-muted-foreground")
          }
        >
          {it.v} · {it.label}
        </button>
      ))}
    </div>
  )
}

export function RegexTester() {
  const [pattern, setPattern] = useState("")
  const [flags, setFlags] = useState("g")
  const [text, setText] = useState("")
  const result = regexTest(pattern, flags, text)
  const counts = result.matches.reduce<Record<string, number>>((acc, m) => {
    acc[m.full] = (acc[m.full] || 0) + 1
    return acc
  }, {})
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="rt-pattern">Pattern</Label>
        <input
          id="rt-pattern"
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="\\b\\w+@\\w+\\.\\w+\\b"
        />
      </div>
      <FlagToggle flags={flags} onChange={setFlags} />
      <TextAreaInput id="rt-text" value={text} onChange={setText} label="Test Text" placeholder="Email me at ada@example.com or alan@example.org" />
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (pattern === "" ? "border-border text-muted-foreground" : result.ok ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {pattern === "" ? "Waiting for pattern" : result.ok ? `${result.matches.length} match(es) found` : result.error}
      </div>
      {result.ok && result.matches.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label>Matches</Label>
            <CopyButton text={result.matches.map((m) => m.full).join("\n")} label="Copy matches" />
          </div>
          <div className="max-h-72 overflow-auto rounded-md border border-border bg-muted/20 p-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-1 pr-4">#</th>
                  <th className="py-1 pr-4">Match</th>
                  <th className="py-1 pr-4">Index</th>
                  <th className="py-1">Count</th>
                </tr>
              </thead>
              <tbody>
                {result.matches.slice(0, 100).map((m, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1 pr-4 font-mono text-xs">{i + 1}</td>
                    <td className="py-1 pr-4 font-mono">{m.full}</td>
                    <td className="py-1 pr-4 font-mono text-xs">{m.index}</td>
                    <td className="py-1 font-mono text-xs">{counts[m.full]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export function RegexBuilder() {
  const [pattern, setPattern] = useState("")
  const [flags, setFlags] = useState("i")
  const [testText, setTestText] = useState("")
  const result = regexTest(pattern, flags, testText)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="rb-preset">Starter pattern</Label>
        <SelectField
          id="rb-preset"
          label=""
          value={pattern}
          onChange={(v) => setPattern(v)}
          options={[{ value: "", label: "Pick a pattern…" }, ...REGEX_PRESETS]}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="rb-pattern">Pattern</Label>
        <input
          id="rb-pattern"
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$/"
        />
      </div>
      <FlagToggle flags={flags} onChange={setFlags} />
      <TextAreaInput id="rb-test" value={testText} onChange={setTestText} label="Try it on" placeholder="Paste some text to test against the pattern" />
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (pattern === "" ? "border-border text-muted-foreground" : result.ok ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {pattern === "" ? "Waiting for pattern" : result.ok ? `${result.matches.length} match(es)` : result.error}
      </div>
      <Formula>Expression: /{pattern || "…"}/{flags}</Formula>
      <div className="flex flex-col gap-2">
        <Label>Captured groups (first 20 matches)</Label>
        <div className="max-h-72 overflow-auto rounded-md border border-border bg-muted/20 p-3">
          {result.ok && result.matches.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-1 pr-4">Match</th>
                  <th className="py-1">Groups</th>
                </tr>
              </thead>
              <tbody>
                {result.matches.slice(0, 20).map((m, i) => (
                  <tr key={i} className="border-b border-border/50 align-top">
                    <td className="py-1 pr-4 font-mono text-xs">{m.full}</td>
                    <td className="py-1 font-mono text-xs">{m.groups.map((g, j) => `$${j + 1}: ${g === "" ? "(empty)" : g}`).join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      </div>
    </div>
  )
}

export function RegexExplainer() {
  const [pattern, setPattern] = useState("")
  const [flags, setFlags] = useState("g")
  const steps = pattern === "" ? [] : regexExplain(pattern)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="re-pattern">Pattern</Label>
        <input
          id="re-pattern"
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="^(?<year>\\d{4})-(?<month>\\d{2})$"
        />
      </div>
      <FlagToggle flags={flags} onChange={setFlags} />
      <Formula>{pattern === "" ? "Enter a pattern to see its anatomy" : `${steps.length} token(s) parsed`}</Formula>
      <div className="flex flex-col gap-2">
        <Label>Tokens</Label>
        <div className="max-h-96 overflow-auto rounded-md border border-border bg-muted/20 p-3">
          {steps.length === 0 ? (
            <span className="text-sm text-muted-foreground">—</span>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-1 pr-4">#</th>
                  <th className="py-1 pr-4">Token</th>
                  <th className="py-1">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((s, i) => (
                  <tr key={i} className="border-b border-border/50 align-top">
                    <td className="py-1 pr-4 font-mono text-xs">{i + 1}</td>
                    <td className="py-1 pr-4 font-mono">{s.token}</td>
                    <td className="py-1">{s.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export function RegexGenerator() {
  const [pattern, setPattern] = useState("")
  const [flags, setFlags] = useState("g")
  const [count, setCount] = useState("10")
  const n = Math.min(100, Math.max(1, Math.round(Number(count)) || 10))
  const examples = pattern === "" ? [] : regexExamples(pattern, flags, n)
  const result = regexTest(pattern, flags, "")
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="rg-pattern">Pattern</Label>
        <input
          id="rg-pattern"
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="[a-z]{3,5}-\\d{2}"
        />
      </div>
      <FlagToggle flags={flags} onChange={setFlags} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="rg-count">Examples to generate</Label>
        <input
          id="rg-count"
          type="number"
          min={1}
          max={100}
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={count}
          onChange={(e) => setCount(e.target.value)}
        />
      </div>
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (pattern === "" ? "border-border text-muted-foreground" : result.ok ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {pattern === "" ? "Waiting for pattern" : result.ok ? `Ready to generate matching strings` : result.error}
      </div>
      {examples.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label>Generated strings</Label>
            <CopyButton text={examples.join("\n")} label="Copy all" />
          </div>
          <div className="flex max-h-72 flex-wrap gap-2 overflow-auto rounded-md border border-border bg-muted/20 p-3">
            {examples.map((ex, i) => (
              <code key={i} className="rounded bg-background px-2 py-1 text-xs ring-1 ring-border">
                {ex}
              </code>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
