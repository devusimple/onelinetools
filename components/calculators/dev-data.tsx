"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TextAreaInput, CopyButton } from "./text"
import { SelectField, Formula, ResultGrid, ResultRow } from "./shared"
import {
  tryJson,
  csvToJson,
  jsonToYaml,
  xmlToJson,
  jsonToXml,
  xmlFormat,
  xmlMinify,
  tryYaml,
  tryXml,
} from "@/lib/dev-utils"
import type { XmlNode } from "@/lib/dev-utils"

const DELIM_OPTIONS = [
  { value: ",", label: "Comma" },
  { value: ";", label: "Semicolon" },
  { value: "\t", label: "Tab" },
  { value: "|", label: "Pipe" },
]

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

export function CsvToJson() {
  const [input, setInput] = useState("")
  const [delim, setDelim] = useState(",")
  const output = csvToJson(input, delim)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="cvj-in" value={input} onChange={setInput} label="CSV Input" placeholder="name,age,city\nAda,36,London\nAlan,41,Boston" />
      <SelectField id="cvj-delim" label="Delimiter" value={delim} onChange={setDelim} options={DELIM_OPTIONS} />
      <CodeOutput label="JSON Output" text={output} />
    </div>
  )
}

export function JsonToYaml() {
  const [input, setInput] = useState("")
  const [indent, setIndent] = useState("2")
  const parsed = tryJson(input)
  const n = Math.max(2, Math.min(8, Math.round(Number(indent)) || 2))
  const output = parsed.ok ? jsonToYaml(parsed.value, n) : ""
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="jy-in" value={input} onChange={setInput} label="JSON Input" placeholder={'{"name":"Ada","tags":["dev","ml"],"meta":{"age":36}}'} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="jy-indent">Indentation</Label>
        <input
          id="jy-indent"
          type="number"
          min={2}
          max={8}
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={indent}
          onChange={(e) => setIndent(e.target.value)}
        />
      </div>
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (input.trim() === "" ? "border-border text-muted-foreground" : parsed.ok ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {input.trim() === "" ? "Waiting for input" : parsed.ok ? "Converted" : parsed.error}
      </div>
      <CodeOutput label="YAML Output" text={output} />
    </div>
  )
}

export function YamlToJson() {
  const [input, setInput] = useState("")
  const parsed = tryYaml(input)
  const output = parsed.ok ? JSON.stringify(parsed.value, null, 2) : ""
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="yj-in" value={input} onChange={setInput} label="YAML Input" placeholder="name: Ada\ntags:\n  - dev\n  - ml" />
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (input.trim() === "" ? "border-border text-muted-foreground" : parsed.ok ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {input.trim() === "" ? "Waiting for input" : parsed.ok ? "Converted" : parsed.error}
      </div>
      <CodeOutput label="JSON Output" text={output} />
    </div>
  )
}

export function JsonToXml() {
  const [input, setInput] = useState("")
  const [root, setRoot] = useState("root")
  const parsed = tryJson(input)
  const output = parsed.ok ? jsonToXml(input, root.trim() || "root") : ""
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="jx-in" value={input} onChange={setInput} label="JSON Input" placeholder={'{"name":"Ada","age":36,"skills":["js","go"]}'} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="jx-root">Root element name</Label>
        <input
          id="jx-root"
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={root}
          onChange={(e) => setRoot(e.target.value)}
        />
      </div>
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (input.trim() === "" ? "border-border text-muted-foreground" : parsed.ok ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {input.trim() === "" ? "Waiting for input" : parsed.ok ? "Converted" : parsed.error}
      </div>
      <CodeOutput label="XML Output" text={output} />
    </div>
  )
}

export function XmlToJson() {
  const [input, setInput] = useState("")
  const parsed = tryXml(input)
  const output = parsed.ok ? xmlToJson(input) : ""
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="xj-in" value={input} onChange={setInput} label="XML Input" placeholder={'<root><name>Ada</name><age>36</age></root>'} />
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (input.trim() === "" ? "border-border text-muted-foreground" : parsed.ok ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {input.trim() === "" ? "Waiting for input" : parsed.ok ? "Converted" : parsed.error}
      </div>
      <CodeOutput label="JSON Output" text={output} />
    </div>
  )
}

export function XmlFormatter() {
  const [input, setInput] = useState("")
  const output = xmlFormat(input)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="xf-in" value={input} onChange={setInput} label="XML Input" placeholder={'<root><child attr="1"><grand>text</grand></child></root>'} />
      <CodeOutput label="Formatted XML" text={output} />
    </div>
  )
}

export function XmlValidator() {
  const [input, setInput] = useState("")
  const parsed = tryXml(input)
  let depth = 0
  if (parsed.ok && parsed.value && typeof parsed.value === "object") {
    const walk = (node: { children?: unknown[] }, d: number) => {
      depth = Math.max(depth, d)
      if (node && Array.isArray(node.children)) node.children.forEach((c) => walk(c as { children?: unknown[] }, d + 1))
    }
    walk(parsed.value as { children?: unknown[] }, 1)
  }
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="xv-in" value={input} onChange={setInput} label="XML Input" placeholder={'<root><child>text</child></root>'} />
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (input.trim() === "" ? "border-border text-muted-foreground" : parsed.ok ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {input.trim() === "" ? "Waiting for input" : parsed.ok ? "XML is well-formed" : parsed.error}
      </div>
      <ResultGrid>
        <ResultRow label="Root element" value={parsed.ok && typeof parsed.value === "object" && (parsed.value as XmlNode)?.tag ? String((parsed.value as XmlNode).tag) : "—"} />
        <ResultRow label="Max depth" value={parsed.ok ? String(depth) : "—"} />
      </ResultGrid>
    </div>
  )
}

export function XmlMinifier() {
  const [input, setInput] = useState("")
  const output = xmlMinify(input)
  const saved = input.length - output.length
  const pct = input.length > 0 ? Math.round((saved / input.length) * 100) : 0
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="xm-in" value={input} onChange={setInput} label="XML Input" placeholder={'<root>\n  <child> text </child>\n</root>'} />
      <Formula>
        {input.length === 0 ? "" : `${input.length.toLocaleString()} → ${output.length.toLocaleString()} chars · saved ${saved.toLocaleString()} (${pct}%)`}
      </Formula>
      <CodeOutput label="Minified XML" text={output} />
    </div>
  )
}