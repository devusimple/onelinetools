"use client"

import { useState } from "react"
import { countWords, generateLorem, randomParagraphs, randomSentences, randomWords } from "@/lib/text-utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { NumberField } from "./shared"
import { CopyButton } from "./text"

function OutputArea({ text, stats }: { text: string; stats?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>Output</Label>
        <CopyButton text={text} />
      </div>
      <Textarea readOnly value={text} className="min-h-48" />
      {stats ? <p className="text-xs text-muted-foreground">{stats}</p> : null}
    </div>
  )
}

export function LoremIpsumGenerator() {
  const [paragraphs, setParagraphs] = useState("3")
  const [perPara, setPerPara] = useState("5")
  const [output, setOutput] = useState("")

  const p = Math.min(50, Math.max(1, Math.round(Number(paragraphs)) || 3))
  const s = Math.min(30, Math.max(1, Math.round(Number(perPara)) || 5))

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="li-p" label="Paragraphs" value={paragraphs} onChange={setParagraphs} placeholder="3" />
        <NumberField id="li-s" label="Sentences per paragraph" value={perPara} onChange={setPerPara} placeholder="5" />
      </div>
      <div>
        <Button type="button" onClick={() => setOutput(generateLorem(p, s))}>
          Generate
        </Button>
      </div>
      <OutputArea text={output} stats={output ? `${countWords(output)} words · ${output.length} characters` : undefined} />
    </div>
  )
}

export function RandomWordGenerator() {
  const [count, setCount] = useState("10")
  const [output, setOutput] = useState("")

  const n = Math.min(500, Math.max(1, Math.round(Number(count)) || 10))

  return (
    <div className="flex flex-col gap-6">
      <NumberField id="rw-count" label="Number of words" value={count} onChange={setCount} placeholder="10" />
      <div>
        <Button type="button" onClick={() => setOutput(randomWords(n))}>
          Generate
        </Button>
      </div>
      <OutputArea text={output} />
    </div>
  )
}

export function RandomSentenceGenerator() {
  const [count, setCount] = useState("5")
  const [output, setOutput] = useState("")

  const n = Math.min(100, Math.max(1, Math.round(Number(count)) || 5))

  return (
    <div className="flex flex-col gap-6">
      <NumberField id="rs-count" label="Number of sentences" value={count} onChange={setCount} placeholder="5" />
      <div>
        <Button type="button" onClick={() => setOutput(randomSentences(n))}>
          Generate
        </Button>
      </div>
      <OutputArea text={output} />
    </div>
  )
}

export function RandomParagraphGenerator() {
  const [count, setCount] = useState("3")
  const [output, setOutput] = useState("")

  const n = Math.min(50, Math.max(1, Math.round(Number(count)) || 3))

  return (
    <div className="flex flex-col gap-6">
      <NumberField id="rp-count" label="Number of paragraphs" value={count} onChange={setCount} placeholder="3" />
      <div>
        <Button type="button" onClick={() => setOutput(randomParagraphs(n))}>
          Generate
        </Button>
      </div>
      <OutputArea text={output} stats={output ? `${countWords(output)} words · ${output.length} characters` : undefined} />
    </div>
  )
}
