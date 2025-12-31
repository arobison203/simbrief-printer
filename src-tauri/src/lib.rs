use serde::{Deserialize, Serialize};
use std::fs::OpenOptions;
use std::io::Write;
use std::net::TcpStream;
use std::process::Command;
use std::time::Duration;

#[derive(Debug, Serialize, Deserialize)]
struct PrintRequest {
    data: String,
    printer_ip: String,
    printer_port: Option<u16>,
}

#[derive(Debug, Serialize)]
struct PrintResponse {
    success: bool,
    message: String,
}

#[derive(Debug, Serialize)]
struct USBDevice {
    // Human-friendly name / summary
    name: String,
    // Raw info (platform-specific). For macOS this will contain the JSON output
    // from `system_profiler SPUSBDataType -json` so the frontend can display
    // or let the user inspect it to pick the correct device path.
    info: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct USBPrintRequest {
    data: String,
    // Path to the device node, e.g. "/dev/cu.usbserial-XXXX" (macOS/Linux)
    // or "\\\\.\\COM3" (Windows) if the device exposes a serial interface.
    device_path: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct USBTestRequest {
    device_path: String,
}

/// Print to a network ESC/POS printer via TCP
#[tauri::command]
async fn print_to_network(request: PrintRequest) -> Result<PrintResponse, String> {
    let port = request.printer_port.unwrap_or(9100);
    let address = format!("{}:{}", request.printer_ip, port);

    match TcpStream::connect_timeout(
        &address
            .parse()
            .map_err(|e| format!("Invalid address: {}", e))?,
        Duration::from_secs(5),
    ) {
        Ok(mut stream) => {
            stream
                .set_write_timeout(Some(Duration::from_secs(5)))
                .map_err(|e| format!("Failed to set timeout: {}", e))?;

            stream
                .write_all(request.data.as_bytes())
                .map_err(|e| format!("Failed to write to printer: {}", e))?;

            stream
                .flush()
                .map_err(|e| format!("Failed to flush stream: {}", e))?;

            Ok(PrintResponse {
                success: true,
                message: format!("Successfully printed to {}", address),
            })
        }
        Err(e) => Err(format!(
            "Failed to connect to printer at {}: {}",
            address, e
        )),
    }
}

/// Test connection to a network printer
#[tauri::command]
async fn test_printer_connection(
    printer_ip: String,
    printer_port: Option<u16>,
) -> Result<PrintResponse, String> {
    let port = printer_port.unwrap_or(9100);
    let address = format!("{}:{}", printer_ip, port);

    match TcpStream::connect_timeout(
        &address
            .parse()
            .map_err(|e| format!("Invalid address: {}", e))?,
        Duration::from_secs(5),
    ) {
        Ok(_) => Ok(PrintResponse {
            success: true,
            message: format!("Successfully connected to printer at {}", address),
        }),
        Err(e) => Err(format!(
            "Failed to connect to printer at {}: {}",
            address, e
        )),
    }
}

/// List USB devices / printers on the host.
///
/// NOTE:
/// - On macOS this runs `system_profiler SPUSBDataType -json` and returns the raw
///   JSON string inside the `info` field for the frontend to inspect. This is a
///   pragmatic approach that works without adding platform-specific native crates.
/// - On other platforms this will return an error indicating the operation is not
///   implemented yet. We intentionally keep the API cross-platform and add
///   platform-specific implementations later.
#[tauri::command]
async fn list_usb_devices() -> Result<Vec<USBDevice>, String> {
    // Currently provide a macOS implementation (per user's current OS).
    // For other OSes, return a helpful error so the frontend can show that
    // listing is not yet available.
    if cfg!(target_os = "macos") {
        // Use `system_profiler SPUSBDataType -json` to get USB tree.
        // This avoids requiring extra crates for direct IOKit bindings.
        let output = Command::new("system_profiler")
            .arg("SPUSBDataType")
            .arg("-json")
            .output()
            .map_err(|e| format!("Failed to run system_profiler: {}", e))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!(
                "system_profiler failed (status: {}). stderr: {}",
                output.status, stderr
            ));
        }

        let stdout = String::from_utf8_lossy(&output.stdout).to_string();

        // Return the raw JSON as a single entry. The frontend can present this to
        // the user for inspection. In a follow-up we can parse and extract
        // friendly names and possible device node hints.
        Ok(vec![USBDevice {
            name: "macOS USB device list (raw JSON)".to_string(),
            info: stdout,
        }])
    } else if cfg!(target_os = "linux") {
        // Placeholder: on Linux one could call `lsusb -v` or inspect /dev, or use libudev.
        Err("USB device listing is not yet implemented for Linux in this build.".to_string())
    } else if cfg!(target_os = "windows") {
        // Placeholder: enumerate Win32 devices via SetupAPI or WMI.
        Err("USB device listing is not yet implemented for Windows in this build.".to_string())
    } else {
        Err("USB device listing is not supported on this platform.".to_string())
    }
}

/// Print raw bytes to a USB-connected device by writing to a device path.
///
/// device_path should be a path to a node that accepts raw writes:
/// - macOS / Linux: a device node like `/dev/cu.usbserial-XXXX` or `/dev/ttyUSB0`
/// - Windows: a COM device name like `\\\\.\\COM3`
///
/// Important: the caller (frontend/user) must ensure the correct device node is used
/// and that the application has permission to write to it.
#[tauri::command]
async fn print_to_usb(request: USBPrintRequest) -> Result<PrintResponse, String> {
    if request.device_path.trim().is_empty() {
        return Err("No device path provided".to_string());
    }

    // Try to open the device node for writing.
    let path = request.device_path.clone();
    match OpenOptions::new().write(true).open(&path) {
        Ok(mut file) => {
            // Write raw data. This will attempt to write the ESC/POS bytes as-is.
            file.write_all(request.data.as_bytes())
                .map_err(|e| format!("Failed to write to device {}: {}", path, e))?;
            file.flush()
                .map_err(|e| format!("Failed to flush device {}: {}", path, e))?;

            Ok(PrintResponse {
                success: true,
                message: format!("Successfully wrote data to USB device at {}", path),
            })
        }
        Err(e) => Err(format!(
            "Failed to open device {} for writing: {}. \
            Ensure the path is correct and you have permission to access the device.",
            path, e
        )),
    }
}

/// Test USB connection by attempting to open the device path for writing (no data sent).
#[tauri::command]
async fn test_usb_connection(request: USBTestRequest) -> Result<PrintResponse, String> {
    if request.device_path.trim().is_empty() {
        return Err("No device path provided".to_string());
    }

    let path = request.device_path.clone();
    match OpenOptions::new().write(true).open(&path) {
        Ok(_) => Ok(PrintResponse {
            success: true,
            message: format!("Successfully opened USB device at {}", path),
        }),
        Err(e) => Err(format!(
            "Failed to open device {}: {}. \
            This likely means the path is invalid or you lack permission.",
            path, e
        )),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            print_to_network,
            test_printer_connection,
            list_usb_devices,
            print_to_usb,
            test_usb_connection
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
