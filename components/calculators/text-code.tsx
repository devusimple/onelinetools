"use client"

import { useState } from "react"
import {
  asciiCodes,
  codesToAscii,
  morseToText,
  textToMorse,
  unicodeEscape,
  unicodePoints,
  unicodeUnescape,
} from "@/lib/text-utils"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ResultGrid, ResultRow, Formula } from "./shared"
import { CopyButton, TextAreaInput } from "./text"

function PairPanel({
  labelA,
  labelB,
  a,
  b,
  onA,
  onB,
}: {
  labelA: string
  labelB: string
  a: string
  b: string
  onA: (v: string) => void
  onB: (v: string) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label>{labelA}</Label>
        <Textarea
          value={a}
          onChange={(e) => onA(e.target.value)}
          className="min-h-40"
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>{labelB}</Label>
          <CopyButton text={b} />
        </div>
        <Textarea value={b} onChange={(e) => onB(e.target.value)} className="min-h-40" />
      </div>
    </div>
  )
}

export function MorseCodeConverter() {
  const [text, setText] = useState("")
  const [morse, setMorse] = useState("")

  return (
    <div className="flex flex-col gap-6">
      <PairPanel
        labelA="Text"
        labelB="Morse Code"
        a={text}
        b={morse}
        onA={(v) => {
          setText(v)
          setMorse(textToMorse(v))
        }}
        onB={(v) => {
          setMorse(v)
          setText(morseToText(v))
        }}
      />
      <Formula>Type in either box; the other updates live</Formula>
    </div>
  )
}

export function AsciiConverter() {
  const [text, setText] = useState("")
  const [codes, setCodes] = useState("")
  const table = asciiCodes(text)
  const decoded = codesToAscii(codes)

  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="ascii-text" label="Text → Codes" value={text} onChange={setText} />
      <div className="max-h-64 overflow-y-auto rounded-md border border-border bg-muted/20 p-3">
        {table.length === 0 ? (
          <span className="text-sm text-muted-foreground">—</span>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-1 pr-4">Character</th>
                <th className="py-1 pr-4">Decimal</th>
                <th className="py-1">Hex</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-1 pr-4">{row.char === " " ? "␠" : row.char}</td>
                  <td className="py-1 pr-4 font-mono">{row.code}</td>
                  <td className="py-1 font-mono">0x{row.hex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="ascii-codes">Codes → Text</Label>
        <Textarea
          id="ascii-codes"
          value={codes}
          onChange={(e) => setCodes(e.target.value)}
          placeholder="72 101 108 108 111"
          className="min-h-24"
        />
      </div>
      <ResultGrid>
        <ResultRow label="Decoded Text" value={decoded || "—"} />
      </ResultGrid>
    </div>
  )
}

export function UnicodeConverter() {
  const [text, setText] = useState("")
  const [escaped, setEscaped] = useState("")
  const [codes, setCodes] = useState("")
  const table = unicodePoints(text)
  const decoded = codesToAscii(codes)

  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="uni-text" label="Text → Code Points" value={text} onChange={setText} />
      <div className="max-h-64 overflow-y-auto rounded-md border border-border bg-muted/20 p-3">
        {table.length === 0 ? (
          <span className="text-sm text-muted-foreground">—</span>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-1 pr-4">Character</th>
                <th className="py-1 pr-4">Code Point</th>
                <th className="py-1">Decimal</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-1 pr-4">{row.char === " " ? "␠" : row.char}</td>
                  <td className="py-1 pr-4 font-mono">U+{row.hex}</td>
                  <td className="py-1 font-mono">{row.dec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="uni-escape">Escaped (\uXXXX)</Label>
          <CopyButton text={unicodeEscape(text)} />
        </div>
        <Textarea
          id="uni-escape"
          value={escaped}
          onChange={(e) => setEscaped(e.target.value)}
          placeholder="\u0041\u00E9"
          className="min-h-20 font-mono"
        />
      </div>
      <ResultGrid>
        <ResultRow label="Unescaped" value={unicodeUnescape(escaped) || "—"} />
        <ResultRow label="Escape of input" value={text ? unicodeEscape(text) : "—"} />
      </ResultGrid>
      <div className="flex flex-col gap-2">
        <Label htmlFor="uni-codes">Code Points → Text</Label>
        <Textarea
          id="uni-codes"
          value={codes}
          onChange={(e) => setCodes(e.target.value)}
          placeholder="U+0048 U+0069 33 0x21"
          className="min-h-20 font-mono"
        />
      </div>
      <ResultGrid>
        <ResultRow label="Decoded Text" value={decoded || "—"} />
      </ResultGrid>
    </div>
  )
}
