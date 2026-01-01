import { useState } from "react";
import { StepProps, WizardData } from "./const";
import {
  runPrintTest,
} from "../../utils/printerUtils.ts";
import { InformationCircleIcon, XCircleIcon, CheckCircleIcon, PrinterIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface PrinterConfigStepProps extends StepProps {
  wizardData: WizardData;
  cupsPrinters: { name: string; info: string }[];
  onRefreshUsbPrinters: () => Promise<void>;
}

export const PrinterConfigStep = ({
  wizardData,
  setWizardData,
  onNext,
  onBack,
  cupsPrinters,
  onRefreshUsbPrinters,
}: PrinterConfigStepProps) => {
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleIpChange = (value: string) => {
    setWizardData({ ...wizardData, printerIp: value });
  };

  const handlePortChange = (value: string) => {
    setWizardData({ ...wizardData, printerPort: value });
  };

  const handleTrailingLinesChange = (value: number) => {
    setWizardData({ ...wizardData, trailingBlankLines: value });
    setTestResult(null);
  };

  const handlePrinterWidthChange = (value: "58mm" | "80mm") => {
    console.log("handlePrinterWidthChange called with:", value);
    setWizardData({ ...wizardData, printerWidth: value });
    setTestResult(null);
  };

  const handleConnectionTypeChange = (type: "lan" | "usb") => {
    console.log("handleConnectionTypeChange called with:", type);
    setWizardData({ ...wizardData, connectionType: type });
    setTestResult(null);
  };

  const handleRefreshUsbPrinters = async () => {
    setScanning(true);
    setScanError(null);

    try {
      await onRefreshUsbPrinters();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setScanError(`Scan failed: ${errorMsg}`);
    } finally {
      setScanning(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await runPrintTest({
        connectionType: wizardData.connectionType,
        printerIp: wizardData.printerIp,
        printerPort: wizardData.printerPort,
        selectedCupsPrinter: wizardData.selectedCupsPrinter,
        printerWidth: wizardData.printerWidth,
        trailingBlankLines: wizardData.trailingBlankLines,
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const canProceedNext =
        wizardData.connectionType === "lan"
          ? wizardData.printerIp && wizardData.printerPort
          : wizardData.selectedCupsPrinter;
      if (canProceedNext) {
        e.preventDefault();
        onNext();
      }
    }
  };

  const canTest = testing ||
    (wizardData.connectionType === "lan" &&
      (!wizardData.printerIp || !wizardData.printerPort)) ||
    (wizardData.connectionType === "usb" && !wizardData.selectedCupsPrinter);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-2">Printer Setup & Test</h2>
        <p className="text-sm text-base-content mb-6">
          Configure your thermal printer and test connection
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="space-y-6">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Connection Type</legend>
              <div className="join join-vertical w-full">
                <input
                  type="radio"
                  name="connectionType"
                  className="join-item btn"
                  aria-label="LAN"
                  checked={wizardData.connectionType === "lan"}
                  onChange={() => handleConnectionTypeChange("lan")}
                />
                <input
                  type="radio"
                  name="connectionType"
                  className="join-item btn"
                  aria-label="USB"
                  checked={wizardData.connectionType === "usb"}
                  onChange={() => handleConnectionTypeChange("usb")}
                />
              </div>
              <p className="fieldset-label mt-2 text-xs">
                {wizardData.connectionType === "lan"
                  ? "Connect via IP address and port"
                  : "Connect via USB cable (uses system printer management)"}
              </p>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Printer Width</legend>
              <div className="join join-vertical w-full">
                <input
                  type="radio"
                  name="printerWidth"
                  className="join-item btn"
                  aria-label="58mm"
                  checked={wizardData.printerWidth === "58mm"}
                  onChange={() => handlePrinterWidthChange("58mm")}
                />
                <input
                  type="radio"
                  name="printerWidth"
                  className="join-item btn"
                  aria-label="80mm"
                  checked={wizardData.printerWidth === "80mm"}
                  onChange={() => handlePrinterWidthChange("80mm")}
                />
              </div>
              <p className="fieldset-label mt-2 text-xs">
                Check your printer's label or specifications
              </p>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Paper Cutter Position</legend>
              <input
                type="range"
                min="0"
                max="20"
                value={wizardData.trailingBlankLines}
                onChange={(e) =>
                  handleTrailingLinesChange(parseInt(e.target.value, 10))
                }
                className="range range-primary w-full"
              />
              <div className="flex justify-between text-xs text-base-content mt-1">
                <span>Tight</span>
                <span className="font-mono text-base">
                  {wizardData.trailingBlankLines} lines
                </span>
                <span>Loose</span>
              </div>
              <p className="fieldset-label mt-1 text-xs">
                Adjust until paper cuts cleanly at tear bar
              </p>
            </fieldset>
          </div>

          <div className="space-y-6">
            {wizardData.connectionType === "lan" ? (
              <div className="card bg-base-200 border border-base-300 h-full">
                <div className="card-body p-4">
                  <h3 className="font-semibold mb-3">Network Connection</h3>
                  <div className="join w-full">
                    <label className="join-item flex-1">
                      <span className="label pb-0 px-3">
                        <span className="label-text">IP Address</span>
                      </span>
                      <input
                        type="text"
                        placeholder="192.168.1.100"
                        value={wizardData.printerIp}
                        onChange={(e) => handleIpChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="input input-bordered w-full join-item"
                      />
                    </label>
                    <label className="join-item w-28">
                      <span className="label pb-0 px-3">
                        <span className="label-text">Port</span>
                      </span>
                      <input
                        type="text"
                        placeholder="9100"
                        value={wizardData.printerPort}
                        onChange={(e) => handlePortChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="input input-bordered w-full join-item"
                      />
                    </label>
                  </div>
                  <p className="fieldset-label mt-2 text-xs">
                    Find your printer's IP in your router settings or printer menu
                  </p>
                </div>
              </div>
            ) : (
              <div className="card bg-base-200 border border-base-300 h-full">
                <div className="card-body p-4 flex flex-col">
                  <h3 className="font-semibold mb-3">Select Printer</h3>
                  {scanning ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <span className="loading loading-spinner loading-lg mb-3"></span>
                      <p className="text-base-content text-sm">Scanning for printers...</p>
                    </div>
                  ) : scanError ? (
                    <div className="alert alert-error mb-4">
                      <XCircleIcon className="shrink-0 h-5 w-5" />
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-sm">{scanError}</span>
                        <button
                          onClick={handleRefreshUsbPrinters}
                          className="btn btn-xs btn-error btn-ghost"
                          disabled={scanning}
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  ) : cupsPrinters.length > 0 ? (
                    <div>
                      <div className="join join-vertical w-full">
                        {cupsPrinters.map((cp) => (
                          <label
                            key={cp.name}
                            className={`join-item cursor-pointer p-3 border transition-colors ${
                              wizardData.selectedCupsPrinter === cp.name
                                ? "bg-primary border-primary"
                                : "hover:bg-base-300 border-base-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="usbPrinter"
                                value={cp.name}
                                checked={wizardData.selectedCupsPrinter === cp.name}
                                onChange={() =>
                                  setWizardData({
                                    ...wizardData,
                                    selectedCupsPrinter: cp.name,
                                  })
                                }
                                className="radio radio-primary"
                              />
                              <span className="font-semibold flex-1 text-sm">{cp.name}</span>
                              {wizardData.selectedCupsPrinter === cp.name && (
                                <span className="badge badge-success badge-xs">
                                  Selected
                                </span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handleRefreshUsbPrinters}
                          className="btn btn-xs btn-ghost"
                          disabled={scanning}
                        >
                          {scanning ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <>
                              <ArrowPathIcon className="w-3.5 h-3.5 mr-1" />
                              Refresh
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-info mb-4">
                      <InformationCircleIcon className="shrink-0 w-5 h-5" />
                      <div>
                        <h3 className="font-bold text-sm">No printers found</h3>
                        <div className="text-xs">
                          Ensure your printer is connected and installed in your system
                        </div>
                      </div>
                      <button
                        onClick={handleRefreshUsbPrinters}
                        className="btn btn-xs"
                        disabled={scanning}
                      >
                        {scanning ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Scanning...
                          </>
                        ) : (
                          "Scan Again"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="card bg-base-200 border-2 border-dashed border-primary h-fit">
            <div className="card-body p-4 flex flex-col">
              <h3 className="font-semibold mb-3">Test Connection</h3>
              <div className="alert alert-sm mb-4">
                <InformationCircleIcon className="shrink-0 w-5 h-5" />
                <div className="text-sm">
                  Print a test page to verify everything works correctly
                </div>
              </div>

              <button
                className="btn btn-primary w-full"
                onClick={handleTest}
                disabled={canTest}
              >
                {testing ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="ml-2">Printing...</span>
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
                    <CheckCircleIcon className="shrink-0 h-5 w-5" />
                  ) : (
                    <XCircleIcon className="shrink-0 h-5 w-5" />
                  )}
                  <span className="text-sm">{testResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card-actions justify-end mt-6">
          <button className="btn btn-ghost" onClick={onBack}>
            Back
          </button>
          <button
            className="btn btn-primary"
            onClick={onNext}
            disabled={
              (wizardData.connectionType === "lan" &&
                (!wizardData.printerIp || !wizardData.printerPort)) ||
              (wizardData.connectionType === "usb" &&
                !wizardData.selectedCupsPrinter)
            }
          >
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  );
};
