"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ToolCard } from "@/components/tool-card"
import { categories, type ToolCategory } from "@/lib/tools"
import { cn } from "@/lib/utils"

function filterCategories(
  categories: ToolCategory[],
  query: string,
  categoryId: string | null
): ToolCategory[] {
  const q = query.trim().toLowerCase()
  const base = categoryId ? categories.filter((c) => c.id === categoryId) : categories
  if (!q) return base
  return base
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
  const [categoryId, setCategoryId] = useState<string | null>(null)

  const filtered = useMemo(
    () => filterCategories(categories, query, categoryId),
    [query, categoryId]
  )
  const shown = filtered.reduce((n, c) => n + c.tools.length, 0)

  const tabs = [
    { id: null as string | null, title: "All" },
    ...categories.map((c) => ({ id: c.id, title: c.title })),
  ]

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

      <nav aria-label="Filter tools by category">
        <div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:-mx-6 sm:px-6">
          <div className="flex w-max gap-2">
            {tabs.map((tab) => {
              const active = categoryId === tab.id
              return (
                <button
                  key={tab.id ?? "all"}
                  type="button"
                  onClick={() => setCategoryId(tab.id)}
                  aria-pressed={active}
                  className={cn(
                    "h-9 shrink-0 rounded-none border px-4 text-xs font-semibold tracking-widest whitespace-nowrap uppercase transition-colors",
                    active
                      ? "border-ring bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-ring hover:text-foreground"
                  )}
                >
                  {tab.title}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

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
