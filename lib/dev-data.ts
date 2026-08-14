import { randomInt, pick } from "./dev-utils"

/* ------------------------------------------------------------------ */
/* Regex tools                                                         */
/* ------------------------------------------------------------------ */

export interface RegexStep {
  token: string
  explanation: string
}

export function regexExplain(pattern: string): RegexStep[] {
  const steps: RegexStep[] = []
  let i = 0
  while (i < pattern.length) {
    const ch = pattern[i]
    if (ch === "\\") {
      const next = pattern[i + 1] ?? ""
      const map: Record<string, string> = {
        d: "Any digit (0-9)", D: "Any non-digit",
        w: "Any word character [A-Za-z0-9_]", W: "Any non-word character",
        s: "Any whitespace", S: "Any non-whitespace",
        b: "Word boundary", B: "Non-word boundary",
        t: "Tab character", n: "Newline", r: "Carriage return", f: "Form feed", v: "Vertical tab",
        "0": "Null character",
      }
      if (next === "u" || next === "x") {
        const len = next === "u" ? 4 : 2
        const hex = pattern.slice(i + 2, i + 2 + len)
        steps.push({ token: pattern.slice(i, i + 2 + len), explanation: `Unicode/hex escape ${hex}` })
        i += 2 + len
        continue
      }
      steps.push({
        token: pattern.slice(i, i + 2),
        explanation: map[next] ?? `Escaped character "${next}"`,
      })
      i += 2
      continue
    }
    if (ch === "[") {
      let j = i + 1
      while (j < pattern.length && pattern[j] !== "]") {
        if (pattern[j] === "\\") j++
        j++
      }
      if (j < pattern.length) j++
      const cls = pattern.slice(i, j)
      const negated = cls[1] === "^"
      const content = cls.slice(1 + (negated ? 1 : 0), -1)
      steps.push({
        token: cls,
        explanation: `${negated ? "Any character except" : "Any character in"} class [${content}]`,
      })
      i = j
      continue
    }
    if (ch === "(") {
      if (pattern.startsWith("(?=", i)) {
        steps.push({ token: "(?=", explanation: "Positive lookahead" })
        i += 3
        continue
      }
      if (pattern.startsWith("(?!", i)) {
        steps.push({ token: "(?!", explanation: "Negative lookahead" })
        i += 3
        continue
      }
      if (pattern.startsWith("(?<=", i)) {
        steps.push({ token: "(?<=", explanation: "Positive lookbehind" })
        i += 4
        continue
      }
      if (pattern.startsWith("(?<!", i)) {
        steps.push({ token: "(?<!", explanation: "Negative lookbehind" })
        i += 4
        continue
      }
      if (pattern.startsWith("(?:", i)) {
        steps.push({ token: "(?:", explanation: "Non-capturing group" })
        i += 3
        continue
      }
      steps.push({ token: "(", explanation: "Capturing group" })
      i++
      continue
    }
    if (ch === ")") {
      steps.push({ token: ")", explanation: "Close group" })
      i++
      continue
    }
    if (ch === "|") {
      steps.push({ token: "|", explanation: "Alternation (match either side)" })
      i++
      continue
    }
    if (ch === "^") {
      steps.push({ token: "^", explanation: "Start of input / line (with m flag)" })
      i++
      continue
    }
    if (ch === "$") {
      steps.push({ token: "$", explanation: "End of input / line (with m flag)" })
      i++
      continue
    }
    if (ch === ".") {
      steps.push({ token: ".", explanation: "Any single character (except newline)" })
      i++
      continue
    }
    if (ch === "*") {
      steps.push({ token: "*", explanation: "Zero or more of the previous element" })
      i++
      continue
    }
    if (ch === "+") {
      steps.push({ token: "+", explanation: "One or more of the previous element" })
      i++
      continue
    }
    if (ch === "?") {
      steps.push({ token: "?", explanation: "Zero or one of the previous element" })
      i++
      continue
    }
    if (ch === "{") {
      const j = pattern.indexOf("}", i)
      if (j !== -1) {
        steps.push({
          token: pattern.slice(i, j + 1),
          explanation: `Quantifier: exactly/range ${pattern.slice(i + 1, j)}`,
        })
        i = j + 1
        continue
      }
    }
    steps.push({ token: ch, explanation: `Literal "${ch}"` })
    i++
  }
  return steps
}

export interface RegexMatch {
  full: string
  index: number
  groups: string[]
}

export function regexTest(
  pattern: string,
  flags: string,
  text: string
): { ok: boolean; error?: string; matches: RegexMatch[]; source?: string } {
  try {
    const re = new RegExp(pattern, flags)
    const matches: RegexMatch[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      matches.push({
        full: m[0],
        index: m.index,
        groups: m.slice(1).map((g) => (g === undefined ? "" : g)),
      })
      if (m[0] === "") re.lastIndex++
      if (matches.length > 2000) break
    }
    return { ok: true, matches, source: re.source }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), matches: [] }
  }
}

const REGEX_GENERATE_ESCAPES: Record<string, string> = {
  d: "0123456789",
  w: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_",
  s: " \t",
  D: "abcdefghijklmnopqrstuvwxyz",
  W: " -_",
  S: "abcde012",
  t: "\t", n: "\n", r: "\r",
}

function regexGenerateOnce(pattern: string, limit = 120): string {
  let i = 0
  const p = pattern
  let out = ""
  const quant = (atom: () => string) => {
    let mn = 1
    let mx = 1
    if (p[i] === "?") {
      mn = 0
      mx = 1
      i++
    } else if (p[i] === "*") {
      mn = 0
      mx = 3
      i++
    } else if (p[i] === "+") {
      mn = 1
      mx = 3
      i++
    } else if (p[i] === "{") {
      const j = p.indexOf("}", i)
      if (j !== -1) {
        const spec = p.slice(i + 1, j)
        const parts = spec.split(",")
        mn = Math.min(Number(parts[0]) || 0, 5)
        mx = parts[1] !== undefined ? Math.min(Number(parts[1]) || mn, 5) : mn
        if (parts[1] === "") mx = mn + 3
        i = j + 1
      }
    }
    const count = mn + randomInt(Math.max(mx - mn + 1, 1))
    let s = ""
    for (let k = 0; k < count && out.length < limit; k++) s += atom()
    return s
  }
  while (i < p.length && out.length < limit) {
    const ch = p[i]
    if (ch === "\\") {
      const next = p[i + 1] ?? ""
      if (next === "b") {
        i += 2
        continue
      }
      if (next === "u" || next === "x") {
        i += 2 + (next === "u" ? 4 : 2)
        continue
      }
      const pool = REGEX_GENERATE_ESCAPES[next]
      const atom = () => (pool ? pick(pool.split("")) : next)
      out += quant(atom)
      i += 2
      continue
    }
    if (ch === "[") {
      let j = i + 1
      while (j < p.length && p[j] !== "]") {
        if (p[j] === "\\") j++
        j++
      }
      const inner = p.slice(i + 1, Math.min(j, p.length))
      const negated = inner.startsWith("^")
      const content = inner.slice(negated ? 1 : 0)
      const ranges: string[] = []
      for (let k = 0; k < content.length; k++) {
        if (content[k + 1] === "-" && content[k + 2] && content[k + 2] !== "]") {
          const a = content.charCodeAt(k)
          const b = content.charCodeAt(k + 2)
          for (let c = a; c <= b && c < 65536; c++) ranges.push(String.fromCharCode(c))
          k += 2
        } else if (content[k] === "\\") {
          const esc = content[k + 1] ?? ""
          const pool = REGEX_GENERATE_ESCAPES[esc]
          if (pool) ranges.push(...pool.split(""))
          else ranges.push(esc)
          k++
        } else {
          ranges.push(content[k])
        }
      }
      const pool = negated
        ? "abcdefghijklmnopqrstuvwxyz0123456789 "
            .split("")
            .filter((c) => !ranges.includes(c))
            .join("")
        : ranges.join("")
      out += quant(() => (pool ? pick(pool.split("")) : "x"))
      i = Math.min(j + 1, p.length)
      continue
    }
    if (ch === "(") {
      if (p.startsWith("(?:", i) || p.startsWith("(?=", i) || p.startsWith("(?!", i)) {
        let depth = 1
        let k = i
        let end = -1
        while (k < p.length) {
          if (p[k] === "\\") {
            k += 2
            continue
          }
          if (p[k] === "(") depth++
          else if (p[k] === ")") {
            depth--
            if (depth === 0) {
              end = k
              break
            }
          }
          k++
        }
        if (end === -1) {
          out += "("
          i++
          continue
        }
        const inner = p.slice(i + 1, end).replace(/^\?/, "")
        out += quant(() => regexGenerateOnce(inner, limit))
        i = end + 1
        continue
      }
      let depth = 0
      let end = -1
      let k = i
      while (k < p.length) {
        if (p[k] === "\\") {
          k += 2
          continue
        }
        if (p[k] === "(") depth++
        else if (p[k] === ")") {
          depth--
          if (depth === 0) {
            end = k
            break
          }
        }
        k++
      }
      if (end === -1) {
        out += "("
        i++
        continue
      }
      const inner = p.slice(i + 1, end)
      out += quant(() => regexGenerateOnce(inner.replace(/^\?:/, ""), limit))
      i = end + 1
      continue
    }
    if (ch === "|" || ch === "^" || ch === "$") {
      i++
      continue
    }
    const atom = () =>
      ch === "."
        ? pick("abcdefghijklmnopqrstuvwxyz1234567890 ".split(""))
        : ch
    out += quant(atom)
    i++
  }
  return out
}

export function regexExamples(pattern: string, flags: string, count: number): string[] {
  if (!pattern) return []
  try {
    void new RegExp(pattern, flags)
  } catch {
    return []
  }
  const out = new Set<string>()
  for (let i = 0; i < count * 4 && out.size < count; i++) {
    out.add(regexGenerateOnce(pattern))
  }
  return Array.from(out).slice(0, count)
}

export const REGEX_PRESETS: { value: string; label: string }[] = [
  {
    value: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    label: "Email address",
  },
  {
    value: "^(\\+?\\d{1,3})?[-.\\s]?\\(?\\d{1,4}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}$",
    label: "Phone number",
  },
  {
    value: "^(https?:\\/\\/)?([\\w-]+\\.)+[\\w-]{2,}(\\/[\\w-./?%&=]*)?$",
    label: "URL",
  },
  {
    value: "^(25[0-5]|2[0-4]\\d|1?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|1?\\d?\\d)){3}$",
    label: "IPv4 address",
  },
  { value: "^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$", label: "Hex color" },
  { value: "^\\d{4}-\\d{2}-\\d{2}$", label: "Date (YYYY-MM-DD)" },
  {
    value: "^[a-z0-9]+(-[a-z0-9]+)*$",
    label: "Slug",
  },
  { value: "^[a-zA-Z0-9_-]+$", label: "Alphanumeric + dash/underscore" },
  { value: "^\\d{10}$", label: "Ten-digit number" },
]

/* ------------------------------------------------------------------ */
/* Cron tools                                                          */
/* ------------------------------------------------------------------ */

const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function cronFieldDesc(field: string, name: string, values: string[]): string {
  const t = field.trim()
  if (t === "*") return `every ${name}`
  if (t.startsWith("*/")) {
    const step = Number(t.slice(2))
    return `every ${step} ${name}${step === 1 ? "" : "s"}`
  }
  const parts = t.split(",")
  const descs = parts.map((p) => {
    const named = values[Number(p)]
    const range = p.match(/^(\d+)(?:-(\d+))?(\/\d+)?$/)
    if (range) {
      const a = Number(range[1])
      const b = range[2] ? Number(range[2]) : a
      const step = range[3] ? Number(range[3].slice(1)) : 1
      const aName = values[a] ?? String(a)
      const bName = values[b] ?? String(b)
      if (step > 1) return `${aName} through ${bName} every ${step}`
      return a === b ? aName : `${aName} through ${bName}`
    }
    return named ?? p
  })
  const rangeAny = /^(\d+)(?:-\d+)?(\/\d+)?$/.test(t) && !t.includes(",")
  if (rangeAny && descs.length === 1 && values[0] === "0" && name === "minute") {
    return `though minute ${descs[0]}`
  }
  return name === "minute" ? `minute ${descs.join(", ")}` : `on ${descs.join(", ")}`
}

export function cronToDescription(cron: string): string {
  const fields = cron.trim().split(/\s+/)
  if (fields.length !== 5) {
    return "Invalid cron — expected 5 fields (minute hour day-of-month month day-of-week)"
  }
  const [min, hour, dom, mon, dow] = fields
  const parts: string[] = []
  if (min !== "*") parts.push(cronFieldDesc(min, "minute", Array.from({ length: 60 }, (_, i) => String(i))))
  if (hour !== "*") parts.push(cronFieldDesc(hour, "hour", Array.from({ length: 24 }, (_, i) => String(i))))
  if (dom !== "*") parts.push(cronFieldDesc(dom, "day", Array.from({ length: 32 }, (_, i) => String(i ? i : 1))))
  if (mon !== "*") parts.push(cronFieldDesc(mon, "month", MONTHS))
  if (dow !== "*") parts.push(cronFieldDesc(dow, "weekday", DOW))
  const base =
    min === "*" && hour === "*"
      ? "Runs every minute"
      : hour === "*"
        ? `Runs every hour`
        : `Runs at ${hour === "*" ? "every hour" : `hour ${hour === "*" ? "" : ""}`}`
  return `${base}${parts.length ? ", " + parts.join(", ") : ""}`
}

function cronMatchField(field: string, value: number): boolean {
  const t = field.trim()
  if (t === "*") return true
  for (const part of t.split(",")) {
    const range = part.match(/^(\d+)(?:-(\d+))?(\/\d+)?$/)
    if (range) {
      const a = Number(range[1])
      const b = range[2] ? Number(range[2]) : a
      const step = range[3] ? Number(range[3].slice(1)) : 1
      if (value >= a && value <= b && (value - a) % step === 0) return true
    } else if (Number(part) === value) return true
  }
  return false
}

function cronMatches(date: Date, fields: string[]): boolean {
  return (
    cronMatchField(fields[0], date.getMinutes()) &&
    cronMatchField(fields[1], date.getHours()) &&
    cronMatchField(fields[2], date.getDate()) &&
    cronMatchField(fields[3], date.getMonth() + 1) &&
    cronMatchField(fields[4], date.getDay())
  )
}

export function cronNextTimes(cron: string, count = 5): { date: Date; iso: string }[] {
  const fields = cron.trim().split(/\s+/)
  if (fields.length !== 5) return []
  const out: { date: Date; iso: string }[] = []
  const start = new Date()
  start.setSeconds(0, 0)
  const end = new Date(start.getTime() + 3650 * 24 * 60 * 60 * 1000)
  let cur = new Date(start.getTime() + 60000)
  while (cur <= end && out.length < count) {
    if (cronMatches(cur, fields)) {
      out.push({ date: new Date(cur), iso: cur.toISOString() })
    }
    cur = new Date(cur.getTime() + 60000)
  }
  return out
}

export function buildCron(
  min: string,
  hour: string,
  dom: string,
  mon: string,
  dow: string
): string {
  return `${min} ${hour} ${dom} ${mon} ${dow}`.trim()
}

/* ------------------------------------------------------------------ */
/* HTTP status, MIME, User-Agent data                                  */
/* ------------------------------------------------------------------ */

export interface HttpStatus {
  code: number
  title: string
  category: string
  description: string
}

export const HTTP_STATUSES: HttpStatus[] = [
  { code: 100, title: "Continue", category: "Informational", description: "Server received headers; client should continue." },
  { code: 101, title: "Switching Protocols", category: "Informational", description: "Server agrees to switch protocols." },
  { code: 102, title: "Processing", category: "Informational", description: "Server is processing but has no response yet." },
  { code: 200, title: "OK", category: "Success", description: "The request succeeded." },
  { code: 201, title: "Created", category: "Success", description: "Request succeeded and a resource was created." },
  { code: 202, title: "Accepted", category: "Success", description: "Request accepted for processing, completion pending." },
  { code: 203, title: "Non-Authoritative Information", category: "Success", description: "Returned metadata is from a local copy, not the origin." },
  { code: 204, title: "No Content", category: "Success", description: "Request succeeded with no body to return." },
  { code: 205, title: "Reset Content", category: "Success", description: "Client should reset the document view." },
  { code: 206, title: "Partial Content", category: "Success", description: "Server delivers only the requested byte range." },
  { code: 300, title: "Multiple Choices", category: "Redirection", description: "Several possible representations for the resource." },
  { code: 301, title: "Moved Permanently", category: "Redirection", description: "Resource moved permanently to a new URL." },
  { code: 302, title: "Found", category: "Redirection", description: "Resource temporarily located at a different URL." },
  { code: 303, title: "See Other", category: "Redirection", description: "Redirect to another resource via GET." },
  { code: 304, title: "Not Modified", category: "Redirection", description: "Cached copy is still valid." },
  { code: 307, title: "Temporary Redirect", category: "Redirection", description: "Redirect while preserving the method and body." },
  { code: 308, title: "Permanent Redirect", category: "Redirection", description: "Permanent redirect preserving method and body." },
  { code: 400, title: "Bad Request", category: "Client Error", description: "Malformed or otherwise invalid request." },
  { code: 401, title: "Unauthorized", category: "Client Error", description: "Authentication required and missing or failed." },
  { code: 402, title: "Payment Required", category: "Client Error", description: "Reserved for future use." },
  { code: 403, title: "Forbidden", category: "Client Error", description: "Server understood the request but refuses it." },
  { code: 404, title: "Not Found", category: "Client Error", description: "The requested resource could not be found." },
  { code: 405, title: "Method Not Allowed", category: "Client Error", description: "HTTP method is not supported for this resource." },
  { code: 406, title: "Not Acceptable", category: "Client Error", description: "Response would not satisfy content negotiation." },
  { code: 408, title: "Request Timeout", category: "Client Error", description: "Server timed out waiting for the request." },
  { code: 409, title: "Conflict", category: "Client Error", description: "Request conflicts with the current resource state." },
  { code: 410, title: "Gone", category: "Client Error", description: "Resource is permanently no longer available." },
  { code: 413, title: "Payload Too Large", category: "Client Error", description: "Request body is larger than the server permits." },
  { code: 414, title: "URI Too Long", category: "Client Error", description: "Request URI is longer than the server permits." },
  { code: 415, title: "Unsupported Media Type", category: "Client Error", description: "Request media type is not supported." },
  { code: 422, title: "Unprocessable Entity", category: "Client Error", description: "Well-formed request contains semantic errors." },
  { code: 429, title: "Too Many Requests", category: "Client Error", description: "Too many requests sent in a given time period." },
  { code: 431, title: "Request Header Fields Too Large", category: "Client Error", description: "Request headers exceed server limits." },
  { code: 451, title: "Unavailable For Legal Reasons", category: "Client Error", description: "Resource is blocked for legal reasons." },
  { code: 500, title: "Internal Server Error", category: "Server Error", description: "An unexpected server-side condition occurred." },
  { code: 501, title: "Not Implemented", category: "Server Error", description: "Server does not support the requested functionality." },
  { code: 502, title: "Bad Gateway", category: "Server Error", description: "Invalid response received from an upstream server." },
  { code: 503, title: "Service Unavailable", category: "Server Error", description: "Server temporarily overloaded or under maintenance." },
  { code: 504, title: "Gateway Timeout", category: "Server Error", description: "Upstream server did not respond in time." },
  { code: 505, title: "HTTP Version Not Supported", category: "Server Error", description: "Server does not support the HTTP version used." },
]

export function lookupHttpStatus(code: number): HttpStatus | undefined {
  return HTTP_STATUSES.find((s) => s.code === code)
}

export const MIME_TYPES: { ext: string; mime: string; description: string }[] = [
  { ext: "html", mime: "text/html", description: "HTML document" },
  { ext: "css", mime: "text/css", description: "Cascading Style Sheet" },
  { ext: "js", mime: "text/javascript", description: "JavaScript source" },
  { ext: "mjs", mime: "text/javascript", description: "ES module JavaScript" },
  { ext: "json", mime: "application/json", description: "JSON data" },
  { ext: "jsonld", mime: "application/ld+json", description: "JSON-LD data" },
  { ext: "xml", mime: "application/xml", description: "XML document" },
  { ext: "txt", mime: "text/plain", description: "Plain text" },
  { ext: "md", mime: "text/markdown", description: "Markdown document" },
  { ext: "csv", mime: "text/csv", description: "Comma-separated values" },
  { ext: "tsv", mime: "text/tab-separated-values", description: "Tab-separated values" },
  { ext: "yaml", mime: "text/yaml", description: "YAML data" },
  { ext: "yml", mime: "text/yaml", description: "YAML data" },
  { ext: "toml", mime: "application/toml", description: "TOML data" },
  { ext: "svg", mime: "image/svg+xml", description: "Scalable Vector Graphics" },
  { ext: "png", mime: "image/png", description: "PNG image" },
  { ext: "jpg", mime: "image/jpeg", description: "JPEG image" },
  { ext: "jpeg", mime: "image/jpeg", description: "JPEG image" },
  { ext: "gif", mime: "image/gif", description: "GIF image" },
  { ext: "webp", mime: "image/webp", description: "WebP image" },
  { ext: "ico", mime: "image/x-icon", description: "Icon image" },
  { ext: "bmp", mime: "image/bmp", description: "Bitmap image" },
  { ext: "avif", mime: "image/avif", description: "AVIF image" },
  { ext: "mp3", mime: "audio/mpeg", description: "MPEG audio" },
  { ext: "wav", mime: "audio/wav", description: "WAV audio" },
  { ext: "ogg", mime: "audio/ogg", description: "Ogg audio" },
  { ext: "mp4", mime: "video/mp4", description: "MPEG-4 video" },
  { ext: "webm", mime: "video/webm", description: "WebM video" },
  { ext: "mov", mime: "video/quicktime", description: "QuickTime video" },
  { ext: "zip", mime: "application/zip", description: "ZIP archive" },
  { ext: "gz", mime: "application/gzip", description: "GZIP archive" },
  { ext: "tar", mime: "application/x-tar", description: "TAR archive" },
  { ext: "7z", mime: "application/x-7z-compressed", description: "7-Zip archive" },
  { ext: "rar", mime: "application/vnd.rar", description: "RAR archive" },
  { ext: "pdf", mime: "application/pdf", description: "PDF document" },
  { ext: "doc", mime: "application/msword", description: "Word document" },
  { ext: "docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", description: "Word document (modern)" },
  { ext: "xls", mime: "application/vnd.ms-excel", description: "Excel spreadsheet" },
  { ext: "xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", description: "Excel spreadsheet (modern)" },
  { ext: "ppt", mime: "application/vnd.ms-powerpoint", description: "PowerPoint presentation" },
  { ext: "wasm", mime: "application/wasm", description: "WebAssembly module" },
  { ext: "ttf", mime: "font/ttf", description: "TrueType font" },
  { ext: "woff", mime: "font/woff", description: "WOFF font" },
  { ext: "woff2", mime: "font/woff2", description: "WOFF2 font" },
]

export function lookupMime(query: string): { ext: string; mime: string; description: string }[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return MIME_TYPES.filter(
    (m) => m.ext.toLowerCase().includes(q) || m.mime.toLowerCase().includes(q)
  )
}

export function parseUserAgent(ua: string): {
  browser: string
  browserVersion: string
  os: string
  device: string
} {
  const s = ua || ""
  let browser = "Unknown"
  let browserVersion = ""
  let os = "Unknown"
  let device = "Desktop"
  const bots = ["Googlebot", "bingbot", "DuckDuckBot", "Baiduspider", "YandexBot", "AhrefsBot", "SemrushBot", "facebookexternalhit"]
  const bot = bots.find((b) => s.includes(b))
  if (bot) {
    return { browser: "Bot / Crawler", browserVersion: bot, os: "—", device: "—" }
  }
  const edge = s.match(/Edg\/([\d.]+)/)
  if (edge) {
    browser = "Microsoft Edge"
    browserVersion = edge[1]
  } else {
    const version = s.match(/version\/([\d.]+)/i)
    if (/crios|micromessenger|android.*chrome/i.test(s)) {
      browser = "Chrome (mobile)"
    } else if (/firefox|deer/i.test(s)) {
      browser = "Firefox"
      browserVersion = s.match(/firefox\/([\d.]+)/i)?.[1] || ""
    } else if (/opr\/|opera/i.test(s)) {
      browser = "Opera"
      browserVersion = s.match(/opr\/([\d.]+)/i)?.[1] || version?.[1] || ""
    } else if (/safari/i.test(s) && !/chrome/i.test(s)) {
      browser = "Safari"
      browserVersion = version?.[1] || ""
    } else if (/chrome|crios/i.test(s)) {
      browser = "Chrome"
      browserVersion = s.match(/(?:chrome|crios)\/([\d.]+)/i)?.[1] || ""
    } else if (/msie|trident/i.test(s)) {
      browser = "Internet Explorer"
      browserVersion = s.match(/msie ([\d.]+)/i)?.[1] || ""
    }
  }
  if (/iPhone|iPad|iPod/i.test(s)) {
    device = /iPad/.test(s) ? "Tablet" : "Mobile"
    os = s.match(/CPU iPhone OS ([\d_]+)/)?.[1].replace(/_/g, ".") || "iOS"
  } else if (/Android/i.test(s)) {
    device = /Mobile/.test(s) ? "Mobile" : "Tablet"
    os = s.match(/Android ([\d.]+)/)?.[1] || "Android"
  } else if (/Windows/i.test(s)) {
    os = s.match(/Windows NT ([\d.]+)/)?.[1]
      ? `Windows NT ${s.match(/Windows NT ([\d.]+)/)?.[1]}`
      : "Windows"
  } else if (/Macintosh|Mac OS X/i.test(s)) {
    os = "macOS"
  } else if (/Linux/i.test(s)) {
    os = "Linux"
  } else if (/CrOS/i.test(s)) {
    os = "ChromeOS"
  }
  return { browser, browserVersion, os, device }
}

/* ------------------------------------------------------------------ */
/* IP / CIDR / MAC utilities                                           */
/* ------------------------------------------------------------------ */

export function isValidIpv4(s: string): boolean {
  const parts = s.trim().split(".")
  if (parts.length !== 4) return false
  return parts.every(
    (p) => p !== "" && /^\d+$/.test(p) && Number(p) >= 0 && Number(p) <= 255 && !/^0\d/.test(p)
  )
}

export function ipv4ToInt(s: string): number | null {
  if (!isValidIpv4(s)) return null
  return s
    .trim()
    .split(".")
    .reduce((acc, p) => acc * 256 + Number(p), 0)
}

export function intToIpv4(n: number): string {
  return [
    (n >>> 24) & 255,
    (n >>> 16) & 255,
    (n >>> 8) & 255,
    n & 255,
  ].join(".")
}

export function prefixToIpv4Mask(prefix: number): string {
  const p = Math.min(Math.max(prefix, 0), 32)
  if (p === 0) return "0.0.0.0"
  return intToIpv4((0xffffffff << (32 - p)) >>> 0)
}

export function ipv4MaskToPrefix(mask: string): number | null {
  if (!isValidIpv4(mask)) return null
  const n = ipv4ToInt(mask)
  if (n === null) return null
  let prefix = 0
  for (let i = 31; i >= 0; i--) {
    if ((n >>> i) & 1) prefix++
    else break
  }
  if ((n >>> (32 - prefix)) !== (0xffffffff >>> (32 - prefix)) && prefix < 32) return null
  return prefix
}

export interface Ipv4Details {
  valid: boolean
  error?: string
  network: string
  broadcast: string
  firstUsable: string
  lastUsable: string
  totalHosts: number
  usableHosts: number
  prefix: number
  mask: string
}

export function ipv4Details(ip: string, mask: string): Ipv4Details {
  const ipInt = ipv4ToInt(ip)
  if (ipInt === null) return { valid: false, error: "Invalid IPv4 address", network: "—", broadcast: "—", firstUsable: "—", lastUsable: "—", totalHosts: 0, usableHosts: 0, prefix: 0, mask: "—" }
  const prefix = ipv4MaskToPrefix(mask)
  if (prefix === null) return { valid: false, error: "Invalid subnet mask", network: "—", broadcast: "—", firstUsable: "—", lastUsable: "—", totalHosts: 0, usableHosts: 0, prefix: 0, mask: "—" }
  const maskInt = (0xffffffff << (32 - prefix)) >>> 0
  const network = ipInt & maskInt
  const broadcast = network | (0xffffffff ^ maskInt)
  const totalHosts = Math.pow(2, 32 - prefix)
  const usableHosts = Math.max(totalHosts - 2, 0)
  return {
    valid: true,
    network: intToIpv4(network),
    broadcast: intToIpv4(broadcast),
    firstUsable: prefix >= 31 ? intToIpv4(network) : intToIpv4(network + 1),
    lastUsable: prefix >= 31 ? intToIpv4(broadcast) : intToIpv4(broadcast - 1),
    totalHosts,
    usableHosts,
    prefix,
    mask: prefixToIpv4Mask(prefix),
  }
}

export function isValidIpv6(s: string): boolean {
  const t = s.trim()
  if (t === "" || t.includes(" ")) return false
  const withZone = t.split("%")[0]
  if (withZone.includes("::")) {
    if (withZone.split("::").length > 2) return false
    const [left, right] = withZone.split("::")
    const l = left === "" ? 0 : left.split(":").length
    const r = right === "" ? 0 : right.split(":").length
    if (l + r > 7) return false
    const check = (part: string) =>
      part === "" || /^[0-9a-fA-F]{1,4}$/.test(part)
    return (
      (left === "" || left.split(":").every(check)) &&
      (right === "" || right.split(":").every(check))
    )
  }
  const parts = withZone.split(":")
  return parts.length === 8 && parts.every((p) => /^[0-9a-fA-F]{1,4}$/.test(p))
}

export function expandIpv6(s: string): string {
  const t = s.trim().split("%")[0]
  if (!t) return "::"
  const parts = t.split("::")
  if (parts.length === 2) {
    const left = parts[0] === "" ? [] : parts[0].split(":")
    const right = parts[1] === "" ? [] : parts[1].split(":")
    const missing = 8 - left.length - right.length
    const expanded = [...left, ...Array(missing).fill("0"), ...right]
    return expanded.map((p) => p.padStart(4, "0")).join(":")
  }
  const expanded = t.split(":")
  return expanded.map((p) => p.padStart(4, "0")).join(":")
}

export function compressIpv6(s: string): string {
  if (!isValidIpv6(s)) return s.trim()
  const groups = expandIpv6(s).split(":").map((g) => g.replace(/^0+/, "") || "0")
  let best = -1
  let bestLen = 0
  let run = 0
  for (let i = 0; i < groups.length; i++) {
    if (groups[i] === "0") run++
    else run = 0
    if (run > bestLen) {
      bestLen = run
      best = i - run + 1
    }
  }
  if (bestLen > 1) {
    groups.splice(best, bestLen, "::")
  }
  return groups.join(":")
}

export interface Ipv6Details {
  valid: boolean
  expanded: string
  compressed: string
  groups: string[]
  prefix: number
  prefixHex: string
  hosts: string
  error?: string
}

export function ipv6Details(ip: string, prefix: number): Ipv6Details {
  if (!isValidIpv6(ip)) {
    return { valid: false, expanded: "—", compressed: "—", groups: [], prefix: 0, prefixHex: "—", hosts: "—", error: "Invalid IPv6 address" }
  }
  const expanded = expandIpv6(ip).split(":")
  const p = Math.min(Math.max(prefix, 0), 128)
  const hostBits = 128 - p
  return {
    valid: true,
    expanded: expanded.join(":"),
    compressed: compressIpv6(ip),
    groups: expanded,
    prefix: p,
    prefixHex: p === 0 ? "/0" : `/${p}`,
    hosts: hostBits <= 0 ? "1" : `2^${hostBits}`,
  }
}

export function cidrDetails(cidr: string):
  | { valid: true; version: 4; details: Ipv4Details }
  | { valid: true; version: 6; details: Ipv6Details }
  | { valid: false; error: string } {
  const t = cidr.trim()
  const m = t.match(/^([^/]+)\/(\d+)$/)
  if (!m) return { valid: false, error: "Expected CIDR like 192.168.1.0/24" }
  const prefix = Number(m[2])
  if (isValidIpv4(m[1])) {
    if (prefix > 32) return { valid: false, error: "IPv4 prefix must be 0-32" }
    return { valid: true, version: 4, details: ipv4Details(m[1], prefixToIpv4Mask(prefix)) }
  }
  if (isValidIpv6(m[1])) {
    if (prefix > 128) return { valid: false, error: "IPv6 prefix must be 0-128" }
    return { valid: true, version: 6, details: ipv6Details(m[1], prefix) }
  }
  return { valid: false, error: "Invalid IP address" }
}

export interface SubnetInfo {
  mask: string
  prefix: number
  wildcard: string
  usableHosts: number
  valid: boolean
}

export function subnetDetails(input: string): SubnetInfo {
  const t = input.trim()
  const asPrefix = t.match(/^\/(\d+)$/)
  if (asPrefix) {
    const p = Number(asPrefix[1])
    if (isValidIpv4("1.2.3.4") && p >= 0 && p <= 32) {
      const mask = prefixToIpv4Mask(p)
      return {
        mask,
        prefix: p,
        wildcard: intToIpv4((0xffffffff ^ ((0xffffffff << (32 - p)) >>> 0)) >>> 0),
        usableHosts: Math.max(Math.pow(2, 32 - p) - 2, 0),
        valid: true,
      }
    }
  }
  if (!isValidIpv4(t)) return { mask: "—", prefix: 0, wildcard: "—", usableHosts: 0, valid: false }
  const prefix = ipv4MaskToPrefix(t)
  if (prefix === null) return { mask: "—", prefix: 0, wildcard: "—", usableHosts: 0, valid: false }
  return {
    mask: t,
    prefix,
    wildcard: intToIpv4((0xffffffff ^ ((0xffffffff << (32 - prefix)) >>> 0)) >>> 0),
    usableHosts: Math.max(Math.pow(2, 32 - prefix) - 2, 0),
    valid: true,
  }
}

export function randomMac(lowercase = false, separator = ":"): string {
  const bytes = new Uint8Array(6)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 6; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  bytes[0] = (bytes[0] & 0xfe) | 0x02
  let hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(separator)
  if (lowercase) hex = hex.toLowerCase()
  return hex
}

export function validateMac(mac: string): boolean {
  const t = mac.trim()
  const hex = t.replace(/[:.-]/g, "")
  return /^[0-9a-fA-F]{12}$/.test(hex) && (t.includes(":") || t.includes("-") || t.includes(".") || t.length === 12)
}

/* ------------------------------------------------------------------ */
/* SemVer utilities                                                    */
/* ------------------------------------------------------------------ */

export interface Semver {
  major: number
  minor: number
  patch: number
  prerelease: string[]
  build: string[]
}

export function parseSemver(v: string): Semver | null {
  const m = v
    .trim()
    .match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/)
  if (!m) return null
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    prerelease: m[4] ? m[4].split(".") : [],
    build: m[5] ? m[5].split(".") : [],
  }
}

export function isSemver(v: string): boolean {
  return parseSemver(v) !== null
}

export function formatSemver(s: Semver): string {
  let out = `${s.major}.${s.minor}.${s.patch}`
  if (s.prerelease.length > 0) out += "-" + s.prerelease.join(".")
  if (s.build.length > 0) out += "+" + s.build.join(".")
  return out
}

export function bumpSemver(v: string, part: "major" | "minor" | "patch"): string {
  const s = parseSemver(v)
  if (!s) return v
  if (part === "major") {
    s.major++
    s.minor = 0
    s.patch = 0
  } else if (part === "minor") {
    s.minor++
    s.patch = 0
  } else {
    s.patch++
  }
  s.prerelease = []
  s.build = []
  return formatSemver(s)
}

export function compareSemver(a: string, b: string): number {
  const sa = parseSemver(a)
  const sb = parseSemver(b)
  if (!sa || !sb) return 0
  if (sa.major !== sb.major) return sa.major < sb.major ? -1 : 1
  if (sa.minor !== sb.minor) return sa.minor < sb.minor ? -1 : 1
  if (sa.patch !== sb.patch) return sa.patch < sb.patch ? -1 : 1
  const preCompare = (x: string[], y: string[]): number => {
    if (x.length === 0 && y.length === 0) return 0
    if (x.length === 0) return 1
    if (y.length === 0) return -1
    for (let i = 0; i < Math.max(x.length, y.length); i++) {
      const px = x[i]
      const py = y[i]
      if (px === undefined) return -1
      if (py === undefined) return 1
      const nx = /^\d+$/.test(px)
      const ny = /^\d+$/.test(py)
      if (nx && ny) {
        if (Number(px) !== Number(py)) return Number(px) < Number(py) ? -1 : 1
      } else {
        const c = px.localeCompare(py)
        if (c !== 0) return c < 0 ? -1 : 1
      }
    }
    return 0
  }
  return preCompare(sa.prerelease, sb.prerelease)
}

export function compareVersions(a: string, b: string): { equal: boolean; newer: string; older: string } {
  const ca = compareSemver(a, b)
  if (ca === 0) return { equal: true, newer: a, older: b }
  return ca < 0 ? { equal: false, newer: b, older: a } : { equal: false, newer: a, older: b }
}

/* ------------------------------------------------------------------ */
/* Presets for generators                                              */
/* ------------------------------------------------------------------ */

export const GIT_COMMANDS: { command: string; description: string }[] = [
  { command: "git init", description: "Initialize a new repository" },
  { command: "git clone <url>", description: "Clone a remote repository" },
  { command: "git status", description: "Show working tree status" },
  { command: "git add .", description: "Stage all changes" },
  { command: "git commit -m \"message\"", description: "Commit staged changes" },
  { command: "git commit --amend", description: "Amend the last commit" },
  { command: "git log --oneline", description: "Show commit history (one line each)" },
  { command: "git diff", description: "Show unstaged changes" },
  { command: "git diff --staged", description: "Show staged changes" },
  { command: "git branch", description: "List local branches" },
  { command: "git branch <name>", description: "Create a new branch" },
  { command: "git checkout <branch>", description: "Switch to a branch" },
  { command: "git switch <branch>", description: "Switch branches (modern)" },
  { command: "git checkout -b <branch>", description: "Create and switch to a branch" },
  { command: "git merge <branch>", description: "Merge a branch into current" },
  { command: "git rebase <branch>", description: "Reapply commits on top of another branch" },
  { command: "git pull", description: "Fetch and merge remote changes" },
  { command: "git pull --rebase", description: "Fetch and rebase onto remote" },
  { command: "git push", description: "Push commits to the remote" },
  { command: "git push --set-upstream origin <branch>", description: "Push and set upstream tracking" },
  { command: "git push --force-with-lease", description: "Force push safely" },
  { command: "git stash", description: "Stash uncommitted changes" },
  { command: "git stash pop", description: "Restore the most recent stash" },
  { command: "git stash list", description: "List stashes" },
  { command: "git tag <name>", description: "Create a tag at HEAD" },
  { command: "git tag -a v1.0.0 -m \"message\"", description: "Create an annotated tag" },
  { command: "git remote -v", description: "Show configured remotes" },
  { command: "git fetch", description: "Download remote refs without merging" },
  { command: "git reset --hard HEAD", description: "Discard all local changes" },
  { command: "git reset --soft HEAD~1", description: "Undo the last commit, keep changes" },
  { command: "git revert <commit>", description: "Create a commit that undoes another" },
  { command: "git cherry-pick <commit>", description: "Apply a specific commit to current branch" },
  { command: "git show <commit>", description: "Show details of a commit" },
  { command: "git help <command>", description: "Show help for a git command" },
]

export const GITIGNORE_PRESETS: { value: string; label: string; content: string }[] = [
  {
    value: "node",
    label: "Node.js",
    content: `node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
.lock-wscript
.DS_Store
*.log`,
  },
  {
    value: "python",
    label: "Python",
    content: `__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/
*.egg-info/
.pytest_cache/
.mypy_cache/
htmlcov/`,
  },
  {
    value: "java",
    label: "Java / Maven / Gradle",
    content: `target/
*.class
*.jar
*.war
*.ear
*.log
.gradle/
build/
out/`,
  },
  {
    value: "macos",
    label: "macOS",
    content: `.DS_Store
.AppleDouble
.LSOverride
._*
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns
.com.apple.timemachine.donotpresent`,
  },
  {
    value: "windows",
    label: "Windows",
    content: `Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
*.stackdump
[Dd]esktop.ini
$RECYCLE.BIN/
*.lnk`,
  },
  {
    value: "vscode",
    label: "VS Code",
    content: `.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
*.code-workspace`,
  },
  {
    value: "idea",
    label: "JetBrains IDEs",
    content: `.idea/
*.iml
*.ipr
*.iws
out/
.classpath
.project
.settings/`,
  },
  {
    value: "react",
    label: "React / Create React App",
    content: `node_modules/
build/
public/
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-error.log*`,
  },
  {
    value: "django",
    label: "Django / Python Web",
    content: `__pycache__/
*.pyc
db.sqlite3
/media/
/staticfiles/
.env
*.log`,
  },
  {
    value: "go",
    label: "Go",
    content: `# Binaries
*.exe
*.exe~
*.dll
*.so
*.dylib
bin/

# Test binary
*.test

# Output of the go coverage tool
*.out

# Dependency directories
vendor/`,
  },
  {
    value: "rust",
    label: "Rust",
    content: `/target
**/*.rs.bk
*.pdb
Cargo.lock`,
  },
  {
    value: "dotnet",
    label: ".NET",
    content: `bin/
obj/
*.user
*.suo
.vs/
*.userprefs
TestResults/
[Dd]ebugPub/
[Rr]elease*/`,
  },
]

export const CHANGELOG_TYPES: { value: string; label: string; description: string }[] = [
  { value: "feat", label: "Features", description: "New capabilities" },
  { value: "fix", label: "Bug Fixes", description: "Bug and defect resolutions" },
  { value: "perf", label: "Performance", description: "Performance improvements" },
  { value: "refactor", label: "Refactors", description: "Code restructuring" },
  { value: "docs", label: "Documentation", description: "Documentation changes" },
  { value: "test", label: "Tests", description: "Test additions or updates" },
  { value: "build", label: "Build System", description: "Build or dependency changes" },
  { value: "chore", label: "Chores", description: "Maintenance tasks" },
  { value: "ci", label: "Continuous Integration", description: "CI configuration changes" },
]

export const DOCKERFILE_PRESETS: { value: string; label: string; content: string }[] = [
  {
    value: "node",
    label: "Node.js app",
    content: `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]`,
  },
  {
    value: "python",
    label: "Python app",
    content: `FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]`,
  },
  {
    value: "go",
    label: "Go app",
    content: `FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /bin/app .

FROM scratch
COPY --from=builder /bin/app /bin/app
EXPOSE 8080
ENTRYPOINT ["/bin/app"]`,
  },
  {
    value: "nginx",
    label: "Nginx static site",
    content: `FROM nginx:alpine
COPY dist /usr/share/nginx/html
EXPOSE 80`,
  },
]

export const COMPOSE_PRESETS: { value: string; label: string; content: string }[] = [
  {
    value: "postgres",
    label: "PostgreSQL",
    content: `services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`,
  },
  {
    value: "mysql",
    label: "MySQL",
    content: `services:
  db:
    image: mysql:8
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: app
    ports:
      - "3306:3306"
    volumes:
      - dbdata:/var/lib/mysql

volumes:
  dbdata:`,
  },
  {
    value: "redis",
    label: "Redis",
    content: `services:
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

volumes:
  redisdata:`,
  },
  {
    value: "node",
    label: "Node.js + database",
    content: `services:
  api:
    build: .
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://postgres:postgres@db:5432/app
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`,
  },
]

export const MOCK_SCHEMAS: { value: string; label: string; generate: (count: number) => unknown }[] = [
  {
    value: "user",
    label: "User object",
    generate: (n) => Array.from({ length: Math.max(n, 1) }, () => ({
      id: `usr_${randomHex(8)}`,
      firstName: pick(NAMES.first),
      lastName: pick(NAMES.last),
      email: `${pick(NAMES.first)}${randomInt(100)}@example.com`.toLowerCase(),
      active: Math.random() > 0.3,
      registeredAt: randomIsoDate(),
    })),
  },
  {
    value: "product",
    label: "Product object",
    generate: (n) =>
      Array.from({ length: Math.max(n, 1) }, (_, i) => ({
        id: i + 1,
        sku: `SKU-${randomHex(6).toUpperCase()}`,
        name: `${pick(ADJ)} ${pick(NOUNS)}`,
        category: pick(["electronics", "home", "clothing", "toys", "books"]),
        price: Math.round((Math.random() * 900 + 5) * 100) / 100,
        inStock: Math.random() > 0.2,
        rating: Math.round(Math.random() * 50) / 10,
      })),
  },
  {
    value: "order",
    label: "Order object",
    generate: (n) =>
      Array.from({ length: Math.max(n, 1) }, () => ({
        orderId: `ORD-${randomInt(900000) + 100000}`,
        status: pick(["pending", "paid", "shipped", "delivered", "cancelled"]),
        total: Math.round((Math.random() * 5000 + 20) * 100) / 100,
        currency: "USD",
        items: randomInt(5) + 1,
        created: randomIsoDate(),
      })),
  },
  {
    value: "api-response",
    label: "API response envelope",
    generate: (n) => ({
      success: true,
      page: randomInt(10) + 1,
      pageSize: Math.max(n, 1),
      total: randomInt(500) + n,
      data: Array.from({ length: Math.max(n, 1) }, () => ({
        id: randomHex(10),
        name: `${pick(NAMES.first)} ${pick(NAMES.last)}`,
        value: Math.round(Math.random() * 10000) / 100,
        tags: Array.from({ length: randomInt(4) + 1 }, () => pick(["alpha", "beta", "gamma", "new", "featured", "sale"])),
      })),
    }),
  },
]

const NAMES = {
  first: ["Ada", "Grace", "Alan", "Linus", "Margaret", "Yukihiro", "Ken", "Dennis", "Barbara", "James", "Mira", "Omar", "Zoe", "Nadia", "Tariq"],
  last: ["Lovelace", "Hopper", "Turing", "Torvalds", "Hamilton", "Matsumoto", "Thompson", "Ritchie", "Liskov", "Gosling", "Khan", "Hassan", "Ali", "Ahmed", "Rahman"],
}

const ADJ = ["Swift", "Bright", "Quiet", "Golden", "Silent", "Rapid", "Smart", "Cosmic", "Solar", "Lunar"]
const NOUNS = ["Widget", "Gadget", "Device", "Sensor", "Module", "Ticker", "Proxy", "Router", "Cache", "Bucket"]

function randomHex(len: number): string {
  const bytes = new Uint8Array(Math.ceil(len / 2))
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes)
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, len)
}

function randomIsoDate(): string {
  const d = new Date(Date.now() - randomInt(365 * 86400000))
  return d.toISOString()
}

export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]

export function buildCurlCommand(method: string, url: string, headers: string, body: string): string {
  const parts = [`curl -X ${method.toUpperCase()}`, `"${url.trim()}"`]
  for (const line of headers.split(/\n/)) {
    const t = line.trim()
    if (!t) continue
    const idx = t.indexOf(":")
    if (idx > 0) parts.push(`-H "${t.slice(0, idx).trim()}:"` + `"${t.slice(idx + 1).trim()}"`)
  }
  if (body.trim()) parts.push(`-d '${body.trim().replace(/'/g, "\\'")}'`)
  return parts.join(" \\\n  ")
}

export function buildFetchCommand(method: string, url: string, headers: string, body: string): string {
  const headerObj: string[] = []
  for (const line of headers.split(/\n/)) {
    const t = line.trim()
    if (!t) continue
    const idx = t.indexOf(":")
    if (idx > 0) {
      headerObj.push(`    "${t.slice(0, idx).trim()}": "${t.slice(idx + 1).trim()}"`)
    }
  }
  const options: string[] = [`  method: "${method.toUpperCase()}"`]
  if (headerObj.length) options.push(`  headers: {\n${headerObj.join(",\n")}\n  }`)
  if (body.trim()) options.push(`  body: ${tryJsonString(body)}`)
  return `fetch("${url.trim()}", {\n${options.join(",\n")}\n})`
}

function tryJsonString(body: string): string {
  try {
    JSON.parse(body)
    return body.trim()
  } catch {
    return JSON.stringify(body)
  }
}

export function envKeyValuePairs(input: string): { key: string; value: string; comment: string }[] {
  const out: { key: string; value: string; comment: string }[] = []
  for (const line of input.split(/\r?\n/)) {
    const t = line.trim()
    if (t === "") continue
    if (t.startsWith("#")) {
      out.push({ key: "", value: "", comment: t })
      continue
    }
    const idx = t.indexOf("=")
    if (idx > 0) {
      out.push({ key: t.slice(0, idx).trim(), value: t.slice(idx + 1).trim(), comment: "" })
    }
  }
  return out
}

export function isEnvKeyValid(key: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(key)
}

export function formatEnvBlock(input: string): string {
  const pairs = envKeyValuePairs(input)
  const keys = pairs.filter((p) => p.key !== "").map((p) => p.key)
  const width = Math.max(...keys.map((k) => k.length), 0)
  const lines: string[] = []
  for (const p of pairs) {
    if (p.comment) {
      lines.push(p.comment)
      continue
    }
    const value = /^["'].*["']$/.test(p.value) ? p.value : p.value === "" ? '""' : `"${p.value.replace(/"/g, '\\"')}"`
    lines.push(`${p.key.padEnd(width)} = ${value}`)
  }
  return lines.join("\n")
}