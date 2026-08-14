"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ToolCard } from "@/components/tool-card"
import { categories, type ToolCategory } from "@/lib/tools"

function filterCategories(categories: ToolCategory[], query: string): ToolCategory[] {
  const q = query.trim().toLowerCase()
  if (!q) return categories
  return categories
    .map((cat) => ({
      ...cat,
      tools: cat.tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.slug.includes(q)
      ),
    }))
    .filter((cat) => cat.tools.length > 0)
}

export function ToolsBrowser() {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => filterCategories(categories, query), [query])
  const shown = filtered.reduce((n, c) => n + c.tools.length, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search tools by name or keyword…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-6"
          aria-label="Search tools"
        />
      </div>

      {shown === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">
          No tools match “{query.trim()}”.
        </p>
      ) : (
        <div className="flex flex-col gap-14">
          {filtered.map((category) => (
            <section key={category.id} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <h2 className="font-heading text-xl font-semibold tracking-wider uppercase">
                  {category.title}
                </h2>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.tools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <footer className="flex flex-col gap-2 border-t border-border pt-8 text-xs text-muted-foreground">
        <p>{shown} tools · all computations run locally in your browser.</p>
      </footer>
    </div>
  )
}
