//! HansFileScanner - Cross-platform file scanning tool
//!
//! This application provides a desktop file scanner with the ability to
//! browse, filter, and manage files across Windows and macOS.

mod commands;
mod models;
mod scanner;

use commands::{copy_files, delete_files, scan_folder};

/// Greet command for testing IPC communication
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            scan_folder,
            delete_files,
            copy_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
