//! Directory traversal using walkdir crate

use std::path::Path;
use std::time::{Duration, Instant};

use chrono::{DateTime, Utc};
use walkdir::WalkDir;

use crate::models::{
    FailedEntry, FailureReason, FileCategory, FileEntry, ScanProgress, ScanResult, ScanStats,
};
use crate::scanner::file_info::{classify_extension, get_extension};

/// Progress callback type for reporting scan progress
pub type ProgressCallback = Box<dyn Fn(ScanProgress) + Send + Sync>;

/// Options for directory scanning
#[derive(Debug, Clone, Default)]
pub struct ScanOptions {
    /// Maximum depth to scan (None = unlimited)
    pub max_depth: Option<usize>,

    /// Follow symbolic links
    pub follow_links: bool,
}

impl ScanOptions {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_max_depth(mut self, depth: usize) -> Self {
        self.max_depth = Some(depth);
        self
    }

    pub fn with_follow_links(mut self, follow: bool) -> Self {
        self.follow_links = follow;
        self
    }
}

/// Scan a directory and return all file entries
pub fn scan_directory(
    root_path: &str,
    options: &ScanOptions,
) -> Result<ScanResult, String> {
    scan_directory_with_progress(root_path, options, None)
}

/// Scan a directory with progress callback for real-time updates
pub fn scan_directory_with_progress(
    root_path: &str,
    options: &ScanOptions,
    progress_callback: Option<ProgressCallback>,
) -> Result<ScanResult, String> {
    let path = Path::new(root_path);

    // Validate the path exists and is a directory
    if !path.exists() {
        return Err(format!("Path not found: {}", root_path));
    }

    if !path.is_dir() {
        return Err(format!("Not a directory: {}", root_path));
    }

    let start_time = Instant::now();
    let root_path_str = path
        .canonicalize()
        .map_err(|e| format!("Failed to canonicalize path: {}", e))?
        .to_string_lossy()
        .to_string();

    let mut entries: Vec<FileEntry> = Vec::new();
    let mut stats = ScanStats::new();
    let mut failed_entries: Vec<FailedEntry> = Vec::new();

    // Configure walkdir
    let mut walker = WalkDir::new(path).follow_links(options.follow_links);

    if let Some(max_depth) = options.max_depth {
        walker = walker.max_depth(max_depth);
    }

    // Progress tracking variables
    let mut scanned_count: u64 = 0;
    let mut last_progress_update = Instant::now();
    let progress_interval = Duration::from_millis(100); // Update every 100ms (at least 10 times per second)

    // Process entries
    for result in walker {
        match result {
            Ok(dir_entry) => {
                let entry_path = dir_entry.path();

                // Skip the root directory itself
                if entry_path == path {
                    continue;
                }

                // Emit progress update at regular intervals
                if let Some(ref callback) = progress_callback {
                    if last_progress_update.elapsed() >= progress_interval {
                        callback(ScanProgress::new(
                            scanned_count,
                            entry_path.to_string_lossy().to_string(),
                        ));
                        last_progress_update = Instant::now();
                    }
                }

                match create_file_entry(dir_entry, &root_path_str) {
                    Ok(file_entry) => {
                        stats.add_entry(&file_entry);
                        entries.push(file_entry);
                        scanned_count += 1;
                    }
                    Err(e) => {
                        failed_entries.push(FailedEntry::new(
                            entry_path.to_string_lossy().to_string(),
                            FailureReason::Unknown,
                            e,
                        ));
                    }
                }
            }
            Err(e) => {
                let path_str = e
                    .path()
                    .map(|p| p.to_string_lossy().to_string())
                    .unwrap_or_else(|| "unknown".to_string());

                let reason = if e.io_error().map(|io| io.kind()) == Some(std::io::ErrorKind::PermissionDenied) {
                    FailureReason::PermissionDenied
                } else {
                    FailureReason::Unknown
                };

                failed_entries.push(FailedEntry::new(path_str, reason, e.to_string()));
            }
        }
    }

    let duration_ms = start_time.elapsed().as_millis() as u64;
    let completed_at = Utc::now().to_rfc3339();

    Ok(ScanResult::new(
        root_path_str,
        entries,
        stats,
        failed_entries,
        completed_at,
        duration_ms,
    ))
}

/// Create a FileEntry from a walkdir DirEntry
fn create_file_entry(
    dir_entry: walkdir::DirEntry,
    root_path: &str,
) -> Result<FileEntry, String> {
    let path = dir_entry.path();
    let metadata = dir_entry
        .metadata()
        .map_err(|e| format!("Failed to get metadata: {}", e))?;

    let path_str = path.to_string_lossy().to_string();
    let name = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default();

    let is_directory = metadata.is_dir();
    let size = if is_directory { 0 } else { metadata.len() };

    // Get modified time
    let modified_at = metadata
        .modified()
        .ok()
        .and_then(|time| {
            let datetime: DateTime<Utc> = time.into();
            Some(datetime.to_rfc3339())
        })
        .unwrap_or_else(|| Utc::now().to_rfc3339());

    // Get extension and category
    let extension = if is_directory {
        String::new()
    } else {
        get_extension(&name)
    };

    let category = if is_directory {
        FileCategory::Folder
    } else {
        classify_extension(&extension)
    };

    // Calculate depth relative to root
    let depth = path
        .strip_prefix(root_path)
        .map(|rel| rel.components().count() as u32)
        .unwrap_or(0);

    // Get parent path
    let parent_path = path
        .parent()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_default();

    Ok(FileEntry::new(
        path_str,
        name,
        is_directory,
        size,
        modified_at,
        category,
        extension,
        depth,
        parent_path,
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::{self, File};
    use std::io::Write;
    use tempfile::tempdir;

    #[test]
    fn test_scan_nonexistent_path() {
        let result = scan_directory("/nonexistent/path/12345", &ScanOptions::new());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Path not found"));
    }

    #[test]
    fn test_scan_file_not_directory() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("test.txt");
        File::create(&file_path).unwrap();

        let result = scan_directory(file_path.to_str().unwrap(), &ScanOptions::new());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Not a directory"));
    }

    #[test]
    fn test_scan_empty_directory() {
        let dir = tempdir().unwrap();
        let result = scan_directory(dir.path().to_str().unwrap(), &ScanOptions::new());
        assert!(result.is_ok());

        let scan_result = result.unwrap();
        assert_eq!(scan_result.entries.len(), 0);
        assert_eq!(scan_result.stats.total_files, 0);
        assert_eq!(scan_result.stats.total_folders, 0);
    }

    #[test]
    fn test_scan_with_files() {
        let dir = tempdir().unwrap();

        // Create test files
        let mut file1 = File::create(dir.path().join("document.pdf")).unwrap();
        file1.write_all(b"test content").unwrap();

        let mut file2 = File::create(dir.path().join("image.jpg")).unwrap();
        file2.write_all(b"test content").unwrap();

        fs::create_dir(dir.path().join("subdir")).unwrap();

        let result = scan_directory(dir.path().to_str().unwrap(), &ScanOptions::new());
        assert!(result.is_ok());

        let scan_result = result.unwrap();
        assert_eq!(scan_result.entries.len(), 3);
        assert_eq!(scan_result.stats.total_files, 2);
        assert_eq!(scan_result.stats.total_folders, 1);
        assert_eq!(scan_result.stats.document_count, 1);
        assert_eq!(scan_result.stats.image_count, 1);
    }

    #[test]
    fn test_scan_with_max_depth() {
        let dir = tempdir().unwrap();

        // Create nested directories
        fs::create_dir_all(dir.path().join("level1/level2/level3")).unwrap();
        File::create(dir.path().join("level1/file1.txt")).unwrap();
        File::create(dir.path().join("level1/level2/file2.txt")).unwrap();
        File::create(dir.path().join("level1/level2/level3/file3.txt")).unwrap();

        // Scan with max depth 2 (root + 1 level)
        let options = ScanOptions::new().with_max_depth(2);
        let result = scan_directory(dir.path().to_str().unwrap(), &options);
        assert!(result.is_ok());

        let scan_result = result.unwrap();
        // Should only include level1 folder and file1.txt
        assert!(scan_result.entries.len() < 6);
    }

    #[test]
    fn test_file_entry_categories() {
        let dir = tempdir().unwrap();

        // Create files of different types
        File::create(dir.path().join("doc.pdf")).unwrap();
        File::create(dir.path().join("pic.png")).unwrap();
        File::create(dir.path().join("vid.mp4")).unwrap();
        File::create(dir.path().join("aud.mp3")).unwrap();
        File::create(dir.path().join("other.xyz")).unwrap();

        let result = scan_directory(dir.path().to_str().unwrap(), &ScanOptions::new());
        assert!(result.is_ok());

        let scan_result = result.unwrap();
        assert_eq!(scan_result.stats.document_count, 1);
        assert_eq!(scan_result.stats.image_count, 1);
        assert_eq!(scan_result.stats.video_count, 1);
        assert_eq!(scan_result.stats.audio_count, 1);
        assert_eq!(scan_result.stats.other_count, 1);
    }
}
