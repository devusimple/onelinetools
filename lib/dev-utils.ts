import { diffLines } from "./text-utils"

/* ------------------------------------------------------------------ */
/* Generic helpers                                                     */
/* ------------------------------------------------------------------ */

export function escapeHtmlEntities(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function unescapeHtmlEntities(s: string): string {
  return s
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function randomInt(max: number): number {
  return Math.floor(Math.random() * max)
}

export function pick<T>(arr: readonly T[]): T {
  return arr[randomInt(arr.length)]
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

/* ------------------------------------------------------------------ */
/* JSON tools                                                          */
/* ------------------------------------------------------------------ */

export interface TryResult {
  ok: boolean
  value?: unknown
  error?: string
}

export function tryJson(input: string): TryResult {
  try {
    return { ok: true, value: JSON.parse(input) }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export function jsonFormat(input: string, indent = 2): string {
  return JSON.stringify(JSON.parse(input), null, indent)
}

export function jsonMinify(input: string): string {
  return JSON.stringify(JSON.parse(input))
}

function sortJsonValue(value: unknown, descending: boolean): unknown {
  if (Array.isArray(value)) return value.map((v) => sortJsonValue(v, descending))
  if (isPlainObject(value)) {
    const entries = Object.entries(value).sort((a, b) => {
      const cmp = a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
      return descending ? -cmp : cmp
    })
    const out: Record<string, unknown> = {}
    for (const [k, v] of entries) out[k] = sortJsonValue(v, descending)
    return out
  }
  return value
}

export function jsonSort(input: string, descending = false): string {
  return JSON.stringify(sortJsonValue(JSON.parse(input), descending), null, 2)
}

export function jsonKeys(input: string): string[] {
  const value = JSON.parse(input)
  const out: string[] = []
  const walk = (v: unknown, prefix: string) => {
    if (Array.isArray(v)) {
      v.forEach((item, i) => walk(item, prefix ? `${prefix}[${i}]` : `[${i}]`))
    } else if (isPlainObject(v)) {
      for (const [k, val] of Object.entries(v)) {
        const path = prefix ? `${prefix}.${k}` : k
        out.push(path)
        walk(val, path)
      }
    }
  }
  walk(value, "")
  return out
}

export function jsonPathSelect(input: string, expr: string): unknown[] {
  const value = JSON.parse(input)
  const trimmed = expr.trim().replace(/^(\$|#)\s*/, "")
  if (!trimmed) return [value]
  const tokens = trimmed.match(
    /\.[A-Za-z0-9_$-]+|\[(?:'[^']*'|"[^"]*"|\*|[0-9]+|-[0-9]+)\]/g
  )
  if (!tokens) return []
  let results: unknown[] = [value]
  for (const tok of tokens) {
    const next: unknown[] = []
    if (tok.startsWith(".")) {
      const key = tok.slice(1)
      for (const r of results) {
        if (isPlainObject(r) && key in r) next.push(r[key])
      }
    } else {
      const inner = tok.slice(1, -1)
      if (inner === "*") {
        for (const r of results) {
          if (Array.isArray(r)) next.push(...r)
          else if (isPlainObject(r)) next.push(...Object.values(r))
        }
      } else {
        const key =
          inner.startsWith("'") || inner.startsWith('"') ? inner.slice(1, -1) : inner
        for (const r of results) {
          if (Array.isArray(r)) {
            const idx = parseInt(key, 10)
            const i = idx < 0 ? r.length + idx : idx
            if (i >= 0 && i < r.length) next.push(r[i])
          } else if (isPlainObject(r) && key in r) {
            next.push(r[key])
          }
        }
      }
    }
    results = next
  }
  return results
}

export function jsonTree(input: string): string {
  const describe = (v: unknown, depth: number): string[] => {
    const pad = "  ".repeat(depth)
    if (v === null) return [`${pad}null`]
    if (Array.isArray(v)) {
      const lines = [`${pad}array (${v.length} items)`]
      v.forEach((item, i) => {
        const child = describe(item, depth + 1)
        lines.push(`${"  ".repeat(depth + 1)}[${i}]: ${child[0].trim()}`)
        lines.push(...child.slice(1))
      })
      return lines
    }
    if (isPlainObject(v)) {
      const keys = Object.keys(v)
      const lines = [`${pad}object (${keys.length} keys)`]
      for (const k of keys) {
        const child = describe(v[k], depth + 1)
        lines.push(`${"  ".repeat(depth + 1)}${k}: ${child[0].trim()}`)
        lines.push(...child.slice(1))
      }
      return lines
    }
    return [`${pad}${typeof v}: ${JSON.stringify(v)}`]
  }
  return describe(JSON.parse(input), 0).join("\n")
}

export function jsonDiff(
  a: string,
  b: string
): { type: "same" | "add" | "del"; text: string }[] {
  const av = tryJson(a)
  const bv = tryJson(b)
  if (!av.ok || !bv.ok) return diffLines(a, b)
  return diffLines(jsonFormat(a), jsonFormat(b))
}

/* ------------------------------------------------------------------ */
/* CSV tools                                                           */
/* ------------------------------------------------------------------ */

export function parseCsv(input: string, delimiter = ","): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let inQuotes = false
  const text = input.replace(/\r\n/g, "\n")
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === delimiter) {
      row.push(cell)
      cell = ""
    } else if (ch === "\n") {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
    } else {
      cell += ch
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

function escapeCsvCell(cell: string, delimiter: string): string {
  if (cell.includes(delimiter) || cell.includes('"') || cell.includes("\n")) {
    return `"${cell.replace(/"/g, '""')}"`
  }
  return cell
}

export function rowsToCsv(rows: string[][], delimiter = ","): string {
  return rows
    .map((r) => r.map((c) => escapeCsvCell(c, delimiter)).join(delimiter))
    .join("\n")
}

export function csvToObjects(input: string, delimiter = ","): Record<string, string>[] {
  const rows = parseCsv(input, delimiter)
  if (rows.length === 0) return []
  const headers = rows[0].map((h) => h.trim())
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      obj[h] = r[i] ?? ""
    })
    return obj
  })
}

export function csvToJson(input: string, delimiter = ","): string {
  return JSON.stringify(csvToObjects(input, delimiter), null, 2)
}

export function jsonToCsv(input: string, delimiter = ","): string {
  const value = JSON.parse(input)
  const rows = Array.isArray(value) ? value : [value]
  if (rows.length === 0) return ""
  if (rows.every((r) => isPlainObject(r))) {
    const headers = Array.from(
      new Set(rows.flatMap((r) => Object.keys(r)))
    )
    const out: string[][] = [headers]
    for (const r of rows) {
      out.push(
        headers.map((h) => (r[h] === undefined || r[h] === null ? "" : String(r[h])))
      )
    }
    return rowsToCsv(out, delimiter)
  }
  return rowsToCsv(rows.map((r) => [r === null ? "" : String(r)]), delimiter)
}

export function csvFormat(input: string, delimiter = ","): string {
  const rows = parseCsv(input, delimiter)
  if (rows.length === 0) return ""
  const cols = Math.max(...rows.map((r) => r.length))
  const widths = Array.from({ length: cols }, (_, c) =>
    Math.max(...rows.map((r) => (r[c] ?? "").length), 1)
  )
  const renderRow = (r: string[]) =>
    r.map((cell, c) => (c === r.length - 1 ? cell : cell.padEnd(widths[c]))).join(" | ")
  return rows.map(renderRow).join("\n")
}

export function csvValidate(
  input: string,
  delimiter = ","
): { errors: string[]; rows: number; columns: number } {
  const errors: string[] = []
  const rows = parseCsv(input, delimiter)
  if (rows.length === 0) return { errors: ["No rows found"], rows: 0, columns: 0 }
  const expected = rows[0].length
  rows.slice(1).forEach((r, i) => {
    if (r.length !== expected) {
      errors.push(`Row ${i + 2} has ${r.length} columns (expected ${expected})`)
    }
  })
  return { errors, rows: rows.length, columns: expected }
}

export function csvClean(input: string, delimiter = ","): string {
  const rows = parseCsv(input, delimiter)
  if (rows.length === 0) return ""
  const headers = rows[0].map((h) => h.trim())
  const clean = rows
    .slice(1)
    .map((r) => r.map((c) => c.trim()))
    .filter((r) => r.some((c) => c !== ""))
  return rowsToCsv([headers, ...clean], delimiter)
}

export function csvMerge(a: string, b: string, delimiter = ","): string {
  const rowsA = parseCsv(a, delimiter)
  const rowsB = parseCsv(b, delimiter)
  if (rowsA.length === 0) return b
  if (rowsB.length === 0) return a
  const headersA = rowsA[0].map((h) => h.trim())
  const headersB = rowsB[0].map((h) => h.trim())
  const union = Array.from(new Set([...headersA, ...headersB]))
  const toRow = (h: string[], r: string[]) => union.map((u) => r[h.indexOf(u)] ?? "")
  const out = [union]
  for (const r of rowsA.slice(1)) out.push(toRow(headersA, r))
  for (const r of rowsB.slice(1)) out.push(toRow(headersB, r))
  return rowsToCsv(out, delimiter)
}

export function csvSplit(input: string, chunkSize: number, delimiter = ","): string[] {
  const rows = parseCsv(input, delimiter)
  if (rows.length <= 1) return [input]
  const header = rows[0]
  const body = rows.slice(1)
  const chunks: string[][][] = []
  for (let i = 0; i < body.length; i += chunkSize) {
    chunks.push([header, ...body.slice(i, i + chunkSize)])
  }
  return chunks.map((c) => rowsToCsv(c, delimiter))
}

export function csvTranspose(input: string, delimiter = ","): string {
  const rows = parseCsv(input, delimiter)
  if (rows.length === 0) return ""
  const width = Math.max(...rows.map((r) => r.length))
  const out: string[][] = []
  for (let c = 0; c < width; c++) {
    out.push(rows.map((r) => r[c] ?? ""))
  }
  return rowsToCsv(out, delimiter)
}

/* ------------------------------------------------------------------ */
/* YAML tools                                                          */
/* ------------------------------------------------------------------ */

function yamlIndent(line: string): number {
  return line.length - line.trimStart().length
}

function yamlUnquote(s: string): string {
  const t = s.trim()
  if (t.length < 2) return t
  if (t.startsWith('"') && t.endsWith('"')) {
    try {
      return JSON.parse(t)
    } catch {
      return t.slice(1, -1)
    }
  }
  if (t.startsWith("'") && t.endsWith("'")) return t.slice(1, -1).replace(/''/g, "'")
  return t
}

function yamlScalar(s: string): unknown {
  const t = s.trim()
  if (t === "" || t === "~" || t === "null" || t === "Null" || t === "NULL") return null
  if (t === "true" || t === "True" || t === "TRUE") return true
  if (t === "false" || t === "False" || t === "FALSE") return false
  if (t.startsWith('"') || t.startsWith("'")) return yamlUnquote(t)
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t)
  return t
}

function yamlFlow(s: string): unknown {
  const t = s.trim()
  if (t.startsWith("[")) {
    if (t === "[]") return []
    const inner = t.slice(1, -1)
    if (inner.startsWith("{")) return yamlFlow(inner)
    return inner.split(",").map((p) => yamlScalar(p))
  }
  if (t.startsWith("{")) {
    if (t === "{}") return {}
    const inner = t.slice(1, -1)
    const obj: Record<string, unknown> = {}
    for (const part of inner.split(",")) {
      const idx = part.indexOf(":")
      if (idx > 0) obj[part.slice(0, idx).trim()] = yamlScalar(part.slice(idx + 1))
    }
    return obj
  }
  return yamlScalar(t)
}

function yamlParseValue(
  rest: string,
  lines: string[],
  index: number,
  indent: number
): { value: unknown; next: number } {
  const t = rest.trim()
  if (t.startsWith("[") || t.startsWith("{")) {
    return { value: yamlFlow(t), next: index + 1 }
  }
  if (t === "") {
    let j = index + 1
    while (j < lines.length && lines[j].trim() === "") j++
    if (j < lines.length && yamlIndent(lines[j]) > indent) {
      return yamlParseBlock(lines, j, yamlIndent(lines[j]))
    }
    return { value: null, next: index + 1 }
  }
  return { value: yamlScalar(t), next: index + 1 }
}

function yamlParseBlock(
  lines: string[],
  start: number,
  indent: number
): { value: unknown; next: number } {
  let i = start
  while (i < lines.length && lines[i].trim() === "") i++
  if (i >= lines.length) return { value: null, next: i }
  const line = lines[i]
  if (yamlIndent(line) < indent) return { value: null, next: i }
  if (line.trim().startsWith("-")) return yamlParseSequence(lines, i, indent)
  return yamlParseMapping(lines, i, indent)
}

function yamlParseSequence(
  lines: string[],
  start: number,
  indent: number
): { value: unknown; next: number } {
  const arr: unknown[] = []
  let i = start
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === "") {
      i++
      continue
    }
    if (yamlIndent(line) !== indent || !line.trim().startsWith("-")) break
    const rest = line.trim().slice(1).trim()
    if (rest === "") {
      let j = i + 1
      while (j < lines.length && lines[j].trim() === "") j++
      if (j < lines.length && yamlIndent(lines[j]) > indent) {
        const res = yamlParseBlock(lines, j, yamlIndent(lines[j]))
        arr.push(res.value)
        i = res.next
      } else {
        arr.push(null)
        i++
      }
      continue
    }
    const keyMatch = rest.match(/^([^:]+?):\s*(.*)$/)
    if (keyMatch && !/^["']/.test(rest)) {
      const obj: Record<string, unknown> = {}
      const firstKey = keyMatch[1].trim()
      const res = yamlParseValue(keyMatch[2], lines, i, indent + 2)
      obj[firstKey] = res.value
      i = res.next
      while (i < lines.length) {
        const ln = lines[i]
        if (ln.trim() === "") {
          i++
          continue
        }
        const ci = yamlIndent(ln)
        if (ci !== indent + 2) break
        const tt = ln.trim()
        if (tt.startsWith("-")) break
        const mm = tt.match(/^([^:]+?):\s*(.*)$/)
        if (!mm) break
        const res2 = yamlParseValue(mm[2], lines, i, ci)
        obj[mm[1].trim()] = res2.value
        i = res2.next
      }
      arr.push(obj)
    } else {
      arr.push(yamlScalar(rest))
      i++
    }
  }
  return { value: arr, next: i }
}

function yamlParseMapping(
  lines: string[],
  start: number,
  indent: number
): { value: unknown; next: number } {
  const obj: Record<string, unknown> = {}
  let i = start
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === "") {
      i++
      continue
    }
    const ci = yamlIndent(line)
    if (ci !== indent) break
    const tt = line.trim()
    if (tt.startsWith("-")) break
    const m = tt.match(/^([^:]+?):\s*(.*)$/)
    if (!m) break
    const key = m[1].trim()
    const res = yamlParseValue(m[2], lines, i, ci)
    obj[key] = res.value
    i = res.next
  }
  return { value: obj, next: i }
}

export function yamlToJson(input: string): unknown {
  const lines = input.split(/\r?\n/).map((l) => {
    let inStr: string | null = null
    for (let k = 0; k < l.length; k++) {
      const ch = l[k]
      if (inStr) {
        if (ch === inStr && l[k - 1] !== "\\") inStr = null
      } else if (ch === '"' || ch === "'") {
        inStr = ch
      } else if (ch === "#" && (k === 0 || /\s/.test(l[k - 1]))) {
        return l.slice(0, k).replace(/\s+$/, "")
      }
    }
    return l
  })
  const { value } = yamlParseBlock(lines, 0, 0)
  return value ?? {}
}

export function tryYaml(input: string): TryResult {
  try {
    return { ok: true, value: yamlToJson(input) }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

function yamlScalarText(v: unknown): string {
  if (v === null || v === undefined) return "null"
  if (typeof v === "string") {
    if (v === "" || /["'#:[\]{},&*!|>%@` \t\n]/.test(v)) {
      return JSON.stringify(v)
    }
    return v
  }
  return String(v)
}

export function jsonToYaml(value: unknown, indent = 2): string {
  const sp = " ".repeat(indent)
  const emit = (v: unknown, level: number): string[] => {
    const pad = sp.repeat(level)
    if (Array.isArray(v)) {
      if (v.length === 0) return [`${pad}[]`]
      const out: string[] = []
      for (const item of v) {
        if (isPlainObject(item)) {
          const entries = Object.entries(item)
          const [k, val] = entries[0]
          if (isPlainObject(val) || Array.isArray(val)) {
            out.push(`${pad}- ${k}:`)
            out.push(...emit(val, level + 1))
          } else {
            out.push(`${pad}- ${k}: ${yamlScalarText(val)}`)
          }
          for (const [k2, v2] of entries.slice(1)) {
            if (isPlainObject(v2) || Array.isArray(v2)) {
              out.push(`${pad}  ${k2}:`)
              out.push(...emit(v2, level + 1))
            } else {
              out.push(`${pad}  ${k2}: ${yamlScalarText(v2)}`)
            }
          }
        } else if (Array.isArray(item)) {
          if (item.length === 0) out.push(`${pad}- []`)
          else {
            out.push(`${pad}-`)
            out.push(...emit(item, level + 1))
          }
        } else {
          out.push(`${pad}- ${yamlScalarText(item)}`)
        }
      }
      return out
    }
    if (isPlainObject(v)) {
      const keys = Object.keys(v)
      if (keys.length === 0) return [`${pad}{}`]
      const out: string[] = []
      for (const [k, val] of Object.entries(v)) {
        if (isPlainObject(val) || Array.isArray(val)) {
          out.push(`${pad}${k}:`)
          out.push(...emit(val, level + 1))
        } else {
          out.push(`${pad}${k}: ${yamlScalarText(val)}`)
        }
      }
      return out
    }
    return [`${pad}${yamlScalarText(v)}`]
  }
  return emit(value, 0).join("\n")
}

/* ------------------------------------------------------------------ */
/* XML tools                                                           */
/* ------------------------------------------------------------------ */

export interface XmlNode {
  tag: string
  attrs: Record<string, string>
  children: XmlNode[]
  text: string
}

const XML_VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
  "meta", "param", "source", "track", "wbr",
])

function xmlDecodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
}

export function xmlParse(input: string): XmlNode {
  const text = input
  let pos = 0
  const root: XmlNode = { tag: "#root", attrs: {}, children: [], text: "" }
  const stack: XmlNode[] = [root]

  const pushText = (node: XmlNode, raw: string) => {
    const decoded = xmlDecodeEntities(raw)
    if (node.children.length === 0) node.text += decoded
    else if (decoded.trim() !== "") {
      node.children.push({ tag: "#text", attrs: {}, children: [], text: decoded })
    }
  }

  while (pos < text.length) {
    const lt = text.indexOf("<", pos)
    if (lt === -1) {
      pushText(stack[stack.length - 1], text.slice(pos))
      break
    }
    if (lt > pos) pushText(stack[stack.length - 1], text.slice(pos, lt))
    if (text.startsWith("<!--", lt)) {
      const end = text.indexOf("-->", lt)
      if (end === -1) break
      pos = end + 3
      continue
    }
    if (text.startsWith("<![CDATA[", lt)) {
      const end = text.indexOf("]]>", lt)
      if (end === -1) break
      pushText(stack[stack.length - 1], text.slice(lt + 9, end))
      pos = end + 3
      continue
    }
    if (text.startsWith("<?", lt) || text.startsWith("<!", lt)) {
      const end = text.indexOf(">", lt)
      if (end === -1) break
      pos = end + 1
      continue
    }
    if (text.startsWith("</", lt)) {
      const end = text.indexOf(">", lt)
      if (end === -1) break
      pos = end + 1
      if (stack.length > 1) stack.pop()
      continue
    }
    let end = lt + 1
    let quote: string | null = null
    while (end < text.length) {
      const ch = text[end]
      if (quote) {
        if (ch === quote) quote = null
      } else if (ch === '"' || ch === "'") {
        quote = ch
      } else if (ch === ">") {
        break
      }
      end++
    }
    const rawTag = text.slice(lt + 1, end)
    const selfClose = rawTag.endsWith("/")
    const inner = (selfClose ? rawTag.slice(0, -1) : rawTag).trim()
    const nameMatch = inner.match(/^[A-Za-z_:][A-Za-z0-9_:.-]*/)
    const tagName = nameMatch ? nameMatch[0] : "unknown"
    const attrs: Record<string, string> = {}
    const attrRe = /([A-Za-z_:][A-Za-z0-9_:.-]*)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/g
    let am: RegExpExecArray | null
    while ((am = attrRe.exec(inner))) {
      const raw = am[2]
      attrs[am[1]] =
        raw.length >= 2 && (raw[0] === '"' || raw[0] === "'")
          ? xmlDecodeEntities(raw.slice(1, -1))
          : xmlDecodeEntities(raw)
    }
    pos = end + 1
    const node: XmlNode = { tag: tagName, attrs, children: [], text: "" }
    stack[stack.length - 1].children.push(node)
    if (!selfClose && !XML_VOID.has(tagName.toLowerCase())) stack.push(node)
  }
  return root
}

function xmlSerialize(node: XmlNode, indent: number): string {
  const sp = "  ".repeat(indent)
  const parts: string[] = []
  const attrs = Object.entries(node.attrs)
    .map(([k, v]) => ` ${k}="${escapeXml(v)}"`)
    .join("")
  const childElements = node.children
  if (childElements.length === 0) {
    const inner = node.text
    if (node.tag === "#text") return escapeXml(inner)
    if (inner === "") return `${sp}<${node.tag}${attrs}/>`
    return `${sp}<${node.tag}${attrs}>${escapeXml(inner)}</${node.tag}>`
  }
  if (node.tag === "#root") {
    for (const c of childElements) parts.push(xmlSerialize(c, 0))
    return parts.join("\n")
  }
  parts.push(`${sp}<${node.tag}${attrs}>`)
  if (node.text !== "") parts.push(`${sp}  ${escapeXml(node.text)}`)
  for (const c of childElements) parts.push(xmlSerialize(c, indent + 1))
  parts.push(`${sp}</${node.tag}>`)
  return parts.join("\n")
}

function xmlMinifyNode(node: XmlNode): string {
  const attrs = Object.entries(node.attrs)
    .map(([k, v]) => ` ${k}="${escapeXml(v)}"`)
    .join("")
  if (node.children.length === 0) {
    if (node.tag === "#text") return escapeXml(node.text)
    if (node.text === "") return `<${node.tag}${attrs}/>`
    return `<${node.tag}${attrs}>${escapeXml(node.text)}</${node.tag}>`
  }
  const inner = node.text === "" ? "" : escapeXml(node.text)
  return `<${node.tag}${attrs}>${inner}${node.children
    .map((c) => xmlMinifyNode(c))
    .join("")}</${node.tag}>`
}

export function xmlFormat(input: string): string {
  const root = xmlParse(input)
  return root.children.length === 1
    ? xmlSerialize(root.children[0], 0)
    : xmlSerialize(root, 0)
}

export function xmlMinify(input: string): string {
  const root = xmlParse(input)
  return root.children.map((c) => xmlMinifyNode(c)).join("")
}

function xmlNodeToJson(node: XmlNode): unknown {
  if (node.tag === "#text") return node.text
  if (node.children.length === 0) {
    return Object.keys(node.attrs).length > 0
      ? { "#text": node.text, $: node.attrs }
      : node.text
  }
  const obj: Record<string, unknown> = {}
  if (Object.keys(node.attrs).length > 0) obj["$"] = node.attrs
  if (node.text !== "") obj["#text"] = node.text
  for (const child of node.children) {
    if (child.tag === "#text") continue
    const val = xmlNodeToJson(child)
    if (child.tag in obj) {
      const existing = obj[child.tag]
      if (Array.isArray(existing)) existing.push(val)
      else obj[child.tag] = [existing, val]
    } else {
      obj[child.tag] = val
    }
  }
  return obj
}

export function xmlToJson(input: string): string {
  const root = xmlParse(input)
  const obj: Record<string, unknown> = {}
  for (const child of root.children) {
    if (child.tag === "#text") continue
    if (child.tag in obj) {
      const existing = obj[child.tag]
      if (Array.isArray(existing)) existing.push(xmlNodeToJson(child))
      else obj[child.tag] = [existing, xmlNodeToJson(child)]
    } else {
      obj[child.tag] = xmlNodeToJson(child)
    }
  }
  return JSON.stringify(obj, null, 2)
}

export function tryXml(input: string): TryResult {
  const stack: string[] = []
  let pos = 0
  const src = input
  while (pos < src.length) {
    const lt = src.indexOf("<", pos)
    if (lt === -1) break
    if (src.startsWith("<!--", lt)) {
      const end = src.indexOf("-->", lt)
      if (end === -1) return { ok: false, error: "Unterminated comment" }
      pos = end + 3
      continue
    }
    if (src.startsWith("<![CDATA[", lt)) {
      const end = src.indexOf("]]>", lt)
      if (end === -1) return { ok: false, error: "Unterminated CDATA section" }
      pos = end + 3
      continue
    }
    if (src.startsWith("<?", lt) || src.startsWith("<!", lt)) {
      const end = src.indexOf(">", lt)
      if (end === -1) return { ok: false, error: "Unterminated processing instruction" }
      pos = end + 1
      continue
    }
    let end = lt + 1
    let quote: string | null = null
    while (end < src.length) {
      const ch = src[end]
      if (quote) {
        if (ch === quote) quote = null
      } else if (ch === '"' || ch === "'") {
        quote = ch
      } else if (ch === ">") {
        break
      }
      end++
    }
    if (end >= src.length) return { ok: false, error: `Unterminated tag near position ${lt}` }
    const raw = src.slice(lt + 1, end)
    const closing = src[lt + 1] === "/"
    const selfClose = raw.endsWith("/")
    if (closing) {
      const name = raw.slice(1).trim().split(/\s/)[0]
      const top = stack[stack.length - 1]
      if (top !== name) {
        return { ok: false, error: `Mismatched closing tag </${name}> (expected </${top ?? "?"}>)` }
      }
      stack.pop()
    } else if (!selfClose && !XML_VOID.has(raw.trim().split(/\s/)[0].toLowerCase())) {
      const nameMatch = raw.trim().match(/^[A-Za-z_:][A-Za-z0-9_:.-]*/)
      if (nameMatch) stack.push(nameMatch[0])
    }
    pos = end + 1
  }
  if (stack.length > 0) {
    return { ok: false, error: `Unclosed tag <${stack[stack.length - 1]}>` }
  }
  return { ok: true, value: xmlParse(input) }
}

export function jsonToXml(input: string, rootName = "root"): string {
  const value = JSON.parse(input)
  const el = (name: string, v: unknown): string => {
    if (v === null || v === undefined) return `<${name}/>`
    if (Array.isArray(v)) return v.map((it) => el(name, it)).join("")
    if (isPlainObject(v)) {
      const attrs: string[] = []
      const children: string[] = []
      let text = ""
      for (const [k, val] of Object.entries(v)) {
        if (k === "$" || k.startsWith("@")) {
          attrs.push(
            ` ${k.startsWith("@") ? k.slice(1) : k}="${escapeXml(String(val))}"`
          )
          continue
        }
        if (k === "#text") {
          text += String(val)
          continue
        }
        if (Array.isArray(val)) {
          for (const it of val) children.push(el(k, it))
        } else {
          children.push(el(k, val))
        }
      }
      const a = attrs.join("")
      const inner = text === "" ? "" : escapeXml(text)
      if (children.length === 0) return `<${name}${a}>${inner}</${name}>`
      return `<${name}${a}>${inner}${children.join("")}</${name}>`
    }
    return `<${name}>${escapeXml(String(v))}</${name}>`
  }
  if (Array.isArray(value)) return value.map((it) => el(rootName, it)).join("")
  if (isPlainObject(value)) {
    const keys = Object.keys(value)
    if (keys.length === 1) return el(keys[0], value[keys[0]])
    return el(rootName, value)
  }
  return el(rootName, value)
}
