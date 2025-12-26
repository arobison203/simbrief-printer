import { SimbriefResponse } from "../types.ts";

interface OFPDisplayProps {
  data: SimbriefResponse;
}

function OFPDisplay({ data }: OFPDisplayProps) {
  const general = data.general || {};
  const origin = data.origin || {};
  const destination = data.destination || {};
  const alternate = data.alternate || {};
  const fuel = data.fuel || {};
  const weights = data.weights || {};
  const times = data.times || {};
  const aircraft = data.aircraft || {};

  // Safely convert any value to string for rendering
  const toStr = (val: any): string => {
    if (val === null || val === undefined) return "N/A";
    if (typeof val === "string") return val;
    if (typeof val === "number") return String(val);
    if (typeof val === "object") return "N/A";
    return String(val);
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
        <div className="ofp-row">
          <span className="ofp-label">Flight:</span>
          <span className="ofp-value">
            {toStr(general.icao_airline) || "---"}
            {toStr(general.flight_number) || "---"}
          </span>
        </div>
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
          <span className="ofp-value">FL{toStr(general.initial_altitude)}</span>
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
          <span className="ofp-value">{toStr(fuel.enroute_burn)} lbs</span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Taxi Fuel:</span>
          <span className="ofp-value">{toStr(fuel.taxi)} lbs</span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Contingency:</span>
          <span className="ofp-value">{toStr(fuel.contingency)} lbs</span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Alternate:</span>
          <span className="ofp-value">{toStr(fuel.alternate_burn)} lbs</span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Reserve:</span>
          <span className="ofp-value">{toStr(fuel.reserve)} lbs</span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Extra:</span>
          <span className="ofp-value">{toStr(fuel.extra)} lbs</span>
        </div>
        <div className="ofp-divider"></div>
        <div className="ofp-row">
          <span className="ofp-label">Min T/O Fuel:</span>
          <span className="ofp-value">{toStr(fuel.min_takeoff)} lbs</span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">
            <strong>Plan T/O Fuel:</strong>
          </span>
          <span className="ofp-value">
            <strong>{toStr(fuel.plan_takeoff)} lbs</strong>
          </span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Plan Ramp:</span>
          <span className="ofp-value">{toStr(fuel.plan_ramp)} lbs</span>
        </div>
      </div>

      <div className="ofp-section">
        <div className="ofp-title">WEIGHTS & LOAD</div>
        <div className="ofp-row">
          <span className="ofp-label">OEW:</span>
          <span className="ofp-value">{toStr(weights.oew)} lbs</span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Payload:</span>
          <span className="ofp-value">{toStr(weights.payload)} lbs</span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Passengers:</span>
          <span className="ofp-value">{toStr(weights.pax_count) || "0"}</span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">Cargo:</span>
          <span className="ofp-value">{toStr(weights.cargo)} lbs</span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">ZFW:</span>
          <span className="ofp-value">{toStr(weights.est_zfw)} lbs</span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">TOW:</span>
          <span className="ofp-value">{toStr(weights.est_tow)} lbs</span>
        </div>
        <div className="ofp-row">
          <span className="ofp-label">LDW:</span>
          <span className="ofp-value">{toStr(weights.est_ldw)} lbs</span>
        </div>
      </div>

      <div className="ofp-section">
        <div className="ofp-title">WEATHER</div>
        <div className="ofp-row">
          <span className="ofp-label">Origin METAR:</span>
        </div>
        <div className="ofp-weather">{toStr(origin.metar)}</div>

        <div className="ofp-row" style={{ marginTop: "10px" }}>
          <span className="ofp-label">Destination METAR:</span>
        </div>
        <div className="ofp-weather">{toStr(destination.metar)}</div>

        {alternate.metar && (
          <>
            <div className="ofp-row" style={{ marginTop: "10px" }}>
              <span className="ofp-label">Alternate METAR:</span>
            </div>
            <div className="ofp-weather">{toStr(alternate.metar)}</div>
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
