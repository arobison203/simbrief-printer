import { SimbriefResponse } from "../types.ts";

interface OFPDisplayProps {
  data: SimbriefResponse;
  displayUnits: "lbs" | "kg";
}

function OFPDisplay({ data, displayUnits }: OFPDisplayProps) {
  const general = data.general || {};
  const origin = data.origin || {};
  const destination = data.destination || {};
  const alternate = data.alternate || {};
  const fuel = data.fuel || {};
  const weights = data.weights || {};
  const times = data.times || {};
  const aircraft = data.aircraft || {};
  const params = data.params || {};

  // Determine original units from the OFP data
  const originalUnits = params.units === "kgs" ? "kg" : "lbs";

  // Safely convert any value to string for rendering
  const toStr = (val: any): string => {
    if (val === null || val === undefined) return "N/A";
    if (typeof val === "string") return val;
    if (typeof val === "number") return String(val);
    if (typeof val === "object") return "N/A";
    return String(val);
  };

  // Convert weight value based on display preference
  const convertWeight = (value: string | undefined): string => {
    if (!value) return "N/A";
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "N/A";

    // If original and display units match, no conversion needed
    if (originalUnits === displayUnits) {
      return Math.round(numValue).toString();
    }

    // Convert between units
    let converted: number;
    if (originalUnits === "lbs" && displayUnits === "kg") {
      // lbs to kg: divide by 2.20462
      converted = numValue / 2.20462;
    } else {
      // kg to lbs: multiply by 2.20462
      converted = numValue * 2.20462;
    }

    return Math.round(converted).toString();
  };

  // Format altitude properly (convert to flight level if >= 18000)
  const formatAltitude = (altitude: string | undefined): string => {
    if (!altitude) return "N/A";
    const alt = parseInt(altitude, 10);
    if (isNaN(alt)) return "N/A";

    if (alt >= 18000) {
      // Convert to flight level (divide by 100)
      return `FL${Math.floor(alt / 100)}`;
    } else {
      // Below transition altitude, show in feet
      return `${alt} ft`;
    }
  };

  const formatTime = (seconds: string | undefined): string => {
    if (!seconds) return "N/A";
    const numSeconds = parseInt(seconds, 10);
    if (isNaN(numSeconds)) return "N/A";

    const hours = Math.floor(numSeconds / 3600);
    const minutes = Math.floor((numSeconds % 3600) / 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const formatRoute = (route: string | undefined): string => {
    if (!route) return "N/A";
    const words = route.split(" ");
    let formatted = "";
    let lineLength = 0;

    words.forEach((word) => {
      if (lineLength + word.length > 35) {
        formatted += "\n" + word + " ";
        lineLength = word.length + 1;
      } else {
        formatted += word + " ";
        lineLength += word.length + 1;
      }
    });

    return formatted.trim();
  };

  return (
    <>
      <div className="ofp-header">OPERATIONAL FLIGHT PLAN</div>

      <div className="ofp-section">
        <div className="ofp-title">FLIGHT INFORMATION</div>
        {general.icao_airline &&
          typeof general.icao_airline === "string" &&
          general.icao_airline.trim() !== "" && (
            <div className="ofp-row">
              <span className="ofp-label">Flight:</span>
              <span className="ofp-value">
                {toStr(general.icao_airline)}
                {toStr(general.flight_number)}
              </span>
            </div>
          )}
        <div className="ofp-row">
          <span className="ofp-label">Aircraft:</span>
          <span className="ofp-value">{toStr(aircraft.name)}</span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Registration:</span>
          <span className="ofp-value">{toStr(aircraft.reg)}</span>
        </div>
      </div>

      <div className="ofp-section">
        <div className="ofp-title">ROUTING</div>
        <div className="ofp-row">
          <span className="ofp-label">From:</span>
          <span className="ofp-value">
            {toStr(origin.icao_code)} - {toStr(origin.name)}
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">To:</span>
          <span className="ofp-value">
            {toStr(destination.icao_code)} - {toStr(destination.name)}
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Alternate:</span>
          <span className="ofp-value">
            {toStr(alternate.icao_code)} - {toStr(alternate.name)}
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Distance:</span>
          <span className="ofp-value">{toStr(general.route_distance)} NM</span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Flight Time:</span>
          <span className="ofp-value">
            {formatTime(times.est_time_enroute)}
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Altitude:</span>
          <span className="ofp-value">
            {formatAltitude(general.initial_altitude)}
          </span>
        </div>
      </div>

      <div className="ofp-section">
        <div className="ofp-title">ROUTE</div>
        <div className="ofp-route">{formatRoute(general.route)}</div>
      </div>

      <div className="ofp-section">
        <div className="ofp-title">FUEL PLAN</div>
        <div className="ofp-row">
          <span className="ofp-label">Trip Fuel:</span>
          <span className="ofp-value">
            {convertWeight(fuel.enroute_burn)} {displayUnits}
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Taxi Fuel:</span>
          <span className="ofp-value">
            {convertWeight(fuel.taxi)} {displayUnits}
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Contingency:</span>
          <span className="ofp-value">
            {convertWeight(fuel.contingency)} {displayUnits}
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Alternate:</span>
          <span className="ofp-value">
            {convertWeight(fuel.alternate_burn)} {displayUnits}
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Reserve:</span>
          <span className="ofp-value">
            {convertWeight(fuel.reserve)} {displayUnits}
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Extra:</span>
          <span className="ofp-value">
            {convertWeight(fuel.extra)} {displayUnits}
          </span>
        </div>
        <div className="ofp-divider"></div>
        <div className="ofp-row">
          <span className="ofp-label">Min T/O Fuel:</span>
          <span className="ofp-value">
            {convertWeight(fuel.min_takeoff)} {displayUnits}
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">
            <strong>Plan T/O Fuel:</strong>
          </span>
          <span className="ofp-value">
            <strong>
              {convertWeight(fuel.plan_takeoff)} {displayUnits}
            </strong>
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Plan Ramp:</span>
          <span className="ofp-value">
            {convertWeight(fuel.plan_ramp)} {displayUnits}
          </span>
        </div>
      </div>

      <div className="ofp-section">
        <div className="ofp-title">WEIGHTS & LOAD</div>
        <div className="ofp-row">
          <span className="ofp-label">OEW:</span>
          <span className="ofp-value">
            {convertWeight(weights.oew)} {displayUnits}
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Payload:</span>
          <span className="ofp-value">
            {convertWeight(weights.payload)} {displayUnits}
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Passengers:</span>
          <span className="ofp-value">{toStr(weights.pax_count) || "0"}</span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Cargo:</span>
          <span className="ofp-value">
            {convertWeight(weights.cargo)} {displayUnits}
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">ZFW:</span>
          <span className="ofp-value">
            {convertWeight(weights.est_zfw)} {displayUnits}
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">TOW:</span>
          <span className="ofp-value">
            {convertWeight(weights.est_tow)} {displayUnits}
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">LDW:</span>
          <span className="ofp-value">
            {convertWeight(weights.est_ldw)} {displayUnits}
          </span>
        </div>
      </div>

      <div className="ofp-section">
        <div className="ofp-title">WEATHER</div>
        <div className="ofp-row">
          <span className="ofp-label">Origin METAR:</span>
        </div>
        <div className="ofp-weather">{toStr(origin.metar)}</div>

        {origin.taf && (
          <>
            <div className="ofp-row" style={{ marginTop: "10px" }}>
              <span className="ofp-label">Origin TAF:</span>
            </div>
            <div className="ofp-weather">{toStr(origin.taf)}</div>
          </>
        )}

        <div className="ofp-row" style={{ marginTop: "10px" }}>
          <span className="ofp-label">Destination METAR:</span>
        </div>
        <div className="ofp-weather">{toStr(destination.metar)}</div>

        {destination.taf && (
          <>
            <div className="ofp-row" style={{ marginTop: "10px" }}>
              <span className="ofp-label">Destination TAF:</span>
            </div>
            <div className="ofp-weather">{toStr(destination.taf)}</div>
          </>
        )}

        {alternate.metar && (
          <>
            <div className="ofp-row" style={{ marginTop: "10px" }}>
              <span className="ofp-label">Alternate METAR:</span>
            </div>
            <div className="ofp-weather">{toStr(alternate.metar)}</div>
          </>
        )}

        {alternate.taf && (
          <>
            <div className="ofp-row" style={{ marginTop: "10px" }}>
              <span className="ofp-label">Alternate TAF:</span>
            </div>
            <div className="ofp-weather">{toStr(alternate.taf)}</div>
          </>
        )}
      </div>

      <div className="ofp-section">
        <div className="ofp-title">PERFORMANCE</div>
        <div className="ofp-row">
          <span className="ofp-label">Cruise Speed:</span>
          <span className="ofp-value">M{toStr(general.cruise_mach)}</span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Avg Wind:</span>
          <span className="ofp-value">
            {toStr(general.avg_wind_dir)}° / {toStr(general.avg_wind_spd)} kts
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Avg Temp Dev:</span>
          <span className="ofp-value">{toStr(general.avg_temp_dev)}°C</span>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "20px", fontSize: "10px" }}>
        Generated by SimBrief
      </div>
    </>
  );
}

export default OFPDisplay;
