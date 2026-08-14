"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TextAreaInput, CopyButton } from "./text"
import { SelectField, ResultGrid, ResultRow, Formula } from "./shared"
import {
  tryJson,
  jsonFormat,
  jsonMinify,
  jsonSort,
  jsonKeys,
  jsonPathSelect,
  jsonTree,
  jsonDiff,
  jsonToCsv,
} from "@/lib/dev-utils"

function CodeOutput({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="code-out">{label}</Label>
        <CopyButton text={text} />
      </div>
      <Textarea id="code-out" readOnly value={text} className="min-h-40 font-mono text-xs" />
    </div>
  )
}

function CodeOutputText({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="code-out-t">{label}</Label>
        <CopyButton text={text} />
      </div>
      <pre className="max-h-96 overflow-auto rounded-md border border-border bg-muted/20 p-3 font-mono text-xs whitespace-pre-wrap break-all">
        {text || "—"}
      </pre>
    </div>
  )
}

export function JsonFormatter() {
  const [input, setInput] = useState("")
  const [indent, setIndent] = useState("2")
  const parsed = tryJson(input)
  const n = Math.min(Math.max(Number(indent) || 2, 1), 8)
  const output = parsed.ok ? jsonFormat(input, n) : ""
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="jf-in" value={input} onChange={setInput} label="JSON Input" placeholder='{"name": "value", "items": [1, 2, 3]}' />
      <SelectField
        id="jf-indent"
        label="Indentation"
        value={indent}
        onChange={setIndent}
        options={["2", "4", "8"].map((v) => ({ value: v, label: `${v} spaces` }))}
      />
      <Formula>{parsed.ok ? "Valid JSON" : parsed.error ?? ""}</Formula>
      <CodeOutput label="Formatted JSON" text={output} />
    </div>
  )
}

export function JsonValidator() {
  const [input, setInput] = useState("")
  const parsed = tryJson(input)
  const value = parsed.value
  const type = Array.isArray(value) ? "array" : value === null ? "null" : typeof value
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="jv-in" value={input} onChange={setInput} label="JSON Input" placeholder='{"valid": true}' />
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (input.trim() === "" ? "border-border text-muted-foreground" : parsed.ok ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {input.trim() === "" ? "Waiting for input" : parsed.ok ? "Valid JSON" : parsed.error}
      </div>
      <ResultGrid>
        <ResultRow label="Type" value={input.trim() === "" ? "—" : type} />
        <ResultRow label="Characters" value={input.length.toLocaleString()} />
        <ResultRow label="Depth" value={value !== undefined && value !== null && typeof value === "object" ? String(depthOf(value)) : "—"} />
        <ResultRow label="Size" value={parsed.ok ? approxSize(value) : "—"} />
      </ResultGrid>
    </div>
  )
}

function depthOf(value: unknown): number {
  if (Array.isArray(value)) return 1 + (value.length ? Math.max(...value.map((v) => depthOf(v))) : 0)
  if (typeof value === "object" && value !== null) {
    const vals = Object.values(value as Record<string, unknown>)
    return 1 + (vals.length ? Math.max(...vals.map((v) => depthOf(v))) : 0)
  }
  return 0
}

function approxSize(value: unknown): string {
  const s = JSON.stringify(value)
  if (s.length < 1024) return `${s.length} B`
  if (s.length < 1024 * 1024) return `${(s.length / 1024).toFixed(1)} KB`
  return `${(s.length / 1024 / 1024).toFixed(1)} MB`
}

export function JsonMinifier() {
  const [input, setInput] = useState("")
  const parsed = tryJson(input)
  const output = parsed.ok ? jsonMinify(input) : ""
  const saved = input.length - output.length
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="jm-in" value={input} onChange={setInput} label="JSON Input" placeholder='{ "name": "value" }' />
      <Formula>
        {parsed.ok
          ? `${input.length} → ${output.length} chars (${saved > 0 ? "saved " + saved : "unchanged"})`
          : parsed.error ?? ""}
      </Formula>
      <CodeOutput label="Minified JSON" text={output} />
    </div>
  )
}

export function JsonViewer() {
  const [input, setInput] = useState("")
  const parsed = tryJson(input)
  const formatted = parsed.ok ? jsonFormat(input) : ""
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="jview-in" value={input} onChange={setInput} label="JSON Input" placeholder='{"key": "value"}' />
      <ResultGrid>
        <ResultRow label="Valid" value={input.trim() === "" ? "—" : parsed.ok ? "Yes" : "No"} />
        <ResultRow label="Lines" value={formatted ? formatted.split("\n").length.toLocaleString() : "—"} />
        <ResultRow label="Size" value={parsed.ok ? approxSize(parsed.value) : "—"} />
        <ResultRow label="Root Type" value={parsed.ok ? (Array.isArray(parsed.value) ? "array" : typeof parsed.value) : "—"} />
      </ResultGrid>
      {parsed.ok && <CodeOutput label="Pretty View" text={formatted} />}
    </div>
  )
}

export function JsonTreeViewer() {
  const [input, setInput] = useState("")
  const parsed = tryJson(input)
  const tree = parsed.ok ? jsonTree(input) : ""
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="jt-in" value={input} onChange={setInput} label="JSON Input" placeholder='{"a": 1, "b": [true, null]}' />
      {parsed.ok && (
        <>
          <ResultGrid>
            <ResultRow label="Keys" value={String(jsonKeys(input).length)} />
            <ResultRow label="Valid" value="Yes" />
          </ResultGrid>
          <CodeOutputText label="Tree Structure" text={tree} />
        </>
      )}
      {!parsed.ok && input.trim() !== "" && <Formula>{parsed.error}</Formula>}
    </div>
  )
}

export function JsonDiff() {
  const [a, setA] = useState("")
  const [b, setB] = useState("")
  const lines = jsonDiff(a, b)
  const adds = lines.filter((l) => l.type === "add").length
  const dels = lines.filter((l) => l.type === "del").length
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextAreaInput id="jd-a" label="Original JSON" value={a} onChange={setA} />
        <TextAreaInput id="jd-b" label="Modified JSON" value={b} onChange={setB} />
      </div>
      <Formula>+{adds} added, -{dels} removed</Formula>
      <div className="max-h-96 overflow-auto rounded-md border border-border bg-muted/20 p-2 font-mono text-xs">
        {lines.map((l, i) => (
          <div
            key={i}
            className={
              l.type === "add"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : l.type === "del"
                  ? "bg-red-500/10 text-red-700 dark:text-red-400 line-through"
                  : "text-foreground"
            }
          >
            <span className="select-none">{l.type === "add" ? "+ " : l.type === "del" ? "- " : "  "}</span>
            <span>{l.text || " "}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function JsonSorter() {
  const [input, setInput] = useState("")
  const [descending, setDescending] = useState(false)
  const parsed = tryJson(input)
  const output = parsed.ok ? jsonSort(input, descending) : ""
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="js-in" value={input} onChange={setInput} label="JSON Input" placeholder='{"z": 1, "a": 2, "m": 3}' />
      <div className="flex flex-wrap gap-2">
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
          <input type="checkbox" checked={descending} onChange={(e) => setDescending(e.target.checked)} className="size-4" />
          <span>Sort keys descending</span>
        </label>
      </div>
      <Formula>{parsed.ok ? "Keys sorted recursively" : parsed.error ?? ""}</Formula>
      <CodeOutput label="Sorted JSON" text={output} />
    </div>
  )
}

export function JsonKeyExtractor() {
  const [input, setInput] = useState("")
  const parsed = tryJson(input)
  const keys = parsed.ok ? jsonKeys(input) : []
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="jke-in" value={input} onChange={setInput} label="JSON Input" placeholder='{"a": {"b": [{"c": 1}]}}' />
      <Formula>{parsed.ok ? `${keys.length} key paths found` : parsed.error ?? ""}</Formula>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Key paths</span>
          <CopyButton text={keys.join("\n")} />
        </div>
        <div className="max-h-80 overflow-auto rounded-md border border-border bg-muted/20 p-3 font-mono text-xs">
          {keys.length === 0 ? <span className="text-muted-foreground">—</span> : (
            <ol className="list-decimal space-y-1 pl-5">
              {keys.map((k, i) => (
                <li key={i}>{k}</li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}

export function JsonPathTester() {
  const [input, setInput] = useState("")
  const [path, setPath] = useState("$")
  const parsed = tryJson(input)
  const results = parsed.ok ? jsonPathSelect(input, path) : []
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="jpt-in" value={input} onChange={setInput} label="JSON Input" placeholder='{"users": [{"id": 1}, {"id": 2}]}' />
      <div className="flex flex-col gap-2">
        <Label htmlFor="jpt-path">JSONPath expression</Label>
        <input
          id="jpt-path"
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="$"
        />
      </div>
      <Formula>
        {parsed.ok
          ? `${results.length} match${results.length === 1 ? "" : "es"} (examples: $.users[0].id, $.users[*].id)`
          : parsed.error ?? ""}
      </Formula>
      {parsed.ok && results.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Matches</span>
          <div className="max-h-80 overflow-auto rounded-md border border-border bg-muted/20 p-3 font-mono text-xs">
            {results.slice(0, 50).map((r, i) => (
              <div key={i} className="mb-1 break-all whitespace-pre-wrap">
                {JSON.stringify(r)}
              </div>
            ))}
            {results.length > 50 && <span className="text-muted-foreground">… and {results.length - 50} more</span>}
          </div>
        </div>
      )}
    </div>
  )
}

export function JsonToCsv() {
  const [input, setInput] = useState("")
  const [delim, setDelim] = useState(",")
  const parsed = tryJson(input)
  let output = ""
  let error = ""
  if (parsed.ok) {
    try {
      output = jsonToCsv(input, delim)
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    }
  }
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="j2c-in" value={input} onChange={setInput} label="JSON (array of objects)" placeholder='[{"name": "Ada", "age": 36}]' />
      <SelectField
        id="j2c-delim"
        label="Delimiter"
        value={delim}
        onChange={setDelim}
        options={[
          { value: ",", label: "Comma" },
          { value: ";", label: "Semicolon" },
          { value: "\t", label: "Tab" },
          { value: "|", label: "Pipe" },
        ]}
      />
      <Formula>{error || (parsed.ok ? "Converted array of objects to CSV" : parsed.error ?? "")}</Formula>
      <CodeOutput label="CSV Output" text={output} />
    </div>
  )
}
