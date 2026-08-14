import { escapeHtmlEntities } from "./dev-utils"

/* ------------------------------------------------------------------ */
/* HTML tools                                                          */
/* ------------------------------------------------------------------ */

interface HtmlToken {
  type: "tag" | "close" | "text" | "comment" | "other"
  raw: string
  tag?: string
}

const HTML_VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
  "meta", "param", "source", "track", "wbr",
])

export function htmlTokenize(input: string): HtmlToken[] {
  const tokens: HtmlToken[] = []
  let pos = 0
  while (pos < input.length) {
    const lt = input.indexOf("<", pos)
    if (lt === -1) {
      tokens.push({ type: "text", raw: input.slice(pos) })
      break
    }
    if (lt > pos) tokens.push({ type: "text", raw: input.slice(pos, lt) })
    if (input.startsWith("<!--", lt)) {
      const end = input.indexOf("-->", lt)
      if (end === -1) break
      tokens.push({ type: "comment", raw: input.slice(lt, end + 3) })
      pos = end + 3
      continue
    }
    if (input.startsWith("<!", lt) || input.startsWith("<?", lt)) {
      const end = input.indexOf(">", lt)
      if (end === -1) break
      tokens.push({ type: "other", raw: input.slice(lt, end + 1) })
      pos = end + 1
      continue
    }
    if (input.startsWith("</", lt)) {
      const end = input.indexOf(">", lt)
      if (end === -1) break
      const name = input.slice(lt + 2, end).trim().split(/\s/)[0]
      tokens.push({ type: "close", raw: input.slice(lt, end + 1), tag: name.toLowerCase() })
      pos = end + 1
      continue
    }
    let end = lt + 1
    let quote: string | null = null
    while (end < input.length) {
      const ch = input[end]
      if (quote) {
        if (ch === quote) quote = null
      } else if (ch === '"' || ch === "'") {
        quote = ch
      } else if (ch === ">") {
        break
      }
      end++
    }
    const raw = input.slice(lt, end + 1)
    const m = raw.match(/^<([A-Za-z][A-Za-z0-9:-]*)/)
    tokens.push({ type: "tag", raw, tag: m ? m[1].toLowerCase() : undefined })
    pos = end + 1
  }
  return tokens
}

export function htmlFormat(input: string): string {
  const tokens = htmlTokenize(input)
  const out: string[] = []
  let depth = 0
  for (const t of tokens) {
    const pad = "  ".repeat(Math.max(depth, 0))
    if (t.type === "comment" || t.type === "other") {
      out.push(`${pad}${t.raw}`)
    } else if (t.type === "close") {
      depth = Math.max(depth - 1, 0)
      out.push(`${pad}${t.raw}`)
    } else if (t.type === "tag") {
      out.push(`${pad}${t.raw}`)
      if (t.tag && !HTML_VOID.has(t.tag)) depth++
    } else {
      const trimmed = t.raw.trim()
      if (trimmed !== "") out.push(`${pad}${trimmed}`)
    }
  }
  return out.join("\n")
}

export function htmlMinify(input: string): string {
  const tokens = htmlTokenize(input)
  let out = ""
  let prevIsTag = false
  for (const t of tokens) {
    if (t.type === "comment") continue
    if (t.type === "text") {
      const trimmed = t.raw.replace(/\s+/g, " ").trim()
      if (trimmed === "") {
        if (!prevIsTag) out += " "
      } else {
        out += prevIsTag ? " " + trimmed : trimmed
      }
      prevIsTag = false
    } else {
      out += t.raw
      prevIsTag = true
    }
  }
  return out.replace(/>\s+</g, "><").trim()
}

/* ------------------------------------------------------------------ */
/* CSS tools                                                           */
/* ------------------------------------------------------------------ */

export function cssFormat(input: string): string {
  let out = ""
  let indent = 0
  let i = 0
  const emitLine = (content: string) => {
    out += "  ".repeat(Math.max(indent, 0)) + content.trim() + "\n"
  }
  while (i < input.length) {
    const ch = input[i]
    if (ch === "/" && input[i + 1] === "*") {
      const end = input.indexOf("*/", i)
      if (end === -1) break
      emitLine(input.slice(i, end + 2))
      i = end + 2
      continue
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1
      while (j < input.length && input[j] !== ch) {
        if (input[j] === "\\") j++
        j++
      }
      out += input.slice(i, Math.min(j + 1, input.length))
      i = Math.min(j + 1, input.length)
      continue
    }
    if (ch === "{") {
      out = out.trimEnd() + " {\n"
      indent++
      i++
      continue
    }
    if (ch === "}") {
      indent = Math.max(indent - 1, 0)
      out = out.trimEnd() + "\n"
      emitLine("}")
      i++
      continue
    }
    if (ch === ";") {
      out = out.trimEnd() + ";\n"
      i++
      continue
    }
    out += ch
    i++
  }
  return out
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trimEnd())
    .join("\n")
    .trim()
}

export function cssMinify(input: string): string {
  let out = ""
  let i = 0
  while (i < input.length) {
    const ch = input[i]
    if (ch === "/" && input[i + 1] === "*") {
      const end = input.indexOf("*/", i)
      i = end === -1 ? input.length : end + 2
      continue
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1
      let s = ch
      while (j < input.length && input[j] !== ch) {
        if (input[j] === "\\") {
          s += input[j] + (input[j + 1] ?? "")
          j += 2
          continue
        }
        s += input[j]
        j++
      }
      s += ch
      out += s
      i = Math.min(j + 1, input.length)
      continue
    }
    if (/\s/.test(ch)) {
      const prev = out[out.length - 1]
      const next = input[i + 1]
      if (!(prev && next && /[\w-]/.test(prev) && /[\w-]/.test(next))) i++
      else {
        out += " "
        while (i < input.length && /\s/.test(input[i])) i++
      }
      continue
    }
    if (ch === "{" || ch === "}" || ch === ";" || ch === ",") {
      out = out.replace(/[ \t]+$/, "")
      out += ch
      i++
      continue
    }
    if (ch === ":") {
      if (/[+\-*]/.test(out[out.length - 1] ?? "")) {
        out += " "
        i++
        continue
      }
      out = out.replace(/[ \t]+$/, "")
      out += ":"
      i++
      continue
    }
    out += ch
    i++
  }
  return out.replace(/;}/g, "}").trim()
}

/* ------------------------------------------------------------------ */
/* JS / TS formatter & minifier                                        */
/* ------------------------------------------------------------------ */

interface JsToken {
  kind:
    | "ws"
    | "comment"
    | "string"
    | "template"
    | "num"
    | "word"
    | "punct"
    | "other"
  text: string
}

const OP_CHARS = new Set("+-*/%=<>!&|^~?:.,;()[]{}@#".split(""))

function jsTokenize(src: string): JsToken[] {
  const tokens: JsToken[] = []
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (/\s/.test(ch)) {
      let j = i
      while (j < src.length && /\s/.test(src[j])) j++
      tokens.push({ kind: "ws", text: src.slice(i, j) })
      i = j
      continue
    }
    if (ch === "/" && src[i + 1] === "/") {
      let j = i + 2
      while (j < src.length && src[j] !== "\n") j++
      tokens.push({ kind: "comment", text: src.slice(i, j) })
      i = j
      continue
    }
    if (ch === "/" && src[i + 1] === "*") {
      let j = i + 2
      while (j < src.length && !(src[j] === "*" && src[j + 1] === "/")) j++
      tokens.push({ kind: "comment", text: src.slice(i, Math.min(j + 2, src.length)) })
      i = Math.min(j + 2, src.length)
      continue
    }
    if (ch === "'" || ch === '"') {
      let j = i + 1
      while (j < src.length) {
        if (src[j] === "\\") j += 2
        else if (src[j] === ch) break
        else j++
      }
      tokens.push({ kind: "string", text: src.slice(i, Math.min(j + 1, src.length)) })
      i = Math.min(j + 1, src.length)
      continue
    }
    if (ch === "`") {
      let j = i + 1
      let depth = 0
      while (j < src.length) {
        if (src[j] === "\\") j += 2
        else if (src[j] === "`" && depth === 0) break
        else if (src[j] === "$" && src[j + 1] === "{") {
          depth++
          j += 2
        } else if (src[j] === "}") {
          if (depth > 0) depth--
          j++
        } else j++
      }
      tokens.push({ kind: "template", text: src.slice(i, Math.min(j + 1, src.length)) })
      i = Math.min(j + 1, src.length)
      continue
    }
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
      let j = i
      if (src[j] === "0" && /[xXbBoO]/.test(src[j + 1] ?? "")) {
        j += 2
        while (j < src.length && /[0-9a-fA-F_]/.test(src[j])) j++
      } else {
        while (j < src.length && /[0-9_]/.test(src[j])) j++
        if (src[j] === ".") {
          j++
          while (j < src.length && /[0-9_]/.test(src[j])) j++
        }
        if (/[eE]/.test(src[j] ?? "")) {
          j++
          if (/[+-]/.test(src[j] ?? "")) j++
          while (j < src.length && /[0-9]/.test(src[j])) j++
        }
      }
      if (src[j] === "n") j++
      tokens.push({ kind: "num", text: src.slice(i, j) })
      i = j
      continue
    }
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i
      while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++
      tokens.push({ kind: "word", text: src.slice(i, j) })
      i = j
      continue
    }
    if (OP_CHARS.has(ch)) {
      const multi = ["...", ">>>=", "===", "!==", "**=", "&&=", "||=", "??=", "<<=", ">>=",
        ">>>", "**", "++", "--", "<<", ">>", "<=", ">=", "==", "!=", "&&", "||", "??",
        "+=", "-=", "*=", "/=", "%=", "=>", "?."].find((op) => src.startsWith(op, i))
      if (multi) {
        tokens.push({ kind: "punct", text: multi })
        i += multi.length
      } else {
        tokens.push({ kind: "punct", text: ch })
        i++
      }
      continue
    }
    tokens.push({ kind: "other", text: ch })
    i++
  }
  return tokens
}

const NEED_SPACE_BEFORE_WORD = new Set([
  "return", "typeof", "delete", "void", "throw", "new", "yield", "await",
  "case", "else", "do", "in", "of", "instanceof", "extends",
])

function jsNeedsSpace(a: string, b: string): boolean {
  const last = a[a.length - 1]
  const first = b[0]
  if (/[\w$]/.test(last) && /[\w$]/.test(first)) return true
  if (/[0-9]/.test(last) && first === ".") return true
  if (OP_CHARS.has(last) && OP_CHARS.has(first)) {
    const bothOps = (s: string) => "+-*%&|^=< >".includes(s)
    return bothOps(last) && bothOps(first)
  }
  return false
}

export function jsMinify(input: string): string {
  const tokens = jsTokenize(input)
  let out = ""
  let prevWord = ""
  for (const t of tokens) {
    if (t.kind === "ws" || t.kind === "comment") continue
    const text = t.text
    if (out !== "") {
      const isWordNext = t.kind === "word" || t.kind === "num"
      const needs =
        jsNeedsSpace(out, text) ||
        (prevWord !== "" && isWordNext && NEED_SPACE_BEFORE_WORD.has(prevWord))
      if (needs) out += " "
    }
    out += text
    prevWord = t.kind === "word" ? text : ""
  }
  return out
}

export function jsFormat(input: string): string {
  const tokens = jsTokenize(input)
  const lines: string[] = []
  let line = ""
  let indent = 0
  let parenDepth = 0
  const pad = () => "  ".repeat(Math.max(indent, 0))
  const flush = () => {
    if (line.trim() !== "") lines.push(pad() + line.trim())
    line = ""
  }
  for (const t of tokens) {
    if (t.kind === "ws") continue
    if (t.kind === "comment") {
      flush()
      lines.push(pad() + t.text.trim())
      continue
    }
    const text = t.text
    if (text === "{") {
      line += " {"
      flush()
      indent++
      continue
    }
    if (text === "}") {
      indent = Math.max(indent - 1, 0)
      flush()
      line = "}"
      continue
    }
    if (text === ";") {
      if (parenDepth === 0) {
        line += ";"
        flush()
      } else {
        line += "; "
      }
      continue
    }
    if (text === "(") parenDepth++
    if (text === ")") parenDepth = Math.max(parenDepth - 1, 0)
    if (text === ",") {
      line += ", "
      continue
    }
    line += text
  }
  if (line.trim() !== "") lines.push(pad() + line.trim())
  return lines.join("\n")
}

/* ------------------------------------------------------------------ */
/* SQL tools                                                           */
/* ------------------------------------------------------------------ */

const SQL_CLAUSE = new Set([
  "SELECT", "FROM", "WHERE", "GROUP", "HAVING", "ORDER", "LIMIT", "OFFSET",
  "UNION", "JOIN", "INSERT", "UPDATE", "DELETE", "VALUES", "SET",
])

export function sqlFormat(input: string): string {
  const src = input.replace(/;?\s*$/, "")
  const out: string[] = [""]
  let indent = 0
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (ch === "'" || ch === '"') {
      let j = i + 1
      let s = ch
      while (j < src.length) {
        if (src[j] === "\\") {
          s += src[j] + (src[j + 1] ?? "")
          j += 2
          continue
        }
        s += src[j]
        if (src[j] === ch) break
        j++
      }
      out[out.length - 1] += s
      i = Math.min(j + 1, src.length)
      continue
    }
    if (ch === "(") {
      out[out.length - 1] += " ("
      indent++
      i++
      continue
    }
    if (ch === ")") {
      indent = Math.max(indent - 1, 0)
      out.push("  ".repeat(indent) + ")")
      i++
      continue
    }
    const m = src.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/)
    if (m) {
      const word = m[0]
      const upper = word.toUpperCase()
      if (upper === "AND" || upper === "OR") {
        out.push("  ".repeat(indent) + "  " + upper)
      } else if (upper === "BY" || upper === "ON") {
        out.push("  ".repeat(indent) + "  " + upper + " ")
        out[out.length - 1] = out[out.length - 1].trimEnd()
      } else if (SQL_CLAUSE.has(upper)) {
        out.push("  ".repeat(indent) + upper)
      } else if (upper === "ASC" || upper === "DESC") {
        out[out.length - 1] += " " + upper
      } else {
        out[out.length - 1] += " " + word
      }
      i += word.length
      continue
    }
    if (ch === ",") {
      out[out.length - 1] += ","
      out.push("  ".repeat(indent) + "  ")
      i++
      continue
    }
    if (/\s/.test(ch)) {
      i++
      continue
    }
    out[out.length - 1] += ch
    i++
  }
  return out
    .map((l) => l.replace(/\s+$/, ""))
    .filter((l) => l.trim() !== "")
    .join("\n")
}

export function sqlMinify(input: string): string {
  let out = ""
  let i = 0
  while (i < input.length) {
    const ch = input[i]
    if (ch === "-" && input[i + 1] === "-") {
      let j = i + 2
      while (j < input.length && input[j] !== "\n") j++
      i = j
      continue
    }
    if (ch === "/" && input[i + 1] === "*") {
      const end = input.indexOf("*/", i)
      i = end === -1 ? input.length : end + 2
      continue
    }
    if (ch === "'" || ch === '"') {
      let j = i + 1
      let s = ch
      while (j < input.length) {
        if (input[j] === "\\") {
          s += input[j] + (input[j + 1] ?? "")
          j += 2
          continue
        }
        s += input[j]
        if (input[j] === ch) break
        j++
      }
      out += s
      i = Math.min(j + 1, input.length)
      continue
    }
    if (/\s/.test(ch)) {
      const prev = out[out.length - 1]
      const next = input[i + 1]
      if (prev && next && /[\w]/.test(prev) && /[\w]/.test(next)) out += " "
      i++
      continue
    }
    out += ch
    i++
  }
  return out.trim()
}

/* ------------------------------------------------------------------ */
/* Markdown tools                                                      */
/* ------------------------------------------------------------------ */

export function markdownToHtml(input: string): string {
  const src = input.replace(/\r\n/g, "\n")
  const codeBlocks: string[] = []
  const text = src.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang: string, code: string) => {
    const id = `@@CODE${codeBlocks.length}@@`
    codeBlocks.push(
      `<pre><code${
        lang ? ` class="language-${escapeHtmlEntities(lang)}"` : ""
      }>${escapeHtmlEntities(code.replace(/\n$/, ""))}</code></pre>`
    )
    return id
  })

  const inline = (s: string): string => {
    let r = escapeHtmlEntities(s)
    r = r.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    r = r.replace(/__([^_]+)__/g, "<strong>$1</strong>")
    r = r.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    r = r.replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>")
    r = r.replace(/~~([^~]+)~~/g, "<del>$1</del>")
    r = r.replace(/`([^`\n]+)`/g, "<code>$1</code>")
    r = r.replace(
      /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
      '<img alt="$1" src="$2" />'
    )
    r = r.replace(
      /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
      '<a href="$2">$1</a>'
    )
    return r
  }

  const lines = text.split("\n")
  const html: string[] = []
  let listOpen = false
  let listOrdered = false
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      html.push(`<p>${paragraph.map((p) => inline(p)).join(" ")}</p>`)
      paragraph = []
    }
  }

  const closeList = () => {
    if (listOpen) {
      html.push(listOrdered ? "</ol>" : "</ul>")
      listOpen = false
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const codeId = line.match(/^@@CODE(\d+)@@$/)
    if (codeId) {
      flushParagraph()
      closeList()
      html.push(codeBlocks[Number(codeId[1])])
      continue
    }
    const trim = line.trim()
    if (trim === "") {
      flushParagraph()
      closeList()
      continue
    }
    const h = trim.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      flushParagraph()
      closeList()
      const level = h[1].length
      html.push(`<h${level}>${inline(h[2])}</h${level}>`)
      continue
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trim)) {
      flushParagraph()
      closeList()
      html.push("<hr />")
      continue
    }
    if (trim.startsWith(">")) {
      flushParagraph()
      closeList()
      html.push(`<blockquote><p>${inline(trim.replace(/^>\s?/, ""))}</p></blockquote>`)
      continue
    }
    if (trim.startsWith("|")) {
      const cells = trim
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim())
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) {
        flushParagraph()
        closeList()
        html.push("<table><thead></thead><tbody>")
        continue
      }
      html.push(`<tr>${cells.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
      continue
    }
    const ordered = trim.match(/^(\d+)\.\s+(.*)$/)
    if (ordered) {
      flushParagraph()
      if (!listOpen) {
        listOpen = true
        listOrdered = true
        html.push("<ol>")
      }
      html.push(`<li>${inline(ordered[2])}</li>`)
      continue
    }
    const bullet = trim.match(/^([-*+])\s+(.*)$/)
    if (bullet) {
      flushParagraph()
      if (!listOpen) {
        listOpen = true
        listOrdered = false
        html.push("<ul>")
      }
      html.push(`<li>${inline(bullet[2])}</li>`)
      continue
    }
    closeList()
    paragraph.push(line)
  }
  flushParagraph()
  closeList()
  if (html.some((h) => h.startsWith("<table"))) html.push("</tbody></table>")
  return html.join("\n")
}

export function markdownFormat(input: string): string {
  const src = input.replace(/\r\n/g, "\n")
  const out: string[] = []
  let blank = false
  for (const line of src.split("\n")) {
    if (line.trim() === "") {
      if (!blank) out.push("")
      blank = true
      continue
    }
    blank = false
    out.push(line.replace(/[ \t]+$/, ""))
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n"
}

export function htmlToMarkdown(input: string): string {
  if (typeof DOMParser === "undefined") return input
  const doc = new DOMParser().parseFromString(input, "text/html")
  const blocks: string[] = []
  const walk = (el: HTMLElement, listType: string): string => {
    const tag = el.tagName.toLowerCase()
    const children = Array.from(el.childNodes)
    if (tag === "br") return "  \n"
    if (tag === "hr") return "---"
    if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6") {
      const level = Number(tag[1])
      return `#`.repeat(level) + " " + children.map((c) => walk(c as HTMLElement, listType)).join("")
    }
    if (tag === "strong" || tag === "b") {
      return `**${children.map((c) => walk(c as HTMLElement, listType)).join("")}**`
    }
    if (tag === "em" || tag === "i") {
      return `*${children.map((c) => walk(c as HTMLElement, listType)).join("")}*`
    }
    if (tag === "del" || tag === "s") {
      return `~~${children.map((c) => walk(c as HTMLElement, listType)).join("")}~~`
    }
    if (tag === "code") return "`" + (el.textContent || "") + "`"
    if (tag === "pre") {
      return "```\n" + (el.textContent || "").trim() + "\n```"
    }
    if (tag === "a") {
      const href = (el as HTMLAnchorElement).href || ""
      return `[${children.map((c) => walk(c as HTMLElement, listType)).join("")}](${href})`
    }
    if (tag === "img") {
      const img = el as HTMLImageElement
      return `![${img.alt || ""}](${img.src})`
    }
    if (tag === "blockquote") {
      const inner = children.map((c) => walk(c as HTMLElement, listType)).join("").trim()
      return inner
        .split("\n")
        .map((l) => `> ${l}`)
        .join("\n")
    }
    if (tag === "ul" || tag === "ol") {
      const items = Array.from(el.children)
        .map((c) => walk(c as HTMLElement, tag))
        .join("\n")
      return items
    }
    if (tag === "li") {
      const marker = listType === "ol" ? "1. " : "- "
      const text = children.map((c) => walk(c as HTMLElement, listType)).join("").trim()
      return `${marker}${text}`
    }
    if (tag === "p" || tag === "div" || tag === "section" || tag === "article" || tag === "main") {
      const inner = children.map((c) => walk(c as HTMLElement, listType)).join("")
      return inner.endsWith("\n") ? inner : inner + "\n"
    }
    return children.map((c) => walk(c as HTMLElement, listType)).join("")
  }
  for (const child of Array.from(doc.body.childNodes)) {
    const line = walk(child as HTMLElement, "ul")
    if (line.trim() !== "") blocks.push(line)
  }
  return blocks.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n"
}

/* ------------------------------------------------------------------ */
/* TOML / INI tools                                                    */
/* ------------------------------------------------------------------ */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function tomlValue(raw: string): unknown {
  const t = raw.trim()
  if (t.startsWith('"')) {
    let out = ""
    let i = 1
    while (i < t.length) {
      const ch = t[i]
      if (ch === "\\" && t[i + 1]) {
        const e = t[i + 1]
        if (e === "n") out += "\n"
        else if (e === "t") out += "\t"
        else if (e === "\\") out += "\\"
        else if (e === '"') out += '"'
        else if (e === "u") {
          out += String.fromCharCode(parseInt(t.slice(i + 2, i + 6), 16) || 0)
          i += 5
        } else out += e
        i += 2
        continue
      }
      if (ch === '"') break
      out += ch
      i++
    }
    return out
  }
  if (t.startsWith("'")) return t.slice(1, t.lastIndexOf("'"))
  if (t === "true") return true
  if (t === "false") return false
  if (t.startsWith("[")) {
    const inner = t.slice(1, -1)
    if (inner.trim() === "") return []
    return inner.split(",").map((p) => tomlValue(p))
  }
  if (t.startsWith("{")) {
    const obj: Record<string, unknown> = {}
    t.slice(1, -1).split(",").forEach((p) => {
      const idx = p.indexOf("=")
      if (idx > 0) obj[p.slice(0, idx).trim()] = tomlValue(p.slice(idx + 1))
    })
    return obj
  }
  const n = Number(t)
  return t !== "" && !Number.isNaN(n) ? n : t
}

export function tomlParse(input: string): Record<string, unknown> {
  const root: Record<string, unknown> = {}
  let current = root
  const lines = input.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    if (t === "" || t.startsWith("#")) continue
    const arrTable = t.match(/^\[\[(.+)\]\]$/)
    if (arrTable) {
      const name = arrTable[1].trim()
      if (!Array.isArray(root[name])) root[name] = []
      const arr = root[name] as Record<string, unknown>[]
      const item: Record<string, unknown> = {}
      arr.push(item)
      current = item
      continue
    }
    const table = t.match(/^\[(.+)\]$/)
    if (table) {
      const name = table[1].trim()
      if (!isPlainObject(root[name])) root[name] = {}
      current = root[name] as Record<string, unknown>
      continue
    }
    const kv = t.match(/^([A-Za-z0-9_.-]+)\s*=\s*(.*)$/)
    if (!kv) throw new Error(`Invalid TOML on line ${i + 1}: ${t}`)
    current[kv[1].trim()] = tomlValue(kv[2])
  }
  return root
}

export interface TryResult {
  ok: boolean
  value?: unknown
  error?: string
}

export function tryToml(input: string): TryResult {
  try {
    return { ok: true, value: tomlParse(input) }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export interface IniEntry {
  section: string
  key: string
  value: string
}

export function iniParse(input: string): IniEntry[] {
  const out: IniEntry[] = []
  let section = ""
  for (const raw of input.split(/\r?\n/)) {
    const t = raw.trim()
    if (t === "" || t.startsWith(";") || t.startsWith("#")) continue
    const sec = t.match(/^\[(.+)\]$/)
    if (sec) {
      section = sec[1].trim()
      continue
    }
    const kv = t.match(/^([^=]+?)\s*=\s*(.*)$/)
    if (kv) out.push({ section, key: kv[1].trim(), value: kv[2].trim() })
  }
  return out
}
