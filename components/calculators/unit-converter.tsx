"use client"

import { useState } from "react"
import { fmtNum, parseNum } from "@/lib/calc-utils"
import type { UnitDef } from "@/lib/unit-utils"
import {
  ACCELERATION_UNITS,
  ANGLE_UNITS,
  AREA_UNITS,
  CAPACITANCE_UNITS,
  CUBIC_FEET_UNITS,
  CUBIC_METER_UNITS,
  CURRENT_UNITS,
  C_F_UNITS,
  DATA_STORAGE_UNITS,
  DATA_TRANSFER_UNITS,
  DENSITY_UNITS,
  DISTANCE_UNITS,
  ENERGY_UNITS,
  F_C_UNITS,
  FEET_METER_UNITS,
  FLOW_RATE_UNITS,
  FORCE_UNITS,
  FREQUENCY_UNITS,
  GALLON_LITER_UNITS,
  ILLUMINANCE_UNITS,
  INCH_CM_UNITS,
  INDUCTANCE_UNITS,
  K_C_F_UNITS,
  LENGTH_UNITS,
  MAGNETIC_UNITS,
  MASS_UNITS,
  MILE_KM_UNITS,
  OUNCE_GRAM_UNITS,
  POUND_KG_UNITS,
  POWER_UNITS,
  PRESSURE_UNITS,
  RADIATION_UNITS,
  RESISTANCE_UNITS,
  SPEED_UNITS,
  SQUARE_FEET_UNITS,
  SQUARE_METER_UNITS,
  TEMPERATURE_UNITS,
  TIME_UNITS,
  TORQUE_UNITS,
  VOLTAGE_UNITS,
  VOLUME_UNITS,
  WEIGHT_UNITS,
  YARD_METER_UNITS,
  convertUnit,
} from "@/lib/unit-utils"
import { NumberField, SelectField, ResultGrid, ResultRow, Formula } from "./shared"

function UnitConverter({ units }: { units: UnitDef[] }) {
  const [value, setValue] = useState("")
  const [from, setFrom] = useState(units[0].id)
  const [to, setTo] = useState(units[1].id)

  const v = parseNum(value)
  const fromUnit = units.find((u) => u.id === from) ?? units[0]
  const toUnit = units.find((u) => u.id === to) ?? units[1]
  const result = v != null ? convertUnit(v, fromUnit, toUnit) : null
  const inverse = v != null ? convertUnit(v, toUnit, fromUnit) : null
  const one = convertUnit(1, fromUnit, toUnit)
  const options = units.map((u) => ({ value: u.id, label: u.label }))

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="uc-value" label="Value" value={value} onChange={setValue} placeholder="e.g. 10" />
        <SelectField id="uc-from" label="From" value={from} onChange={setFrom} options={options} />
        <SelectField id="uc-to" label="To" value={to} onChange={setTo} options={options} />
      </div>
      <Formula>1 {fromUnit.label} = {fmtNum(one)} {toUnit.label}</Formula>
      <ResultGrid>
        <ResultRow label="Converted" value={result != null ? fmtNum(result) : "—"} />
        <ResultRow label="Inverse" value={inverse != null ? `${fmtNum(inverse)} ${fromUnit.label}` : "—"} />
      </ResultGrid>
    </div>
  )
}

export function LengthConverter() {
  return <UnitConverter units={LENGTH_UNITS} />
}
export function DistanceConverter() {
  return <UnitConverter units={DISTANCE_UNITS} />
}
export function AreaConverter() {
  return <UnitConverter units={AREA_UNITS} />
}
export function VolumeConverter() {
  return <UnitConverter units={VOLUME_UNITS} />
}
export function WeightConverter() {
  return <UnitConverter units={WEIGHT_UNITS} />
}
export function MassConverter() {
  return <UnitConverter units={MASS_UNITS} />
}
export function TemperatureConverter() {
  return <UnitConverter units={TEMPERATURE_UNITS} />
}
export function SpeedConverter() {
  return <UnitConverter units={SPEED_UNITS} />
}
export function TimeConverter() {
  return <UnitConverter units={TIME_UNITS} />
}
export function PressureConverter() {
  return <UnitConverter units={PRESSURE_UNITS} />
}
export function EnergyConverter() {
  return <UnitConverter units={ENERGY_UNITS} />
}
export function PowerConverter() {
  return <UnitConverter units={POWER_UNITS} />
}
export function ForceConverter() {
  return <UnitConverter units={FORCE_UNITS} />
}
export function TorqueConverter() {
  return <UnitConverter units={TORQUE_UNITS} />
}
export function FrequencyConverter() {
  return <UnitConverter units={FREQUENCY_UNITS} />
}
export function AngleConverter() {
  return <UnitConverter units={ANGLE_UNITS} />
}
export function DataStorageConverter() {
  return <UnitConverter units={DATA_STORAGE_UNITS} />
}
export function DataTransferConverter() {
  return <UnitConverter units={DATA_TRANSFER_UNITS} />
}
export function FlowRateConverter() {
  return <UnitConverter units={FLOW_RATE_UNITS} />
}
export function AccelerationConverter() {
  return <UnitConverter units={ACCELERATION_UNITS} />
}
export function DensityConverter() {
  return <UnitConverter units={DENSITY_UNITS} />
}
export function VoltageConverter() {
  return <UnitConverter units={VOLTAGE_UNITS} />
}
export function CurrentConverter() {
  return <UnitConverter units={CURRENT_UNITS} />
}
export function ResistanceConverter() {
  return <UnitConverter units={RESISTANCE_UNITS} />
}
export function CapacitanceConverter() {
  return <UnitConverter units={CAPACITANCE_UNITS} />
}
export function InductanceConverter() {
  return <UnitConverter units={INDUCTANCE_UNITS} />
}
export function MagneticFieldConverter() {
  return <UnitConverter units={MAGNETIC_UNITS} />
}
export function IlluminanceConverter() {
  return <UnitConverter units={ILLUMINANCE_UNITS} />
}
export function RadiationConverter() {
  return <UnitConverter units={RADIATION_UNITS} />
}
export function SquareFeetConverter() {
  return <UnitConverter units={SQUARE_FEET_UNITS} />
}
export function SquareMeterConverter() {
  return <UnitConverter units={SQUARE_METER_UNITS} />
}
export function CubicFeetConverter() {
  return <UnitConverter units={CUBIC_FEET_UNITS} />
}
export function CubicMeterConverter() {
  return <UnitConverter units={CUBIC_METER_UNITS} />
}
export function FeetToMeterConverter() {
  return <UnitConverter units={FEET_METER_UNITS} />
}
export function InchToCmConverter() {
  return <UnitConverter units={INCH_CM_UNITS} />
}
export function MileToKmConverter() {
  return <UnitConverter units={MILE_KM_UNITS} />
}
export function YardToMeterConverter() {
  return <UnitConverter units={YARD_METER_UNITS} />
}
export function PoundToKgConverter() {
  return <UnitConverter units={POUND_KG_UNITS} />
}
export function OunceToGramConverter() {
  return <UnitConverter units={OUNCE_GRAM_UNITS} />
}
export function GallonToLiterConverter() {
  return <UnitConverter units={GALLON_LITER_UNITS} />
}
export function CelsiusToFahrenheitConverter() {
  return <UnitConverter units={C_F_UNITS} />
}
export function FahrenheitToCelsiusConverter() {
  return <UnitConverter units={F_C_UNITS} />
}
export function KelvinConverter() {
  return <UnitConverter units={K_C_F_UNITS} />
}

const FUEL_OPTIONS = [
  { value: "kml", label: "Kilometers per liter (km/L)" },
  { value: "l100", label: "Liters per 100 km (L/100km)" },
  { value: "mpg_us", label: "Miles per US gallon (mpg)" },
  { value: "mpg_uk", label: "Miles per imperial gallon (mpg UK)" },
  { value: "mil", label: "Miles per liter (mi/L)" },
]

function fuelToKml(value: number, id: string): number {
  switch (id) {
    case "l100":
      return 100 / value
    case "mpg_us":
      return value / 2.35214583
    case "mpg_uk":
      return value / 2.8248094
    case "mil":
      return value * 1.609344
    default:
      return value
  }
}

function fuelFromKml(kml: number, id: string): number {
  switch (id) {
    case "l100":
      return 100 / kml
    case "mpg_us":
      return kml * 2.35214583
    case "mpg_uk":
      return kml * 2.8248094
    case "mil":
      return kml / 1.609344
    default:
      return kml
  }
}

export function FuelEconomyConverter() {
  const [value, setValue] = useState("")
  const [from, setFrom] = useState("mpg_us")
  const [to, setTo] = useState("l100")

  const v = parseNum(value)
  const kml = v != null && v !== 0 ? fuelToKml(v, from) : null
  const result = kml != null ? fuelFromKml(kml, to) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="fe-value" label="Value" value={value} onChange={setValue} placeholder="e.g. 30" />
        <SelectField id="fe-from" label="From" value={from} onChange={setFrom} options={FUEL_OPTIONS} />
        <SelectField id="fe-to" label="To" value={to} onChange={setTo} options={FUEL_OPTIONS} />
      </div>
      <Formula>Conversions are based on kilometers per liter</Formula>
      <ResultGrid>
        <ResultRow label="Converted" value={result != null ? fmtNum(result) : "—"} />
        {kml != null ? (
          <>
            <ResultRow label="As km/L" value={fmtNum(kml)} />
            <ResultRow label="As L/100km" value={fmtNum(100 / kml)} />
          </>
        ) : null}
      </ResultGrid>
    </div>
  )
}
