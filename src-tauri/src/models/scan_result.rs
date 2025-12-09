//! Scan result data structures

use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use super::file_entry::{FileCategory, FileEntry};

/// Failure reason for files that couldn't be processed
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum FailureReason {
    PermissionDenied,
    FileLocked,
    PathNotFound,
    Unknown,
}

/// Represents a file that failed to be processed during scanning
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FailedEntry {
    /// File path
    pub path: String,

    /// Failure reason
    pub reason: FailureReason,

    /// Error message
    pub error_message: String,
}

impl FailedEntry {
    pub fn new(path: String, reason: FailureReason, error_message: String) -> Self {
        Self {
            path,
            reason,
            error_message,
        }
    }
}

/// Statistics from a scan operation
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ScanStats {
    /// Total number of files (excluding folders)
    pub total_files: u64,

    /// Total number of folders
    pub total_folders: u64,

    /// Total size in bytes
    pub total_size: u64,

    /// Count of document files
    pub document_count: u64,

    /// Count of image files
    pub image_count: u64,

    /// Count of video files
    pub video_count: u64,

    /// Count of audio files
    pub audio_count: u64,

    /// Count of other files
    pub other_count: u64,
}

impl ScanStats {
    /// Create a new empty ScanStats
    pub fn new() -> Self {
        Self::default()
    }

    /// Add a file entry to the statistics
    pub fn add_entry(&mut self, entry: &FileEntry) {
        if entry.is_directory {
            self.total_folders += 1;
        } else {
            self.total_files += 1;
            self.total_size += entry.size;

            match entry.category {
                FileCategory::Document => self.document_count += 1,
                FileCategory::Image => self.image_count += 1,
                FileCategory::Video => self.video_count += 1,
                FileCategory::Audio => self.audio_count += 1,
                FileCategory::Other => self.other_count += 1,
                FileCategory::Folder => {} // Handled above
            }
        }
    }

    /// Get category counts as a HashMap
    pub fn category_counts(&self) -> HashMap<FileCategory, u64> {
        let mut counts = HashMap::new();
        counts.insert(FileCategory::Document, self.document_count);
        counts.insert(FileCategory::Image, self.image_count);
        counts.insert(FileCategory::Video, self.video_count);
        counts.insert(FileCategory::Audio, self.audio_count);
        counts.insert(FileCategory::Other, self.other_count);
        counts.insert(FileCategory::Folder, self.total_folders);
        counts
    }
}

/// Complete result of a scan operation
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResult {
    /// Root directory path that was scanned
    pub root_path: String,

    /// All file entries found
    pub entries: Vec<FileEntry>,

    /// Scan statistics
    pub stats: ScanStats,

    /// Files that failed to be scanned
    pub failed_entries: Vec<FailedEntry>,

    /// Scan completion time (ISO 8601 format)
    pub completed_at: String,

    /// Scan duration in milliseconds
    pub duration_ms: u64,
}

impl ScanResult {
    /// Create a new ScanResult
    pub fn new(
        root_path: String,
        entries: Vec<FileEntry>,
        stats: ScanStats,
        failed_entries: Vec<FailedEntry>,
        completed_at: String,
        duration_ms: u64,
    ) -> Self {
        Self {
            root_path,
            entries,
            stats,
            failed_entries,
            completed_at,
            duration_ms,
        }
    }
}

/// Scan status enumeration
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ScanStatus {
    Idle,
    Scanning,
    Completed,
    Error,
}

impl Default for ScanStatus {
    fn default() -> Self {
        Self::Idle
    }
}

/// Scan progress information for real-time UI updates
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanProgress {
    /// Number of files scanned so far
    pub scanned_count: u64,

    /// Path currently being scanned
    pub current_path: String,

    /// Estimated progress percentage (0-100), if calculable
    pub estimated_progress: Option<f32>,
}

impl ScanProgress {
    pub fn new(scanned_count: u64, current_path: String) -> Self {
        Self {
            scanned_count,
            current_path,
            estimated_progress: None,
        }
    }

    pub fn with_progress(mut self, progress: f32) -> Self {
        self.estimated_progress = Some(progress);
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scan_stats_add_entry() {
        let mut stats = ScanStats::new();

        let file_entry = FileEntry {
            path: "/test/file.pdf".to_string(),
            name: "file.pdf".to_string(),
            is_directory: false,
            size: 1024,
            modified_at: "2025-01-01T00:00:00Z".to_string(),
            category: FileCategory::Document,
            extension: "pdf".to_string(),
            depth: 1,
            parent_path: "/test".to_string(),
        };

        stats.add_entry(&file_entry);

        assert_eq!(stats.total_files, 1);
        assert_eq!(stats.total_folders, 0);
        assert_eq!(stats.total_size, 1024);
        assert_eq!(stats.document_count, 1);
    }

    #[test]
    fn test_scan_stats_add_folder() {
        let mut stats = ScanStats::new();

        let folder_entry = FileEntry {
            path: "/test/folder".to_string(),
            name: "folder".to_string(),
            is_directory: true,
            size: 0,
            modified_at: "2025-01-01T00:00:00Z".to_string(),
            category: FileCategory::Folder,
            extension: "".to_string(),
            depth: 1,
            parent_path: "/test".to_string(),
        };

        stats.add_entry(&folder_entry);

        assert_eq!(stats.total_files, 0);
        assert_eq!(stats.total_folders, 1);
        assert_eq!(stats.total_size, 0);
    }

    #[test]
    fn test_failure_reason_serialization() {
        let reason = FailureReason::PermissionDenied;
        let json = serde_json::to_string(&reason).unwrap();
        assert_eq!(json, "\"permission_denied\"");
    }

    #[test]
    fn test_scan_progress_serialization() {
        let progress = ScanProgress::new(100, "/test/path".to_string()).with_progress(50.0);
        let json = serde_json::to_string(&progress).unwrap();
        assert!(json.contains("\"scannedCount\":100"));
        assert!(json.contains("\"estimatedProgress\":50.0"));
    }
}
