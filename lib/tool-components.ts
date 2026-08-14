import type { ComponentType } from "react"
import { BasicCalculator } from "@/components/calculators/basic"
import { ScientificCalculator } from "@/components/calculators/scientific"
import {
  AverageCalculator,
  MeanCalculator,
  MedianCalculator,
  ModeCalculator,
  RangeCalculator,
  StandardDeviationCalculator,
  VarianceCalculator,
} from "@/components/calculators/list-stats"
import {
  PercentageCalculator,
  PercentageIncreaseCalculator,
  PercentageDecreaseCalculator,
  PercentDifferenceCalculator,
  PercentErrorCalculator,
} from "@/components/calculators/percent"
import {
  MarkupCalculator,
  MarginCalculator,
  ProfitCalculator,
  LossCalculator,
  BreakEvenCalculator,
  UnitPriceCalculator,
  PricePerQuantityCalculator,
} from "@/components/calculators/money"
import {
  SplitBillCalculator,
  TipCalculator,
  DiscountCalculator,
  SalePriceCalculator,
  OriginalPriceCalculator,
  TaxCalculator,
  GSTCalculator,
  VATCalculator,
  ServiceChargeCalculator,
  CommissionCalculator,
} from "@/components/calculators/bill"
import {
  SalaryCalculator,
  HourlyWageCalculator,
  OvertimeCalculator,
  AnnualSalaryCalculator,
  MonthlySalaryCalculator,
  DailyWageCalculator,
  NetSalaryCalculator,
  GrossSalaryCalculator,
  TakeHomePayCalculator,
} from "@/components/calculators/salary"
import { WorkHoursCalculator, TimeCardCalculator } from "@/components/calculators/time"
import {
  FractionCalculator,
  DecimalCalculator,
  RatioCalculator,
  ProportionCalculator,
} from "@/components/calculators/fraction"
import {
  ExpenseCalculator,
  BudgetCalculator,
  SavingsCalculator,
  CostCalculator,
} from "@/components/calculators/budget"

export const toolComponents: Record<string, ComponentType> = {
  "basic-calculator": BasicCalculator,
  "scientific-calculator": ScientificCalculator,
  "percentage-calculator": PercentageCalculator,
  "fraction-calculator": FractionCalculator,
  "decimal-calculator": DecimalCalculator,
  "ratio-calculator": RatioCalculator,
  "proportion-calculator": ProportionCalculator,
  "average-calculator": AverageCalculator,
  "mean-calculator": MeanCalculator,
  "median-calculator": MedianCalculator,
  "mode-calculator": ModeCalculator,
  "range-calculator": RangeCalculator,
  "standard-deviation-calculator": StandardDeviationCalculator,
  "variance-calculator": VarianceCalculator,
  "percentage-increase-calculator": PercentageIncreaseCalculator,
  "percentage-decrease-calculator": PercentageDecreaseCalculator,
  "percent-difference-calculator": PercentDifferenceCalculator,
  "percent-error-calculator": PercentErrorCalculator,
  "markup-calculator": MarkupCalculator,
  "margin-calculator": MarginCalculator,
  "profit-calculator": ProfitCalculator,
  "loss-calculator": LossCalculator,
  "break-even-calculator": BreakEvenCalculator,
  "unit-price-calculator": UnitPriceCalculator,
  "price-per-quantity-calculator": PricePerQuantityCalculator,
  "split-bill-calculator": SplitBillCalculator,
  "tip-calculator": TipCalculator,
  "discount-calculator": DiscountCalculator,
  "sale-price-calculator": SalePriceCalculator,
  "original-price-calculator": OriginalPriceCalculator,
  "tax-calculator": TaxCalculator,
  "gst-calculator": GSTCalculator,
  "vat-calculator": VATCalculator,
  "service-charge-calculator": ServiceChargeCalculator,
  "commission-calculator": CommissionCalculator,
  "salary-calculator": SalaryCalculator,
  "hourly-wage-calculator": HourlyWageCalculator,
  "overtime-calculator": OvertimeCalculator,
  "annual-salary-calculator": AnnualSalaryCalculator,
  "monthly-salary-calculator": MonthlySalaryCalculator,
  "daily-wage-calculator": DailyWageCalculator,
  "net-salary-calculator": NetSalaryCalculator,
  "gross-salary-calculator": GrossSalaryCalculator,
  "take-home-pay-calculator": TakeHomePayCalculator,
  "work-hours-calculator": WorkHoursCalculator,
  "time-card-calculator": TimeCardCalculator,
  "expense-calculator": ExpenseCalculator,
  "budget-calculator": BudgetCalculator,
  "savings-calculator": SavingsCalculator,
  "cost-calculator": CostCalculator,
}

export function getToolComponent(slug: string): ComponentType | undefined {
  return toolComponents[slug]
}
