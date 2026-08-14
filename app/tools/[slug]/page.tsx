import Link from "next/link"
import { notFound } from "next/navigation"
import { categories, getTool, type Tool, type ToolType } from "@/lib/tools"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const typeMeta: Record<ToolType, { label: string; dot: string }> = {
  client: { label: "Client · runs in browser", dot: "bg-emerald-500" },
  hybrid: { label: "Hybrid · may need a server", dot: "bg-amber-500" },
  server: { label: "Server · requires a backend", dot: "bg-red-500" },
}

export async function generateStaticParams() {
  return categories.flatMap((c) => c.tools.map((t) => ({ slug: t.slug })))
}

function neighbors(slug: string): { prev?: Tool; next?: Tool } {
  const all = categories.flatMap((c) => c.tools)
  const index = all.findIndex((t) => t.slug === slug)
  if (index === -1) return {}
  return {
    prev: all[index - 1],
    next: all[index + 1],
  }
}

export async function generateMetadata({ params }: PageProps<"/tools/[slug]">) {
  const { slug } = await params
  const tool = getTool(slug)
  return {
    title: tool ? `${tool.name} — OneLineTools` : "Tool not found",
    description: tool?.description,
  }
}

export default async function ToolPage({ params }: PageProps<"/tools/[slug]">) {
  const { slug } = await params
  const tool = getTool(slug)
  if (!tool) notFound()

  const { prev, next } = neighbors(slug)
  const meta = typeMeta[tool.type]
  const ToolComponent = tool.component

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <span aria-hidden>←</span> All tools
        </Link>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          <span className={`size-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      <header className="flex flex-col gap-2">
        <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          #{String(tool.id).padStart(3, "0")} · {tool.name}
        </p>
        <h1 className="font-heading text-3xl font-bold tracking-wide uppercase sm:text-4xl">
          {tool.name}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {tool.description}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <ToolComponent />
        </CardContent>
      </Card>

      <nav className="flex items-center justify-between gap-4 border-t border-border pt-6">
        {prev ? (
          <Link
            href={`/tools/${prev.slug}`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <span aria-hidden>←</span> {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/tools/${next.slug}`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "ml-auto")}
          >
            {next.name} <span aria-hidden>→</span>
          </Link>
        ) : null}
      </nav>
    </main>
  )
}
