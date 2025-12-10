//! Data models for the file scanner application

mod file_entry;
mod scan_result;

pub use file_entry::{FileCategory, FileEntry};
pub use scan_result::{
    FailedEntry, FailureReason, ScanProgress, ScanResult, ScanStats, ScanStatus,
};
