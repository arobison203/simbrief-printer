import { SimbriefResponse } from "../types";

// ESC/POS Commands
const ESC = "\x1B";
const GS = "\x1D";

export const ESCPOS = {
  INIT: `${ESC}@`,
  BOLD_ON: `${ESC}E\x01`,
  BOLD_OFF: `${ESC}E\x00`,
  UNDERLINE_ON: `${ESC}-\x01`,
  UNDERLINE_OFF: `${ESC}-\x00`,
  DOUBLE_HEIGHT_ON: `${GS}!\x01`,
  DOUBLE_WIDTH_ON: `${GS}!\x10`,
  DOUBLE_SIZE_ON: `${GS}!\x11`,
  NORMAL_SIZE: `${GS}!\x00`,
  ALIGN_LEFT: `${ESC}a\x00`,
  ALIGN_CENTER: `${ESC}a\x01`,
  ALIGN_RIGHT: `${ESC}a\x02`,
  LINE_FEED: "\n",
  CUT_FULL: `${GS}V\x00`,
};

interface FormatOptions {
  maxWidth?: number;
  includeRoute?: boolean;
  includeWeather?: boolean;
}

// Builder class for cleaner syntax
class ReceiptBuilder {
  private output: string = "";
  private maxWidth: number;

  constructor(maxWidth: number = 48) {
    this.maxWidth = maxWidth;
    this.output += ESCPOS.INIT;
  }

  // Chainable methods
  text(str: string): this {
    this.output += str;
    return this;
  }

  line(str: string = ""): this {
    this.output += str + "\n";
    return this;
  }

  bold(fn: () => this): this {
    this.output += ESCPOS.BOLD_ON;
    fn.call(this);
    this.output += ESCPOS.BOLD_OFF;
    return this;
  }

  boldText(str: string): this {
    this.output += ESCPOS.BOLD_ON + str + ESCPOS.BOLD_OFF;
    return this;
  }

  centered(fn: () => this): this {
    this.output += ESCPOS.ALIGN_CENTER;
    fn.call(this);
    this.output += ESCPOS.ALIGN_LEFT;
    return this;
  }

  centerText(str: string): this {
    this.output += ESCPOS.ALIGN_CENTER + str + ESCPOS.ALIGN_LEFT;
    return this;
  }

  doubleSize(fn: () => this): this {
    this.output += ESCPOS.DOUBLE_SIZE_ON;
    fn.call(this);
    this.output += ESCPOS.NORMAL_SIZE;
    return this;
  }

  doubleSizeText(str: string): this {
    this.output += ESCPOS.DOUBLE_SIZE_ON + str + ESCPOS.NORMAL_SIZE;
    return this;
  }

  separator(): this {
    this.output += "-".repeat(this.maxWidth) + "\n";
    return this;
  }

  doubleSeparator(): this {
    this.output += "=".repeat(this.maxWidth) + "\n";
    return this;
  }

  underscore(): this {
    this.output += "_".repeat(this.maxWidth) + "\n";
    return this;
  }

  blank(): this {
    this.output += "\n";
    return this;
  }

  blanks(count: number): this {
    for (let i = 0; i < count; i++) {
      this.output += "\n";
    }
    return this;
  }

  section(title: string): this {
    this.separator();
    this.centered(() => this.doubleSizeText(title).line());
    return this;
  }

  header(title: string): this {
    this.boldText(title).line();
    return this;
  }

  field(label: string, value: string, forceWrap: boolean = false): this {
    const labelText = label;
    const spacing = this.maxWidth - labelText.length - value.length;

    if (spacing > 0 && !forceWrap) {
      this.output += ESCPOS.BOLD_ON + labelText + ESCPOS.BOLD_OFF;
      this.output += " ".repeat(spacing) + value + "\n";
    } else {
      // Wrap value
      this.output += ESCPOS.BOLD_ON + labelText + ESCPOS.BOLD_OFF + "\n";
      this.wrapValue(value);
    }
    return this;
  }

  private wrapValue(value: string): void {
    const indent = "  ";
    const availableWidth = this.maxWidth - indent.length;
    let remaining = value;

    while (remaining.length > 0) {
      if (remaining.length <= availableWidth) {
        this.output += indent + remaining + "\n";
        break;
      } else {
        let splitPos = availableWidth;
        const lastSpace = remaining.lastIndexOf(" ", availableWidth);
        if (lastSpace > 0) {
          splitPos = lastSpace;
        }
        this.output += indent + remaining.substring(0, splitPos).trim() + "\n";
        remaining = remaining.substring(splitPos).trim();
      }
    }
  }

  wrap(text: string): this {
    const words = text.split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= this.maxWidth) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        if (currentLine) this.output += currentLine + "\n";
        currentLine = word;
      }
    }
    if (currentLine) this.output += currentLine + "\n";
    return this;
  }

  cut(): this {
    this.output += ESCPOS.CUT_FULL;
    return this;
  }

  build(): string {
    return this.output;
  }
}

// Helper functions
function convertWeight(
  value: string | undefined,
  originalUnits: "lbs" | "kg",
  displayUnits: "lbs" | "kg",
): string {
  if (!value) return "N/A";
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "N/A";

  if (originalUnits === displayUnits) {
    return Math.round(numValue).toString();
  }

  let converted: number;
  if (originalUnits === "lbs" && displayUnits === "kg") {
    converted = numValue / 2.20462;
  } else {
    converted = numValue * 2.20462;
  }

  return Math.round(converted).toString();
}

function formatAltitude(altitude: string | undefined): string {
  if (!altitude) return "N/A";
  const alt = parseInt(altitude, 10);
  if (isNaN(alt)) return "N/A";

  if (alt >= 18000) {
    return `FL${Math.floor(alt / 100)}`;
  } else {
    return `${alt} ft`;
  }
}

function formatTime(seconds: string | undefined): string {
  if (!seconds) return "N/A";
  const numSeconds = parseInt(seconds, 10);
  if (isNaN(numSeconds)) return "N/A";

  const hours = Math.floor(numSeconds / 3600);
  const minutes = Math.floor((numSeconds % 3600) / 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatOFPForThermalPrinter(
  data: SimbriefResponse,
  displayUnits: "lbs" | "kg",
  options: FormatOptions = {},
): string {
  const { maxWidth = 48, includeRoute = true, includeWeather = true } = options;

  const b = new ReceiptBuilder(maxWidth);
  const originalUnits = data.params?.units === "kgs" ? "kg" : "lbs";
  const weightUnit = displayUnits.toUpperCase();

  // Weight converter closure
  const w = (val: string | undefined) =>
    convertWeight(val, originalUnits, displayUnits);

  // Header
  b.centered(() =>
    b
      .line("OPERATIONAL FLIGHT PLAN")
      .doubleSizeText(data.atc?.callsign || data.aircraft?.reg || "N/A")
      .line()
      .line(`${data.origin?.icao_code} -> ${data.destination?.icao_code}`),
  );
  b.field("Aircraft:", data.aircraft?.icao_code ?? "N/A")
    .field("Registration:", data.aircraft?.reg ?? "N/A")
    .blank();

  b.section("DEPARTURE")
    .centered(() => b.line(data.origin?.name ?? "N/A"))
    .field("ICAO:", data.origin?.icao_code!)
    .field("Planned Runway:", data.origin?.plan_rwy ?? "N/A")
    .field("METAR:", data.origin?.metar ?? "N/A", true);

  b.section("DESTINATION")
    .centered(() => b.line(data.destination?.name ?? "N/A"))
    .field("ICAO:", data.destination?.icao_code!)
    .field("Planned Runway:", data.destination?.plan_rwy ?? "N/A")
    .field("METAR:", data.destination?.metar ?? "N/A", true);

  // Performance
  b.section("PERFORMANCE")
    .field("Distance:", `${data.general?.route_distance ?? "N/A"} NM`)
    .field("Cruise Speed:", `M${data.general?.cruise_mach ?? "N/A"}`)
    .field("Flight Time:", formatTime(data.times?.est_time_enroute))
    .field("Altitude:", formatAltitude(data.general?.initial_altitude))
    .field(
      "Avg Wind:",
      `${data.general?.avg_wind_dir ?? "N/A"}/${data.general?.avg_wind_spd ?? "N/A"}`,
    )
    .field("Avg Temp Dev:", `${data.general?.avg_temp_dev ?? "N/A"} C`)
    .field("Cost Index:", data.general?.costindex ?? "N/A")
    .blank();

  // Route
  if (includeRoute && data.general?.route) {
    b.section("ROUTE").wrap(data.general.route).blank();
  }

  // Fuel Plan
  b.section("FUEL & WEIGHT")
    // fuel
    .field("Trip Fuel:", `${w(data.fuel?.enroute_burn)} ${weightUnit}`)
    .field("Taxi Fuel:", `${w(data.fuel?.taxi)} ${weightUnit}`)
    .field("Contingency:", `${w(data.fuel?.contingency)} ${weightUnit}`)
    .field("Alternate:", `${w(data.fuel?.alternate_burn)} ${weightUnit}`)
    .field("Reserve:", `${w(data.fuel?.reserve)} ${weightUnit}`)
    .field("Extra:", `${w(data.fuel?.extra)} ${weightUnit}`)
    .field("Min T/O Fuel:", `${w(data.fuel?.min_takeoff)} ${weightUnit}`)
    .field("Plan Fuel:", `${w(data.fuel?.plan_takeoff)} ${weightUnit}`)
    .separator()
    // weight
    .field("Passengers:", data.weights?.pax_count?.toString() ?? "0")
    .field("Empty Weight:", `${w(data.weights?.oew)} ${weightUnit}`)
    .field("Payload:", `${w(data.weights?.payload)} ${weightUnit}`)
    .field("Cargo:", `${w(data.weights?.cargo)} ${weightUnit}`)
    .field("Zero Fuel Weight:", `${w(data.weights?.est_zfw)} ${weightUnit}`)
    .field("Takeoff Weight:", `${w(data.weights?.est_tow)} ${weightUnit}`)
    .field("Landing Weight:", `${w(data.weights?.est_ldw)} ${weightUnit}`)
    .blank();

  // Notes
  b.section("NOTES")
    .blank()
    .line("Clearance Limit:")
    .blank()
    .underscore()
    .blank()
    .line("Route:")
    .blank()
    .underscore()
    .blank()
    .line("Altitude:")
    .blank()
    .underscore()
    .blank()
    .line("Frequency:")
    .blank()
    .underscore()
    .blank()
    .line("Transponder:")
    .blank()
    .underscore()
    .blank()
    .header("General:")
    .blank()
    .underscore()
    .blank()
    .underscore()
    .blank()
    .underscore()
    .blank()
    .underscore()
    .blank();

  // Footer
  b.centered(() =>
    b
      .line("Generated by SimBrief")
      .line("For flight simulation use only")
      .line("NOT FOR REAL WORLD NAVIGATION"),
  )
    .blanks(5)
    .cut();

  return b.build();
}
