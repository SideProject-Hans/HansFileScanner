//! Tauri command handlers

mod file_ops;
mod scan;

pub use file_ops::{copy_files, delete_files};
pub use scan::scan_folder;
