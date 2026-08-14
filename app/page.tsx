import { categories } from "@/lib/tools"
import { ToolsBrowser } from "@/components/tools-browser"

export default function HomePage() {
  const total = categories.reduce((n, c) => n + c.tools.length, 0)

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6">
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

      <ToolsBrowser />
    </main>
  )
}