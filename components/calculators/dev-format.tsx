"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TextAreaInput, CopyButton } from "./text"
import { SelectField, Formula, ResultGrid, ResultRow } from "./shared"
import {
  parseCsv,
  csvFormat,
  csvValidate,
  csvClean,
  csvMerge,
  csvSplit,
  csvTranspose,
} from "@/lib/dev-utils"
import {
  htmlFormat,
  htmlMinify,
  cssFormat,
  cssMinify,
  jsFormat,
  jsMinify,
  sqlFormat,
  sqlMinify,
  markdownToHtml,
  markdownFormat,
  htmlToMarkdown,
  tryToml,
  iniParse,
} from "@/lib/dev-format-utils"
import { tryYaml } from "@/lib/dev-utils"

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

function SizeStats({ input, output }: { input: string; output: string }) {
  const saved = input.length - output.length
  const pct = input.length > 0 ? Math.round((saved / input.length) * 100) : 0
  return (
    <Formula>
      {input.length.toLocaleString()} → {output.length.toLocaleString()} chars · {saved > 0 ? `saved ${saved.toLocaleString()} (${pct}%)` : "no savings"}
    </Formula>
  )
}

export function HtmlFormatter() {
  const [input, setInput] = useState("")
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="hf-in" value={input} onChange={setInput} label="HTML Input" placeholder="<div><p>Hello</p></div>" />
      <CodeOutput label="Formatted HTML" text={htmlFormat(input)} />
    </div>
  )
}

export function HtmlMinifier() {
  const [input, setInput] = useState("")
  const output = htmlMinify(input)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="hm-in" value={input} onChange={setInput} label="HTML Input" placeholder="<!-- comment --><div>  <p>Hello</p>  </div>" />
      <SizeStats input={input} output={output} />
      <CodeOutput label="Minified HTML" text={output} />
    </div>
  )
}

export function CssFormatter() {
  const [input, setInput] = useState("")
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="csf-in" value={input} onChange={setInput} label="CSS Input" placeholder=".a{color:red;margin:0}@media(max-width:600px){.a{color:blue}}" />
      <CodeOutput label="Formatted CSS" text={cssFormat(input)} />
    </div>
  )
}

export function CssMinifier() {
  const [input, setInput] = useState("")
  const output = cssMinify(input)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="csm-in" value={input} onChange={setInput} label="CSS Input" placeholder="/* comment */\n.a { color: red; margin: 0; }" />
      <SizeStats input={input} output={output} />
      <CodeOutput label="Minified CSS" text={output} />
    </div>
  )
}

function JsTransformTool({ title, transform, placeholder }: { title: string; transform: (s: string) => string; placeholder: string }) {
  const [input, setInput] = useState("")
  const output = transform(input)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="js-in" value={input} onChange={setInput} label={`${title} Input`} placeholder={placeholder} />
      <SizeStats input={input} output={output} />
      <CodeOutput label={`${title} Output`} text={output} />
    </div>
  )
}

export function JavascriptFormatter() {
  return <JsTransformTool title="JavaScript" transform={jsFormat} placeholder={'const x = { a: 1 }; function f(){ return x.a; }'} />
}

export function JavascriptMinifier() {
  return <JsTransformTool title="JavaScript" transform={jsMinify} placeholder={"// comment\nconst add = (a, b) => a + b;"} />
}

export function TypescriptFormatter() {
  return <JsTransformTool title="TypeScript" transform={jsFormat} placeholder={'interface User { name: string; age: number } const u: User = { name: "Ada", age: 36 }'} />
}

export function SqlFormatter() {
  const [input, setInput] = useState("")
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="sf-in" value={input} onChange={setInput} label="SQL Input" placeholder="SELECT id,name FROM users WHERE age>18 ORDER BY name LIMIT 10;" />
      <CodeOutput label="Formatted SQL" text={sqlFormat(input)} />
    </div>
  )
}

export function SqlMinifier() {
  const [input, setInput] = useState("")
  const output = sqlMinify(input)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="sm-in" value={input} onChange={setInput} label="SQL Input" placeholder="-- comment\nSELECT id, name FROM users WHERE age > 18;" />
      <SizeStats input={input} output={output} />
      <CodeOutput label="Minified SQL" text={output} />
    </div>
  )
}

export function MarkdownFormatter() {
  const [input, setInput] = useState("")
  const output = markdownFormat(input)
  const lines = output.split("\n").filter((l) => l.trim() !== "").length
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="mf-in" value={input} onChange={setInput} label="Markdown Input" placeholder="# Title\n\nSome text with trailing spaces  \n\n- item" />
      <Formula>{lines} non-empty lines after normalization</Formula>
      <CodeOutput label="Formatted Markdown" text={output} />
    </div>
  )
}

export function MarkdownPreviewer() {
  const [input, setInput] = useState("")
  const html = markdownToHtml(input)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="mp-in" value={input} onChange={setInput} label="Markdown Input" placeholder="# Hello\n\nThis is **bold** and `code`.\n\n- one\n- two" />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Preview</Label>
          <CopyButton text={html} label="Copy HTML" />
        </div>
        <div
          className="max-h-[28rem] min-h-40 overflow-auto rounded-md border border-border bg-card p-4 text-sm prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-pre:bg-muted prose-pre:p-3 prose-code:bg-muted prose-code:px-1 prose-a:text-primary prose-a:underline prose-li:list-disc prose-li:ml-4"
          dangerouslySetInnerHTML={{ __html: html || "<p class=\"text-muted-foreground\">—</p>" }}
        />
      </div>
    </div>
  )
}

export function MarkdownToHtml() {
  const [input, setInput] = useState("")
  const output = markdownToHtml(input)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="m2h-in" value={input} onChange={setInput} label="Markdown Input" placeholder="# Title\n\nSome **bold** text" />
      <Formula>{output.length.toLocaleString()} characters of HTML</Formula>
      <CodeOutput label="HTML Output" text={output} />
    </div>
  )
}

export function HtmlToMarkdown() {
  const [input, setInput] = useState("")
  const output = htmlToMarkdown(input)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="h2m-in" value={input} onChange={setInput} label="HTML Input" placeholder="<h1>Title</h1><p>Some <strong>bold</strong> text</p>" />
      <CodeOutput label="Markdown Output" text={output} />
    </div>
  )
}

export function YamlValidator() {
  const [input, setInput] = useState("")
  const parsed = tryYaml(input)
  const keys = parsed.ok && parsed.value && typeof parsed.value === "object" ? Object.keys(parsed.value).length : 0
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="yv-in" value={input} onChange={setInput} label="YAML Input" placeholder="name: Ada\nversion: 1.0" />
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (input.trim() === "" ? "border-border text-muted-foreground" : parsed.ok ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {input.trim() === "" ? "Waiting for input" : parsed.ok ? "Valid YAML" : parsed.error}
      </div>
      <ResultGrid>
        <ResultRow label="Top-level keys" value={input.trim() === "" ? "—" : String(keys)} />
        <ResultRow label="Size" value={`${input.length.toLocaleString()} chars`} />
      </ResultGrid>
    </div>
  )
}

export function TomlValidator() {
  const [input, setInput] = useState("")
  const parsed = tryToml(input)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="tv-in" value={input} onChange={setInput} label="TOML Input" placeholder='[server]\nhost = "localhost"\nport = 8080' />
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (input.trim() === "" ? "border-border text-muted-foreground" : parsed.ok ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {input.trim() === "" ? "Waiting for input" : parsed.ok ? "Valid TOML" : parsed.error}
      </div>
      {parsed.ok && (
        <CodeOutput label="Parsed TOML" text={JSON.stringify(parsed.value, null, 2)} />
      )}
    </div>
  )
}

export function IniParser() {
  const [input, setInput] = useState("")
  const entries = iniParse(input)
  const sections = new Set(entries.map((e) => e.section))
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="ip-in" value={input} onChange={setInput} label="INI Input" placeholder="[database]\nhost=localhost\nport=5432\n\n[app]\ndebug=true" />
      <Formula>{entries.length} key/value pairs · {sections.size} sections</Formula>
      <div className="max-h-96 overflow-auto rounded-md border border-border bg-muted/20 p-3">
        {entries.length === 0 ? (
          <span className="text-sm text-muted-foreground">—</span>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-1 pr-4">Section</th>
                <th className="py-1 pr-4">Key</th>
                <th className="py-1">Value</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-1 pr-4 font-mono text-xs">{e.section || "—"}</td>
                  <td className="py-1 pr-4 font-mono">{e.key}</td>
                  <td className="py-1 font-mono text-xs">{e.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export function CsvFormatter() {
  const [input, setInput] = useState("")
  const [delim, setDelim] = useState(",")
  const formatted = csvFormat(input, delim)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="cf-in" value={input} onChange={setInput} label="CSV Input" placeholder="name,age,city\nAda,36,London\nAlan,41,Boston" />
      <SelectField id="cf-delim" label="Delimiter" value={delim} onChange={setDelim} options={DELIM_OPTIONS} />
      <Formula>Columns aligned for readability</Formula>
      <CodeOutput label="Aligned CSV" text={formatted} />
    </div>
  )
}

export function CsvValidator() {
  const [input, setInput] = useState("")
  const [delim, setDelim] = useState(",")
  const result = csvValidate(input, delim)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="cv-in" value={input} onChange={setInput} label="CSV Input" placeholder="a,b,c\n1,2\n1,2,3" />
      <SelectField id="cv-delim" label="Delimiter" value={delim} onChange={setDelim} options={DELIM_OPTIONS} />
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (input.trim() === "" ? "border-border text-muted-foreground" : result.errors.length === 0 ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {input.trim() === "" ? "Waiting for input" : result.errors.length === 0 ? "CSV structure is valid" : `${result.errors.length} issue(s) found`}
      </div>
      <ResultGrid>
        <ResultRow label="Rows" value={input.trim() === "" ? "—" : String(result.rows)} />
        <ResultRow label="Columns" value={input.trim() === "" ? "—" : String(result.columns)} />
      </ResultGrid>
      {result.errors.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {result.errors.map((e, i) => (
            <p key={i} className="rounded-none bg-red-500/10 px-3 py-2 font-mono text-xs text-red-700 dark:text-red-400">
              {e}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export function CsvCleaner() {
  const [input, setInput] = useState("")
  const [delim, setDelim] = useState(",")
  const output = csvClean(input, delim)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="cc-in" value={input} onChange={setInput} label="CSV Input" placeholder="name, age\n  Ada , 36\n\n, \nAlan,41" />
      <SelectField id="cc-delim" label="Delimiter" value={delim} onChange={setDelim} options={DELIM_OPTIONS} />
      <Formula>Trims cells, drops empty rows, normalizes headers</Formula>
      <CodeOutput label="Cleaned CSV" text={output} />
    </div>
  )
}

export function CsvMerger() {
  const [a, setA] = useState("")
  const [b, setB] = useState("")
  const [delim, setDelim] = useState(",")
  const output = csvMerge(a, b, delim)
  const rows = parseCsv(output, delim).length - 1
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextAreaInput id="cm-a" label="First CSV" value={a} onChange={setA} placeholder={"id,name\n1,Ada"} />
        <TextAreaInput id="cm-b" label="Second CSV" value={b} onChange={setB} placeholder={"id,city\n2,London"} />
      </div>
      <SelectField id="cm-delim" label="Delimiter" value={delim} onChange={setDelim} options={DELIM_OPTIONS} />
      <Formula>{output.trim() === "" ? "" : `${Math.max(rows, 0)} data rows merged`}</Formula>
      <CodeOutput label="Merged CSV" text={output} />
    </div>
  )
}

export function CsvSplitter() {
  const [input, setInput] = useState("")
  const [size, setSize] = useState("100")
  const [delim, setDelim] = useState(",")
  const n = Math.max(1, Math.round(Number(size)) || 100)
  const chunks = csvSplit(input, n, delim)
  const raw = parseCsv(input, delim)
  const dataRows = Math.max(raw.length - 1, 0)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="cs-in" value={input} onChange={setInput} label="CSV Input" placeholder="h1,h2\n1,a\n2,b\n3,c" />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField id="cs-delim" label="Delimiter" value={delim} onChange={setDelim} options={DELIM_OPTIONS} />
        <div className="flex flex-col gap-2">
          <Label htmlFor="cs-size">Rows per chunk</Label>
          <input
            id="cs-size"
            type="number"
            min={1}
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
        </div>
      </div>
      <Formula>{dataRows === 0 ? "" : `${dataRows} rows → ${chunks.length} chunk${chunks.length === 1 ? "" : "s"} (header repeated in each)`}</Formula>
      <div className="flex flex-col gap-4">
        {chunks.map((c, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Chunk {i + 1} of {chunks.length}</Label>
              <CopyButton text={c} label="Copy chunk" />
            </div>
            <Textarea readOnly value={c} className="min-h-24 font-mono text-xs" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CsvTransposer() {
  const [input, setInput] = useState("")
  const [delim, setDelim] = useState(",")
  const output = csvTranspose(input, delim)
  const rows = parseCsv(input, delim)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="ct-in" value={input} onChange={setInput} label="CSV Input" placeholder="name,age\nAda,36\nAlan,41" />
      <SelectField id="ct-delim" label="Delimiter" value={delim} onChange={setDelim} options={DELIM_OPTIONS} />
      <Formula>{rows.length > 0 ? `${rows[0].length} columns × ${rows.length} rows → transposed` : ""}</Formula>
      <CodeOutput label="Transposed CSV" text={output} />
    </div>
  )
}
