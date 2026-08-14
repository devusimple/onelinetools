"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CopyButton, TextAreaInput } from "./text"
import { NumberField, SelectField, ResultGrid, ResultRow, Formula } from "./shared"
import { unicodeEscape, unicodeUnescape } from "@/lib/text-utils"
import {
  b64ToStr,
  base32Decode,
  base32Encode,
  base58Decode,
  base58Encode,
  base64urlToStr,
  bytesToHex,
  certificateFingerprint,
  checksum,
  crc32,
  decodeCertificate,
  decodeJwt,
  generateCryptoKey,
  generateOtpSecret,
  generatePassphrase,
  generatePassword,
  generatePin,
  hashBytes,
  hashText,
  HASH_OPTIONS,
  HMAC_OPTIONS,
  hmacDigest,
  htmlDecode,
  htmlEncode,
  jsonEscape,
  jsonUnescape,
  parsePem,
  passwordEntropy,
  passwordStrength,
  randomOtp,
  randomToken,
  secureRandomHex,
  signJwtHs256,
  strToB64,
  strToBase64url,
  totp,
  urlDecode,
  urlEncode,
  uuidv4,
  uuidv7,
  validateUuid,
  verifyJwtHs256,
  type HashAlgo,
  type HmacAlgo,
} from "@/lib/encoding-utils"

function Io({
  transform,
  placeholder,
  invalid,
  errorMsg = "Invalid input",
  inputLabel = "Input",
  outputLabel = "Output",
}: {
  transform: (t: string) => string
  placeholder?: string
  invalid?: (t: string) => boolean
  errorMsg?: string
  inputLabel?: string
  outputLabel?: string
}) {
  const [text, setText] = useState("")
  const bad = invalid ? invalid(text) : false
  const output = bad ? "" : transform(text)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="io-in" value={text} onChange={setText} label={inputLabel} placeholder={placeholder} />
      {bad ? (
        <Formula>{errorMsg}</Formula>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="io-out">{outputLabel}</Label>
            <CopyButton text={output} />
          </div>
          <Textarea id="io-out" readOnly value={output} className="min-h-40 font-mono" />
        </div>
      )}
    </div>
  )
}

function OutputArea({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <CopyButton text={value} />
      </div>
      <Textarea readOnly value={value || "—"} className="min-h-16 font-mono" />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function JsonBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <CopyButton text={value} />
      </div>
      <Textarea readOnly value={value} className="min-h-32 font-mono text-xs" />
    </div>
  )
}

function HashPanel({
  algos,
  defaultAlgo,
  hint,
}: {
  algos?: { value: HashAlgo; label: string }[]
  defaultAlgo: HashAlgo
  hint?: string
}) {
  const [text, setText] = useState("")
  const [algo, setAlgo] = useState<HashAlgo>(defaultAlgo)
  const hash = text ? hashText(algo, text) : ""
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="hp-input" value={text} onChange={setText} />
      {algos ? (
        <SelectField
          id="hp-algo"
          label="Algorithm"
          value={algo}
          onChange={(v) => setAlgo(v as HashAlgo)}
          options={algos}
        />
      ) : null}
      <Formula>{hint ?? `${algo.toUpperCase()} digest of the UTF-8 bytes of your text`}</Formula>
      <OutputArea label={`${algo.toUpperCase()} Hash`} value={hash} />
    </div>
  )
}

export function Base64Encoder() {
  return (
    <Io
      transform={strToB64}
      placeholder="Hello world…"
      outputLabel="Base64"
      inputLabel="Plain Text"
    />
  )
}

export function Base64Decoder() {
  return (
    <Io
      transform={(t) => b64ToStr(t) ?? ""}
      invalid={(t) => t.trim() !== "" && b64ToStr(t) === null}
      errorMsg="That does not look like valid Base64."
      placeholder="SGVsbG8gd29ybGQ="
      inputLabel="Base64"
      outputLabel="Plain Text"
    />
  )
}

export function Base64UrlEncoder() {
  return (
    <Io
      transform={strToBase64url}
      placeholder="Hello world…"
      outputLabel="Base64URL"
      inputLabel="Plain Text"
    />
  )
}

export function Base64UrlDecoder() {
  return (
    <Io
      transform={(t) => base64urlToStr(t) ?? ""}
      invalid={(t) => t.trim() !== "" && base64urlToStr(t) === null}
      errorMsg="That does not look like valid Base64URL."
      placeholder="SGVsbG8gd29ybGQ"
      inputLabel="Base64URL"
      outputLabel="Plain Text"
    />
  )
}

export function Base32Encoder() {
  return (
    <Io
      transform={(t) => base32Encode(new TextEncoder().encode(t))}
      placeholder="Hello world…"
      outputLabel="Base32"
      inputLabel="Plain Text"
    />
  )
}

export function Base32Decoder() {
  return (
    <Io
      transform={(t) => {
        const bytes = base32Decode(t)
        return bytes ? new TextDecoder().decode(bytes) : ""
      }}
      invalid={(t) => t.trim() !== "" && base32Decode(t) === null}
      errorMsg="That does not look like valid Base32."
      placeholder="JBSWY3DPEHPK3PXP"
      inputLabel="Base32"
      outputLabel="Plain Text"
    />
  )
}

export function Base58Encoder() {
  return (
    <Io
      transform={(t) => base58Encode(new TextEncoder().encode(t))}
      placeholder="Hello world…"
      outputLabel="Base58"
      inputLabel="Plain Text"
    />
  )
}

export function Base58Decoder() {
  return (
    <Io
      transform={(t) => {
        const bytes = base58Decode(t)
        return bytes ? new TextDecoder().decode(bytes) : ""
      }}
      invalid={(t) => t.trim() !== "" && base58Decode(t) === null}
      errorMsg="That does not look like valid Base58."
      placeholder="JxF12TrwUP45BMd"
      inputLabel="Base58"
      outputLabel="Plain Text"
    />
  )
}

export function UrlEncoder() {
  return <Io transform={urlEncode} placeholder="https://example.com/?q=hello world" outputLabel="Encoded URL" inputLabel="URL" />
}

export function UrlDecoder() {
  return (
    <Io
      transform={(t) => urlDecode(t) ?? ""}
      invalid={(t) => t.trim() !== "" && urlDecode(t) === null}
      errorMsg="That does not look like valid percent-encoding."
      placeholder="https%3A%2F%2Fexample.com%2F%3Fq%3Dhello%20world"
      inputLabel="Encoded URL"
      outputLabel="Decoded URL"
    />
  )
}

export function HtmlEntityEncoder() {
  return (
    <Io
      transform={htmlEncode}
      placeholder={'<p class="x">Tom & Jerry</p>'}
      outputLabel="Encoded HTML"
      inputLabel="Plain Text"
    />
  )
}

export function HtmlEntityDecoder() {
  return (
    <Io
      transform={htmlDecode}
      placeholder="&lt;p&gt;Tom &amp; Jerry&lt;/p&gt;"
      inputLabel="HTML Entities"
      outputLabel="Plain Text"
    />
  )
}

export function JsonEscapeTool() {
  return (
    <Io
      transform={jsonEscape}
      placeholder={'Say "hi" and press\\ntab\tnow'}
      outputLabel="Escaped JSON"
      inputLabel="Plain Text"
    />
  )
}

export function JsonUnescapeTool() {
  return (
    <Io
      transform={(t) => jsonUnescape(t) ?? ""}
      invalid={(t) => t.trim() !== "" && jsonUnescape(t) === null}
      errorMsg="That does not look like a valid escaped JSON string."
      placeholder={'Say \"hi\" and press\\ntab'}
      inputLabel="Escaped JSON"
      outputLabel="Plain Text"
    />
  )
}

export function UnicodeEscapeTool() {
  return (
    <Io
      transform={unicodeEscape}
      placeholder="café ☕"
      outputLabel="Escaped"
      inputLabel="Plain Text"
    />
  )
}

export function UnicodeUnescapeTool() {
  return (
    <Io
      transform={unicodeUnescape}
      placeholder="caf\u00e9 \u{2615}"
      inputLabel="Escaped"
      outputLabel="Plain Text"
    />
  )
}

export function Md5Generator() {
  return <HashPanel defaultAlgo="md5" hint="MD5 digest of the UTF-8 bytes of your text" />
}

export function Sha1Generator() {
  return <HashPanel defaultAlgo="sha1" hint="SHA-1 digest of the UTF-8 bytes of your text" />
}

export function Sha256Generator() {
  return <HashPanel defaultAlgo="sha256" hint="SHA-256 digest of the UTF-8 bytes of your text" />
}

export function Sha384Generator() {
  return <HashPanel defaultAlgo="sha384" hint="SHA-384 digest of the UTF-8 bytes of your text" />
}

export function Sha512Generator() {
  return <HashPanel defaultAlgo="sha512" hint="SHA-512 digest of the UTF-8 bytes of your text" />
}

export function Sha3Generator() {
  const sha3Opts = HASH_OPTIONS.filter((o) => o.value.startsWith("sha3"))
  return <HashPanel algos={sha3Opts} defaultAlgo="sha3-256" hint="SHA-3 digest of the UTF-8 bytes of your text" />
}

export function TextHashGenerator() {
  return <HashPanel algos={HASH_OPTIONS} defaultAlgo="sha256" />
}

export function HmacGenerator() {
  const [text, setText] = useState("")
  const [key, setKey] = useState("")
  const [algo, setAlgo] = useState<HmacAlgo>("sha256")
  const mac = hmacDigest(algo, key, text)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="hmac-text" value={text} onChange={setText} label="Message" />
      <TextAreaInput id="hmac-key" value={key} onChange={setKey} label="Secret Key" />
      <SelectField
        id="hmac-algo"
        label="Algorithm"
        value={algo}
        onChange={(v) => setAlgo(v as HmacAlgo)}
        options={HMAC_OPTIONS}
      />
      <OutputArea label={`${algo.toUpperCase()} MAC`} value={mac} />
    </div>
  )
}

export function FileHashGenerator() {
  const [algo, setAlgo] = useState<HashAlgo>("sha256")
  const [data, setData] = useState<Uint8Array | null>(null)
  const [name, setName] = useState("")
  const [size, setSize] = useState("")
  const hash = data ? bytesToHex(hashBytes(algo, data)) : ""

  const handleFile = async (file: File | null) => {
    setName("")
    setSize("")
    setData(null)
    if (!file) return
    setName(file.name)
    setSize(`${file.size} bytes`)
    setData(new Uint8Array(await file.arrayBuffer()))
  }

  return (
    <div className="flex flex-col gap-6">
      <Label>Choose a file</Label>
      <input
        type="file"
        onChange={(e) => {
          void handleFile(e.target.files?.[0] ?? null)
        }}
        className="text-sm"
      />
      <SelectField
        id="fh-algo"
        label="Algorithm"
        value={algo}
        onChange={(v) => setAlgo(v as HashAlgo)}
        options={HASH_OPTIONS}
      />
      {name ? <Formula>{name} · {size || ""}</Formula> : null}
      <OutputArea label={`${algo.toUpperCase()} Hash`} value={hash} />
    </div>
  )
}

export function HashCompareTool() {
  const [text, setText] = useState("")
  const [expected, setExpected] = useState("")
  const [algo, setAlgo] = useState<HashAlgo>("sha256")
  const actual = hashText(algo, text)
  const cleanExpected = expected.trim().toLowerCase().replace(/[: ]/g, "")
  const cleanActual = actual.toLowerCase()
  const match = expected.trim() === "" || actual === "" ? null : cleanExpected === cleanActual
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="hc-input" value={text} onChange={setText} label="Your Text" />
      <TextAreaInput id="hc-expected" value={expected} onChange={setExpected} label="Expected Hash" placeholder="Paste a hash to compare…" />
      <SelectField
        id="hc-algo"
        label="Algorithm"
        value={algo}
        onChange={(v) => setAlgo(v as HashAlgo)}
        options={HASH_OPTIONS}
      />
      <OutputArea label={`${algo.toUpperCase()} Hash`} value={actual} />
      <Formula>
        {match === null
          ? "Paste a hash above to compare"
          : match
            ? "✓ Match — the hash matches your text"
            : "✗ No match — the hash differs from your text"}
      </Formula>
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4" />
      <span>{label}</span>
    </label>
  )
}

function GeneratorPanel({
  children,
  onGenerate,
  output,
  hint,
}: {
  children?: React.ReactNode
  onGenerate: () => void
  output: string
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-6">
      {children}
      <div>
        <Button type="button" onClick={onGenerate}>
          Generate
        </Button>
      </div>
      <OutputArea label="Output" value={output} hint={hint} />
    </div>
  )
}

export function PasswordGenerator() {
  const [length, setLength] = useState("16")
  const [upper, setUpper] = useState(true)
  const [lower, setLower] = useState(true)
  const [digits, setDigits] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [output, setOutput] = useState("")
  const n = Math.min(128, Math.max(4, Math.round(Number(length)) || 16))
  const gen = () =>
    setOutput(generatePassword({ length: n, upper, lower, digits, symbols }))
  return (
    <GeneratorPanel onGenerate={gen} output={output} hint="Generated with the browser's secure random source">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="pg-length" label="Length" value={length} onChange={setLength} placeholder="16" suffix="chars" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Toggle checked={upper} onChange={setUpper} label="Uppercase" />
        <Toggle checked={lower} onChange={setLower} label="Lowercase" />
        <Toggle checked={digits} onChange={setDigits} label="Numbers" />
        <Toggle checked={symbols} onChange={setSymbols} label="Symbols" />
      </div>
      {output ? <Formula>Entropy ≈ {Math.round(passwordEntropy(output))} bits</Formula> : null}
    </GeneratorPanel>
  )
}

export function StrongPasswordGenerator() {
  const [length, setLength] = useState("20")
  const [output, setOutput] = useState("")
  const n = Math.min(128, Math.max(12, Math.round(Number(length)) || 20))
  return (
    <GeneratorPanel
      onGenerate={() => setOutput(generatePassword({ length: n, upper: true, lower: true, digits: true, symbols: true }))}
      output={output}
      hint="Uses all four character classes with guaranteed coverage"
    >
      <NumberField id="sp-length" label="Length" value={length} onChange={setLength} placeholder="20" suffix="chars" />
      {output ? <Formula>Entropy ≈ {Math.round(passwordEntropy(output))} bits</Formula> : null}
    </GeneratorPanel>
  )
}

export function PassphraseGenerator() {
  const [words, setWords] = useState("4")
  const [sep, setSep] = useState("dash")
  const [capitalize, setCapitalize] = useState(false)
  const [output, setOutput] = useState("")
  const n = Math.min(20, Math.max(1, Math.round(Number(words)) || 4))
  const sepChar = sep === "space" ? " " : sep === "dot" ? "." : sep === "underscore" ? "_" : "-"
  return (
    <GeneratorPanel
      onGenerate={() => setOutput(generatePassphrase(n, sepChar, capitalize))}
      output={output}
      hint="Memorable random words from a fixed word list"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="ph-words" label="Words" value={words} onChange={setWords} placeholder="4" />
        <SelectField
          id="ph-sep"
          label="Separator"
          value={sep}
          onChange={setSep}
          options={[
            { value: "dash", label: "Dash (-)" },
            { value: "space", label: "Space" },
            { value: "dot", label: "Dot (.)" },
            { value: "underscore", label: "Underscore (_)" },
          ]}
        />
      </div>
      <Toggle checked={capitalize} onChange={setCapitalize} label="Capitalize each word" />
    </GeneratorPanel>
  )
}

export function PinGenerator() {
  const [length, setLength] = useState("6")
  const [output, setOutput] = useState("")
  const n = Math.min(32, Math.max(1, Math.round(Number(length)) || 6))
  return (
    <GeneratorPanel onGenerate={() => setOutput(generatePin(n))} output={output}>
      <NumberField id="pin-length" label="Length" value={length} onChange={setLength} placeholder="6" suffix="digits" />
    </GeneratorPanel>
  )
}

export function RandomTokenGenerator() {
  const [bytes, setBytes] = useState("16")
  const [output, setOutput] = useState("")
  const n = Math.min(256, Math.max(1, Math.round(Number(bytes)) || 16))
  return (
    <GeneratorPanel onGenerate={() => setOutput(randomToken(n))} output={output} hint="Cryptographically secure random hex">
      <NumberField id="rt-bytes" label="Bytes" value={bytes} onChange={setBytes} placeholder="16" />
    </GeneratorPanel>
  )
}

export function UuidGenerator() {
  const [output, setOutput] = useState(uuidv4())
  const [time, setTime] = useState(new Date().toLocaleTimeString())
  return (
    <GeneratorPanel
      onGenerate={() => {
        setOutput(uuidv4())
        setTime(new Date().toLocaleTimeString())
      }}
      output={output}
      hint="Random UUID version 4"
    >
      <Formula>Generated {time}</Formula>
    </GeneratorPanel>
  )
}

export function UuidV4Generator() {
  const [count, setCount] = useState("5")
  const [output, setOutput] = useState("")
  const n = Math.min(100, Math.max(1, Math.round(Number(count)) || 5))
  return (
    <GeneratorPanel onGenerate={() => setOutput(Array.from({ length: n }, uuidv4).join("\n"))} output={output} hint="One random UUID v4 per line">
      <NumberField id="v4-count" label="How many" value={count} onChange={setCount} placeholder="5" />
    </GeneratorPanel>
  )
}

export function UuidV7Generator() {
  const [count, setCount] = useState("5")
  const [output, setOutput] = useState("")
  const n = Math.min(100, Math.max(1, Math.round(Number(count)) || 5))
  return (
    <GeneratorPanel onGenerate={() => setOutput(Array.from({ length: n }, uuidv7).join("\n"))} output={output} hint="Time-ordered UUID version 7, one per line">
      <NumberField id="v7-count" label="How many" value={count} onChange={setCount} placeholder="5" />
    </GeneratorPanel>
  )
}

export function UuidValidator() {
  const [input, setInput] = useState("")
  const result = validateUuid(input)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="uv-input" value={input} onChange={setInput} label="UUID to validate" placeholder="xxxxxxxx-xxxx-…" />
      <ResultGrid>
        <ResultRow label="Valid" value={input.trim() === "" ? "—" : result.valid ? "✓ Yes" : "✗ No"} />
        <ResultRow label="Version" value={result.valid ? String(result.version) : "—"} />
        <ResultRow label="Variant" value={result.valid ? result.variant! : "—"} />
      </ResultGrid>
    </div>
  )
}

export function JwtDecoder() {
  const [token, setToken] = useState("")
  const decoded = decodeJwt(token)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="jwt-decode-input" value={token} onChange={setToken} label="JWT" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.…" />
      {token.trim() === "" ? (
        <Formula>Paste a JWT to decode its header and payload</Formula>
      ) : decoded ? (
        <>
          <JsonBlock label="Header" value={JSON.stringify(decoded.header, null, 2)} />
          <JsonBlock label="Payload" value={JSON.stringify(decoded.payload, null, 2)} />
          <Formula>Signature: {decoded.signature}</Formula>
        </>
      ) : (
        <Formula>That does not look like a valid three-part JWT.</Formula>
      )}
    </div>
  )
}

export function JwtInspector() {
  const [token, setToken] = useState("")
  const [now, setNow] = useState(0)
  const decoded = decodeJwt(token)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const expired =
    decoded && typeof decoded.payload.exp === "number" && now > 0
      ? now >= Number(decoded.payload.exp) * 1000
      : null
  const claims: [string, string][] = []
  if (decoded) {
    for (const k of ["alg", "typ", "kid", "jku"]) {
      const h = decoded.header[k]
      if (h !== undefined) claims.push([k, String(h)])
    }
    for (const k of ["iss", "sub", "aud", "exp", "nbf", "iat", "jti"]) {
      const p = decoded.payload[k]
      if (p !== undefined) claims.push([k, typeof p === "number" ? new Date(p * 1000).toISOString() : String(p)])
    }
  }
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="jwt-inspect-input" value={token} onChange={setToken} label="JWT" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.…" />
      {decoded ? (
        <>
          <div className="max-h-80 overflow-y-auto rounded-md border border-border bg-muted/20 p-3">
            {claims.length === 0 ? (
              <span className="text-sm text-muted-foreground">No standard claims found</span>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-1 pr-4">Claim</th>
                    <th className="py-1">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map(([k, v], i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-1 pr-4 font-mono">{k}</td>
                      <td className="break-all py-1">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <Formula>
            {decoded.payload.exp
              ? expired === null
                ? "Checking expiry…"
                : expired
                  ? "Expired"
                  : "Not expired"
              : "No expiry claim"}
          </Formula>
        </>
      ) : (
        <Formula>{token.trim() === "" ? "Paste a JWT to inspect its claims" : "That does not look like a valid three-part JWT."}</Formula>
      )}
    </div>
  )
}

export function JwtGenerator() {
  const [payloadText, setPayloadText] = useState(
    '{\n  "sub": "1234567890",\n  "name": "Jane Doe",\n  "iat": 1700000000\n}'
  )
  const [secret, setSecret] = useState("my-secret-key")
  const [token, setToken] = useState("")
  let parsed: Record<string, unknown> | null = null
  try {
    parsed = JSON.parse(payloadText)
  } catch {
    parsed = null
  }
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="jwt-gen-payload" value={payloadText} onChange={setPayloadText} label="Payload (JSON)" />
      <TextAreaInput id="jwt-gen-secret" value={secret} onChange={setSecret} label="Secret" />
      {!parsed ? <Formula>Payload must be valid JSON.</Formula> : null}
      <div>
        <Button type="button" disabled={!parsed} onClick={() => setToken(signJwtHs256(parsed!, secret))}>
          Sign HS256
        </Button>
      </div>
      {token ? <OutputArea label="Signed JWT" value={token} /> : null}
    </div>
  )
}

export function JwtValidator() {
  const [token, setToken] = useState("")
  const [secret, setSecret] = useState("")
  const [now, setNow] = useState(0)
  const decoded = decodeJwt(token)
  const valid = token.trim() !== "" ? verifyJwtHs256(token, secret) : null
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const expired =
    decoded && typeof decoded.payload.exp === "number" && now > 0
      ? now >= Number(decoded.payload.exp) * 1000
      : null
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="jwt-val-token" value={token} onChange={setToken} label="JWT" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.…" />
      <TextAreaInput id="jwt-val-secret" value={secret} onChange={setSecret} label="Secret" />
      <ResultGrid>
        <ResultRow
          label="Signature"
          value={valid === null ? "—" : valid ? "✓ Valid" : "✗ Invalid"}
        />
        <ResultRow
          label="Expiry"
          value={expired === null ? "—" : expired ? "Expired" : "Not expired"}
        />
      </ResultGrid>
    </div>
  )
}

export function PasswordStrengthChecker() {
  const [password, setPassword] = useState("")
  const { score, label, checks } = passwordStrength(password)
  const entropy = passwordEntropy(password)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="ps-input" value={password} onChange={setPassword} label="Password" />
      <ResultGrid>
        <ResultRow label="Strength" value={password ? label : "—"} />
        <ResultRow label="Score" value={password ? `${score} / ${checks.length}` : "—"} />
        <ResultRow label="Entropy" value={password ? `${entropy.toFixed(1)} bits` : "—"} />
      </ResultGrid>
      <div className="max-h-64 overflow-y-auto rounded-md border border-border bg-muted/20 p-3">
        <ul className="space-y-1">
          {checks.map((c, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span>{c.label}</span>
              <span className="font-mono text-muted-foreground">{c.ok ? "✓" : "✗"}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function EntropyCalculator() {
  const [input, setInput] = useState("")
  const entropy = input ? passwordEntropy(input) : 0
  const guesses = entropy > 0 ? Math.pow(2, entropy) : 0
  const crack = entropy > 0 ? guesses / 1e9 : 0
  const crackLabel =
    crack <= 0 ? "—" : crack < 60 ? `${crack.toFixed(1)} seconds` : crack < 3600 ? `${(crack / 60).toFixed(1)} minutes` : crack < 86400 ? `${(crack / 3600).toFixed(1)} hours` : crack < 31536000 ? `${(crack / 86400).toFixed(1)} days` : `${(crack / 31536000).toFixed(1)} years`
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="entropy-input" value={input} onChange={setInput} label="Secret" placeholder="Type a password or token…" />
      <Formula>Assumes an attacker tries about 1 billion guesses per second</Formula>
      <ResultGrid>
        <ResultRow label="Entropy" value={input ? `${entropy.toFixed(1)} bits` : "—"} />
        <ResultRow label="Estimated Crack Time" value={input ? crackLabel : "—"} />
      </ResultGrid>
    </div>
  )
}

export function ChecksumCalculator() {
  const [text, setText] = useState("")
  const [mode, setMode] = useState("adler32")
  const result = checksum(mode as "sum16" | "xor" | "adler32", text)
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="cs-input" value={text} onChange={setText} />
      <SelectField
        id="cs-mode"
        label="Method"
        value={mode}
        onChange={setMode}
        options={[
          { value: "adler32", label: "Adler-32" },
          { value: "sum16", label: "16-bit sum" },
          { value: "xor", label: "XOR" },
        ]}
      />
      <OutputArea label="Checksum" value={text ? result : ""} />
    </div>
  )
}

export function CrcCalculator() {
  const [text, setText] = useState("")
  const [variant, setVariant] = useState("crc32")
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="crc-input" value={text} onChange={setText} />
      <SelectField
        id="crc-algo"
        label="Variant"
        value={variant}
        onChange={setVariant}
        options={[{ value: "crc32", label: "CRC-32 (IEEE 802.3)" }]}
      />
      <OutputArea label="CRC-32" value={text ? crc32(text) : ""} />
    </div>
  )
}

export function OtpGenerator() {
  const [length, setLength] = useState("6")
  const [output, setOutput] = useState("")
  const [until, setUntil] = useState(0)
  const [now, setNow] = useState(0)
  useEffect(() => {
    if (until === 0) return
    const t = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(t)
  }, [until])
  const n = Math.min(12, Math.max(4, Math.round(Number(length)) || 6))
  const remaining = Math.max(0, Math.ceil((until - now) / 1000))
  return (
    <GeneratorPanel
      onGenerate={() => {
        setOutput(randomOtp(n))
        setNow(Date.now())
        setUntil(Date.now() + 30000)
      }}
      output={output}
      hint="One-time code regenerated from the browser's secure random source"
    >
      <NumberField id="otp-length" label="Digits" value={length} onChange={setLength} placeholder="6" />
      {until !== 0 ? <Formula>Regenerate in {remaining}s</Formula> : null}
    </GeneratorPanel>
  )
}

export function TotpGenerator() {
  const [secret, setSecret] = useState("")
  const [digits, setDigits] = useState("6")
  const [period, setPeriod] = useState("30")
  const [algo, setAlgo] = useState("sha1")
  const [now, setNow] = useState(0)
  const d = Math.min(10, Math.max(6, Math.round(Number(digits)) || 6))
  const p = Math.min(300, Math.max(15, Math.round(Number(period)) || 30))
  const code = totp(secret, { digits: d, period: p, algorithm: algo as "sha1" | "sha256" | "sha512" })
  const remaining = p - (Math.floor(now / 1000) % p)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex flex-col gap-6">
      <TextAreaInput id="totp-secret" value={secret} onChange={setSecret} label="Base32 Secret" placeholder="JBSWY3DPEHPK3PXP" />
      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField id="totp-digits" label="Digits" value={digits} onChange={setDigits} placeholder="6" />
        <NumberField id="totp-period" label="Period (s)" value={period} onChange={setPeriod} placeholder="30" />
        <SelectField
          id="totp-algo"
          label="Algorithm"
          value={algo}
          onChange={setAlgo}
          options={[
            { value: "sha1", label: "SHA-1" },
            { value: "sha256", label: "SHA-256" },
            { value: "sha512", label: "SHA-512" },
          ]}
        />
      </div>
      {code === null ? (
        <Formula>Enter a valid Base32 secret to see the current TOTP code.</Formula>
      ) : (
        <>
          <OutputArea label="Current Code" value={code} />
          <Formula>Code refreshes in {remaining}s</Formula>
        </>
      )}
    </div>
  )
}

export function QrSecretGenerator() {
  const [bytes, setBytes] = useState("20")
  const [output, setOutput] = useState("")
  const n = Math.min(64, Math.max(10, Math.round(Number(bytes)) || 20))
  return (
    <GeneratorPanel onGenerate={() => setOutput(generateOtpSecret(n))} output={output} hint="Base32 secret you can paste into authenticator apps">
      <NumberField id="qr-bytes" label="Random bytes" value={bytes} onChange={setBytes} placeholder="20" />
    </GeneratorPanel>
  )
}

function PemTextArea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="pem-input">PEM Certificate</Label>
      <Textarea
        id="pem-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"-----BEGIN CERTIFICATE-----\n…\n-----END CERTIFICATE-----"}
        className="min-h-40 font-mono text-xs"
      />
    </div>
  )
}

export function CertificateDecoder() {
  const [pem, setPem] = useState("")
  const blocks = parsePem(pem)
  const first = blocks?.[0]
  const cert = first && /CERTIFICATE/i.test(first.label) ? decodeCertificate(first.bytes) : null
  return (
    <div className="flex flex-col gap-6">
      <PemTextArea value={pem} onChange={setPem} />
      {pem.trim() === "" ? (
        <Formula>Paste a PEM certificate to decode its fields.</Formula>
      ) : !blocks ? (
        <Formula>Could not parse the PEM block.</Formula>
      ) : !first ? (
        <Formula>No PEM blocks found.</Formula>
      ) : !cert ? (
        <Formula>Decoded a {first.label} block ({first.bytes.length} bytes) but could not parse a certificate structure.</Formula>
      ) : (
        <>
          <ResultGrid>
            <ResultRow label="Subject" value={cert.subject} />
            <ResultRow label="Issuer" value={cert.issuer} />
            <ResultRow label="Serial Number" value={cert.serial} />
            <ResultRow label="Signature Algorithm" value={cert.signatureAlgorithm} />
            <ResultRow label="Public Key" value={cert.publicKeyAlgorithm} />
            <ResultRow label="Valid From" value={cert.notBefore} />
            <ResultRow label="Valid To" value={cert.notAfter} />
            <ResultRow label="Size" value={`${cert.bytes} bytes`} />
          </ResultGrid>
        </>
      )}
    </div>
  )
}

export function PemDecoder() {
  const [pem, setPem] = useState("")
  const blocks = parsePem(pem)
  return (
    <div className="flex flex-col gap-6">
      <PemTextArea value={pem} onChange={setPem} />
      {pem.trim() === "" ? (
        <Formula>Paste PEM data to decode each block.</Formula>
      ) : !blocks ? (
        <Formula>Could not decode the base64 content.</Formula>
      ) : blocks.length === 0 ? (
        <Formula>No PEM blocks found.</Formula>
      ) : (
        blocks.map((b, i) => (
          <div key={i} className="flex flex-col gap-4">
            <Formula>
              Block {i + 1}: {b.label} · {b.bytes.length} bytes
            </Formula>
            <OutputArea label="DER Hex" value={b.hex} />
            <OutputArea label="Base64" value={b.b64} />
          </div>
        ))
      )}
    </div>
  )
}

export function CertificateFingerprintCalculator() {
  const [pem, setPem] = useState("")
  const [algo, setAlgo] = useState("sha256")
  const blocks = parsePem(pem)
  const cert = blocks?.[0]
  const fp = cert ? certificateFingerprint(cert.bytes, algo as "sha1" | "sha256") : ""
  return (
    <div className="flex flex-col gap-6">
      <PemTextArea value={pem} onChange={setPem} />
      <SelectField
        id="cf-algo"
        label="Hash"
        value={algo}
        onChange={setAlgo}
        options={[
          { value: "sha256", label: "SHA-256" },
          { value: "sha1", label: "SHA-1" },
        ]}
      />
      {pem.trim() !== "" && cert ? (
        <OutputArea label={`${algo.toUpperCase()} Fingerprint`} value={fp} />
      ) : pem.trim() !== "" ? (
        <Formula>Paste a valid PEM certificate to compute its fingerprint.</Formula>
      ) : (
        <Formula>Paste a PEM certificate to compute its fingerprint.</Formula>
      )}
    </div>
  )
}

export function SecureRandomGenerator() {
  const [bytes, setBytes] = useState("32")
  const [output, setOutput] = useState("")
  const n = Math.min(1024, Math.max(1, Math.round(Number(bytes)) || 32))
  return (
    <GeneratorPanel onGenerate={() => setOutput(secureRandomHex(n))} output={output} hint="Hex-encoded bytes from crypto.getRandomValues">
      <NumberField id="sr-bytes" label="Bytes" value={bytes} onChange={setBytes} placeholder="32" />
    </GeneratorPanel>
  )
}

export function CryptographicKeyGenerator() {
  const [kind, setKind] = useState("aes-256")
  const [output, setOutput] = useState("")
  const sizes: Record<string, { bytes: number; label: string }> = {
    "aes-128": { bytes: 16, label: "AES-128" },
    "aes-192": { bytes: 24, label: "AES-192" },
    "aes-256": { bytes: 32, label: "AES-256" },
    "hmac-256": { bytes: 32, label: "HMAC / SHA-256" },
    "rsa-2048": { bytes: 256, label: "RSA-2048 random seed" },
    "rsa-4096": { bytes: 512, label: "RSA-4096 random seed" },
    "salt-16": { bytes: 16, label: "Salt / nonce (16 bytes)" },
    "salt-32": { bytes: 32, label: "Salt / nonce (32 bytes)" },
  }
  const info = sizes[kind] ?? sizes["aes-256"]
  return (
    <div className="flex flex-col gap-6">
      <SelectField
        id="ck-kind"
        label="Key type"
        value={kind}
        onChange={setKind}
        options={Object.entries(sizes).map(([value, s]) => ({ value, label: s.label }))}
      />
      <div>
        <Button
          type="button"
          onClick={() => {
            const r = generateCryptoKey(info.bytes)
            setOutput(`${r.hex}\n\n${r.base64}`)
          }}
        >
          Generate
        </Button>
      </div>
      {output ? (
        <>
          <OutputArea label="Key (hex)" value={output.split("\n\n")[0]} />
          <OutputArea label="Key (Base64)" value={output.split("\n\n")[1]} />
          <Formula>{info.bytes * 8} bits · for actual RSA keypairs use a dedicated tool like openssl</Formula>
        </>
      ) : null}
    </div>
  )
}
