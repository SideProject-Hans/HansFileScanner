//! Scanner module for directory traversal and file information extraction

mod file_info;
mod walker;

pub use file_info::classify_extension;
pub use walker::{scan_directory, scan_directory_with_progress, ProgressCallback, ScanOptions};
