import type { LucideIcon } from "lucide-react"
import {
  Calculator,
  FunctionSquare,
  Percent,
  Divide,
  Slash,
  Split,
  Equal,
  List,
  Sigma,
  Gauge,
  Hash,
  ArrowLeftRight,
  Activity,
  ChartLine,
  TrendingUp,
  TrendingDown,
  GitCompareArrows,
  TriangleAlert,
  BadgePercent,
  Target,
  CircleDollarSign,
  CircleMinus,
  Scale,
  Tag,
  Barcode,
  Users,
  HandCoins,
  PercentSquare,
  Gift,
  Undo2,
  Landmark,
  CirclePercent,
  ReceiptText,
  Utensils,
  Coins,
  Briefcase,
  Clock,
  TimerReset,
  CalendarDays,
  CalendarRange,
  Sun,
  Wallet,
  Banknote,
  House,
  Hourglass,
  ListChecks,
  Receipt,
  PiggyBank,
  BanknoteArrowUp,
  Boxes,
} from "lucide-react"

export type ToolType = "client" | "hybrid" | "server"

export interface Tool {
  id: number
  slug: string
  name: string
  description: string
  type: ToolType
  icon: LucideIcon
}

export interface ToolCategory {
  id: string
  title: string
  description: string
  tools: Tool[]
}

export const categories: ToolCategory[] = [
  {
    id: "general-calculators",
    title: "General Calculators",
    description:
      "Everyday calculators for arithmetic, statistics, percentages, money, salary, time and budgeting.",
    tools: [
      { id: 1, slug: "basic-calculator", name: "Basic Calculator", description: "Simple arithmetic calculator with a keypad.", type: "client", icon: Calculator },
      { id: 2, slug: "scientific-calculator", name: "Scientific Calculator", description: "Trigonometry, logarithms, powers and more.", type: "client", icon: FunctionSquare },
      { id: 3, slug: "percentage-calculator", name: "Percentage Calculator", description: "Find percentages in three common ways.", type: "client", icon: Percent },
      { id: 4, slug: "fraction-calculator", name: "Fraction Calculator", description: "Add, subtract, multiply and divide fractions.", type: "client", icon: Divide },
      { id: 5, slug: "decimal-calculator", name: "Decimal Calculator", description: "Arithmetic operations on decimal numbers.", type: "client", icon: Slash },
      { id: 6, slug: "ratio-calculator", name: "Ratio Calculator", description: "Simplify ratios and solve ratio proportions.", type: "client", icon: Split },
      { id: 7, slug: "proportion-calculator", name: "Proportion Calculator", description: "Solve a/b = c/d proportion problems.", type: "client", icon: Equal },
      { id: 8, slug: "average-calculator", name: "Average Calculator", description: "Find the average of a set of numbers.", type: "client", icon: List },
      { id: 9, slug: "mean-calculator", name: "Mean Calculator", description: "Calculate the arithmetic mean of a dataset.", type: "client", icon: Sigma },
      { id: 10, slug: "median-calculator", name: "Median Calculator", description: "Find the middle value of a dataset.", type: "client", icon: Gauge },
      { id: 11, slug: "mode-calculator", name: "Mode Calculator", description: "Find the most frequent value(s) in data.", type: "client", icon: Hash },
      { id: 12, slug: "range-calculator", name: "Range Calculator", description: "Calculate the range of a dataset.", type: "client", icon: ArrowLeftRight },
      { id: 13, slug: "standard-deviation-calculator", name: "Standard Deviation Calculator", description: "Measure the spread of a dataset.", type: "client", icon: Activity },
      { id: 14, slug: "variance-calculator", name: "Variance Calculator", description: "Calculate the variance of a dataset.", type: "client", icon: ChartLine },
      { id: 15, slug: "percentage-increase-calculator", name: "Percentage Increase Calculator", description: "Find how much a value grew in percent.", type: "client", icon: TrendingUp },
      { id: 16, slug: "percentage-decrease-calculator", name: "Percentage Decrease Calculator", description: "Find how much a value dropped in percent.", type: "client", icon: TrendingDown },
      { id: 17, slug: "percent-difference-calculator", name: "Percent Difference Calculator", description: "Compare two values as a percent difference.", type: "client", icon: GitCompareArrows },
      { id: 18, slug: "percent-error-calculator", name: "Percent Error Calculator", description: "Compare an observed value to a true value.", type: "client", icon: TriangleAlert },
      { id: 19, slug: "markup-calculator", name: "Markup Calculator", description: "Calculate selling price from cost and markup.", type: "client", icon: BadgePercent },
      { id: 20, slug: "margin-calculator", name: "Margin Calculator", description: "Calculate profit margin from cost and price.", type: "client", icon: Target },
      { id: 21, slug: "profit-calculator", name: "Profit Calculator", description: "Revenue minus costs equals your profit.", type: "client", icon: CircleDollarSign },
      { id: 22, slug: "loss-calculator", name: "Loss Calculator", description: "Find the loss when selling below cost.", type: "client", icon: CircleMinus },
      { id: 23, slug: "break-even-calculator", name: "Break-Even Calculator", description: "Find the units needed to cover costs.", type: "client", icon: Scale },
      { id: 24, slug: "unit-price-calculator", name: "Unit Price Calculator", description: "Find the price of a single unit.", type: "client", icon: Tag },
      { id: 25, slug: "price-per-quantity-calculator", name: "Price Per Quantity Calculator", description: "Find price per item, kg, liter and more.", type: "client", icon: Barcode },
      { id: 26, slug: "split-bill-calculator", name: "Split Bill Calculator", description: "Split a bill evenly with tip included.", type: "client", icon: Users },
      { id: 27, slug: "tip-calculator", name: "Tip Calculator", description: "Calculate tips and per-person totals.", type: "client", icon: HandCoins },
      { id: 28, slug: "discount-calculator", name: "Discount Calculator", description: "Find savings and final price after discount.", type: "client", icon: PercentSquare },
      { id: 29, slug: "sale-price-calculator", name: "Sale Price Calculator", description: "Calculate the sale price of discounted items.", type: "client", icon: Gift },
      { id: 30, slug: "original-price-calculator", name: "Original Price Calculator", description: "Reconstruct the price before a discount.", type: "client", icon: Undo2 },
      { id: 31, slug: "tax-calculator", name: "Tax Calculator", description: "Add tax to an amount.", type: "client", icon: Landmark },
      { id: 32, slug: "gst-calculator", name: "GST Calculator", description: "Add or extract GST from a price.", type: "client", icon: CirclePercent },
      { id: 33, slug: "vat-calculator", name: "VAT Calculator", description: "Add or extract VAT from a price.", type: "client", icon: ReceiptText },
      { id: 34, slug: "service-charge-calculator", name: "Service Charge Calculator", description: "Apply a service charge to a bill.", type: "client", icon: Utensils },
      { id: 35, slug: "commission-calculator", name: "Commission Calculator", description: "Calculate commission from sales.", type: "client", icon: Coins },
      { id: 36, slug: "salary-calculator", name: "Salary Calculator", description: "Convert between hourly, daily, monthly and annual pay.", type: "client", icon: Briefcase },
      { id: 37, slug: "hourly-wage-calculator", name: "Hourly Wage Calculator", description: "Convert salary into an hourly wage.", type: "client", icon: Clock },
      { id: 38, slug: "overtime-calculator", name: "Overtime Calculator", description: "Calculate pay including overtime hours.", type: "client", icon: TimerReset },
      { id: 39, slug: "annual-salary-calculator", name: "Annual Salary Calculator", description: "Convert monthly or weekly pay to annual.", type: "client", icon: CalendarDays },
      { id: 40, slug: "monthly-salary-calculator", name: "Monthly Salary Calculator", description: "Convert an annual salary to monthly.", type: "client", icon: CalendarRange },
      { id: 41, slug: "daily-wage-calculator", name: "Daily Wage Calculator", description: "Find your daily pay from a monthly salary.", type: "client", icon: Sun },
      { id: 42, slug: "net-salary-calculator", name: "Net Salary Calculator", description: "Subtract deductions from gross pay.", type: "client", icon: Wallet },
      { id: 43, slug: "gross-salary-calculator", name: "Gross Salary Calculator", description: "Recover gross pay from net and deductions.", type: "client", icon: Banknote },
      { id: 44, slug: "take-home-pay-calculator", name: "Take-Home Pay Calculator", description: "Calculate take-home pay after taxes.", type: "client", icon: House },
      { id: 45, slug: "work-hours-calculator", name: "Work Hours Calculator", description: "Calculate hours worked between two times.", type: "client", icon: Hourglass },
      { id: 46, slug: "time-card-calculator", name: "Time Card Calculator", description: "Track hours across multiple work days.", type: "client", icon: ListChecks },
      { id: 47, slug: "expense-calculator", name: "Expense Calculator", description: "Total and analyze a list of expenses.", type: "client", icon: Receipt },
      { id: 48, slug: "budget-calculator", name: "Budget Calculator", description: "Balance income against expenses.", type: "client", icon: PiggyBank },
      { id: 49, slug: "savings-calculator", name: "Savings Calculator", description: "Project how much you can save over time.", type: "client", icon: BanknoteArrowUp },
      { id: 50, slug: "cost-calculator", name: "Cost Calculator", description: "Itemize and total project costs.", type: "client", icon: Boxes },
    ],
  },
]

export const allTools: Tool[] = categories.flatMap((c) => c.tools)

export function getTool(slug: string): Tool | undefined {
  return allTools.find((t) => t.slug === slug)
}
