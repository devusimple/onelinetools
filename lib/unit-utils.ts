export interface UnitDef {
  id: string
  label: string
  factor: number
  offset?: number
}

export function convertUnit(value: number, from: UnitDef, to: UnitDef): number {
  if (from.offset == null && to.offset == null) {
    return (value * from.factor) / to.factor
  }
  const base = (value + (from.offset ?? 0)) * from.factor
  return base / to.factor - (to.offset ?? 0)
}

function pick(units: UnitDef[], ids: string[]): UnitDef[] {
  return ids.map((id) => units.find((u) => u.id === id) as UnitDef)
}

export const LENGTH_UNITS: UnitDef[] = [
  { id: "mm", label: "Millimeter (mm)", factor: 0.001 },
  { id: "cm", label: "Centimeter (cm)", factor: 0.01 },
  { id: "m", label: "Meter (m)", factor: 1 },
  { id: "km", label: "Kilometer (km)", factor: 1000 },
  { id: "in", label: "Inch (in)", factor: 0.0254 },
  { id: "ft", label: "Foot (ft)", factor: 0.3048 },
  { id: "yd", label: "Yard (yd)", factor: 0.9144 },
  { id: "mi", label: "Mile (mi)", factor: 1609.344 },
  { id: "nmi", label: "Nautical mile", factor: 1852 },
  { id: "um", label: "Micrometer (µm)", factor: 0.000001 },
  { id: "nm", label: "Nanometer (nm)", factor: 0.000000001 },
]

export const DISTANCE_UNITS: UnitDef[] = [
  { id: "m", label: "Meter (m)", factor: 1 },
  { id: "km", label: "Kilometer (km)", factor: 1000 },
  { id: "mi", label: "Mile (mi)", factor: 1609.344 },
  { id: "ft", label: "Foot (ft)", factor: 0.3048 },
  { id: "yd", label: "Yard (yd)", factor: 0.9144 },
  { id: "nmi", label: "Nautical mile", factor: 1852 },
  { id: "au", label: "Astronomical unit (au)", factor: 149597870700 },
  { id: "ly", label: "Light-year (ly)", factor: 9460730472580800 },
]

export const AREA_UNITS: UnitDef[] = [
  { id: "m2", label: "Square meter (m²)", factor: 1 },
  { id: "km2", label: "Square kilometer (km²)", factor: 1000000 },
  { id: "cm2", label: "Square centimeter (cm²)", factor: 0.0001 },
  { id: "mm2", label: "Square millimeter (mm²)", factor: 0.000001 },
  { id: "ft2", label: "Square foot (ft²)", factor: 0.09290304 },
  { id: "in2", label: "Square inch (in²)", factor: 0.00064516 },
  { id: "yd2", label: "Square yard (yd²)", factor: 0.83612736 },
  { id: "acre", label: "Acre", factor: 4046.8564224 },
  { id: "ha", label: "Hectare (ha)", factor: 10000 },
  { id: "mi2", label: "Square mile (mi²)", factor: 2589988.110336 },
]

export const VOLUME_UNITS: UnitDef[] = [
  { id: "m3", label: "Cubic meter (m³)", factor: 1 },
  { id: "l", label: "Liter (L)", factor: 0.001 },
  { id: "ml", label: "Milliliter (mL)", factor: 0.000001 },
  { id: "cm3", label: "Cubic centimeter (cm³)", factor: 0.000001 },
  { id: "ft3", label: "Cubic foot (ft³)", factor: 0.028316846592 },
  { id: "in3", label: "Cubic inch (in³)", factor: 0.000016387064 },
  { id: "yd3", label: "Cubic yard (yd³)", factor: 0.764554857984 },
  { id: "gal", label: "US gallon (gal)", factor: 0.003785411784 },
  { id: "qt", label: "US quart (qt)", factor: 0.000946352946 },
  { id: "pt", label: "US pint (pt)", factor: 0.000473176473 },
  { id: "cup", label: "US cup", factor: 0.0002365882365 },
  { id: "floz", label: "US fluid ounce", factor: 0.0000295735295625 },
  { id: "tbsp", label: "Tablespoon (tbsp)", factor: 0.00001478676478125 },
  { id: "tsp", label: "Teaspoon (tsp)", factor: 0.00000492892159375 },
]

export const WEIGHT_UNITS: UnitDef[] = [
  { id: "kg", label: "Kilogram (kg)", factor: 1 },
  { id: "g", label: "Gram (g)", factor: 0.001 },
  { id: "mg", label: "Milligram (mg)", factor: 0.000001 },
  { id: "tonne", label: "Metric tonne (t)", factor: 1000 },
  { id: "lb", label: "Pound (lb)", factor: 0.45359237 },
  { id: "oz", label: "Ounce (oz)", factor: 0.028349523125 },
  { id: "stone", label: "Stone (st)", factor: 6.35029318 },
  { id: "uston", label: "US ton (short)", factor: 907.18474 },
  { id: "ukton", label: "UK ton (long)", factor: 1016.0469088 },
  { id: "grain", label: "Grain (gr)", factor: 0.00006479891 },
]

export const MASS_UNITS: UnitDef[] = [
  { id: "kg", label: "Kilogram (kg)", factor: 1 },
  { id: "g", label: "Gram (g)", factor: 0.001 },
  { id: "mg", label: "Milligram (mg)", factor: 0.000001 },
  { id: "ug", label: "Microgram (µg)", factor: 0.000000001 },
  { id: "tonne", label: "Metric tonne (t)", factor: 1000 },
  { id: "carat", label: "Carat (ct)", factor: 0.0002 },
  { id: "grain", label: "Grain (gr)", factor: 0.00006479891 },
  { id: "lb", label: "Pound (lb)", factor: 0.45359237 },
  { id: "oz", label: "Ounce (oz)", factor: 0.028349523125 },
]

export const TEMPERATURE_UNITS: UnitDef[] = [
  { id: "c", label: "Celsius (°C)", factor: 1, offset: 273.15 },
  { id: "f", label: "Fahrenheit (°F)", factor: 5 / 9, offset: 459.67 },
  { id: "k", label: "Kelvin (K)", factor: 1, offset: 0 },
]

export const SPEED_UNITS: UnitDef[] = [
  { id: "ms", label: "Meter/second (m/s)", factor: 1 },
  { id: "kmh", label: "Kilometer/hour (km/h)", factor: 1 / 3.6 },
  { id: "mph", label: "Mile/hour (mph)", factor: 0.44704 },
  { id: "knot", label: "Knot (kn)", factor: 0.5144444444 },
  { id: "fts", label: "Foot/second (ft/s)", factor: 0.3048 },
  { id: "mach", label: "Mach (at sea level)", factor: 340.29 },
]

export const TIME_UNITS: UnitDef[] = [
  { id: "s", label: "Second (s)", factor: 1 },
  { id: "min", label: "Minute (min)", factor: 60 },
  { id: "h", label: "Hour (h)", factor: 3600 },
  { id: "day", label: "Day", factor: 86400 },
  { id: "week", label: "Week", factor: 604800 },
  { id: "month", label: "Month (avg)", factor: 2629800 },
  { id: "year", label: "Year (365.25 days)", factor: 31557600 },
]

export const PRESSURE_UNITS: UnitDef[] = [
  { id: "pa", label: "Pascal (Pa)", factor: 1 },
  { id: "kpa", label: "Kilopascal (kPa)", factor: 1000 },
  { id: "mpa", label: "Megapascal (MPa)", factor: 1000000 },
  { id: "bar", label: "Bar", factor: 100000 },
  { id: "psi", label: "Pound/sq inch (psi)", factor: 6894.757293168 },
  { id: "atm", label: "Atmosphere (atm)", factor: 101325 },
  { id: "mmhg", label: "Millimeter mercury (mmHg)", factor: 133.322368421 },
  { id: "torr", label: "Torr", factor: 133.322368421 },
]

export const ENERGY_UNITS: UnitDef[] = [
  { id: "j", label: "Joule (J)", factor: 1 },
  { id: "kj", label: "Kilojoule (kJ)", factor: 1000 },
  { id: "mj", label: "Megajoule (MJ)", factor: 1000000 },
  { id: "cal", label: "Calorie (cal)", factor: 4.184 },
  { id: "kcal", label: "Kilocalorie (kcal)", factor: 4184 },
  { id: "wh", label: "Watt-hour (Wh)", factor: 3600 },
  { id: "kwh", label: "Kilowatt-hour (kWh)", factor: 3600000 },
  { id: "btu", label: "BTU", factor: 1055.05585262 },
  { id: "ev", label: "Electronvolt (eV)", factor: 0.0000000000000000001602176634 },
]

export const POWER_UNITS: UnitDef[] = [
  { id: "w", label: "Watt (W)", factor: 1 },
  { id: "kw", label: "Kilowatt (kW)", factor: 1000 },
  { id: "mw", label: "Megawatt (MW)", factor: 1000000 },
  { id: "hp", label: "Horsepower (hp)", factor: 745.699871582 },
  { id: "btuh", label: "BTU/hour", factor: 0.293071070172 },
  { id: "cals", label: "Calorie/second", factor: 4.184 },
  { id: "kcals", label: "Kilocalorie/second", factor: 4184 },
]

export const FORCE_UNITS: UnitDef[] = [
  { id: "n", label: "Newton (N)", factor: 1 },
  { id: "kn", label: "Kilonewton (kN)", factor: 1000 },
  { id: "lbf", label: "Pound-force (lbf)", factor: 4.4482216152605 },
  { id: "kgf", label: "Kilogram-force (kgf)", factor: 9.80665 },
  { id: "dyn", label: "Dyne (dyn)", factor: 0.00001 },
]

export const TORQUE_UNITS: UnitDef[] = [
  { id: "nm", label: "Newton-meter (N·m)", factor: 1 },
  { id: "knm", label: "Kilonewton-meter (kN·m)", factor: 1000 },
  { id: "ftlb", label: "Pound-foot (ft·lb)", factor: 1.3558179483314 },
  { id: "inlb", label: "Pound-inch (in·lb)", factor: 0.1129848290276 },
  { id: "kgfm", label: "Kilogram-meter (kgf·m)", factor: 9.80665 },
  { id: "dyncm", label: "Dyne-centimeter (dyn·cm)", factor: 0.0000001 },
]

export const FREQUENCY_UNITS: UnitDef[] = [
  { id: "hz", label: "Hertz (Hz)", factor: 1 },
  { id: "khz", label: "Kilohertz (kHz)", factor: 1000 },
  { id: "mhz", label: "Megahertz (MHz)", factor: 1000000 },
  { id: "ghz", label: "Gigahertz (GHz)", factor: 1000000000 },
  { id: "rpm", label: "Revolutions/min (rpm)", factor: 1 / 60 },
]

export const ANGLE_UNITS: UnitDef[] = [
  { id: "rad", label: "Radian (rad)", factor: 1 },
  { id: "deg", label: "Degree (°)", factor: Math.PI / 180 },
  { id: "arcmin", label: "Arcminute (′)", factor: Math.PI / 10800 },
  { id: "arcsec", label: "Arcsecond (″)", factor: Math.PI / 648000 },
  { id: "grad", label: "Gradian (gon)", factor: Math.PI / 200 },
  { id: "turn", label: "Turn / revolution", factor: 2 * Math.PI },
]

export const DATA_STORAGE_UNITS: UnitDef[] = [
  { id: "bit", label: "Bit", factor: 0.125 },
  { id: "byte", label: "Byte (B)", factor: 1 },
  { id: "kb", label: "Kilobyte (KB)", factor: 1000 },
  { id: "mb", label: "Megabyte (MB)", factor: 1000000 },
  { id: "gb", label: "Gigabyte (GB)", factor: 1000000000 },
  { id: "tb", label: "Terabyte (TB)", factor: 1000000000000 },
  { id: "pb", label: "Petabyte (PB)", factor: 1000000000000000 },
  { id: "kib", label: "Kibibyte (KiB)", factor: 1024 },
  { id: "mib", label: "Mebibyte (MiB)", factor: 1048576 },
  { id: "gib", label: "Gibibyte (GiB)", factor: 1073741824 },
]

export const DATA_TRANSFER_UNITS: UnitDef[] = [
  { id: "bps", label: "Bit/second (bit/s)", factor: 1 },
  { id: "bpsB", label: "Byte/second (B/s)", factor: 8 },
  { id: "kbps", label: "Kilobit/second (kbps)", factor: 1000 },
  { id: "kbpsB", label: "Kilobyte/second (KB/s)", factor: 8000 },
  { id: "mbps", label: "Megabit/second (Mbps)", factor: 1000000 },
  { id: "mbpsB", label: "Megabyte/second (MB/s)", factor: 8000000 },
  { id: "gbps", label: "Gigabit/second (Gbps)", factor: 1000000000 },
  { id: "gbpsB", label: "Gigabyte/second (GB/s)", factor: 8000000000 },
]

export const FLOW_RATE_UNITS: UnitDef[] = [
  { id: "m3s", label: "Cubic meter/second (m³/s)", factor: 1 },
  { id: "m3h", label: "Cubic meter/hour (m³/h)", factor: 1 / 3600 },
  { id: "ls", label: "Liter/second (L/s)", factor: 0.001 },
  { id: "lmin", label: "Liter/minute (L/min)", factor: 0.0000166666666666667 },
  { id: "mlmin", label: "Milliliter/minute (mL/min)", factor: 0.0000000166666666666667 },
  { id: "ft3s", label: "Cubic foot/second (ft³/s)", factor: 0.028316846592 },
  { id: "gpm", label: "US gallon/minute (gpm)", factor: 0.0000630901964 },
  { id: "gph", label: "US gallon/hour (gal/h)", factor: 0.00000105150327333 },
]

export const ACCELERATION_UNITS: UnitDef[] = [
  { id: "ms2", label: "Meter/second² (m/s²)", factor: 1 },
  { id: "fts2", label: "Foot/second² (ft/s²)", factor: 0.3048 },
  { id: "g", label: "Standard gravity (g)", factor: 9.80665 },
  { id: "gal", label: "Gal (cm/s²)", factor: 0.01 },
]

export const DENSITY_UNITS: UnitDef[] = [
  { id: "kgm3", label: "Kilogram/cubic meter (kg/m³)", factor: 1 },
  { id: "gcm3", label: "Gram/cubic cm (g/cm³)", factor: 1000 },
  { id: "gml", label: "Gram/milliliter (g/mL)", factor: 1000 },
  { id: "kgl", label: "Kilogram/liter (kg/L)", factor: 1000 },
  { id: "lbft3", label: "Pound/cubic foot (lb/ft³)", factor: 16.01846337396 },
  { id: "lbgal", label: "Pound/US gallon (lb/gal)", factor: 119.82642732 },
]

export const VOLTAGE_UNITS: UnitDef[] = [
  { id: "v", label: "Volt (V)", factor: 1 },
  { id: "mv", label: "Millivolt (mV)", factor: 0.001 },
  { id: "uv", label: "Microvolt (µV)", factor: 0.000001 },
  { id: "kv", label: "Kilovolt (kV)", factor: 1000 },
]

export const CURRENT_UNITS: UnitDef[] = [
  { id: "a", label: "Ampere (A)", factor: 1 },
  { id: "ma", label: "Milliampere (mA)", factor: 0.001 },
  { id: "ua", label: "Microampere (µA)", factor: 0.000001 },
  { id: "ka", label: "Kiloampere (kA)", factor: 1000 },
]

export const RESISTANCE_UNITS: UnitDef[] = [
  { id: "ohm", label: "Ohm (Ω)", factor: 1 },
  { id: "mohm", label: "Milliohm (mΩ)", factor: 0.001 },
  { id: "kohm", label: "Kilohm (kΩ)", factor: 1000 },
  { id: "mohm2", label: "Megohm (MΩ)", factor: 1000000 },
]

export const CAPACITANCE_UNITS: UnitDef[] = [
  { id: "f", label: "Farad (F)", factor: 1 },
  { id: "mf", label: "Millifarad (mF)", factor: 0.001 },
  { id: "uf", label: "Microfarad (µF)", factor: 0.000001 },
  { id: "nf", label: "Nanofarad (nF)", factor: 0.000000001 },
  { id: "pf", label: "Picofarad (pF)", factor: 0.000000000001 },
]

export const INDUCTANCE_UNITS: UnitDef[] = [
  { id: "h", label: "Henry (H)", factor: 1 },
  { id: "mh", label: "Millihenry (mH)", factor: 0.001 },
  { id: "uh", label: "Microhenry (µH)", factor: 0.000001 },
  { id: "nh", label: "Nanohenry (nH)", factor: 0.000000001 },
]

export const MAGNETIC_UNITS: UnitDef[] = [
  { id: "t", label: "Tesla (T)", factor: 1 },
  { id: "mt", label: "Millitesla (mT)", factor: 0.001 },
  { id: "ut", label: "Microtesla (µT)", factor: 0.000001 },
  { id: "gauss", label: "Gauss (G)", factor: 0.0001 },
]

export const ILLUMINANCE_UNITS: UnitDef[] = [
  { id: "lux", label: "Lux (lx)", factor: 1 },
  { id: "fc", label: "Foot-candle (fc)", factor: 10.763910417 },
  { id: "lm2", label: "Lumen/square meter", factor: 1 },
  { id: "phot", label: "Phot", factor: 10000 },
]

export const RADIATION_UNITS: UnitDef[] = [
  { id: "sv", label: "Sievert (Sv)", factor: 1 },
  { id: "msv", label: "Millisievert (mSv)", factor: 0.001 },
  { id: "usv", label: "Microsievert (µSv)", factor: 0.000001 },
  { id: "rem", label: "Rem", factor: 0.01 },
  { id: "rad", label: "Rad", factor: 0.01 },
  { id: "gy", label: "Gray (Gy)", factor: 1 },
  { id: "mgy", label: "Milligray (mGy)", factor: 0.001 },
]

export const SQUARE_FEET_UNITS = pick(AREA_UNITS, ["ft2", "m2", "in2", "yd2", "acre", "ha"])
export const SQUARE_METER_UNITS = pick(AREA_UNITS, ["m2", "ft2", "yd2", "km2", "ha", "acre"])
export const CUBIC_FEET_UNITS = pick(VOLUME_UNITS, ["ft3", "m3", "l", "gal", "yd3", "in3"])
export const CUBIC_METER_UNITS = pick(VOLUME_UNITS, ["m3", "ft3", "l", "gal", "yd3"])
export const FEET_METER_UNITS = pick(LENGTH_UNITS, ["ft", "m", "yd", "in", "cm", "km"])
export const INCH_CM_UNITS = pick(LENGTH_UNITS, ["in", "cm", "mm", "m", "ft"])
export const MILE_KM_UNITS = pick(LENGTH_UNITS, ["mi", "km", "m", "yd", "ft", "nmi"])
export const YARD_METER_UNITS = pick(LENGTH_UNITS, ["yd", "m", "ft", "in", "cm"])
export const POUND_KG_UNITS = pick(WEIGHT_UNITS, ["lb", "kg", "oz", "stone", "g", "tonne"])
export const OUNCE_GRAM_UNITS = pick(WEIGHT_UNITS, ["oz", "g", "lb", "kg", "mg"])
export const GALLON_LITER_UNITS = pick(VOLUME_UNITS, ["gal", "l", "qt", "pt", "ml", "floz"])
export const C_F_UNITS = pick(TEMPERATURE_UNITS, ["c", "f", "k"])
export const F_C_UNITS = pick(TEMPERATURE_UNITS, ["f", "c", "k"])
export const K_C_F_UNITS = pick(TEMPERATURE_UNITS, ["k", "c", "f"])
