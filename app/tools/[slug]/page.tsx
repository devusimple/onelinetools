import Link from "next/link"
import { notFound } from "next/navigation"
import { createElement } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { categories, getTool, type Tool } from "@/lib/tools"
import { toolComponents } from "@/lib/tool-components"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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
  const Icon = tool.icon

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <ArrowLeft aria-hidden /> All tools
      </Link>

      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center border border-border bg-muted/50 text-foreground">
            <Icon className="size-5" aria-hidden />
          </span>
          <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
            #{String(tool.id).padStart(3, "0")} · {tool.name}
          </p>
        </div>
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
          {toolComponents[slug] ? createElement(toolComponents[slug]) : null}
        </CardContent>
      </Card>

      <nav className="grid gap-2 border-t border-border pt-6 sm:grid-cols-2">
        <div className="flex">
          {prev ? (
            <Link
              href={`/tools/${prev.slug}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "w-full min-w-0 justify-start"
              )}
            >
              <ArrowLeft aria-hidden />
              <span className="min-w-0 flex-1 truncate">{prev.name}</span>
            </Link>
          ) : null}
        </div>
        <div className="flex sm:justify-end">
          {next ? (
            <Link
              href={`/tools/${next.slug}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "w-full min-w-0 justify-end"
              )}
            >
              <span className="min-w-0 flex-1 truncate">{next.name}</span>
              <ArrowRight aria-hidden />
            </Link>
          ) : null}
        </div>
      </nav>
    </main>
  )
}
