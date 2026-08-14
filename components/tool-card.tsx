import Link from "next/link"
import type { Tool } from "@/lib/tools"

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col rounded-none border border-border bg-card p-5 transition-colors hover:border-ring hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-10 shrink-0 items-center justify-center border border-border bg-muted/50 text-foreground transition-colors group-hover:border-ring">
          <Icon className="size-5" aria-hidden />
        </span>
        <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          #{String(tool.id).padStart(3, "0")}
        </span>
      </div>
      <h3 className="mt-4 font-heading text-base font-semibold tracking-wide uppercase">
        {tool.name}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {tool.description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold tracking-widest text-foreground uppercase group-hover:underline">
        Open tool
        <span aria-hidden>→</span>
      </span>
    </Link>
  )
}
