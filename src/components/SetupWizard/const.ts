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
