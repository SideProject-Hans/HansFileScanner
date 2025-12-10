//! File operation command handlers (delete, copy)

use std::path::Path;
use std::time::Instant;

use serde::{Deserialize, Serialize};

/// Operation type for file operations
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum OperationType {
    Delete,
    Copy,
}

/// Failure reason for failed file operations
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FailureReason {
    PermissionDenied,
    FileLocked,
    PathNotFound,
    TargetNotFound,
    FileExists,
    SameFolder,
    Unknown,
}

/// Represents a file that failed during operation
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FailedEntry {
    pub path: String,
    pub reason: FailureReason,
    pub error_message: String,
}

/// Result of a file operation (delete/copy)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileOperationResult {
    pub operation: OperationType,
    pub success_count: u32,
    pub failed_count: u32,
    pub failed_files: Vec<FailedEntry>,
    pub duration_ms: u64,
}

/// Delete multiple files by moving them to trash
///
/// This command safely deletes files by moving them to the system trash/recycle bin,
/// allowing users to recover them if needed.
///
/// # Arguments
/// * `paths` - Vector of file paths to delete
///
/// # Returns
/// * `Ok(FileOperationResult)` - Operation result with success/failure counts
/// * `Err(String)` - Error message if the operation completely fails
#[tauri::command]
pub async fn delete_files(paths: Vec<String>) -> Result<FileOperationResult, String> {
    let start_time = Instant::now();

    let mut success_count: u32 = 0;
    let mut failed_files: Vec<FailedEntry> = Vec::new();

    for path_str in &paths {
        let path = Path::new(path_str);

        // Check if path exists
        if !path.exists() {
            failed_files.push(FailedEntry {
                path: path_str.clone(),
                reason: FailureReason::PathNotFound,
                error_message: format!("File not found: {}", path_str),
            });
            continue;
        }

        // Attempt to move to trash
        match trash::delete(path) {
            Ok(()) => {
                success_count += 1;
            }
            Err(e) => {
                let (reason, message) = categorize_trash_error(&e);
                failed_files.push(FailedEntry {
                    path: path_str.clone(),
                    reason,
                    error_message: message,
                });
            }
        }
    }

    let duration_ms = start_time.elapsed().as_millis() as u64;
    let failed_count = failed_files.len() as u32;

    Ok(FileOperationResult {
        operation: OperationType::Delete,
        success_count,
        failed_count,
        failed_files,
        duration_ms,
    })
}

/// Copy multiple files to a target folder
///
/// # Arguments
/// * `source_paths` - Vector of source file paths to copy
/// * `target_folder` - Target folder path where files will be copied
///
/// # Returns
/// * `Ok(FileOperationResult)` - Operation result with success/failure counts
/// * `Err(String)` - Error message if the operation completely fails
#[tauri::command]
pub async fn copy_files(
    source_paths: Vec<String>,
    target_folder: String,
) -> Result<FileOperationResult, String> {
    let start_time = Instant::now();

    let target_path = Path::new(&target_folder);

    // Validate target folder exists and is a directory
    if !target_path.exists() {
        return Err(format!("Target folder not found: {}", target_folder));
    }
    if !target_path.is_dir() {
        return Err(format!("Target path is not a directory: {}", target_folder));
    }

    let mut success_count: u32 = 0;
    let mut failed_files: Vec<FailedEntry> = Vec::new();

    for source_path_str in &source_paths {
        let source_path = Path::new(source_path_str);

        // Check if source exists
        if !source_path.exists() {
            failed_files.push(FailedEntry {
                path: source_path_str.clone(),
                reason: FailureReason::PathNotFound,
                error_message: format!("Source file not found: {}", source_path_str),
            });
            continue;
        }

        // Get file name for target path
        let file_name = match source_path.file_name() {
            Some(name) => name,
            None => {
                failed_files.push(FailedEntry {
                    path: source_path_str.clone(),
                    reason: FailureReason::Unknown,
                    error_message: "Could not determine file name".to_string(),
                });
                continue;
            }
        };

        let dest_path = target_path.join(file_name);

        // Check if source and destination are the same folder
        if let Some(source_parent) = source_path.parent() {
            if source_parent == target_path {
                failed_files.push(FailedEntry {
                    path: source_path_str.clone(),
                    reason: FailureReason::SameFolder,
                    error_message: "Source and target folder are the same".to_string(),
                });
                continue;
            }
        }

        // Check if destination already exists
        if dest_path.exists() {
            failed_files.push(FailedEntry {
                path: source_path_str.clone(),
                reason: FailureReason::FileExists,
                error_message: format!("File already exists: {}", dest_path.display()),
            });
            continue;
        }

        // Perform the copy
        match std::fs::copy(source_path, &dest_path) {
            Ok(_) => {
                success_count += 1;
            }
            Err(e) => {
                let (reason, message) = categorize_io_error(&e);
                failed_files.push(FailedEntry {
                    path: source_path_str.clone(),
                    reason,
                    error_message: message,
                });
            }
        }
    }

    let duration_ms = start_time.elapsed().as_millis() as u64;
    let failed_count = failed_files.len() as u32;

    Ok(FileOperationResult {
        operation: OperationType::Copy,
        success_count,
        failed_count,
        failed_files,
        duration_ms,
    })
}

/// Categorize trash crate errors into FailureReason
fn categorize_trash_error(error: &trash::Error) -> (FailureReason, String) {
    let message = error.to_string();

    match error {
        trash::Error::Unknown { .. } => {
            if message.contains("permission") || message.contains("denied") {
                (FailureReason::PermissionDenied, message)
            } else if message.contains("locked") || message.contains("in use") {
                (FailureReason::FileLocked, message)
            } else {
                (FailureReason::Unknown, message)
            }
        }
        _ => (FailureReason::Unknown, message),
    }
}

/// Categorize std::io::Error into FailureReason
fn categorize_io_error(error: &std::io::Error) -> (FailureReason, String) {
    let message = error.to_string();

    match error.kind() {
        std::io::ErrorKind::PermissionDenied => (FailureReason::PermissionDenied, message),
        std::io::ErrorKind::NotFound => (FailureReason::PathNotFound, message),
        std::io::ErrorKind::AlreadyExists => (FailureReason::FileExists, message),
        _ => {
            if message.contains("locked") || message.contains("in use") {
                (FailureReason::FileLocked, message)
            } else {
                (FailureReason::Unknown, message)
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::File;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_delete_files_nonexistent_path() {
        let result = delete_files(vec!["/nonexistent/path/file.txt".to_string()]).await;

        assert!(result.is_ok());
        let result = result.unwrap();
        assert_eq!(result.success_count, 0);
        assert_eq!(result.failed_count, 1);
        assert_eq!(result.failed_files[0].reason, FailureReason::PathNotFound);
    }

    #[tokio::test]
    async fn test_delete_files_empty_paths() {
        let result = delete_files(vec![]).await;

        assert!(result.is_ok());
        let result = result.unwrap();
        assert_eq!(result.success_count, 0);
        assert_eq!(result.failed_count, 0);
    }

    #[tokio::test]
    async fn test_delete_files_success() {
        // Create a temporary directory and file
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("test_delete.txt");
        File::create(&file_path).unwrap();

        assert!(file_path.exists());

        let result = delete_files(vec![file_path.to_string_lossy().to_string()]).await;

        assert!(result.is_ok());
        let result = result.unwrap();
        assert_eq!(result.success_count, 1);
        assert_eq!(result.failed_count, 0);
        assert_eq!(result.operation, OperationType::Delete);

        // File should be moved to trash (no longer exists at original location)
        assert!(!file_path.exists());
    }

    #[tokio::test]
    async fn test_copy_files_nonexistent_target() {
        let result = copy_files(
            vec!["/some/file.txt".to_string()],
            "/nonexistent/target".to_string(),
        )
        .await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_copy_files_nonexistent_source() {
        let temp_dir = TempDir::new().unwrap();

        let result = copy_files(
            vec!["/nonexistent/source.txt".to_string()],
            temp_dir.path().to_string_lossy().to_string(),
        )
        .await;

        assert!(result.is_ok());
        let result = result.unwrap();
        assert_eq!(result.success_count, 0);
        assert_eq!(result.failed_count, 1);
        assert_eq!(result.failed_files[0].reason, FailureReason::PathNotFound);
    }

    #[tokio::test]
    async fn test_copy_files_success() {
        // Create source file
        let source_dir = TempDir::new().unwrap();
        let source_file = source_dir.path().join("source.txt");
        std::fs::write(&source_file, "test content").unwrap();

        // Create target directory
        let target_dir = TempDir::new().unwrap();

        let result = copy_files(
            vec![source_file.to_string_lossy().to_string()],
            target_dir.path().to_string_lossy().to_string(),
        )
        .await;

        assert!(result.is_ok());
        let result = result.unwrap();
        assert_eq!(result.success_count, 1);
        assert_eq!(result.failed_count, 0);
        assert_eq!(result.operation, OperationType::Copy);

        // Verify file was copied
        let copied_file = target_dir.path().join("source.txt");
        assert!(copied_file.exists());
        assert_eq!(
            std::fs::read_to_string(copied_file).unwrap(),
            "test content"
        );
    }

    #[tokio::test]
    async fn test_copy_files_same_folder() {
        let temp_dir = TempDir::new().unwrap();
        let source_file = temp_dir.path().join("test.txt");
        std::fs::write(&source_file, "content").unwrap();

        let result = copy_files(
            vec![source_file.to_string_lossy().to_string()],
            temp_dir.path().to_string_lossy().to_string(),
        )
        .await;

        assert!(result.is_ok());
        let result = result.unwrap();
        assert_eq!(result.success_count, 0);
        assert_eq!(result.failed_count, 1);
        assert_eq!(result.failed_files[0].reason, FailureReason::SameFolder);
    }

    #[tokio::test]
    async fn test_copy_files_file_exists() {
        // Create source file
        let source_dir = TempDir::new().unwrap();
        let source_file = source_dir.path().join("test.txt");
        std::fs::write(&source_file, "source content").unwrap();

        // Create target with existing file
        let target_dir = TempDir::new().unwrap();
        let existing_file = target_dir.path().join("test.txt");
        std::fs::write(&existing_file, "existing content").unwrap();

        let result = copy_files(
            vec![source_file.to_string_lossy().to_string()],
            target_dir.path().to_string_lossy().to_string(),
        )
        .await;

        assert!(result.is_ok());
        let result = result.unwrap();
        assert_eq!(result.success_count, 0);
        assert_eq!(result.failed_count, 1);
        assert_eq!(result.failed_files[0].reason, FailureReason::FileExists);
    }

    #[test]
    fn test_categorize_io_error_permission_denied() {
        let error = std::io::Error::new(std::io::ErrorKind::PermissionDenied, "Access denied");
        let (reason, _) = categorize_io_error(&error);
        assert_eq!(reason, FailureReason::PermissionDenied);
    }

    #[test]
    fn test_categorize_io_error_not_found() {
        let error = std::io::Error::new(std::io::ErrorKind::NotFound, "File not found");
        let (reason, _) = categorize_io_error(&error);
        assert_eq!(reason, FailureReason::PathNotFound);
    }
}
