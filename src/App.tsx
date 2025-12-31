import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SimbriefResponse } from "./types.ts";
import PrintPreview from "./components/PrintPreview.tsx";
import { formatOFPForThermalPrinter } from "./utils/escposFormatter.ts";

function App() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ofpData, setOfpData] = useState<SimbriefResponse | null>(null);
  const [displayUnits, setDisplayUnits] = useState<"lbs" | "kg">("lbs");
  const [printerIp, setPrinterIp] = useState("10.203.10.197");
  const [printerPort, setPrinterPort] = useState("9100");
  const [printing, setPrinting] = useState(false);
  const [previewData, setPreviewData] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError("Please enter a SimBrief username");
      return;
    }

    setLoading(true);
    setError(null);
    setOfpData(null);

    try {
      // SimBrief API supports CORS, so we can call it directly
      const apiUrl = `https://www.simbrief.com/api/xml.fetcher.php?username=${encodeURIComponent(trimmedUsername)}&json=1`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(
          `API Error: ${response.status} - ${response.statusText}`,
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(
          "Received invalid response from API (not JSON). Check console for details.",
        );
      }

      const data: SimbriefResponse = await response.json();

      if (!data || !data.general) {
        console.error("Invalid OFP data structure:", data);
        throw new Error("No valid OFP data received from SimBrief");
      }

      setOfpData(data);

      // Set default display units based on OFP data
      const originalUnits = data.params?.units === "kgs" ? "kg" : "lbs";
      setDisplayUnits(originalUnits as "lbs" | "kg");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch OFP data");
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate preview when OFP data or display units change
  useEffect(() => {
    if (!ofpData) {
      setPreviewData("");
      return;
    }

    const formattedOutput = formatOFPForThermalPrinter(ofpData, displayUnits, {
      maxWidth: 48, // Standard width for 80mm thermal paper
      includeRoute: true,
      includeWeather: true,
    });

    setPreviewData(formattedOutput);
  }, [ofpData, displayUnits]);

  const handlePrint = async () => {
    if (!previewData) return;

    setPrinting(true);
    setError(null);

    try {
      // Call Tauri backend to print
      const response = await invoke<{ success: boolean; message: string }>(
        "print_to_network",
        {
          request: {
            data: previewData,
            printer_ip: printerIp,
            printer_port: parseInt(printerPort, 10),
          },
        },
      );

      if (response.success) {
        setConnectionStatus({
          type: "success",
          message: "Print job sent successfully!",
        });
        setTimeout(
          () => setConnectionStatus({ type: null, message: "" }),
          5000,
        );
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError("Print failed: " + errorMsg);
      setConnectionStatus({
        type: "error",
        message: "Failed to print: " + errorMsg,
      });
      setTimeout(() => setConnectionStatus({ type: null, message: "" }), 5000);
    } finally {
      setPrinting(false);
    }
  };

  const handleTestConnection = async () => {
    setError(null);
    setConnectionStatus({ type: null, message: "" });

    try {
      const params = {
        printerIp: printerIp,
        printerPort: printerPort ? parseInt(printerPort, 10) : null,
      };

      const response = await invoke<{ success: boolean; message: string }>(
        "test_printer_connection",
        params,
      );

      if (response.success) {
        setConnectionStatus({
          type: "success",
          message: "Connected successfully!",
        });
        setTimeout(
          () => setConnectionStatus({ type: null, message: "" }),
          5000,
        );
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setConnectionStatus({
        type: "error",
        message: errorMsg,
      });
      setTimeout(() => setConnectionStatus({ type: null, message: "" }), 5000);
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <header className="sidebar-header">
          <h1>SimBrief Printer</h1>
        </header>

        <form className="input-section" onSubmit={handleSubmit}>
          <label htmlFor="username">SimBrief Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="fetch-btn">
            {loading ? "Fetching..." : "Fetch Flight Plan"}
          </button>
        </form>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Fetching OFP...</p>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <div className="printer-section">
          <h3>Printer Settings</h3>
          <div className="printer-config">
            <div className="config-row">
              <label htmlFor="printerIp">IP Address</label>
              <input
                type="text"
                id="printerIp"
                placeholder="10.203.10.197"
                value={printerIp}
                onChange={(e) => setPrinterIp(e.target.value)}
              />
            </div>
            <div className="config-row">
              <label htmlFor="printerPort">Port</label>
              <input
                type="text"
                id="printerPort"
                placeholder="9100"
                value={printerPort}
                onChange={(e) => setPrinterPort(e.target.value)}
              />
            </div>
            <button onClick={handleTestConnection} className="test-btn">
              Test Connection
            </button>
            {connectionStatus.type && (
              <div className={`status-message ${connectionStatus.type}`}>
                {connectionStatus.message}
              </div>
            )}
          </div>
        </div>

        {ofpData && (
          <div className="options-section">
            <h3>Options</h3>
            <div className="option-row">
              <label>Units</label>
              <button
                onClick={() =>
                  setDisplayUnits(displayUnits === "lbs" ? "kg" : "lbs")
                }
                className="toggle-btn"
              >
                {displayUnits === "lbs" ? "LBS" : "KG"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="main-content">
        {ofpData ? (
          <PrintPreview
            formattedOutput={previewData}
            onPrint={handlePrint}
            isPrinting={printing}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">✈️</div>
            <h2>No Flight Plan Loaded</h2>
            <p>
              Enter your SimBrief username and fetch a flight plan to get
              started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
