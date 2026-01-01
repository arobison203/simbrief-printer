import { useState } from "react";
import { AppSettings } from "../utils/storage.ts";
import { runPrintTest } from "../utils/printerUtils.ts";
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";

interface SettingsPanelProps {
  settings: AppSettings;
  onClose: () => void;
  onSave: (settings: Partial<AppSettings>) => void;
  onRerunWizard: () => void;
  cupsPrinters: { name: string; info: string }[];
  onRefreshUsbPrinters: () => Promise<void>;
}

export const SettingsPanel = ({
  settings,
  onClose,
  onSave,
  onRerunWizard,
  cupsPrinters,
  onRefreshUsbPrinters,
}: SettingsPanelProps) => {
  const [tempSettings, setTempSettings] = useState<AppSettings>({
    ...settings,
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSave = () => {
    onSave(tempSettings);
    onClose();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await runPrintTest({
        connectionType: tempSettings.connectionType,
        printerIp: tempSettings.printerIp,
        printerPort: tempSettings.printerPort,
        selectedCupsPrinter: tempSettings.selectedCupsPrinter,
        printerWidth: tempSettings.printerWidth,
        trailingBlankLines: tempSettings.trailingBlankLines,
      });

      if (response.success) {
        setTestResult({
          type: "success",
          message: "Test page printed successfully!",
        });
      } else {
        setTestResult({ type: "error", message: response.message });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setTestResult({
        type: "error",
        message: errorMsg || "Failed to print test page",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleRefreshUsbPrinters = async () => {
    await onRefreshUsbPrinters();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="font-bold text-lg">SimBrief</h3>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Username</legend>
              <input
                type="text"
                value={tempSettings.username}
                onChange={(e) =>
                  setTempSettings({ ...tempSettings, username: e.target.value })
                }
                className="input input-bordered w-full"
              />
            </fieldset>

            <h3 className="font-bold text-lg pt-4">Printer</h3>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Connection Type</legend>
              <div className="join">
                <input
                  type="radio"
                  name="connectionType"
                  className="join-item btn btn-sm"
                  aria-label="LAN"
                  checked={tempSettings.connectionType === "lan"}
                  onChange={() =>
                    setTempSettings({ ...tempSettings, connectionType: "lan" })
                  }
                />
                <input
                  type="radio"
                  name="connectionType"
                  className="join-item btn btn-sm"
                  aria-label="USB"
                  checked={tempSettings.connectionType === "usb"}
                  onChange={() => {
                    setTempSettings({ ...tempSettings, connectionType: "usb" });
                  }}
                />
              </div>
            </fieldset>

            {tempSettings.connectionType === "lan" ? (
              <>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Printer IP</legend>
                  <input
                    type="text"
                    value={tempSettings.printerIp}
                    onChange={(e) =>
                      setTempSettings({
                        ...tempSettings,
                        printerIp: e.target.value,
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Port</legend>
                  <input
                    type="text"
                    value={tempSettings.printerPort}
                    onChange={(e) =>
                      setTempSettings({
                        ...tempSettings,
                        printerPort: e.target.value,
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </fieldset>
              </>
            ) : (
              <>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">USB Printer</legend>
                  <div className="flex items-center gap-2">
                    <select
                      value={tempSettings.selectedCupsPrinter}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          selectedCupsPrinter: e.target.value,
                        })
                      }
                      className="select select-bordered flex-1"
                    >
                      <option value="">Select a printer...</option>
                      {cupsPrinters.map((cp) => (
                        <option key={cp.name} value={cp.name}>
                          {cp.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleRefreshUsbPrinters}
                      className="btn btn-ghost btn-sm"
                    >
                      ↻
                    </button>
                  </div>
                </fieldset>
              </>
            )}

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Printer Width</legend>
              <div className="join">
                <input
                  type="radio"
                  name="printerWidth"
                  className="join-item btn btn-sm"
                  aria-label="58mm"
                  checked={tempSettings.printerWidth === "58mm"}
                  onChange={() =>
                    setTempSettings({ ...tempSettings, printerWidth: "58mm" })
                  }
                />
                <input
                  type="radio"
                  name="printerWidth"
                  className="join-item btn btn-sm"
                  aria-label="80mm"
                  checked={tempSettings.printerWidth === "80mm"}
                  onChange={() =>
                    setTempSettings({ ...tempSettings, printerWidth: "80mm" })
                  }
                />
              </div>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Paper Cutter Position</legend>
              <input
                type="range"
                min="0"
                max="20"
                value={tempSettings.trailingBlankLines}
                onChange={(e) =>
                  setTempSettings({
                    ...tempSettings,
                    trailingBlankLines: parseInt(e.target.value, 10),
                  })
                }
                className="range range-primary w-full"
              />
              <div className="flex justify-between text-xs text-base-content mt-1">
                <span>Short</span>
                <span className="font-mono">
                  {tempSettings.trailingBlankLines} lines
                </span>
                <span>Long</span>
              </div>
              <p className="fieldset-label">
                Adjust until paper cuts cleanly at tear bar
              </p>
            </fieldset>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">Test Print</h3>
            <div className="alert alert-sm">
              <InformationCircleIcon className="shrink-0 w-5 h-5" />
              <div className="text-sm">
                Print a test page to verify everything works correctly
              </div>
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={handleTest}
              disabled={testing}
            >
              {testing ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Printing...
                </>
              ) : (
                <>
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  Print Test Page
                </>
              )}
            </button>

            {testResult && (
              <div
                role="alert"
                className={`alert ${
                  testResult.type === "success"
                    ? "alert-success"
                    : "alert-error"
                }`}
              >
                {testResult.type === "success" ? (
                  <CheckCircleIcon className="shrink-0 w-5 h-5" />
                ) : (
                  <XCircleIcon className="shrink-0 w-5 h-5" />
                )}
                <span className="text-sm">{testResult.message}</span>
              </div>
            )}

            <div className="divider"></div>

            <h3 className="font-bold text-lg">Actions</h3>
            <div className="alert alert-warning">
              <ExclamationTriangleIcon className="shrink-0 w-5 h-5" />
              <div className="text-sm">
                Rerunning the wizard will clear all settings and start fresh
              </div>
            </div>

            <button
              className="btn btn-error btn-outline w-full"
              onClick={onRerunWizard}
            >
              Rerun Setup Wizard
            </button>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};
