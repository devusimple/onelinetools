"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TextAreaInput, CopyButton } from "./text"
import { Formula } from "./shared"
import {
  HTTP_METHODS,
  buildCurlCommand,
  buildFetchCommand,
  cronToDescription,
  cronNextTimes,
  buildCron,
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

function MethodTabs({ value, onChange }: { value: string; onChange: (m: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {HTTP_METHODS.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={
            "h-8 rounded-md border px-3 font-mono text-xs shadow-sm " +
            (value === m ? "border-primary bg-primary/10 text-primary" : "border-input bg-transparent text-muted-foreground")
          }
        >
          {m}
        </button>
      ))}
    </div>
  )
}

export function HttpRequestBuilder() {
  const [method, setMethod] = useState("GET")
  const [url, setUrl] = useState("")
  const [headers, setHeaders] = useState("")
  const [body, setBody] = useState("")
  const curl = buildCurlCommand(method, url, headers, body)
  const fetchCmd = buildFetchCommand(method, url, headers, body)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label>Method</Label>
        <MethodTabs value={method} onChange={setMethod} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="hrb-url">URL</Label>
        <input
          id="hrb-url"
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/users"
        />
      </div>
      <TextAreaInput id="hrb-headers" label="Headers (one per line)" value={headers} onChange={setHeaders} placeholder={'Content-Type: application/json\nAuthorization: Bearer TOKEN'} />
      {method !== "GET" && method !== "HEAD" && (
        <TextAreaInput id="hrb-body" label="Request body (JSON recommended)" value={body} onChange={setBody} placeholder={'{"name":"Ada"}'} />
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <CodeOutput label="curl" text={curl} />
        <CodeOutput label="fetch" text={fetchCmd} />
      </div>
    </div>
  )
}

export function CurlBuilder() {
  const [method, setMethod] = useState("GET")
  const [url, setUrl] = useState("")
  const [headers, setHeaders] = useState("")
  const [body, setBody] = useState("")
  const curl = buildCurlCommand(method, url, headers, body)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label>Method</Label>
        <MethodTabs value={method} onChange={setMethod} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="crb-url">URL</Label>
        <input
          id="crb-url"
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/users"
        />
      </div>
      <TextAreaInput id="crb-headers" label="Headers (one per line)" value={headers} onChange={setHeaders} placeholder={'Authorization: Bearer TOKEN'} />
      {method !== "GET" && method !== "HEAD" && (
        <TextAreaInput id="crb-body" label="Request body (JSON recommended)" value={body} onChange={setBody} placeholder={'{"name":"Ada"}'} />
      )}
      <CodeOutput label="curl command" text={curl} />
    </div>
  )
}

export function FetchBuilder() {
  const [method, setMethod] = useState("GET")
  const [url, setUrl] = useState("")
  const [headers, setHeaders] = useState("")
  const [body, setBody] = useState("")
  const fetchCmd = buildFetchCommand(method, url, headers, body)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label>Method</Label>
        <MethodTabs value={method} onChange={setMethod} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="fb-url">URL</Label>
        <input
          id="fb-url"
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/users"
        />
      </div>
      <TextAreaInput id="fb-headers" label="Headers (one per line)" value={headers} onChange={setHeaders} placeholder={'Content-Type: application/json'} />
      {method !== "GET" && method !== "HEAD" && (
        <TextAreaInput id="fb-body" label="Request body (JSON recommended)" value={body} onChange={setBody} placeholder={'{"name":"Ada"}'} />
      )}
      <CodeOutput label="fetch() snippet" text={fetchCmd} />
    </div>
  )
}

export function CronParser() {
  const [input, setInput] = useState("")
  const description = cronToDescription(input)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="cp-in">Cron Expression</Label>
        <input
          id="cp-in"
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="*/15 * * * *"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Plain English</Label>
        <div className="rounded-md border border-border bg-muted/20 px-3 py-4">
          <span className="text-lg">{description}</span>
        </div>
      </div>
    </div>
  )
}

export function CronNextRuns() {
  const [input, setInput] = useState("")
  const [count, setCount] = useState("5")
  const n = Math.min(20, Math.max(1, Math.round(Number(count)) || 5))
  const next = cronNextTimes(input, n)
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="crn-in">Cron Expression</Label>
          <input
            id="crn-in"
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="0 9 * * 1-5"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="crn-count">How many</Label>
          <input
            id="crn-count"
            type="number"
            min={1}
            max={20}
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>
      </div>
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (input.trim() === "" ? "border-border text-muted-foreground" : next.length > 0 ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {input.trim() === "" ? "Waiting for input" : next.length > 0 ? cronToDescription(input) : "No upcoming times found"}
      </div>
      {next.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {next.map((t, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 font-mono text-sm"
            >
              <span className="text-muted-foreground">#{i + 1}</span>
              <span>{t.iso}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function CronBuilder() {
  const fields = [
    { key: "min" as const, label: "Minute", hint: "0-59", placeholder: "0" },
    { key: "hour" as const, label: "Hour", hint: "0-23", placeholder: "9" },
    { key: "dom" as const, label: "Day of month", hint: "1-31", placeholder: "*" },
    { key: "mon" as const, label: "Month", hint: "1-12", placeholder: "*" },
    { key: "dow" as const, label: "Day of week", hint: "0-7", placeholder: "1-5" },
  ]
  const [values, setValues] = useState<Record<string, string>>({
    min: "0",
    hour: "9",
    dom: "*",
    mon: "*",
    dow: "1-5",
  })
  const set = (k: string, v: string) => setValues((vs) => ({ ...vs, [k]: v }))
  const cron = buildCron(values.min, values.hour, values.dom, values.mon, values.dow)
  const description = cronToDescription(cron)
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-5">
        {fields.map((f) => (
          <div key={f.key} className="flex flex-col gap-2">
            <Label htmlFor={`cron-${f.key}`}>{f.label}</Label>
            <input
              id={`cron-${f.key}`}
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={values[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.placeholder}
            />
            <span className="text-xs text-muted-foreground">{f.hint}</span>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-primary/40 bg-primary/5 px-4 py-3 font-mono text-lg">
        {cron}
      </div>
      <Formula>{description}</Formula>
      <CodeOutput label="Expression" text={cron} />
    </div>
  )
}