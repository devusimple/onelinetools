import { md5, sha1 } from "@noble/hashes/legacy.js"
import { sha256, sha384, sha512 } from "@noble/hashes/sha2.js"
import { sha3_224, sha3_256, sha3_384, sha3_512 } from "@noble/hashes/sha3.js"
import { hmac } from "@noble/hashes/hmac.js"
import { bytesToHex, randomBytes, utf8ToBytes } from "@noble/hashes/utils.js"

export { bytesToHex }

const B64_CHUNK = 0x8000

export function bytesToB64(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i += B64_CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + B64_CHUNK))
  }
  return btoa(binary)
}

export function b64ToBytes(b64: string): Uint8Array | null {
  try {
    const binary = atob(b64.trim())
    return Uint8Array.from(binary, (c) => c.charCodeAt(0))
  } catch {
    return null
  }
}

export function strToB64(text: string): string {
  return bytesToB64(utf8ToBytes(text))
}

export function b64ToStr(b64: string): string | null {
  const bytes = b64ToBytes(b64)
  if (!bytes) return null
  try {
    return new TextDecoder("utf-8").decode(bytes)
  } catch {
    return null
  }
}

export function base64urlEncode(bytes: Uint8Array): string {
  return bytesToB64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export function strToBase64url(text: string): string {
  return base64urlEncode(utf8ToBytes(text))
}

export function base64urlToStr(input: string): string | null {
  const bytes = base64urlDecode(input)
  if (!bytes) return null
  try {
    return new TextDecoder("utf-8").decode(bytes)
  } catch {
    return null
  }
}

export function base64urlDecode(input: string): Uint8Array | null {
  const cleaned = input.trim().replace(/-/g, "+").replace(/_/g, "/")
  const rem = cleaned.length % 4
  return b64ToBytes(rem ? cleaned + "=".repeat(4 - rem) : cleaned)
}

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0
  let value = 0
  let output = ""
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i]
    bits += 8
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  while (output.length % 8 !== 0) output += "="
  return output
}

export function base32Decode(input: string): Uint8Array | null {
  const cleaned = input.trim().toUpperCase().replace(/[=\s]/g, "")
  const bytes: number[] = []
  let bits = 0
  let value = 0
  for (const ch of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(ch)
    if (idx === -1) return null
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return Uint8Array.from(bytes)
}

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

export function base58Encode(bytes: Uint8Array): string {
  const digits: number[] = [0]
  for (const byte of bytes) {
    let carry = byte
    for (let i = 0; i < digits.length; i++) {
      carry += digits[i] * 256
      digits[i] = carry % 58
      carry = Math.floor(carry / 58)
    }
    while (carry > 0) {
      digits.push(carry % 58)
      carry = Math.floor(carry / 58)
    }
  }
  let zeros = 0
  for (const b of bytes) {
    if (b === 0) zeros++
    else break
  }
  let out = "1".repeat(zeros)
  for (let i = digits.length - 1; i >= 0; i--) out += BASE58_ALPHABET[digits[i]]
  return out
}

export function base58Decode(input: string): Uint8Array | null {
  const cleaned = input.trim()
  if (cleaned === "") return Uint8Array.of()
  const bytes: number[] = [0]
  for (const ch of cleaned) {
    const idx = BASE58_ALPHABET.indexOf(ch)
    if (idx === -1) return null
    let carry = idx
    for (let i = 0; i < bytes.length; i++) {
      carry += bytes[i] * 58
      bytes[i] = carry & 0xff
      carry = Math.floor(carry / 256)
    }
    while (carry > 0) {
      bytes.push(carry & 0xff)
      carry = Math.floor(carry / 256)
    }
  }
  let zeros = 0
  for (const ch of cleaned) {
    if (ch === "1") zeros++
    else break
  }
  const out: number[] = []
  for (let i = 0; i < zeros; i++) out.push(0)
  for (let i = bytes.length - 1; i >= 0; i--) out.push(bytes[i])
  return Uint8Array.from(out)
}

export function urlEncode(text: string): string {
  return encodeURIComponent(text)
}

export function urlDecode(text: string): string | null {
  try {
    return decodeURIComponent(text)
  } catch {
    return null
  }
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
  copy: "©",
  reg: "®",
  trade: "™",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201c",
  rdquo: "\u201d",
  bull: "•",
  middot: "·",
  times: "×",
  divide: "÷",
  plusmn: "±",
  euro: "€",
  pound: "£",
  yen: "¥",
  cent: "¢",
  deg: "°",
  frac12: "½",
  frac14: "¼",
  frac34: "¾",
  micro: "µ",
  para: "¶",
  sect: "§",
  iexcl: "¡",
  iquest: "¿",
  szlig: "ß",
  agrave: "à",
  aacute: "á",
  acirc: "â",
  atilde: "ã",
  auml: "ä",
  aelig: "æ",
  ccedil: "ç",
  egrave: "è",
  eacute: "é",
  ecirc: "ê",
  euml: "ë",
  igrave: "ì",
  iacute: "í",
  icirc: "î",
  iuml: "ï",
  ntilde: "ñ",
  ograve: "ò",
  oacute: "ó",
  ocirc: "ô",
  otilde: "õ",
  ouml: "ö",
  oslash: "ø",
  ugrave: "ù",
  uacute: "ú",
  ucirc: "û",
  uuml: "ü",
  yacute: "ý",
  yuml: "ÿ",
}

export function htmlEncode(text: string): string {
  return text.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c])
}

export function htmlDecode(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity[0] === "#") {
      const code =
        entity[1] === "x" || entity[1] === "X"
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10)
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match
    }
    return NAMED_ENTITIES[entity] ?? match
  })
}

export function jsonEscape(text: string): string {
  return JSON.stringify(text).slice(1, -1)
}

export function jsonUnescape(text: string): string | null {
  try {
    return JSON.parse(`"${text}"`)
  } catch {
    return null
  }
}

export type HashAlgo =
  | "md5"
  | "sha1"
  | "sha256"
  | "sha384"
  | "sha512"
  | "sha3-224"
  | "sha3-256"
  | "sha3-384"
  | "sha3-512"

export function hashBytes(algo: HashAlgo, data: Uint8Array): Uint8Array {
  switch (algo) {
    case "md5":
      return md5(data)
    case "sha1":
      return sha1(data)
    case "sha256":
      return sha256(data)
    case "sha384":
      return sha384(data)
    case "sha512":
      return sha512(data)
    case "sha3-224":
      return sha3_224(data)
    case "sha3-256":
      return sha3_256(data)
    case "sha3-384":
      return sha3_384(data)
    case "sha3-512":
      return sha3_512(data)
  }
}

export function hashText(algo: HashAlgo, text: string): string {
  return bytesToHex(hashBytes(algo, utf8ToBytes(text)))
}

export const HASH_OPTIONS: { value: HashAlgo; label: string }[] = [
  { value: "md5", label: "MD5 (128 bit)" },
  { value: "sha1", label: "SHA-1 (160 bit)" },
  { value: "sha256", label: "SHA-256 (256 bit)" },
  { value: "sha384", label: "SHA-384 (384 bit)" },
  { value: "sha512", label: "SHA-512 (512 bit)" },
  { value: "sha3-224", label: "SHA3-224" },
  { value: "sha3-256", label: "SHA3-256" },
  { value: "sha3-384", label: "SHA3-384" },
  { value: "sha3-512", label: "SHA3-512" },
]

export type HmacAlgo = "md5" | "sha1" | "sha256" | "sha384" | "sha512"

export const HMAC_OPTIONS: { value: HmacAlgo; label: string }[] = [
  { value: "sha1", label: "HMAC-SHA1" },
  { value: "sha256", label: "HMAC-SHA256" },
  { value: "sha384", label: "HMAC-SHA384" },
  { value: "sha512", label: "HMAC-SHA512" },
  { value: "md5", label: "HMAC-MD5" },
]

export function hmacDigest(algo: HmacAlgo, key: string, message: string): string {
  const h =
    algo === "sha1"
      ? sha1
      : algo === "sha384"
        ? sha384
        : algo === "sha512"
          ? sha512
          : algo === "md5"
            ? md5
            : sha256
  return bytesToHex(hmac(h, utf8ToBytes(key), utf8ToBytes(message)))
}

const LOWER = "abcdefghijklmnopqrstuvwxyz"
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const DIGITS = "0123456789"
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/"

function securePick(pool: string): string {
  const bytes = randomBytes(pool.length)
  return pool[bytes[0] % pool.length]
}

function shuffleArray<T>(arr: T[]): T[] {
  const bytes = randomBytes(arr.length)
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = bytes[i] % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export interface PasswordOptions {
  length: number
  upper?: boolean
  lower?: boolean
  digits?: boolean
  symbols?: boolean
}

export function generatePassword(opts: PasswordOptions): string {
  const length = Math.min(128, Math.max(4, Math.round(opts.length) || 16))
  const upper = opts.upper !== false
  const lower = opts.lower !== false
  const digits = opts.digits !== false
  const symbols = opts.symbols !== false
  let pool = ""
  if (upper) pool += UPPER
  if (lower) pool += LOWER
  if (digits) pool += DIGITS
  if (symbols) pool += SYMBOLS
  if (!pool) pool = LOWER + DIGITS
  const required: string[] = []
  if (upper) required.push(securePick(UPPER))
  if (lower) required.push(securePick(LOWER))
  if (digits) required.push(securePick(DIGITS))
  if (symbols) required.push(securePick(SYMBOLS))
  const n = Math.max(0, length - required.length)
  const bytes = randomBytes(n)
  for (let i = 0; i < n; i++) required.push(pool[bytes[i] % pool.length])
  return shuffleArray(required).join("").slice(0, length)
}

export function strongPassword(length = 20): string {
  return generatePassword({
    length,
    upper: true,
    lower: true,
    digits: true,
    symbols: true,
  })
}

const PASSPHRASE_WORDS = [
  "abacus", "badger", "cactus", "dolphin", "eclipse", "falcon", "garden", "harbor",
  "island", "jaguar", "koala", "lantern", "meadow", "napkin", "ocean", "panther",
  "quartz", "river", "saddle", "temple", "umbrella", "violet", "walnut", "yellow",
  "anchor", "breeze", "canyon", "dazzle", "ember", "fjord", "goblin", "hazelnut",
  "icicle", "jasmine", "kettle", "labyrinth", "mystic", "nectar", "orchid", "pebble",
  "quiver", "ravine", "sunset", "timber", "updraft", "voyage", "willow", "zeppelin",
  "amber", "butterfly", "compass", "dragon", "equator", "feather", "galaxy", "heron",
  "infinity", "journey", "keyhole", "lagoon", "magnolia", "needle", "onyx", "prism",
  "quarry", "rainbow", "sapphire", "tornado", "universe", "vortex", "waterfall", "yonder",
]

export function generatePassphrase(words: number, sep = "-", capitalize = false): string {
  const n = Math.min(20, Math.max(1, Math.round(words) || 4))
  const bytes = randomBytes(n)
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    let w = PASSPHRASE_WORDS[bytes[i] % PASSPHRASE_WORDS.length]
    if (capitalize) w = w.charAt(0).toUpperCase() + w.slice(1)
    out.push(w)
  }
  return out.join(sep)
}

export function generatePin(length: number): string {
  const n = Math.min(32, Math.max(1, Math.round(length) || 6))
  const bytes = randomBytes(n)
  let out = ""
  for (let i = 0; i < n; i++) out += bytes[i] % 10
  return out
}

export function randomToken(bytes: number): string {
  const n = Math.min(256, Math.max(1, Math.round(bytes) || 16))
  return bytesToHex(randomBytes(n))
}

export function uuidv4(): string {
  const b = randomBytes(16)
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = bytesToHex(b)
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

export function uuidv7(): string {
  const b = randomBytes(16)
  const ts = Date.now()
  b[0] = (ts >> 40) & 0xff
  b[1] = (ts >> 32) & 0xff
  b[2] = (ts >> 24) & 0xff
  b[3] = (ts >> 16) & 0xff
  b[4] = (ts >> 8) & 0xff
  b[5] = ts & 0xff
  b[6] = (b[6] & 0x0f) | 0x70
  b[8] = (b[8] & 0x3f) | 0x80
  const h = bytesToHex(b)
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

export function validateUuid(input: string): { valid: boolean; version?: number; variant?: string } {
  const clean = input.trim()
  const m = /^[0-9a-f]{8}-[0-9a-f]{4}-([0-9a-f]{4})-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.exec(clean)
  if (!m) return { valid: false }
  return { valid: true, version: parseInt(m[1][0], 16), variant: "RFC 4122" }
}

function jwtB64(bytes: Uint8Array): string {
  return bytesToB64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function jwtB64Decode(input: string): Uint8Array | null {
  const cleaned = input.replace(/-/g, "+").replace(/_/g, "/")
  const rem = cleaned.length % 4
  return b64ToBytes(rem ? cleaned + "=".repeat(4 - rem) : cleaned)
}

export interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
}

export function decodeJwt(token: string): DecodedJwt | null {
  const parts = token.trim().split(".")
  if (parts.length !== 3) return null
  try {
    const header = JSON.parse(new TextDecoder().decode(jwtB64Decode(parts[0])!))
    const payload = JSON.parse(new TextDecoder().decode(jwtB64Decode(parts[1])!))
    return { header, payload, signature: parts[2] }
  } catch {
    return null
  }
}

export function encodeJwtJson(obj: Record<string, unknown>): string {
  return jwtB64(utf8ToBytes(JSON.stringify(obj)))
}

export function signJwtHs256(
  payload: Record<string, unknown>,
  secret: string,
  header: Record<string, unknown> = {}
): string {
  const h = { alg: "HS256", typ: "JWT", ...header }
  const data = `${encodeJwtJson(h)}.${encodeJwtJson(payload)}`
  const sig = hmac(sha256, utf8ToBytes(secret), utf8ToBytes(data))
  return `${data}.${jwtB64(sig)}`
}

export function verifyJwtHs256(token: string, secret: string): boolean {
  const parts = token.trim().split(".")
  if (parts.length !== 3) return false
  const data = `${parts[0]}.${parts[1]}`
  const expected = hmac(sha256, utf8ToBytes(secret), utf8ToBytes(data))
  const actual = jwtB64Decode(parts[2])
  if (!actual || expected.length !== actual.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ actual[i]
  return diff === 0
}

export function passwordStrength(password: string): {
  score: number
  label: string
  checks: { label: string; ok: boolean }[]
} {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "At least 12 characters", ok: password.length >= 12 },
    { label: "Uppercase letters", ok: /[A-Z]/.test(password) },
    { label: "Lowercase letters", ok: /[a-z]/.test(password) },
    { label: "Numbers", ok: /\d/.test(password) },
    { label: "Symbols", ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter((c) => c.ok).length
  const label =
    score >= 6 ? "Strong" : score >= 5 ? "Good" : score >= 3 ? "Fair" : score >= 1 ? "Weak" : "Very weak"
  return { score, label, checks }
}

export function passwordEntropy(password: string): number {
  let pool = 0
  if (/[a-z]/.test(password)) pool += 26
  if (/[A-Z]/.test(password)) pool += 26
  if (/\d/.test(password)) pool += 10
  if (/[^A-Za-z0-9]/.test(password)) pool += 33
  if (pool === 0) return 0
  return password.length * Math.log2(pool)
}

export type ChecksumMode = "sum16" | "xor" | "adler32"

export function checksum(mode: ChecksumMode, text: string): string {
  const bytes = utf8ToBytes(text)
  if (mode === "sum16") {
    let sum = 0
    for (const b of bytes) sum = (sum + b) % 65536
    return sum.toString(16).toUpperCase().padStart(4, "0")
  }
  if (mode === "xor") {
    let x = 0
    for (const b of bytes) x ^= b
    return x.toString(16).toUpperCase().padStart(2, "0")
  }
  let a = 1
  let b = 0
  for (const byte of bytes) {
    a = (a + byte) % 65521
    b = (b + a) % 65521
  }
  return (((b << 16) | a) >>> 0).toString(16).toUpperCase().padStart(8, "0")
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

export function crc32(text: string): string {
  const bytes = utf8ToBytes(text)
  let crc = 0xffffffff
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return ((crc ^ 0xffffffff) >>> 0).toString(16).toUpperCase().padStart(8, "0")
}

export function randomOtp(length: number): string {
  const n = Math.min(12, Math.max(4, Math.round(length) || 6))
  const bytes = randomBytes(n)
  let out = ""
  for (let i = 0; i < n; i++) out += bytes[i] % 10
  return out
}

export type TotpAlgo = "sha1" | "sha256" | "sha512"

function hotp(secret: Uint8Array, counter: number, digits: number, algo: TotpAlgo): string {
  const buf = new Uint8Array(8)
  for (let i = 7; i >= 0; i--) {
    buf[i] = counter & 0xff
    counter = Math.floor(counter / 256)
  }
  const h = algo === "sha256" ? sha256 : algo === "sha512" ? sha512 : sha1
  const digest = hmac(h, secret, buf)
  const offset = digest[digest.length - 1] & 0x0f
  const code =
    ((digest[offset] & 0x7f) << 24) |
    (digest[offset + 1] << 16) |
    (digest[offset + 2] << 8) |
    digest[offset + 3]
  return String(code % Math.pow(10, digits)).padStart(digits, "0")
}

export function totp(
  secretB32: string,
  opts: { period?: number; digits?: number; algorithm?: TotpAlgo } = {}
): string | null {
  const { period = 30, digits = 6, algorithm = "sha1" } = opts
  const secret = base32Decode(secretB32)
  if (!secret) return null
  const counter = Math.floor(Date.now() / 1000 / period)
  return hotp(secret, counter, digits, algorithm)
}

export function generateOtpSecret(bytes = 20): string {
  return base32Encode(randomBytes(bytes)).replace(/=+$/, "")
}

export function secureRandomHex(bytes: number): string {
  const n = Math.min(1024, Math.max(1, Math.round(bytes) || 32))
  return bytesToHex(randomBytes(n))
}

export interface CryptoKeyResult {
  hex: string
  base64: string
}

export function generateCryptoKey(bytes: number): CryptoKeyResult {
  const n = Math.min(128, Math.max(1, Math.round(bytes) || 32))
  const b = randomBytes(n)
  return { hex: bytesToHex(b), base64: bytesToB64(b) }
}

export interface PemBlock {
  label: string
  bytes: Uint8Array
  hex: string
  b64: string
}

export function parsePem(pem: string): PemBlock[] | null {
  const blocks: PemBlock[] = []
  const re = /-----BEGIN ([A-Z0-9 ]+)-----([\s\S]*?)-----END \1-----/g
  let m: RegExpExecArray | null
  while ((m = re.exec(pem)) !== null) {
    const b64 = m[2].replace(/\s+/g, "")
    const bytes = b64ToBytes(b64)
    if (!bytes) return null
    blocks.push({ label: m[1], bytes, hex: bytesToHex(bytes), b64 })
  }
  return blocks
}

class DerReader {
  private pos = 0
  constructor(private data: Uint8Array) {}

  private readByte(): number | null {
    if (this.pos >= this.data.length) return null
    return this.data[this.pos++]
  }

  readLength(): number | null {
    const b = this.readByte()
    if (b === null) return null
    if (b < 0x80) return b
    const n = b & 0x7f
    if (n === 0 || n > 4) return null
    let len = 0
    for (let i = 0; i < n; i++) {
      const x = this.readByte()
      if (x === null) return null
      len = len * 256 + x
    }
    return len
  }

  readTlv(): { tag: number; value: Uint8Array; reader: DerReader } | null {
    const tag = this.readByte()
    if (tag === null) return null
    const len = this.readLength()
    if (len === null || this.pos + len > this.data.length) return null
    const start = this.pos
    const end = start + len
    this.pos = end
    return {
      tag,
      value: this.data.subarray(start, end),
      reader: new DerReader(this.data.subarray(start, end)),
    }
  }
}

function derStringValue(bytes: Uint8Array): string {
  try {
    return new TextDecoder("utf-8").decode(bytes)
  } catch {
    return ""
  }
}

const ATTR_OIDS: Record<string, string> = {
  "2.5.4.3": "CN",
  "2.5.4.6": "C",
  "2.5.4.7": "L",
  "2.5.4.8": "ST",
  "2.5.4.10": "O",
  "2.5.4.11": "OU",
  "2.5.4.4": "SN",
  "2.5.4.5": "serialNumber",
  "2.5.4.12": "title",
  "1.2.840.113549.1.9.1": "emailAddress",
}

function readOid(bytes: Uint8Array): string {
  const arcs: number[] = []
  let value = 0
  for (const b of bytes) {
    value = value * 128 + (b & 0x7f)
    if (!(b & 0x80)) {
      arcs.push(value)
      value = 0
    }
  }
  if (arcs.length === 0) return ""
  const first = arcs[0]
  const head = first < 40 ? [0, first] : first < 80 ? [1, first - 40] : [2, first - 80]
  return [...head, ...arcs.slice(1)].join(".")
}

function parseName(reader: DerReader): Record<string, string> {
  const out: Record<string, string> = {}
  const seq = reader.readTlv()
  if (!seq || (seq.tag & 0x1f) !== 0x10) return out
  const rdnReader = seq.reader
  let set: ReturnType<DerReader["readTlv"]>
  while ((set = rdnReader.readTlv()) !== null) {
    if ((set.tag & 0x1f) !== 0x11) continue
    const avaReader = set.reader
    let ava: ReturnType<DerReader["readTlv"]>
    while ((ava = avaReader.readTlv()) !== null) {
      if ((ava.tag & 0x1f) !== 0x10) continue
      const oidTlv = ava.reader.readTlv()
      const valTlv = ava.reader.readTlv()
      if (!oidTlv || !valTlv) continue
      const oid = readOid(oidTlv.value)
      const name = ATTR_OIDS[oid]
      if (name) out[name] = derStringValue(valTlv.value)
    }
  }
  return out
}

function formatTime(bytes: Uint8Array): string {
  const s = derStringValue(bytes)
  const utc = /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/.exec(s)
  if (utc) {
    try {
      const yy = Number(utc[1])
      return new Date(
        Date.UTC(
          yy < 50 ? 2000 + yy : 1900 + yy,
          Number(utc[2]) - 1,
          Number(utc[3]),
          Number(utc[4]),
          Number(utc[5]),
          Number(utc[6])
        )
      ).toISOString()
    } catch {
      return s
    }
  }
  const gen = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/.exec(s)
  if (gen) {
    try {
      return new Date(
        Date.UTC(
          Number(gen[1]),
          Number(gen[2]) - 1,
          Number(gen[3]),
          Number(gen[4]),
          Number(gen[5]),
          Number(gen[6])
        )
      ).toISOString()
    } catch {
      return s
    }
  }
  return s
}

export interface DecodedCertificate {
  serial: string
  signatureAlgorithm: string
  issuer: string
  subject: string
  notBefore: string
  notAfter: string
  publicKeyAlgorithm: string
  bytes: number
}

const SIG_OIDS: Record<string, string> = {
  "1.2.840.113549.1.1.5": "sha1WithRSAEncryption",
  "1.2.840.113549.1.1.11": "sha256WithRSAEncryption",
  "1.2.840.113549.1.1.12": "sha384WithRSAEncryption",
  "1.2.840.113549.1.1.13": "sha512WithRSAEncryption",
  "1.2.840.10045.4.3.2": "ecdsa-with-SHA256",
  "1.2.840.10045.4.3.3": "ecdsa-with-SHA384",
  "1.2.840.10045.4.3.4": "ecdsa-with-SHA512",
}

const PUB_OIDS: Record<string, string> = {
  "1.2.840.113549.1.1.1": "RSA",
  "1.2.840.10045.2.1": "Elliptic Curve",
  "1.2.840.113549.1.1.7": "RSAES-OAEP",
}

function formatNameMap(map: Record<string, string>): string {
  return Object.entries(map)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ")
}

export function decodeCertificate(der: Uint8Array): DecodedCertificate | null {
  try {
    const outer = new DerReader(der).readTlv()
    if (!outer) return null
    const certReader = outer.reader
    const tbsTlv = certReader.readTlv()
    if (!tbsTlv) return null
    const tbs = tbsTlv.reader
    const versionTlv = tbs.readTlv()
    if (versionTlv && (versionTlv.tag & 0x1f) === 0x00) {
      void versionTlv
    }
    const serialTlv = tbs.readTlv()
    const sigAlgoTlv = tbs.readTlv()
    const issuerTlv = tbs.readTlv()
    const validityTlv = tbs.readTlv()
    const subjectTlv = tbs.readTlv()
    const pubkeyTlv = tbs.readTlv()
    if (!serialTlv || !sigAlgoTlv || !issuerTlv || !validityTlv || !subjectTlv || !pubkeyTlv) {
      return null
    }
    let serial = "—"
    if (serialTlv.tag === 0x02) serial = bytesToHex(serialTlv.value).toUpperCase()

    const sigAlgoReader = sigAlgoTlv.reader
    const sigOidTlv = sigAlgoReader.readTlv()
    let signatureAlgorithm = "—"
    if (sigOidTlv) signatureAlgorithm = SIG_OIDS[readOid(sigOidTlv.value)] ?? readOid(sigOidTlv.value)

    const issuer = formatNameMap(parseName(issuerTlv.reader))
    const subject = formatNameMap(parseName(subjectTlv.reader))

    let notBefore = "—"
    let notAfter = "—"
    if ((validityTlv.tag & 0x1f) === 0x10) {
      const nb = validityTlv.reader.readTlv()
      const na = validityTlv.reader.readTlv()
      if (nb) notBefore = formatTime(nb.value)
      if (na) notAfter = formatTime(na.value)
    }

    let publicKeyAlgorithm = "—"
    const pubAlgoReader = pubkeyTlv.reader
    const pubAlgoSeq = pubAlgoReader.readTlv()
    if (pubAlgoSeq) {
      const oidTlv = pubAlgoSeq.reader.readTlv()
      if (oidTlv) publicKeyAlgorithm = PUB_OIDS[readOid(oidTlv.value)] ?? readOid(oidTlv.value)
    }

    return {
      serial,
      signatureAlgorithm,
      issuer: issuer || "—",
      subject: subject || "—",
      notBefore,
      notAfter,
      publicKeyAlgorithm,
      bytes: der.length,
    }
  } catch {
    return null
  }
}

export function certificateFingerprint(der: Uint8Array, algo: "sha1" | "sha256" = "sha256"): string {
  const digest = algo === "sha1" ? sha1(der) : sha256(der)
  const hex = bytesToHex(digest).toUpperCase()
  return hex.match(/.{1,2}/g)!.join(":")
}
