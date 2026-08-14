export function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length
}

export function countSentences(text: string): number {
  const s = text.trim()
  if (s === "") return 0
  const parts = s.split(/[.!?]+(?:\s+|$)/).filter((p) => p.trim() !== "")
  return Math.max(1, parts.length)
}

export function countParagraphs(text: string): number {
  const s = text.trim()
  if (s === "") return 0
  return s.split(/\n\s*\n/).filter((p) => p.trim() !== "").length
}

export function countLines(text: string): number {
  if (text === "") return 0
  return text.split(/\n/).length
}

export function readingTime(text: string, wpm = 200): number {
  const minutes = countWords(text) / wpm
  return Math.max(0, minutes)
}

export function speakingTime(text: string, wpm = 130): number {
  const minutes = countWords(text) / wpm
  return Math.max(0, minutes)
}

export function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

export function toSentenceCase(text: string): string {
  return text.replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase())
}

export function toggleCase(text: string): string {
  return text
    .split("")
    .map((c) => (c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase()))
    .join("")
}

function toWords(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
}

export function toCamelCase(text: string): string {
  const words = toWords(text)
  if (words.length === 0) return ""
  return (
    words[0].toLowerCase() +
    words
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("")
  )
}

export function toPascalCase(text: string): string {
  return toWords(text)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("")
}

export function toSnakeCase(text: string): string {
  return toWords(text).map((w) => w.toLowerCase()).join("_")
}

export function toKebabCase(text: string): string {
  return toWords(text).map((w) => w.toLowerCase()).join("-")
}

export function toDotCase(text: string): string {
  return toWords(text).map((w) => w.toLowerCase()).join(".")
}

export function toConstantCase(text: string): string {
  return toWords(text).map((w) => w.toUpperCase()).join("_")
}

export function reverseText(text: string): string {
  return text.split("").reverse().join("")
}

export function reverseWords(text: string): string {
  return text.split(/\s+/).filter(Boolean).reverse().join(" ")
}

export function sortLines(
  text: string,
  opts: { desc?: boolean; ci?: boolean } = {}
): string {
  const lines = text.split(/\n/)
  const sorted = [...lines].sort((a, b) => {
    const x = opts.ci ? a.toLowerCase() : a
    const y = opts.ci ? b.toLowerCase() : b
    return x < y ? -1 : x > y ? 1 : 0
  })
  if (opts.desc) sorted.reverse()
  return sorted.join("\n")
}

export function sortNumericLines(text: string, desc = false): string {
  const nums = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l !== "" && !Number.isNaN(Number(l)))
    .map(Number)
  nums.sort((a, b) => a - b)
  if (desc) nums.reverse()
  return nums.map(String).join("\n")
}

export function shuffleLines(text: string): string {
  const lines = text.split(/\n/)
  for (let i = lines.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[lines[i], lines[j]] = [lines[j], lines[i]]
  }
  return lines.join("\n")
}

export function removeDuplicateLines(text: string, ci = false): string {
  const seen = new Set<string>()
  const out: string[] = []
  for (const line of text.split(/\n/)) {
    const key = ci ? line.toLowerCase() : line
    if (!seen.has(key)) {
      seen.add(key)
      out.push(line)
    }
  }
  return out.join("\n")
}

export function removeEmptyLines(text: string): string {
  return text.split(/\n/).filter((l) => l.trim() !== "").join("\n")
}

export function collapseSpaces(text: string): string {
  return text.replace(/\s+/g, " ").trim()
}

export function removeLineBreaks(text: string, sep = " "): string {
  return text.split(/\r?\n/).join(sep)
}

export function wrapText(text: string, width: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const out: string[] = []
  let line = ""
  for (const w of words) {
    if (line && (line + " " + w).length > width) {
      out.push(line)
      line = w
    } else {
      line = line ? line + " " + w : w
    }
  }
  if (line) out.push(line)
  return out.join("\n")
}

export function numberLines(text: string, start = 1): string {
  return text
    .split(/\n/)
    .map((l, i) => `${i + start}. ${l}`)
    .join("\n")
}

export function stripLineNumbers(text: string): string {
  return text
    .split(/\n/)
    .map((l) => l.replace(/^\s*\d+[\.\)\]\:\-\s]+\s*/, ""))
    .join("\n")
}

export function findReplace(
  text: string,
  find: string,
  replace: string,
  opts: { regex?: boolean; ci?: boolean } = {}
): string {
  if (!find) return text
  if (opts.regex) {
    try {
      return text.replace(new RegExp(find, "g" + (opts.ci ? "i" : "")), replace)
    } catch {
      return text
    }
  }
  if (opts.ci) {
    const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return text.replace(new RegExp(escaped, "gi"), replace)
  }
  return text.split(find).join(replace)
}

export function extractEmails(text: string): string[] {
  return (text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).map((m) =>
    m.replace(/[.,;:]+$/, "")
  )
}

export function extractUrls(text: string): string[] {
  return (
    text.match(/(?:https?:\/\/|www\.)[^\s<>"']+/gi) || []
  ).map((m) => m.replace(/[.,;:!?]+$/, ""))
}

export function extractPhones(text: string): string[] {
  return (
    text.match(/(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{1,4}\)[\s.-]?)?\d{3}[\s.-]?\d{3}[\s.-]?\d{3,4}/g) ||
    []
  )
}

export function extractHashtags(text: string): string[] {
  return text.match(/#[a-zA-Z0-9_]+/g) || []
}

export function extractMentions(text: string): string[] {
  return text.match(/@[a-zA-Z0-9_]+/g) || []
}

export function extractNumbers(text: string): string[] {
  return text.match(/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g) || []
}

export function extractLinks(text: string): string[] {
  const hrefs: string[] = []
  const anchorRe = /<a[^>]*href=["']([^"']+)/gi
  let m: RegExpExecArray | null
  while ((m = anchorRe.exec(text)) !== null) hrefs.push(m[1])
  const mdRe = /\[[^\]]*\]\(([^)]+)\)/g
  while ((m = mdRe.exec(text)) !== null) hrefs.push(m[1])
  return hrefs
}

export function extractBetween(text: string, start: string, end: string, regex = false): string[] {
  if (!start && !end) return [text]
  try {
    const s = regex ? start : start.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const e = regex ? end : end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    if (start && end) {
      const re = new RegExp(s + "([\\s\\S]*?)" + e, "g")
      return [...text.matchAll(re)].map((m) => m[1])
    }
    if (start) {
      return text.split(new RegExp(s, "g")).slice(1).map((part) => part.split(/[\n\r]/)[0])
    }
    return text.split(new RegExp(e, "g")).map((part) => part.split(/[\n\r]/).pop()!)
  } catch {
    return []
  }
}

export function joinLines(lines: string[], sep: string): string {
  return lines.join(sep)
}

export function dedupeWords(text: string): string {
  const seen = new Set<string>()
  const out: string[] = []
  for (const w of text.trim().split(/\s+/).filter(Boolean)) {
    const key = w.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      out.push(w)
    }
  }
  return out.join(" ")
}

const STOPWORDS = new Set(
  "a,an,and,are,as,at,be,been,but,by,can,could,did,do,does,for,from,get,got,had,has,have,he,her,here,him,his,how,i,if,in,into,is,it,its,just,like,may,me,more,most,my,no,not,now,of,on,one,only,or,our,out,over,she,should,so,some,such,than,that,the,their,them,then,there,these,they,this,those,to,too,up,us,use,was,we,were,what,when,where,which,while,who,why,will,with,would,you,your"
    .split(",")
)

export function wordFrequency(text: string): { word: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const w of text.toLowerCase().match(/[a-zA-Z0-9']+/g) || []) {
    counts.set(w, (counts.get(w) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
}

export function topKeywords(text: string, top = 10): { word: string; count: number }[] {
  return wordFrequency(text)
    .filter((e) => !STOPWORDS.has(e.word) && e.word.length > 1)
    .slice(0, top)
}

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function slugToText(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate", "velit",
  "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat",
  "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt",
  "mollit", "anim", "id", "est", "laborum",
]

function randomItem(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

function loremSentence(): string {
  const n = 10 + Math.floor(Math.random() * 12)
  const words: string[] = []
  for (let i = 0; i < n; i++) words.push(randomItem(LOREM_WORDS))
  const s = words.join(" ")
  return s.charAt(0).toUpperCase() + s.slice(1) + "."
}

export function generateLorem(paragraphs: number, sentencesPer = 5): string {
  const out: string[] = []
  for (let p = 0; p < Math.max(1, paragraphs); p++) {
    const sentences: string[] = []
    for (let s = 0; s < Math.max(1, sentencesPer); s++) sentences.push(loremSentence())
    out.push(sentences.join(" "))
  }
  return out.join("\n\n")
}

export const RANDOM_WORDS = [
  "apple", "river", "mountain", "garden", "cloud", "silver", "morning", "ocean",
  "forest", "stone", "breeze", "candle", "diamond", "echo", "feather", "glacier",
  "harvest", "island", "journey", "kingdom", "lantern", "meadow", "night", "oracle",
  "puzzle", "quiver", "rainbow", "sapphire", "thunder", "umbrella", "valley", "whisper",
  "xylophone", "yearning", "zephyr", "amber", "blossom", "crystal", "dawn", "ember",
  "fable", "glimmer", "harbor", "ivory", "jasmine", "kite", "lagoon", "mosaic",
  "nectar", "opulence", "prairie", "quarry", "refuge", "summit", "tundra", "utopia",
  "vibrant", "willow", "yonder", "zenith", "anchor", "beacon", "comet", "drift",
  "equinox", "fathom", "grove", "horizon", "insight", "jubilee", "keystone", "latitude",
  "mirage", "nimbus", "oasis", "pearl", "quill", "radiance", "solstice", "tidal",
  "uplift", "vortex", "wander", "yield", "aurora", "bloom", "cascade", "deluge",
]

export function randomWords(n: number): string {
  const out: string[] = []
  for (let i = 0; i < Math.max(1, n); i++) out.push(randomItem(RANDOM_WORDS))
  return out.join(" ")
}

export function randomSentence(): string {
  const n = 6 + Math.floor(Math.random() * 8)
  const words: string[] = []
  for (let i = 0; i < n; i++) words.push(randomItem(RANDOM_WORDS))
  const s = words.join(" ")
  return s.charAt(0).toUpperCase() + s.slice(1) + "."
}

export function randomSentences(n: number): string {
  const out: string[] = []
  for (let i = 0; i < Math.max(1, n); i++) out.push(randomSentence())
  return out.join(" ")
}

export function randomParagraph(): string {
  const n = 3 + Math.floor(Math.random() * 4)
  return randomSentences(n)
}

export function randomParagraphs(n: number): string {
  const out: string[] = []
  for (let i = 0; i < Math.max(1, n); i++) out.push(randomParagraph())
  return out.join("\n\n")
}

const MORSE_MAP: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.",
  "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-",
  "+": ".-.-.", "-": "-....-", "_": "..--.-", '"': ".-..-.", "$": "...-..-", "@": ".--.-.",
  " ": "/",
}

const MORSE_REVERSE = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
)

export function textToMorse(text: string): string {
  const upper = text.toUpperCase()
  const out: string[] = []
  for (const ch of upper) {
    const code = MORSE_MAP[ch]
    if (code !== undefined) out.push(code)
  }
  return out.join(" ")
}

export function morseToText(morse: string): string {
  const words = morse.trim().split(/\s*\/\s*/)
  const out: string[] = []
  for (const word of words) {
    const chars = word.trim().split(/\s+/).filter(Boolean)
    let decoded = ""
    for (const c of chars) {
      const ch = MORSE_REVERSE[c]
      if (ch === "/") {
        decoded += " "
      } else if (ch !== undefined) {
        decoded += ch
      }
    }
    out.push(decoded)
  }
  return out.join(" ")
}

export function asciiCodes(text: string): { char: string; code: number; hex: string }[] {
  return [...text].map((ch) => ({
    char: ch,
    code: ch.charCodeAt(0),
    hex: ch.charCodeAt(0).toString(16).toUpperCase(),
  }))
}

export function codesToAscii(input: string): string {
  const parts = input.split(/[\s,;]+/).filter(Boolean)
  let out = ""
  for (const p of parts) {
    let n: number | null = null
    if (/^[uU]\+[0-9a-fA-F]+$/.test(p)) n = parseInt(p.slice(2), 16)
    else if (/^0x[0-9a-fA-F]+$/.test(p)) n = parseInt(p, 16)
    else if (/^\d+$/.test(p)) n = parseInt(p, 10)
    if (n != null && n >= 0 && n <= 0x10ffff) out += String.fromCodePoint(n)
  }
  return out
}

export function unicodePoints(text: string): { char: string; hex: string; dec: number }[] {
  return [...text].map((ch) => ({
    char: ch,
    hex: ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0"),
    dec: ch.codePointAt(0)!,
  }))
}

export function unicodeEscape(text: string): string {
  let out = ""
  for (const ch of text) {
    const cp = ch.codePointAt(0)!
    out += cp > 0xffff ? `\\u{${cp.toString(16).toUpperCase()}}` : `\\u${cp.toString(16).toUpperCase().padStart(4, "0")}`
  }
  return out
}

export function unicodeUnescape(text: string): string {
  return text.replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
}

export function diffLines(
  a: string,
  b: string
): { type: "same" | "add" | "del"; text: string }[] {
  const A = a.split(/\n/)
  const B = b.split(/\n/)
  const n = A.length
  const m = B.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const out: { type: "same" | "add" | "del"; text: string }[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      out.push({ type: "same", text: A[i] })
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: "del", text: A[i] })
      i++
    } else {
      out.push({ type: "add", text: B[j] })
      j++
    }
  }
  while (i < n) {
    out.push({ type: "del", text: A[i] })
    i++
  }
  while (j < m) {
    out.push({ type: "add", text: B[j] })
    j++
  }
  return out
}
