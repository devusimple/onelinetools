"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TextAreaInput, CopyButton } from "./text"
import { SelectField, Formula, ResultGrid, ResultRow } from "./shared"
import {
  GIT_COMMANDS,
  GITIGNORE_PRESETS,
  CHANGELOG_TYPES,
  DOCKERFILE_PRESETS,
  COMPOSE_PRESETS,
  MOCK_SCHEMAS,
  envKeyValuePairs,
  isEnvKeyValid,
  formatEnvBlock,
} from "@/lib/dev-data"

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

export function GitCheatSheet() {
  const [query, setQuery] = useState("")
  const filtered = GIT_COMMANDS.filter((c) => {
    const q = query.toLowerCase()
    return c.command.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
  })
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="git-q">Search</Label>
        <input
          id="git-q"
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="commit, rebase, branch…"
        />
      </div>
      <Formula>{filtered.length} of {GIT_COMMANDS.length} commands</Formula>
      <div className="max-h-96 overflow-auto rounded-md border border-border bg-muted/20 p-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-1 pr-4">Command</th>
              <th className="py-1">What it does</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={i} className="border-b border-border/50 align-top">
                <td className="py-1.5 pr-4 font-mono text-xs">{c.command}</td>
                <td className="py-1.5 text-xs text-muted-foreground">{c.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function GitignoreGenerator() {
  const [selected, setSelected] = useState<string[]>([])
  const toggle = (v: string) => setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))
  const output = GITIGNORE_PRESETS.filter((p) => selected.includes(p.value))
    .map((p) => `# --- ${p.label} ---\n${p.content}`)
    .join("\n\n")
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label>Presets</Label>
        <div className="flex flex-wrap gap-2">
          {GITIGNORE_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => toggle(p.value)}
              className={
                "h-9 rounded-md border px-3 text-sm shadow-sm " +
                (selected.includes(p.value) ? "border-primary bg-primary/10 text-primary" : "border-input bg-transparent text-muted-foreground")
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <Formula>{selected.length} preset(s) selected → {output.length.toLocaleString()} chars</Formula>
      <CodeOutput label=".gitignore" text={output} />
    </div>
  )
}

export function ChangelogGenerator() {
  const [version, setVersion] = useState("1.0.0")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [entries, setEntries] = useState<{ type: string; text: string }[]>([{ type: "feat", text: "" }])
  const update = (i: number, patch: Partial<{ type: string; text: string }>) =>
    setEntries((es) => es.map((e, j) => (j === i ? { ...e, ...patch } : e)))
  const grouped = CHANGELOG_TYPES.filter((t) => entries.some((e) => e.type === t.value && e.text.trim() !== ""))
  const output = `# Changelog\n\n## ${version} - ${date}\n\n${grouped
    .map((t) => `### ${t.label}\n\n${entries
      .filter((e) => e.type === t.value && e.text.trim() !== "")
      .map((e) => `- ${e.text.trim()}`)
      .join("\n")}`)
    .join("\n\n")}`
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="chg-ver">Version</Label>
          <input
            id="chg-ver"
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0.0"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="chg-date">Date</Label>
          <input
            id="chg-date"
            type="date"
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Label>Changes</Label>
        {entries.map((e, i) => (
          <div key={i} className="flex gap-2">
            <SelectField
              id={`chg-type-${i}`}
              label=""
              value={e.type}
              onChange={(v) => update(i, { type: v })}
              options={CHANGELOG_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            />
            <input
              className="h-10 flex-1 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={e.text}
              onChange={(ev) => update(i, { text: ev.target.value })}
              placeholder="Describe the change…"
            />
            <button
              type="button"
              onClick={() => setEntries((es) => es.filter((_, j) => j !== i))}
              className="h-10 rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground shadow-sm"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setEntries((es) => [...es, { type: "feat", text: "" }])}
          className="h-9 w-fit rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground shadow-sm"
        >
          + Add change
        </button>
      </div>
      <CodeOutput label="CHANGELOG.md" text={output} />
    </div>
  )
}

export function DockerfileGenerator() {
  const [preset, setPreset] = useState(DOCKERFILE_PRESETS[0]?.value ?? "")
  const [port, setPort] = useState("3000")
  const base = DOCKERFILE_PRESETS.find((p) => p.value === preset)
  const output = base
    ? base.content
        .replace(/\{\{PORT\}\}/g, port || "3000")
    : ""
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id="df-preset"
          label="Base image"
          value={preset}
          onChange={setPreset}
          options={DOCKERFILE_PRESETS.map((p) => ({ value: p.value, label: p.label }))}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="df-port">Port</Label>
          <input
            id="df-port"
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={port}
            onChange={(e) => setPort(e.target.value)}
          />
        </div>
      </div>
      <CodeOutput label="Dockerfile" text={output} />
    </div>
  )
}

export function ComposeGenerator() {
  const [preset, setPreset] = useState(COMPOSE_PRESETS[0]?.value ?? "")
  const [port, setPort] = useState("3000")
  const base = COMPOSE_PRESETS.find((p) => p.value === preset)
  const output = base ? base.content.replace(/\{\{PORT\}\}/g, port || "3000") : ""
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id="cp-preset"
          label="Stack"
          value={preset}
          onChange={setPreset}
          options={COMPOSE_PRESETS.map((p) => ({ value: p.value, label: p.label }))}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="cp-port">Host port</Label>
          <input
            id="cp-port"
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={port}
            onChange={(e) => setPort(e.target.value)}
          />
        </div>
      </div>
      <CodeOutput label="docker-compose.yml" text={output} />
    </div>
  )
}

export function MockDataGenerator() {
  const [schema, setSchema] = useState(MOCK_SCHEMAS[0]?.value ?? "")
  const [count, setCount] = useState("5")
  const [, setSeed] = useState(0)
  const n = Math.min(50, Math.max(1, Math.round(Number(count)) || 5))
  const base = MOCK_SCHEMAS.find((s) => s.value === schema)
  const data = base ? base.generate(n) : null
  const output = JSON.stringify(data, null, 2)
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField
          id="md-schema"
          label="Shape"
          value={schema}
          onChange={setSchema}
          options={MOCK_SCHEMAS.map((s) => ({ value: s.value, label: s.label }))}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="md-count">Count</Label>
          <input
            id="md-count"
            type="number"
            min={1}
            max={50}
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
          >
            Regenerate
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Formula>Randomized mock data — click Regenerate for a new set</Formula>
      </div>
      <CodeOutput label="Generated JSON" text={output} />
    </div>
  )
}

export function EnvFileFormatter() {
  const [input, setInput] = useState("")
  const pairs = envKeyValuePairs(input)
  const keys = pairs.filter((p) => p.key !== "")
  const invalid = keys.filter((k) => !isEnvKeyValid(k.key)).map((k) => k.key)
  const output = formatEnvBlock(input)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="env-in" value={input} onChange={setInput} label="Raw .env" placeholder="DB_HOST=localhost\n# production\nDB_PORT=5432\nAPI_KEY = secret" />
      <ResultGrid>
        <ResultRow label="Entries" value={String(pairs.length)} />
        <ResultRow label="Keys" value={String(keys.length)} />
        <ResultRow label="Invalid keys" value={String(invalid.length)} />
      </ResultGrid>
      {invalid.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {invalid.map((k, i) => (
            <p key={i} className="rounded-none bg-red-500/10 px-3 py-2 font-mono text-xs text-red-700 dark:text-red-400">
              Invalid key name: {k}
            </p>
          ))}
        </div>
      )}
      <CodeOutput label="Formatted .env" text={output} />
    </div>
  )
}