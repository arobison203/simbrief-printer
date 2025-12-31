import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SimbriefResponse } from "./types.ts";
import PrintPreview from "./components/PrintPreview.tsx";
import { formatOFPForThermalPrinter } from "./utils/escposFormatter.ts";

type ConnectionType = "lan" | "usb";

type USBDevice = {
  name: string;
  info: string;
};

function App() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ofpData, setOfpData] = useState<SimbriefResponse | null>(null);
  const [displayUnits, setDisplayUnits] = useState<"lbs" | "kg">("lbs");

  // Network printer state (existing)
  const [printerIp, setPrinterIp] = useState("10.203.10.197");
  const [printerPort, setPrinterPort] = useState("9100");

  // Connection type (new)
  const [connectionType, setConnectionType] = useState<ConnectionType>("lan");

  // USB state (new)
  const [usbDevices, setUsbDevices] = useState<USBDevice[]>([]);
  const [usbScanLoading, setUsbScanLoading] = useState(false);
  const [selectedUsbDevice, setSelectedUsbDevice] = useState<string>(""); // device path or hint
  const [manualUsbPath, setManualUsbPath] = useState<string>(""); // manual override
  const [detectedDevicePaths, setDetectedDevicePaths] = useState<string[]>([]);

  const [printing, setPrinting] = useState(false);
  const [previewData, setPreviewData] = useState<string>("");
  const [testingConnection, setTestingConnection] = useState(false);
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
      const apiUrl = `https://www.simbrief.com/api/xml.fetcher.php?username=${encodeURIComponent(
        trimmedUsername,
      )}&json=1`;

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
      if (connectionType === "lan") {
        // Call Tauri backend to print to network
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
            message: "Print job sent successfully (LAN)!",
          });
          setTimeout(
            () => setConnectionStatus({ type: null, message: "" }),
            5000,
          );
        }
      } else {
        // USB path - prefer selectedUsbDevice, then manualUsbPath
        const device = selectedUsbDevice || manualUsbPath;
        if (!device) {
          throw new Error("No USB device selected or entered.");
        }

        // Call Tauri backend to print to USB device
        const response = await invoke<{ success: boolean; message: string }>(
          "print_to_usb",
          {
            request: {
              device_path: device,
              data: previewData,
            },
          },
        );

        if (response.success) {
          setConnectionStatus({
            type: "success",
            message: `Print job sent successfully to USB device ${device}!`,
          });
          setTimeout(
            () => setConnectionStatus({ type: null, message: "" }),
            5000,
          );
        }
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
    setTestingConnection(true);

    try {
      if (connectionType === "lan") {
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
            message: "Connected successfully (LAN)!",
          });
          setTimeout(
            () => setConnectionStatus({ type: null, message: "" }),
            5000,
          );
        }
      } else {
        const device = selectedUsbDevice || manualUsbPath;
        if (!device) {
          throw new Error("No USB device selected or entered.");
        }

        const response = await invoke<{ success: boolean; message: string }>(
          "test_usb_connection",
          {
            request: {
              device_path: device,
            },
          },
        );

        if (response.success) {
          setConnectionStatus({
            type: "success",
            message: `Successfully opened USB device ${device}!`,
          });
          setTimeout(
            () => setConnectionStatus({ type: null, message: "" }),
            5000,
          );
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setConnectionStatus({
        type: "error",
        message: errorMsg,
      });
      setTimeout(() => setConnectionStatus({ type: null, message: "" }), 5000);
    } finally {
      setTestingConnection(false);
    }
  };

  // USB device discovery
  const scanUsbDevices = async () => {
    setUsbScanLoading(true);
    setUsbDevices([]);
    setDetectedDevicePaths([]);
    setSelectedUsbDevice("");
    setManualUsbPath("");

    try {
      // list_usb_devices returns an array of objects { name, info } (info may be a raw JSON string)
      const result = await invoke<any[]>("list_usb_devices");

      if (!Array.isArray(result) || result.length === 0) {
        setError("No USB device information returned from backend.");
        return;
      }

      // Normalize devices
      const devices: USBDevice[] = result.map((item) => {
        if (typeof item === "string") {
          return {
            name: item,
            info: item,
          };
        }

        // item likely has { name, info }
        return {
          name: item.name || JSON.stringify(item).slice(0, 80),
          info:
            typeof item.info === "string"
              ? item.info
              : JSON.stringify(item.info),
        };
      });

      setUsbDevices(devices);

      // Try to extract likely device node paths from returned info strings (heuristic)
      const allInfo = devices.map((d) => d.info).join("\n");
      const paths = extractDevicePathsFromText(allInfo);
      setDetectedDevicePaths(paths);

      // If we detected any device path, auto-select the first one
      if (paths.length > 0) {
        setSelectedUsbDevice(paths[0]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError("Failed to list USB devices: " + errorMsg);
    } finally {
      setUsbScanLoading(false);
    }
  };

  // Heuristic: search for /dev/cu.* and /dev/tty.* and \\.\COM\d+ patterns inside text
  function extractDevicePathsFromText(text: string): string[] {
    const found = new Set<string>();

    try {
      const devRegex = /\/dev\/[A-Za-z0-9._-]+/g;
      const windowsComRegex = /\\\\\\.\\\\COM\\d+|COM\\d+/g; // try to catch COM patterns
      let match;
      while ((match = devRegex.exec(text))) {
        found.add(match[0]);
      }
      while ((match = windowsComRegex.exec(text))) {
        // normalize: if '\\\\.\\COM3' style appears escaped in JSON it might be '\\\\\\\\.\\\\COM3'
        const raw = match[0];
        // If it's just 'COM3' convert to '\\\\.\\COM3'
        if (/^COM\d+$/i.test(raw)) {
          found.add(`\\\\.\\${raw}`);
        } else {
          found.add(raw.replace(/\\\\/g, "\\"));
        }
      }
    } catch (e) {
      // ignore extraction errors
    }

    return Array.from(found);
  }

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
          {error && <div className="global-error">{error}</div>}
        </form>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Fetching OFP...</p>
          </div>
        )}

        <div className="printer-section">
          <h3>Printer Settings</h3>
          <div className="printer-config">
            <div className="config-row">
              <label>Connection Type</label>
              <div className="radio-row">
                <label>
                  <input
                    type="radio"
                    name="connectionType"
                    value="lan"
                    checked={connectionType === "lan"}
                    onChange={() => setConnectionType("lan")}
                  />
                  LAN
                </label>
                <label>
                  <input
                    type="radio"
                    name="connectionType"
                    value="usb"
                    checked={connectionType === "usb"}
                    onChange={() => setConnectionType("usb")}
                  />
                  USB
                </label>
              </div>
            </div>

            {connectionType === "lan" ? (
              <>
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
              </>
            ) : (
              <>
                <div className="config-row config-row--stack align-left">
                  <label>USB Devices</label>
                  <div className="usb-actions">
                    <button
                      onClick={scanUsbDevices}
                      className="scan-btn"
                      disabled={usbScanLoading}
                    >
                      {usbScanLoading ? "Scanning..." : "Find USB devices"}
                    </button>
                    <button
                      onClick={() => {
                        setUsbDevices([]);
                        setDetectedDevicePaths([]);
                        setSelectedUsbDevice("");
                        setManualUsbPath("");
                      }}
                      className="clear-btn"
                      disabled={usbScanLoading}
                    >
                      Clear
                    </button>
                  </div>

                  {usbDevices.length > 0 && (
                    <div className="usb-results">
                      <p className="small-note">
                        Found USB info. You can pick a detected device node
                        below or enter one manually (e.g.{" "}
                        <code>/dev/cu.usbserial-XXXX</code>).
                      </p>

                      {detectedDevicePaths.length > 0 && (
                        <div className="detected-paths">
                          <label>Detected device paths</label>
                          <ul>
                            {detectedDevicePaths.map((p) => (
                              <li key={p}>
                                <label>
                                  <input
                                    type="radio"
                                    name="usbDevice"
                                    value={p}
                                    checked={selectedUsbDevice === p}
                                    onChange={() => {
                                      setSelectedUsbDevice(p);
                                      setManualUsbPath("");
                                    }}
                                  />
                                  <span className="device-path">{p}</span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="raw-usb-info">
                        <label>Raw USB info</label>
                        <div className="usb-info-box">
                          {usbDevices.map((d, idx) => (
                            <details key={idx} style={{ marginBottom: 8 }}>
                              <summary>{d.name}</summary>
                              <pre style={{ maxHeight: 160, overflow: "auto" }}>
                                {d.info}
                              </pre>
                            </details>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className="config-row config-row--stack align-left"
                    style={{ marginTop: 8 }}
                  >
                    <label htmlFor="manualUsbPath">
                      Manual USB Device Path
                    </label>
                    <input
                      type="text"
                      id="manualUsbPath"
                      placeholder="/dev/cu.usbserial-XXXX or \\\\.\\COM3"
                      value={manualUsbPath}
                      onChange={(e) => {
                        setManualUsbPath(e.target.value);
                        if (e.target.value) setSelectedUsbDevice("");
                      }}
                    />
                    <div className="small-note">
                      If auto-detect didn't find a path, enter it here.
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              onClick={handleTestConnection}
              className="test-btn"
              disabled={testingConnection}
            >
              {testingConnection ? "Testing..." : "Test Connection"}
            </button>

            {connectionStatus.type && (
              <div
                className={`connection-status connection-status--${connectionStatus.type}`}
              >
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
