use serde::{Deserialize, Serialize};
use std::io::Write;
use std::net::TcpStream;
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
            test_printer_connection
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
