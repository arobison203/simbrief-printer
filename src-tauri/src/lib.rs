use printers::common::base::job::PrinterJobOptions;
use serde::{Deserialize, Serialize};
use std::io::Write;
use std::net::TcpStream;
use std::time::Duration;

/// Print request for network printing
#[derive(Debug, Serialize, Deserialize)]
struct PrintRequest {
    data: String,
    printer_ip: String,
    printer_port: Option<u16>,
}

/// Generic print response
#[derive(Debug, Serialize)]
struct PrintResponse {
    success: bool,
    message: String,
}

/// System printer representation returned to the frontend
#[derive(Debug, Serialize)]
struct SystemPrinter {
    name: String,
    info: String,
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

/// List available system printers using the printers crate (cross-platform: CUPS on Unix, WinSpool on Windows)
#[tauri::command]
async fn list_system_printers() -> Result<Vec<SystemPrinter>, String> {
    let printers = printers::get_printers();
    let mut result: Vec<SystemPrinter> = Vec::new();

    for printer in printers {
        result.push(SystemPrinter {
            name: printer.name.to_string(),
            info: format!("System printer"),
        });
    }

    if result.is_empty() {
        Err("No system printers found".to_string())
    } else {
        Ok(result)
    }
}

/// Print raw bytes to a system printer using the printers crate (cross-platform)
#[tauri::command]
async fn print_to_system_printer(
    printer_name: String,
    data: String,
) -> Result<PrintResponse, String> {
    let printer = printers::get_printer_by_name(&printer_name);

    match printer {
        Some(printer) => match printer.print(data.as_bytes(), PrinterJobOptions::none()) {
            Ok(_) => Ok(PrintResponse {
                success: true,
                message: format!("Printed to {}", printer_name),
            }),
            Err(e) => Err(format!("Failed to print to {}: {}", printer_name, e)),
        },
        None => Err(format!("Printer '{}' not found", printer_name)),
    }
}

/// Test connection to a system printer by attempting to list it
#[tauri::command]
async fn test_system_printer(printer_name: String) -> Result<PrintResponse, String> {
    let printer = printers::get_printer_by_name(&printer_name);

    match printer {
        Some(_) => Ok(PrintResponse {
            success: true,
            message: format!("Printer {} is available", printer_name),
        }),
        None => Err(format!("Printer '{}' not found", printer_name)),
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
            list_system_printers,
            print_to_system_printer,
            test_system_printer
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
