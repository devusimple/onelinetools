"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { TextAreaInput } from "./text"
import { SelectField, Formula, ResultGrid, ResultRow } from "./shared"
import {
  HTTP_STATUSES,
  lookupHttpStatus,
  MIME_TYPES,
  lookupMime,
  parseUserAgent,
  ipv4Details,
  isValidIpv6,
  expandIpv6,
  compressIpv6,
  ipv6Details,
  cidrDetails,
  subnetDetails,
  randomMac,
  validateMac,
  parseSemver,
  isSemver,
  formatSemver,
  bumpSemver,
  compareSemver,
  compareVersions,
} from "@/lib/dev-data"

export function HttpStatusChecker() {
  const [code, setCode] = useState("")
  const n = Math.round(Number(code))
  const info = Number.isInteger(n) ? lookupHttpStatus(n) : undefined
  const max = HTTP_STATUSES.length
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="hs-code">HTTP Status Code</Label>
        <input
          id="hs-code"
          type="number"
          min={100}
          max={599}
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="404"
        />
      </div>
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (code === "" ? "border-border text-muted-foreground" : info ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {code === "" ? `Enter a code 100–599 (database has ${max} codes)` : info ? `${n} ${info.title}` : `Unknown code: ${code}`}
      </div>
      {info && (
        <>
          <ResultGrid>
            <ResultRow label="Category" value={info.category} />
            <ResultRow label="Class" value={info.category} />
          </ResultGrid>
          <div className="flex flex-col gap-2">
            <Label>Meaning</Label>
            <span className="text-sm text-muted-foreground">{info.description}</span>
          </div>
        </>
      )}
      <div className="flex flex-col gap-2">
        <Label>Common codes</Label>
        <div className="flex max-h-56 flex-wrap gap-2 overflow-auto rounded-md border border-border bg-muted/20 p-3">
          {[200, 201, 204, 301, 302, 304, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCode(String(c))}
              className="rounded bg-background px-2 py-1 font-mono text-xs ring-1 ring-border hover:bg-primary/10"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MimeTypeLookup() {
  const [query, setQuery] = useState("")
  const results = query.trim() === "" ? [] : lookupMime(query)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="mt-query">Extension or MIME type</Label>
        <input
          id="mt-query"
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="json, png, application/pdf…"
        />
      </div>
      <Formula>{query.trim() === "" ? "" : `${results.length} match(es) of ${MIME_TYPES.length} types`}</Formula>
      <div className="flex max-h-96 flex-col gap-2 overflow-auto">
        {results.length === 0 ? (
          <span className="text-sm text-muted-foreground">—</span>
        ) : (
          results.map((r, i) => (
            <div key={i} className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2">
              <div>
                <p className="font-mono text-xs">.{r.ext}</p>
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </div>
              <code className="rounded bg-background px-2 py-1 text-xs ring-1 ring-border">{r.mime}</code>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function UserAgentParser() {
  const [input, setInput] = useState("")
  const info = parseUserAgent(input)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="ua-in" value={input} onChange={setInput} label="User-Agent String" placeholder="Paste a full User-Agent string from DevTools → Network headers" />
      <ResultGrid>
        <ResultRow label="Browser" value={info.browser} />
        <ResultRow label="Version" value={info.browserVersion || "—"} />
        <ResultRow label="OS" value={info.os} />
        <ResultRow label="Device" value={info.device} />
      </ResultGrid>
    </div>
  )
}

export function Ipv4SubnetCalculator() {
  const [ip, setIp] = useState("")
  const [mask, setMask] = useState("")
  const info = ipv4Details(ip, mask)
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="ip4-ip">IPv4 Address</Label>
          <input
            id="ip4-ip"
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="192.168.1.15"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ip4-mask">Subnet Mask</Label>
          <input
            id="ip4-mask"
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={mask}
            onChange={(e) => setMask(e.target.value)}
            placeholder="255.255.255.0"
          />
        </div>
      </div>
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (info.valid ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {info.valid ? "Valid subnet" : info.error || "Enter an address and mask"}
      </div>
      {info.valid && (
        <ResultGrid>
          <ResultRow label="Network" value={info.network} />
          <ResultRow label="Broadcast" value={info.broadcast} />
          <ResultRow label="First usable" value={info.firstUsable} />
          <ResultRow label="Last usable" value={info.lastUsable} />
          <ResultRow label="Total hosts" value={info.totalHosts.toLocaleString()} />
          <ResultRow label="Usable hosts" value={info.usableHosts.toLocaleString()} />
          <ResultRow label="Prefix" value={`/${info.prefix}`} />
        </ResultGrid>
      )}
    </div>
  )
}

export function Ipv6Expander() {
  const [input, setInput] = useState("")
  const valid = isValidIpv6(input)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="ip6-in" value={input} onChange={setInput} label="IPv6 Address" placeholder="2001:db8::1" />
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (input.trim() === "" ? "border-border text-muted-foreground" : valid ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {input.trim() === "" ? "Waiting for input" : valid ? "Valid IPv6" : "Invalid IPv6 address"}
      </div>
      {valid && (
        <ResultGrid>
          <ResultRow label="Expanded" value={expandIpv6(input)}/>
          <ResultRow label="Compressed" value={compressIpv6(input)}/>
          <ResultRow label="Groups" value={String(expandIpv6(input).split(":").length)} />
        </ResultGrid>
      )}
    </div>
  )
}

export function Ipv6Calculator() {
  const [ip, setIp] = useState("")
  const [prefix, setPrefix] = useState("64")
  const p = Math.min(128, Math.max(0, Math.round(Number(prefix)) || 0))
  const info = ipv6Details(ip, p)
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="ip6c-ip">IPv6 Address</Label>
          <input
            id="ip6c-ip"
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="2001:db8:85a3::8a2e:370:7334"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ip6c-prefix">Prefix Length</Label>
          <input
            id="ip6c-prefix"
            type="number"
            min={0}
            max={128}
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
          />
        </div>
      </div>
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (info.valid ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {info.valid ? "Valid IPv6 subnet" : info.error || "Enter an address and prefix"}
      </div>
      {info.valid && (
        <>
          <ResultGrid>
            <ResultRow label="Expanded" value={info.expanded}/>
            <ResultRow label="Prefix" value={info.prefixHex} />
            <ResultRow label="Addresses" value={info.hosts} />
          </ResultGrid>
          <div className="flex flex-col gap-2">
            <Label>Address groups</Label>
            <div className="flex flex-wrap gap-1.5">
              {info.groups.map((g, i) => (
                <code key={i} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {g}
                </code>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function CidrCalculator() {
  const [input, setInput] = useState("")
  const info = cidrDetails(input)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="cidr-in">CIDR Block</Label>
        <input
          id="cidr-in"
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="192.168.1.0/24"
        />
      </div>
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (input.trim() === "" ? "border-border text-muted-foreground" : info.valid ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {input.trim() === "" ? "Waiting for input" : info.valid ? `IPv${info.version} CIDR block` : info.error}
      </div>
      {info.valid && (
        <ResultGrid>
          {info.version === 4 ? (
            <>
              <ResultRow label="IP" value={info.details.network}/>
              <ResultRow label="Mask" value={info.details.mask}/>
              <ResultRow label="First usable" value={info.details.firstUsable}/>
              <ResultRow label="Last usable" value={info.details.lastUsable}/>
              <ResultRow label="Broadcast" value={info.details.broadcast}/>
              <ResultRow label="Total hosts" value={info.details.totalHosts.toLocaleString()} />
              <ResultRow label="Usable hosts" value={info.details.usableHosts.toLocaleString()} />
            </>
          ) : (
            <>
              <ResultRow label="Address" value={info.details.compressed}/>
              <ResultRow label="Expanded" value={info.details.expanded}/>
              <ResultRow label="Prefix" value={info.details.prefixHex} />
              <ResultRow label="Addresses" value={info.details.hosts} />
            </>
          )}
        </ResultGrid>
      )}
    </div>
  )
}

export function SubnetCalculator() {
  const [input, setInput] = useState("")
  const info = subnetDetails(input)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="sb-in">Mask or prefix</Label>
        <input
          id="sb-in"
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="255.255.255.0 or /24"
        />
      </div>
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (input.trim() === "" ? "border-border text-muted-foreground" : info.valid ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {input.trim() === "" ? "Waiting for input" : info.valid ? "Valid subnet mask" : "Enter a dotted mask like 255.255.255.0 or /24"}
      </div>
      {info.valid && (
        <ResultGrid>
          <ResultRow label="Mask" value={info.mask}/>
          <ResultRow label="Prefix" value={`/${info.prefix}`} />
          <ResultRow label="Wildcard" value={info.wildcard}/>
          <ResultRow label="Usable hosts" value={info.usableHosts.toLocaleString()} />
        </ResultGrid>
      )}
    </div>
  )
}

export function MacGenerator() {
  const [lower, setLower] = useState(false)
  const [sep, setSep] = useState(":")
  const [tick, setTick] = useState(0)
  void tick
  const value = randomMac(lower, sep)
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id="mg-sep"
          label="Separator"
          value={sep}
          onChange={setSep}
          options={[
            { value: ":", label: "Colon (aa:bb:cc)" },
            { value: "-", label: "Hyphen (aa-bb-cc)" },
            { value: ".", label: "Dot (aabb.ccdd)" },
            { value: "", label: "None (aabbcc)" },
          ]}
        />
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => setLower((l) => !l)}
            className={
              "h-10 flex-1 rounded-md border px-3 text-sm shadow-sm " +
              (lower ? "border-primary bg-primary/10 text-primary" : "border-input bg-transparent text-muted-foreground")
            }
          >
            Lowercase
          </button>
          <button
            type="button"
            onClick={() => setLower(false)}
            className="h-10 flex-1 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm text-muted-foreground"
          >
            Uppercase
          </button>
        </div>
      </div>
      <Formula>Random MAC address — regenerates on every change below</Formula>
      <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-4 py-3">
        <code className="font-mono text-lg">{value}</code>
        <button type="button" onClick={() => setTick((t) => t + 1)} className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm">
          Regenerate
        </button>
      </div>
    </div>
  )
}

export function MacValidator() {
  const [input, setInput] = useState("")
  const valid = validateMac(input) && input.trim() !== ""
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="mv-in">MAC Address</Label>
        <input
          id="mv-in"
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="AA:BB:CC:DD:EE:FF"
        />
      </div>
      <div
        className={
          "flex items-center gap-3 border px-4 py-3 text-sm " +
          (input.trim() === "" ? "border-border text-muted-foreground" : valid ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400")
        }
      >
        <span className="size-2 rounded-full bg-current" aria-hidden />
        {input.trim() === "" ? "Waiting for input" : valid ? "Valid MAC address" : "Invalid MAC address"}
      </div>
      <div className="flex flex-col gap-2">
        <Label>Valid formats</Label>
        <span className="text-sm text-muted-foreground">Colons (AA:BB:CC:DD:EE:FF), hyphens (AA-BB-CC-DD-EE-FF), or Cisco dots (AABB.CCDD.EEFF)</span>
      </div>
    </div>
  )
}

export function SemverComparator() {
  const [a, setA] = useState("")
  const [b, setB] = useState("")
  const cmp = compareSemver(a, b)
  let display = ""
  if (isSemver(a.trim()) && isSemver(b.trim()) && a.trim() !== "" && b.trim() !== "") {
    display = cmp === 0 ? "equal" : cmp < 0 ? "<" : ">"
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="sv-a">Version A</Label>
          <input
            id="sv-a"
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={a}
            onChange={(e) => setA(e.target.value)}
            placeholder="1.2.3"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sv-b">Version B</Label>
          <input
            id="sv-b"
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={b}
            onChange={(e) => setB(e.target.value)}
            placeholder="1.10.0"
          />
        </div>
      </div>
      <div
        className={
          "flex items-center justify-center border px-4 py-4 font-mono text-2xl " +
          (display === "" ? "border-border text-muted-foreground" : "border-primary/40 bg-primary/5 text-primary")
        }
      >
        {display === "" ? "A  ?  B" : `${a.trim()} ${display} ${b.trim()}`}
      </div>
      <ResultGrid>
        <ResultRow label="A valid" value={isSemver(a.trim()) && a.trim() !== "" ? "yes" : "no"} />
        <ResultRow label="B valid" value={isSemver(b.trim()) && b.trim() !== "" ? "yes" : "no"} />
      </ResultGrid>
    </div>
  )
}

export function SemverBumper() {
  const [input, setInput] = useState("")
  const [part, setPart] = useState("patch")
  const base = input.trim()
  const parsed = isSemver(base) ? parseSemver(base) : null
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="svb-in">Version</Label>
          <input
            id="svb-in"
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="1.2.3"
          />
        </div>
        <SelectField
          id="svb-part"
          label="Bump"
          value={part}
          onChange={setPart}
          options={[
            { value: "major", label: "Major (breaking)" },
            { value: "minor", label: "Minor (feature)" },
            { value: "patch", label: "Patch (fix)" },
            { value: "prerelease", label: "Prerelease" },
          ]}
        />
      </div>
      {parsed ? (
        <>
          <ResultGrid>
            <ResultRow label="Parsed" value={formatSemver(parsed)}/>
            <ResultRow label="Next" value={bumpSemver(input, part as "major" | "minor" | "patch")}/>
          </ResultGrid>
        </>
      ) : (
        <div className="flex items-center gap-3 border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <span className="size-2 rounded-full bg-current" aria-hidden />
          Enter a valid semver like 1.2.3
        </div>
      )}
    </div>
  )
}

export function VersionComparator() {
  const [a, setA] = useState("")
  const [b, setB] = useState("")
  const result = compareVersions(a, b)
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="vc-a">Version A</Label>
          <input
            id="vc-a"
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={a}
            onChange={(e) => setA(e.target.value)}
            placeholder="2.10.4"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="vc-b">Version B</Label>
          <input
            id="vc-b"
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={b}
            onChange={(e) => setB(e.target.value)}
            placeholder="2.9.20"
          />
        </div>
      </div>
      <div
        className={
          "flex items-center justify-center border px-4 py-4 font-mono text-2xl " +
          (a.trim() === "" || b.trim() === "" ? "border-border text-muted-foreground" : "border-primary/40 bg-primary/5 text-primary")
        }
      >
        {a.trim() === "" || b.trim() === "" ? (
          "A  ?  B"
        ) : result.equal ? (
          `${a.trim()} = ${b.trim()}`
        ) : (
          <>
            {result.newer} &gt; {result.older}
          </>
        )}
      </div>
    </div>
  )
}