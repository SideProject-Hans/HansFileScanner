//! Scan command handler

use std::sync::Arc;
use tauri::{AppHandle, Emitter};

use crate::models::{ScanProgress, ScanResult};
use crate::scanner::{scan_directory_with_progress, ScanOptions};

/// Scan a folder and return all file entries
///
/// This command scans the specified directory recursively and returns
/// information about all files and folders found.
///
/// Progress events are emitted through the `scan_progress` event channel
/// at regular intervals (at least 10 times per second) during scanning.
#[tauri::command]
pub async fn scan_folder(
    app_handle: AppHandle,
    path: String,
) -> Result<ScanResult, String> {
    // Validate path
    if path.is_empty() {
        return Err("Path cannot be empty".to_string());
    }

    // Clone app_handle for use in the progress callback
    let app_handle_clone = Arc::new(app_handle.clone());

    // Emit initial progress
    let _ = app_handle.emit(
        "scan_progress",
        ScanProgress::new(0, path.clone()),
    );

    // Create progress callback that emits events to the frontend
    let progress_callback = {
        let app = Arc::clone(&app_handle_clone);
        move |progress: ScanProgress| {
            let _ = app.emit("scan_progress", progress);
        }
    };

    // Perform the scan with progress updates
    let options = ScanOptions::new();
    let result = scan_directory_with_progress(
        &path, 
        &options, 
        Some(Box::new(progress_callback)),
    )?;

    // Emit completion progress
    let _ = app_handle.emit(
        "scan_progress",
        ScanProgress::new(result.entries.len() as u64, "Completed".to_string())
            .with_progress(100.0),
    );

    Ok(result)
}

#[cfg(test)]
mod tests {
    // Integration tests would go here
    // Unit tests for scan_folder require mocking AppHandle
}
