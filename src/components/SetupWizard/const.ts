export type StepId =
  | "welcome"
  | "simbrief"
  | "connection-type"
  | "printer-config"
  | "complete";

export interface WizardStep {
  id: StepId;
  title: string;
  component: React.FC<StepProps>;
}

export interface StepProps {
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
  wizardData: WizardData;
  setWizardData: (data: WizardData) => void;
  canProceed: boolean;
  setCanProceed: (can: boolean) => void;
  cupsPrinters: { name: string; info: string }[];
  onRefreshUsbPrinters: () => Promise<void>;
}

export interface WizardData {
  username: string;
  connectionType: "lan" | "usb";
  printerIp: string;
  printerPort: string;
  cupsPrinters: { name: string; info: string }[];
  selectedCupsPrinter: string;
  usbScanLoading: boolean;
  trailingBlankLines: number;
  printerWidth: "58mm" | "80mm";
}

export const createWizardData = (
  overrides?: Partial<WizardData>
): WizardData => {
  return {
    username: overrides?.username || "",
    connectionType: overrides?.connectionType || "lan",
    printerIp: overrides?.printerIp || "",
    printerPort: overrides?.printerPort || "9100",
    cupsPrinters: overrides?.cupsPrinters || [],
    selectedCupsPrinter: overrides?.selectedCupsPrinter || "",
    usbScanLoading: overrides?.usbScanLoading || false,
    trailingBlankLines: overrides?.trailingBlankLines ?? 3,
    printerWidth: overrides?.printerWidth || "58mm",
  };
};
