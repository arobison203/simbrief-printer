export interface AppSettings {
  wizardCompleted: boolean;
  username: string;
  connectionType: "lan" | "usb";
  printerIp: string;
  printerPort: string;
  selectedCupsPrinter: string;
  trailingBlankLines: number;
  printerWidth: "58mm" | "80mm";
}

const SETTINGS_KEY = "simbrief-printer-settings";

export const loadSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }

  return {
    wizardCompleted: false,
    username: "",
    connectionType: "lan",
    printerIp: "10.203.10.197",
    printerPort: "9100",
    selectedCupsPrinter: "",
    trailingBlankLines: 3,
    printerWidth: "58mm",
  };
};

export const saveSettings = (settings: Partial<AppSettings>): void => {
  try {
    const currentSettings = loadSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
};

export const resetWizard = (): void => {
  try {
    const currentSettings = loadSettings();
    const updatedSettings = { ...currentSettings, wizardCompleted: false };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
  } catch (error) {
    console.error("Failed to reset wizard:", error);
  }
};

export const clearSettings = (): void => {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error("Failed to clear settings:", error);
  }
};
