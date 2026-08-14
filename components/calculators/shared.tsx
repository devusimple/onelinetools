"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function NumberField({
  id,
  label,
  value,
  onChange,
  placeholder,
  suffix,
  step,
  className,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  suffix?: string
  step?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          inputMode="decimal"
          placeholder={placeholder}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(suffix && "pr-10")}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  className,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v ?? "")}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function DateField({
  id,
  label,
  value,
  onChange,
  className,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function ListField({
  id,
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-32"
      />
    </div>
  )
}

export function ResultRow({
  label,
  value,
  hint,
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <span className="font-mono text-xl font-semibold break-all">{value}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  )
}

export function ResultGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
      {children}
    </div>
  )
}

export function Formula({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-none bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
      {children}
    </p>
  )
}

export function Sections({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-8">{children}</div>
}
