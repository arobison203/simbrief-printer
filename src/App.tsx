import { useState, useEffect, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SimbriefResponse } from "./types.ts";
import { PrintPreview } from "./components/PrintPreview.tsx";
import { formatOFPForThermalPrinter } from "./utils/simbriefFormatter.ts";
import { SetupWizard } from "./components/SetupWizard/index.tsx";
import { WizardData } from "./components/SetupWizard/const.ts";
import {
  loadSettings,
  saveSettings,
  clearSettings,
  AppSettings,
} from "./utils/storage.ts";
import { SettingsPanel } from "./components/SettingsPanel.tsx";
import { UserIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { fetchSystemPrinters } from "./utils/printerUtils.ts";

type ConnectionType = "lan" | "usb";

export const App = () => {
  const [showWizard, setShowWizard] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
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

  // Trailing blank lines for paper feed
  const [trailingBlankLines, setTrailingBlankLines] = useState(3);

  // Printer width (58mm or 80mm)
  const [printerWidth, setPrinterWidth] = useState<"58mm" | "80mm">("58mm");

  const [printing, setPrinting] = useState(false);
  const [previewData, setPreviewData] = useState<string>("");
  const [selectedCupsPrinter, setSelectedCupsPrinter] = useState<string>("");
  const [printError, setPrintError] = useState<string | null>(null);
  const [refetching, setRefetching] = useState(false);
  const [cupsPrinters, setCupsPrinters] = useState<
    { name: string; info: string }[]
  >([]);

  const settings = useMemo(() => loadSettings(), []);

  // Load settings on mount
  useEffect(() => {
    setShowWizard(!settings.wizardCompleted);
    setUsername(settings.username);
    setConnectionType(settings.connectionType);
    setPrinterIp(settings.printerIp);
    setPrinterPort(settings.printerPort);
    setSelectedCupsPrinter(settings.selectedCupsPrinter);
    setTrailingBlankLines(settings.trailingBlankLines);
    setPrinterWidth(settings.printerWidth);
  }, [settings]);

  // Fetch USB printers on mount
  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const printers = await fetchSystemPrinters();
        setCupsPrinters(printers);
      } catch (err) {
        console.error("Failed to fetch USB printers:", err);
      }
    };

    fetchPrinters();
  }, []);

  const fetchFlightPlan = async (isRefetch: boolean = false) => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError("Please enter a SimBrief username");
      return;
    }

    if (isRefetch) {
      setRefetching(true);
    } else {
      setLoading(true);
    }
    setError(null);
    setOfpData(null);
    setPreviewData("");

    try {
      const apiUrl = `https://www.simbrief.com/api/xml.fetcher.php?username=${encodeURIComponent(
        trimmedUsername,
      )}&json=1`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch: ${response.status} ${response.statusText}`,
        );
      }

      const text = await response.text();

      if (text.includes("Error") || text.includes("error")) {
        setError("SimBrief API error or no flight plan found");
        return;
      }

      const data = JSON.parse(text) as SimbriefResponse;

      if (data.fetch?.status !== "Success") {
        setError(data.fetch?.status || "Failed to fetch SimBrief flight plan");
        return;
      }

      const originalUnits = data.params?.units || "lbs";

      if (originalUnits === "kgs") {
        setDisplayUnits("kg");
      } else {
        setDisplayUnits("lbs");
      }

      setOfpData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      if (isRefetch) {
        setRefetching(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchFlightPlan(false);
  };

  const handleRefetch = async () => {
    await fetchFlightPlan(true);
  };

  useEffect(() => {
    if (ofpData) {
      const formattedOutput = formatOFPForThermalPrinter(
        ofpData,
        displayUnits,
        {
          maxWidth: printerWidth === "58mm" ? 32 : 48,
          includeRoute: true,
          includeWeather: true,
          trailingBlankLines,
        },
      );
      setPreviewData(formattedOutput);
    }
  }, [ofpData, displayUnits, trailingBlankLines, printerWidth]);

  const handlePrint = async () => {
    if (!previewData) return;

    setPrinting(true);
    setPrintError(null);

    try {
      if (connectionType === "lan") {
        const response = await invoke<{
          success: boolean;
          message: string;
        }>("print_to_network", {
          request: {
            data: previewData,
            printer_ip: printerIp,
            printer_port: parseInt(printerPort, 10),
          },
        });

        if (!response.success) {
          throw new Error(response.message || "Failed to print");
        }
      } else {
        if (!selectedCupsPrinter) {
          throw new Error("No USB printer configured");
        }

        const response = await invoke<{ success: boolean; message: string }>(
          "print_to_system_printer",
          {
            printerName: selectedCupsPrinter,
            data: previewData,
          },
        );

        if (!response.success) {
          throw new Error(response.message || "Failed to print");
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Print failed:", errorMsg);
      setPrintError(errorMsg || "Failed to print");
    } finally {
      setPrinting(false);
    }
  };

  const handleWizardComplete = (data: WizardData) => {
    saveSettings({
      wizardCompleted: true,
      username: data.username,
      connectionType: data.connectionType,
      printerIp: data.printerIp,
      printerPort: data.printerPort,
      selectedCupsPrinter: data.selectedCupsPrinter,
      trailingBlankLines: data.trailingBlankLines,
      printerWidth: data.printerWidth,
    });
    setUsername(data.username);
    setConnectionType(data.connectionType);
    setPrinterIp(data.printerIp);
    setPrinterPort(data.printerPort);
    setSelectedCupsPrinter(data.selectedCupsPrinter);
    setTrailingBlankLines(data.trailingBlankLines);
    setPrinterWidth(data.printerWidth);
    setShowWizard(false);
  };

  const handleSettingsSave = (newSettings: Partial<AppSettings>) => {
    const currentSettings = loadSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    saveSettings(updatedSettings);

    if (newSettings.username !== undefined) {
      setUsername(newSettings.username);
    }
    if (newSettings.connectionType !== undefined) {
      setConnectionType(newSettings.connectionType);
    }
    if (newSettings.printerIp !== undefined) {
      setPrinterIp(newSettings.printerIp);
    }
    if (newSettings.printerPort !== undefined) {
      setPrinterPort(newSettings.printerPort);
    }
    if (newSettings.selectedCupsPrinter !== undefined) {
      setSelectedCupsPrinter(newSettings.selectedCupsPrinter);
    }
    if (newSettings.trailingBlankLines !== undefined) {
      setTrailingBlankLines(newSettings.trailingBlankLines);
    }
    if (newSettings.printerWidth !== undefined) {
      setPrinterWidth(newSettings.printerWidth);
    }
  };

  const handleRerunWizard = () => {
    clearSettings();
    setShowWizard(true);
    setShowSettings(false);
  };

  if (showWizard) {
    return (
      <SetupWizard
        onComplete={handleWizardComplete}
        initialData={settings}
        cupsPrinters={cupsPrinters}
        onRefreshUsbPrinters={async () => {
          try {
            const printers = await fetchSystemPrinters();
            setCupsPrinters(printers);
          } catch (err) {
            console.error("Failed to refresh USB printers:", err);
          }
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen bg-base-200 flex-col">
      {/* Top Bar */}
      <header className="bg-base-100 border-b border-base-300 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {username && (
            <div className="flex items-center gap-2 text-sm text-base-content">
              <UserIcon className="w-4 h-4" />
              <span>{username}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {ofpData && (
            <button
              onClick={() =>
                setDisplayUnits(displayUnits === "lbs" ? "kg" : "lbs")
              }
              className="btn btn-sm btn-outline"
            >
              {displayUnits === "lbs" ? "Switch to KG" : "Switch to LBS"}
            </button>
          )}
          <button
            className="btn btn-sm btn-ghost btn-circle"
            onClick={() => setShowSettings(true)}
            title="Open Settings"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-base-200 overflow-hidden">
        {previewData ? (
          <PrintPreview
            formattedOutput={previewData}
            onPrint={handlePrint}
            isPrinting={printing}
            onRefetch={handleRefetch}
            isRefetching={refetching}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-md">
              <div className="text-6xl">✈️</div>
              <h2 className="text-xl font-semibold text-base-content">
                No Flight Plan Loaded
              </h2>
              <p className="text-sm text-base-content">
                Click below to fetch your latest SimBrief flight plan
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Fetching...
                    </>
                  ) : (
                    "Fetch Flight Plan"
                  )}
                </button>
                {error && (
                  <div className="alert alert-error">
                    <span>{error}</span>
                  </div>
                )}
              </form>
              {printError && (
                <div className="alert alert-error">
                  <span>{printError}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={handleSettingsSave}
          onRerunWizard={handleRerunWizard}
          cupsPrinters={cupsPrinters}
          onRefreshUsbPrinters={async () => {
            try {
              const printers = await fetchSystemPrinters();
              setCupsPrinters(printers);
            } catch (err) {
              console.error("Failed to refresh USB printers:", err);
            }
          }}
        />
      )}
    </div>
  );
};
