import Link from "next/link"
import { categories, type Tool, type ToolType } from "@/lib/tools"

const typeMeta: Record<ToolType, { label: string; dot: string }> = {
  client: { label: "Client", dot: "bg-emerald-500" },
  hybrid: { label: "Hybrid", dot: "bg-amber-500" },
  server: { label: "Server", dot: "bg-red-500" },
}

function ToolCard({ tool }: { tool: Tool }) {
  const meta = typeMeta[tool.type]
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col rounded-none border border-border bg-card p-5 transition-colors hover:border-ring hover:bg-muted/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          #{String(tool.id).padStart(3, "0")}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          <span className={`size-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>
      <h3 className="mt-3 font-heading text-base font-semibold tracking-wide uppercase">
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

export default function HomePage() {
  const total = categories.reduce((n, c) => n + c.tools.length, 0)

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-4">
        <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase">
          OneLineTools
        </p>
        <h1 className="font-heading text-4xl font-bold tracking-wide uppercase sm:text-5xl">
          Nityopojogi Online Tools
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A growing collection of everyday online tools. Every tool runs entirely in your
          browser — no data leaves your device. {total} tools and counting.
        </p>
      </header>

      <div className="flex flex-col gap-14">
        {categories.map((category) => (
          <section key={category.id} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h2 className="font-heading text-xl font-semibold tracking-wider uppercase">
                {category.title}
              </h2>
              <p className="text-sm text-muted-foreground">{category.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Client", "Hybrid", "Server"].map((t) => {
                  const key = t.toLowerCase() as ToolType
                  return (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
                    >
                      <span className={`size-1.5 rounded-full ${typeMeta[key].dot}`} />
                      {t}
                    </span>
                  )
                })}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="flex flex-col gap-2 border-t border-border pt-8 text-xs text-muted-foreground">
        <p>
          {total} tools · all computations run locally in your browser.
        </p>
      </footer>
    </main>
  )
}
