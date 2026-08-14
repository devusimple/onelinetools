"use client"

import { useState } from "react"
import { fmtNum } from "@/lib/calc-utils"
import {
  collapseSpaces,
  countLines,
  countParagraphs,
  countSentences,
  countWords,
  diffLines,
  extractBetween,
  extractEmails,
  extractHashtags,
  extractLinks,
  extractMentions,
  extractNumbers,
  extractPhones,
  extractUrls,
  findReplace,
  joinLines,
  numberLines,
  readingTime,
  removeDuplicateLines,
  removeEmptyLines,
  removeLineBreaks,
  reverseText,
  reverseWords,
  shuffleLines,
  slugToText,
  sortLines,
  sortNumericLines,
  speakingTime as speakingTimeImpl,
  stripLineNumbers,
  toCamelCase,
  toConstantCase,
  toDotCase,
  toKebabCase,
  toPascalCase,
  toSentenceCase,
  toSlug,
  toSnakeCase,
  toTitleCase,
  toggleCase,
  topKeywords,
  wordFrequency,
  wrapText,
} from "@/lib/text-utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NumberField, SelectField, ResultGrid, ResultRow, Formula } from "./shared"

export function TextAreaInput({
  id,
  value,
  onChange,
  label = "Input",
  placeholder,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  label?: string
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-40"
      />
    </div>
  )
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      setTimeout(() => setDone(false), 1200)
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      {done ? "Copied" : label}
    </Button>
  )
}

export function TextIo({
  input,
  onInput,
  output,
  inputLabel = "Input",
  outputLabel = "Output",
  placeholder,
}: {
  input: string
  onInput: (v: string) => void
  output: string
  inputLabel?: string
  outputLabel?: string
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <TextAreaInput id="text-io-in" value={input} onChange={onInput} label={inputLabel} placeholder={placeholder} />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="text-io-out">{outputLabel}</Label>
          <CopyButton text={output} />
        </div>
        <Textarea id="text-io-out" readOnly value={output} className="min-h-40" />
      </div>
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4"
      />
      <span>{label}</span>
    </label>
  )
}

function CounterPanel({ text, primary }: { text: string; primary: string }) {
  const metrics: [string, number][] = [
    ["Words", countWords(text)],
    ["Characters", text.length],
    ["Characters (no spaces)", text.replace(/\s/g, "").length],
    ["Sentences", countSentences(text)],
    ["Paragraphs", countParagraphs(text)],
    ["Lines", countLines(text)],
  ]
  const ordered = [
    ...metrics.filter((m) => m[0] === primary),
    ...metrics.filter((m) => m[0] !== primary),
  ]
  return (
    <ResultGrid>
      {ordered.map(([label, value]) => (
        <ResultRow key={label} label={label} value={fmtNum(value)} />
      ))}
    </ResultGrid>
  )
}

function CounterTool({ primary }: { primary: string }) {
  const [text, setText] = useState("")
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="ct-input" value={text} onChange={setText} />
      <CounterPanel text={text} primary={primary} />
    </div>
  )
}

export function WordCounter() {
  return <CounterTool primary="Words" />
}
export function CharacterCounter() {
  return <CounterTool primary="Characters" />
}
export function CharacterCounterWithoutSpaces() {
  return <CounterTool primary="Characters (no spaces)" />
}
export function SentenceCounter() {
  return <CounterTool primary="Sentences" />
}
export function ParagraphCounter() {
  return <CounterTool primary="Paragraphs" />
}
export function LineCounter() {
  return <CounterTool primary="Lines" />
}

function DurationTool({ defaultWpm, label }: { defaultWpm: string; label: string }) {
  const [text, setText] = useState("")
  const [wpm, setWpm] = useState(defaultWpm)
  const rate = Math.max(1, Number(wpm) || Number(defaultWpm))
  const minutes = label === "reading" ? readingTime(text, rate) : speakingTimeImpl(text, rate)
  const totalSec = Math.round(minutes * 60)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="dur-input" value={text} onChange={setText} />
      <NumberField
        id="dur-wpm"
        label={label === "reading" ? "Reading Speed (words per minute)" : "Speaking Speed (words per minute)"}
        value={wpm}
        onChange={setWpm}
        placeholder={defaultWpm}
      />
      <Formula>{label === "reading" ? "Assumes about 200 words per minute" : "Assumes about 130 words per minute"}</Formula>
      <ResultGrid>
        <ResultRow label={label === "reading" ? "Reading Time" : "Speaking Time"} value={countWords(text) > 0 ? `${m} min ${s} sec` : "—"} />
        <ResultRow label="Words" value={fmtNum(countWords(text))} />
      </ResultGrid>
    </div>
  )
}

export function ReadingTimeCalculator() {
  return <DurationTool defaultWpm="200" label="reading" />
}
export function SpeakingTimeCalculator() {
  return <DurationTool defaultWpm="130" label="speaking" />
}

function Transform({
  transform,
  placeholder,
}: {
  transform: (t: string) => string
  placeholder?: string
}) {
  const [text, setText] = useState("")
  return (
    <div className="flex flex-col gap-6">
      <TextIo input={text} onInput={setText} output={transform(text)} placeholder={placeholder} />
    </div>
  )
}

export function UppercaseConverter() {
  return <Transform transform={(t) => t.toUpperCase()} placeholder="Type something..." />
}
export function LowercaseConverter() {
  return <Transform transform={(t) => t.toLowerCase()} placeholder="Type something..." />
}
export function TitleCaseConverter() {
  return <Transform transform={toTitleCase} />
}
export function SentenceCaseConverter() {
  return <Transform transform={toSentenceCase} />
}
export function ToggleCaseConverter() {
  return <Transform transform={toggleCase} />
}
export function CamelCaseConverter() {
  return <Transform transform={toCamelCase} />
}
export function PascalCaseConverter() {
  return <Transform transform={toPascalCase} />
}
export function SnakeCaseConverter() {
  return <Transform transform={toSnakeCase} />
}
export function KebabCaseConverter() {
  return <Transform transform={toKebabCase} />
}
export function DotCaseConverter() {
  return <Transform transform={toDotCase} />
}
export function ConstantCaseConverter() {
  return <Transform transform={toConstantCase} />
}
export function ReverseText() {
  return <Transform transform={reverseText} />
}
export function ReverseWords() {
  return <Transform transform={reverseWords} />
}

export function SortLinesTool() {
  const [text, setText] = useState("")
  const [desc, setDesc] = useState(false)
  const [ci, setCi] = useState(false)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="sl-input" value={text} onChange={setText} />
      <div className="flex flex-wrap gap-2">
        <Toggle checked={desc} onChange={setDesc} label="Descending" />
        <Toggle checked={ci} onChange={setCi} label="Ignore case" />
      </div>
      <TextIo input={text} onInput={setText} output={sortLines(text, { desc, ci })} />
    </div>
  )
}
export function SortAlphabetically() {
  const [text, setText] = useState("")
  const [desc, setDesc] = useState(false)
  const [unique, setUnique] = useState(false)
  const sorted = sortLines(text, { desc, ci: true })
  const output = unique ? removeDuplicateLines(sorted, true) : sorted
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="sa-input" value={text} onChange={setText} />
      <div className="flex flex-wrap gap-2">
        <Toggle checked={desc} onChange={setDesc} label="Descending" />
        <Toggle checked={unique} onChange={setUnique} label="Remove duplicates" />
      </div>
      <TextIo input={text} onInput={setText} output={output} />
    </div>
  )
}
export function SortNumerically() {
  const [text, setText] = useState("")
  const [desc, setDesc] = useState(false)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="sn-input" value={text} onChange={setText} />
      <Toggle checked={desc} onChange={setDesc} label="Descending" />
      <TextIo input={text} onInput={setText} output={sortNumericLines(text, desc)} />
    </div>
  )
}
export function ShuffleLines() {
  const [text, setText] = useState("")
  const [seed, setSeed] = useState(0)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="sh-input" value={text} onChange={setText} />
      <div>
        <Button type="button" variant="outline" size="sm" onClick={() => setSeed((s) => s + 1)}>
          Shuffle Again
        </Button>
      </div>
      <TextIo input={text} onInput={setText} output={seed === 0 ? text : shuffleLines(text)} />
    </div>
  )
}
export function RemoveDuplicateLinesTool() {
  const [text, setText] = useState("")
  const [ci, setCi] = useState(false)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="rd-input" value={text} onChange={setText} />
      <Toggle checked={ci} onChange={setCi} label="Case insensitive" />
      <TextIo input={text} onInput={setText} output={removeDuplicateLines(text, ci)} />
    </div>
  )
}
export function RemoveEmptyLines() {
  const [text, setText] = useState("")
  return (
    <div className="flex flex-col gap-6">
      <TextIo input={text} onInput={setText} output={removeEmptyLines(text)} />
    </div>
  )
}
export function RemoveExtraSpaces() {
  const [text, setText] = useState("")
  return (
    <div className="flex flex-col gap-6">
      <TextIo input={text} onInput={setText} output={collapseSpaces(text)} />
    </div>
  )
}
export function RemoveLineBreaksTool() {
  const [text, setText] = useState("")
  const [sep, setSep] = useState("space")
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="rlb-input" value={text} onChange={setText} />
      <SelectField
        id="rlb-sep"
        label="Join with"
        value={sep}
        onChange={setSep}
        options={[
          { value: "space", label: "Single space" },
          { value: "none", label: "Nothing" },
          { value: "comma", label: "Comma + space" },
          { value: "semicolon", label: "Semicolon + space" },
        ]}
      />
      <TextIo
        input={text}
        onInput={setText}
        output={removeLineBreaks(text, sep === "none" ? "" : sep === "comma" ? ", " : sep === "semicolon" ? "; " : " ")}
      />
    </div>
  )
}
export function AddLineBreaks() {
  const [text, setText] = useState("")
  const [width, setWidth] = useState("40")
  const w = Math.max(5, Number(width) || 40)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="alb-input" value={text} onChange={setText} />
      <NumberField id="alb-width" label="Max characters per line" value={width} onChange={setWidth} placeholder="40" />
      <TextIo input={text} onInput={setText} output={wrapText(text, w)} />
    </div>
  )
}
export function NumberLinesTool() {
  const [text, setText] = useState("")
  const [start, setStart] = useState("1")
  const s = Math.max(1, Math.round(Number(start)) || 1)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="nl-input" value={text} onChange={setText} />
      <NumberField id="nl-start" label="Starting number" value={start} onChange={setStart} placeholder="1" />
      <TextIo input={text} onInput={setText} output={numberLines(text, s)} />
    </div>
  )
}
export function RemoveLineNumbersTool() {
  const [text, setText] = useState("")
  return (
    <div className="flex flex-col gap-6">
      <TextIo input={text} onInput={setText} output={stripLineNumbers(text)} />
    </div>
  )
}

export function FindReplaceTool() {
  const [text, setText] = useState("")
  const [find, setFind] = useState("")
  const [replace, setReplace] = useState("")
  const [regex, setRegex] = useState(false)
  const [ci, setCi] = useState(false)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="fr-input" value={text} onChange={setText} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fr-find">Find</Label>
          <input
            id="fr-find"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={find}
            onChange={(e) => setFind(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fr-replace">Replace with</Label>
          <input
            id="fr-replace"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Toggle checked={regex} onChange={setRegex} label="Use regular expression" />
        <Toggle checked={ci} onChange={setCi} label="Ignore case" />
      </div>
      <TextIo input={text} onInput={setText} output={findReplace(text, find, replace, { regex, ci })} />
    </div>
  )
}

export function TextDiffChecker() {
  const [a, setA] = useState("")
  const [b, setB] = useState("")
  const lines = diffLines(a, b)
  const adds = lines.filter((l) => l.type === "add").length
  const dels = lines.filter((l) => l.type === "del").length
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextAreaInput id="diff-a" label="Original Text" value={a} onChange={setA} />
        <TextAreaInput id="diff-b" label="New Text" value={b} onChange={setB} />
      </div>
      <Formula>+{adds} added, -{dels} removed</Formula>
      <div className="max-h-96 overflow-y-auto rounded-md border border-border bg-muted/20 p-2 font-mono text-xs">
        {lines.map((l, i) => (
          <div
            key={i}
            className={
              l.type === "add"
                ? "bg-emerald-500/10 text-emerald-700"
                : l.type === "del"
                  ? "bg-red-500/10 text-red-700 line-through"
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

export function TextCleaner() {
  const [text, setText] = useState("")
  const [extraSpaces, setExtraSpaces] = useState(true)
  const [emptyLines, setEmptyLines] = useState(false)
  const [trimLines, setTrimLines] = useState(true)
  const [smartQuotes, setSmartQuotes] = useState(true)
  const [zeroWidth, setZeroWidth] = useState(true)
  const [control, setControl] = useState(true)

  let out = text
  if (extraSpaces) out = out.replace(/[ \t]+/g, " ")
  if (smartQuotes)
    out = out
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2013|\u2014/g, "-")
  if (zeroWidth) out = out.replace(/[\u200B-\u200D\uFEFF]/g, "")
  if (control) out = out.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
  if (emptyLines) out = removeEmptyLines(out)
  if (trimLines) out = out.split("\n").map((l) => l.trim()).join("\n")

  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="tc-input" value={text} onChange={setText} />
      <div className="flex flex-wrap gap-2">
        <Toggle checked={extraSpaces} onChange={setExtraSpaces} label="Collapse extra spaces" />
        <Toggle checked={emptyLines} onChange={setEmptyLines} label="Remove empty lines" />
        <Toggle checked={trimLines} onChange={setTrimLines} label="Trim each line" />
        <Toggle checked={smartQuotes} onChange={setSmartQuotes} label="Straighten smart quotes" />
        <Toggle checked={zeroWidth} onChange={setZeroWidth} label="Remove zero-width chars" />
        <Toggle checked={control} onChange={setControl} label="Remove control chars" />
      </div>
      <TextIo input={text} onInput={setText} output={out} />
    </div>
  )
}

export function WhitespaceCleaner() {
  const [text, setText] = useState("")
  const [collapse, setCollapse] = useState(true)
  const [trimWhole, setTrimWhole] = useState(true)
  const [trimLine, setTrimLine] = useState(false)
  const [tabsToSpaces, setTabsToSpaces] = useState(true)

  let out = text
  if (tabsToSpaces) out = out.replace(/\t/g, "  ")
  if (collapse) out = out.replace(/[ ]+/g, " ")
  if (trimLine) out = out.split("\n").map((l) => l.trim()).join("\n")
  if (trimWhole) out = out.trim()

  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="wc-input" value={text} onChange={setText} />
      <div className="flex flex-wrap gap-2">
        <Toggle checked={collapse} onChange={setCollapse} label="Collapse multiple spaces" />
        <Toggle checked={trimWhole} onChange={setTrimWhole} label="Trim whole text" />
        <Toggle checked={trimLine} onChange={setTrimLine} label="Trim each line" />
        <Toggle checked={tabsToSpaces} onChange={setTabsToSpaces} label="Tabs to spaces" />
      </div>
      <TextIo input={text} onInput={setText} output={out} />
    </div>
  )
}

export function TextTrimmer() {
  const [text, setText] = useState("")
  const [trimWhole, setTrimWhole] = useState(true)
  const [trimLine, setTrimLine] = useState(true)
  const [blankEdges, setBlankEdges] = useState(true)

  let out = text
  if (blankEdges) out = out.replace(/^\s*\n/, "").replace(/\n\s*$/, "")
  if (trimLine) out = out.split("\n").map((l) => l.trim()).join("\n")
  if (trimWhole) out = out.trim()

  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="tt-input" value={text} onChange={setText} />
      <div className="flex flex-wrap gap-2">
        <Toggle checked={trimWhole} onChange={setTrimWhole} label="Trim whole text" />
        <Toggle checked={trimLine} onChange={setTrimLine} label="Trim each line" />
        <Toggle checked={blankEdges} onChange={setBlankEdges} label="Remove blank lines at edges" />
      </div>
      <TextIo input={text} onInput={setText} output={out} />
    </div>
  )
}

const SPLIT_DELIMITERS = [
  { value: "newline", label: "New line" },
  { value: "comma", label: "Comma" },
  { value: "space", label: "Space" },
  { value: "semicolon", label: "Semicolon" },
  { value: "pipe", label: "Pipe (|)" },
]

export function TextSplitter() {
  const [text, setText] = useState("")
  const [delim, setDelim] = useState("newline")

  const parts =
    delim === "newline"
      ? text.split(/\n/).filter((p) => p !== "")
      : delim === "comma"
        ? text.split(",").map((p) => p.trim()).filter(Boolean)
        : delim === "space"
          ? text.split(/\s+/).filter(Boolean)
          : delim === "semicolon"
            ? text.split(";").map((p) => p.trim()).filter(Boolean)
            : text.split("|").map((p) => p.trim()).filter(Boolean)

  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="ts-input" value={text} onChange={setText} />
      <SelectField id="ts-delim" label="Split by" value={delim} onChange={setDelim} options={SPLIT_DELIMITERS} />
      <Formula>{parts.length} parts</Formula>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Parts</span>
          <CopyButton text={parts.join("\n")} />
        </div>
        <div className="max-h-72 overflow-y-auto rounded-md border border-border bg-muted/20 p-3 font-mono text-sm">
          {parts.length === 0 ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <ol className="list-decimal space-y-1 pl-5">
              {parts.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}

export function TextJoiner() {
  const [text, setText] = useState("")
  const [sep, setSep] = useState("comma")
  const lines = text.split(/\n/).filter((l) => l !== "")
  const joined = joinLines(
    lines,
    sep === "comma" ? ", " : sep === "comma-nl" ? ",\n" : sep === "semicolon" ? "; " : sep === "tab" ? "\t" : " "
  )
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="tj-input" label="Lines (one per line)" value={text} onChange={setText} />
      <SelectField
        id="tj-sep"
        label="Join with"
        value={sep}
        onChange={setSep}
        options={[
          { value: "space", label: "Space" },
          { value: "comma", label: "Comma + space" },
          { value: "comma-nl", label: "Comma + newline" },
          { value: "semicolon", label: "Semicolon + space" },
          { value: "tab", label: "Tab" },
        ]}
      />
      <TextIo input={text} onInput={setText} output={joined} />
    </div>
  )
}

export function TextDeduplicator() {
  const [text, setText] = useState("")
  const [ci, setCi] = useState(false)
  const keyFn = ci ? (w: string) => w.toLowerCase() : (w: string) => w
  const seen = new Set<string>()
  const out: string[] = []
  for (const w of text.trim().split(/\s+/).filter(Boolean)) {
    const key = keyFn(w)
    if (!seen.has(key)) {
      seen.add(key)
      out.push(w)
    }
  }
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="td-input" value={text} onChange={setText} />
      <Toggle checked={ci} onChange={setCi} label="Case insensitive" />
      <TextIo input={text} onInput={setText} output={out.join(" ")} />
    </div>
  )
}

function Extractor({ extract, label }: { extract: (t: string) => string[]; label: string }) {
  const [text, setText] = useState("")
  const items = extract(text)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="ex-input" value={text} onChange={setText} />
      <Formula>{items.length} {label} found</Formula>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Extracted</span>
          <CopyButton text={items.join("\n")} />
        </div>
        <div className="max-h-72 overflow-y-auto rounded-md border border-border bg-muted/20 p-3 font-mono text-sm">
          {items.length === 0 ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <ol className="list-decimal space-y-1 pl-5">
              {items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}

export function EmailExtractor() {
  return <Extractor extract={extractEmails} label="emails" />
}
export function UrlExtractor() {
  return <Extractor extract={extractUrls} label="URLs" />
}
export function PhoneNumberExtractor() {
  return <Extractor extract={extractPhones} label="phone numbers" />
}
export function HashtagExtractor() {
  return <Extractor extract={extractHashtags} label="hashtags" />
}
export function MentionExtractor() {
  return <Extractor extract={extractMentions} label="mentions" />
}
export function NumberExtractor() {
  return <Extractor extract={extractNumbers} label="numbers" />
}
export function LinkExtractor() {
  return <Extractor extract={extractLinks} label="links" />
}

export function TextExtractorTool() {
  const [text, setText] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [regex, setRegex] = useState(false)
  const items = extractBetween(text, start, end, regex)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="te-input" value={text} onChange={setText} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="te-start">Start marker</Label>
          <input
            id="te-start"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="te-end">End marker</Label>
          <input
            id="te-end"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
      </div>
      <Toggle checked={regex} onChange={setRegex} label="Treat markers as regular expressions" />
      <Formula>{items.length} matches</Formula>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Extracted</span>
          <CopyButton text={items.join("\n")} />
        </div>
        <Textarea readOnly value={items.join("\n")} className="min-h-32" />
      </div>
    </div>
  )
}

export function KeywordExtractor() {
  const [text, setText] = useState("")
  const [top, setTop] = useState("10")
  const n = Math.max(1, Math.round(Number(top)) || 10)
  const keywords = topKeywords(text, n)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="kw-input" value={text} onChange={setText} />
      <NumberField id="kw-top" label="Top keywords" value={top} onChange={setTop} placeholder="10" />
      <Formula>{keywords.length} keywords (stopwords excluded)</Formula>
      <div className="max-h-80 overflow-y-auto rounded-md border border-border bg-muted/20 p-3">
        {keywords.length === 0 ? (
          <span className="text-sm text-muted-foreground">—</span>
        ) : (
          <ul className="space-y-1">
            {keywords.map((k, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span>{k.word}</span>
                <span className="font-mono text-muted-foreground">{k.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export function WordFrequencyCounter() {
  const [text, setText] = useState("")
  const freq = wordFrequency(text)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="wf-input" value={text} onChange={setText} />
      <Formula>{freq.length} unique words</Formula>
      <div className="max-h-80 overflow-y-auto rounded-md border border-border bg-muted/20 p-3">
        {freq.length === 0 ? (
          <span className="text-sm text-muted-foreground">—</span>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-1 pr-4">Word</th>
                <th className="py-1">Count</th>
              </tr>
            </thead>
            <tbody>
              {freq.map((e) => (
                <tr key={e.word} className="border-b border-border/50">
                  <td className="py-1 pr-4">{e.word}</td>
                  <td className="py-1 font-mono">{e.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export function TextStatistics() {
  const [text, setText] = useState("")
  const words = countWords(text)
  const uniqueWords = wordFrequency(text).length
  const avgWord = words > 0 ? [...text.match(/[A-Za-z0-9']+/g) || []].join("").length / words : 0
  const longest = [...text.match(/[A-Za-z0-9']+/g) || []].reduce((a, b) => (b.length > a.length ? b : a), "")
  const minutes = readingTime(text)
  const totalSec = Math.round(minutes * 60)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="st-input" value={text} onChange={setText} />
      <Formula>Full overview of your text</Formula>
      <ResultGrid>
        <ResultRow label="Words" value={fmtNum(words)} />
        <ResultRow label="Characters" value={fmtNum(text.length)} />
        <ResultRow label="Characters (no spaces)" value={fmtNum(text.replace(/\s/g, "").length)} />
        <ResultRow label="Sentences" value={fmtNum(countSentences(text))} />
        <ResultRow label="Paragraphs" value={fmtNum(countParagraphs(text))} />
        <ResultRow label="Lines" value={fmtNum(countLines(text))} />
        <ResultRow label="Unique Words" value={fmtNum(uniqueWords)} />
        <ResultRow label="Avg Word Length" value={fmtNum(avgWord, 1)} />
        <ResultRow label="Longest Word" value={longest || "—"} />
        <ResultRow label="Reading Time" value={words > 0 ? `${Math.floor(totalSec / 60)} min ${totalSec % 60} sec` : "—"} />
      </ResultGrid>
    </div>
  )
}

export function TextToSlug() {
  const [text, setText] = useState("")
  return (
    <div className="flex flex-col gap-6">
      <TextIo input={text} onInput={setText} output={toSlug(text)} outputLabel="Slug" />
    </div>
  )
}
export function SlugToText() {
  const [text, setText] = useState("")
  return (
    <div className="flex flex-col gap-6">
      <TextIo input={text} onInput={setText} output={slugToText(text)} inputLabel="Slug" outputLabel="Text" />
    </div>
  )
}
