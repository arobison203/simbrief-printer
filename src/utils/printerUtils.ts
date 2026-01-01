import { invoke } from "@tauri-apps/api/core";
import { ReceiptBuilder } from "./escposFormatter.ts";

export interface PrintResult {
  success: boolean;
  message: string;
}

export interface PrinterConfig {
  connectionType: "lan" | "usb";
  printerIp: string;
  printerPort: string;
  selectedCupsPrinter: string | null;
  printerWidth: "58mm" | "80mm" | null;
  trailingBlankLines: number;
}

export interface TestResult {
  type: "success" | "error";
  message: string;
}

export interface CupsPrinter {
  name: string;
  uri: string;
  info?: string;
}

export interface SystemPrinter {
  name: string;
  info: string;
}

export function generateTestPage(
  width: "58mm" | "80mm",
  trailingBlankLines: number = 3,
): string {
  const charWidth = width === "58mm" ? 32 : 48;
  const b = new ReceiptBuilder(charWidth);

  b.centered(() => b.doubleSize(() => b.line("TEST PAGE")));
  b.blank();
  b.doubleSeparator();

  b.boldText("SimBrief Printer Test");
  b.doubleSeparator();
  b.blank();

  b.boldText("Configuration:");
  b.line(
    `- Printer Width: ${width === "58mm" ? "58mm (32 chars)" : "80mm (48 chars)"}`,
  );
  b.line("- Connection: Working");
  b.line("- ESC/POS: OK");
  b.line("- Print: SUCCESS");
  b.blank();

  b.wrap("This test confirms your printer is properly configured and working!");
  b.blank();

  b.separator();
  b.centered(() => b.doubleSizeText("TEST COMPLETE"));
  b.separator();
  b.cut(trailingBlankLines);

  return b.build();
}

export async function printToNetwork(
  data: string,
  printerIp: string,
  printerPort: string,
): Promise<PrintResult> {
  const response = await invoke<PrintResult>("print_to_network", {
    request: {
      data,
      printer_ip: printerIp,
      printer_port: parseInt(printerPort, 10),
    },
  });
  return response;
}

export async function printToCups(
  printer: string,
  data: string,
): Promise<PrintResult> {
  const response = await invoke<PrintResult>("print_to_cups", {
    printer,
    data,
  });
  return response;
}

export async function fetchCupsPrinters(): Promise<CupsPrinter[]> {
  const printers = await invoke<{ name: string; uri: string; info?: string }[] | null>(
    "list_cups_printers"
  );

  if (!Array.isArray(printers) || printers.length === 0) {
    return [];
  }

  return printers.map((p) => ({
    name: p.name,
    uri: p.uri,
    info: p.info,
  }));
}

export async function fetchSystemPrinters(): Promise<SystemPrinter[]> {
  const printers = await invoke<{ name: string; info: string }[] | null>(
    "list_system_printers"
  );

  if (!Array.isArray(printers) || printers.length === 0) {
    return [];
  }

  return printers.map((p) => ({
    name: p.name,
    info: p.info,
  }));
}

export async function runPrintTest(config: PrinterConfig): Promise<PrintResult> {
  const testData = generateTestPage(
    config.printerWidth || "58mm",
    config.trailingBlankLines || 3,
  );

  if (config.connectionType === "lan") {
    return await printToNetwork(
      testData,
      config.printerIp,
      config.printerPort,
    );
  } else {
    if (!config.selectedCupsPrinter) {
      return { success: false, message: "No printer selected" };
    }
    return await printToSystemPrinter(config.selectedCupsPrinter, testData);
  }
}

export async function printToSystemPrinter(
  printer: string,
  data: string,
): Promise<PrintResult> {
  const response = await invoke<PrintResult>("print_to_system_printer", {
    printerName: printer,
    data,
  });
  return response;
}
