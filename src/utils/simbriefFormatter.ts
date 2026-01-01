import { SimbriefResponse } from "../types";
import { ReceiptBuilder } from "./escposFormatter.ts";

interface FormatOptions {
  maxWidth?: number;
  includeRoute?: boolean;
  includeWeather?: boolean;
  trailingBlankLines?: number;
}

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
  const {
    maxWidth = 48,
    includeRoute = true,
    includeWeather: _includeWeather = true,
  } = options;

  const b = new ReceiptBuilder(maxWidth);
  const originalUnits = data.params?.units === "kgs" ? "kg" : "lbs";
  const weightUnit = displayUnits.toUpperCase();

  const w = (val: string | undefined) =>
    convertWeight(val, originalUnits, displayUnits);

  b.centered(() =>
    b
      .line("OPERATIONAL FLIGHT PLAN")
      .doubleSizeText(data.atc?.callsign || data.aircraft?.reg || "N/A")
      .line(`${data.origin?.icao_code} -> ${data.destination?.icao_code}`),
  );
  b.field("Aircraft:", data.aircraft?.icao_code ?? "N/A").field(
    "Registration:",
    data.aircraft?.reg ?? "N/A",
  );

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
    .field("Cost Index:", data.general?.costindex ?? "N/A");

  if (includeRoute && data.general?.route) {
    b.section("ROUTE").wrap(data.general.route);
  }

  b.section("FUEL & WEIGHT")
    .field("Trip Fuel:", `${w(data.fuel?.enroute_burn)} ${weightUnit}`)
    .field("Taxi Fuel:", `${w(data.fuel?.taxi)} ${weightUnit}`)
    .field("Contingency:", `${w(data.fuel?.contingency)} ${weightUnit}`)
    .field("Alternate:", `${w(data.fuel?.alternate_burn)} ${weightUnit}`)
    .field("Reserve:", `${w(data.fuel?.reserve)} ${weightUnit}`)
    .field("Extra:", `${w(data.fuel?.extra)} ${weightUnit}`)
    .field("Min T/O Fuel:", `${w(data.fuel?.min_takeoff)} ${weightUnit}`)
    .field("Plan Fuel:", `${w(data.fuel?.plan_takeoff)} ${weightUnit}`)
    .separator()
    .field("Passengers:", data.weights?.pax_count?.toString() ?? "0")
    .field("Empty Weight:", `${w(data.weights?.oew)} ${weightUnit}`)
    .field("Payload:", `${w(data.weights?.payload)} ${weightUnit}`)
    .field("Cargo:", `${w(data.weights?.cargo)} ${weightUnit}`)
    .field("Zero Fuel Weight:", `${w(data.weights?.est_zfw)} ${weightUnit}`)
    .field("Takeoff Weight:", `${w(data.weights?.est_tow)} ${weightUnit}`)
    .field("Landing Weight:", `${w(data.weights?.est_ldw)} ${weightUnit}`);

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

  b.centered(() =>
    b
      .line("Generated by SimBrief")
      .line("For flight simulation use only")
      .line("NOT FOR REAL WORLD NAVIGATION"),
  ).cut(options?.trailingBlankLines || 3);

  return b.build();
}
