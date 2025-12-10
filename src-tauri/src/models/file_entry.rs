//! File entry data structures

use serde::{Deserialize, Serialize};

/// File category classification
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum FileCategory {
    Document,
    Image,
    Video,
    Audio,
    Folder,
    Other,
}

impl Default for FileCategory {
    fn default() -> Self {
        Self::Other
    }
}

/// Represents a single file or folder entry from scan results
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileEntry {
    /// Full file path (serves as unique identifier)
    pub path: String,

    /// File name (including extension)
    pub name: String,

    /// Whether this entry is a directory
    pub is_directory: bool,

    /// File size in bytes (0 for directories)
    pub size: u64,

    /// Last modified time (ISO 8601 format)
    pub modified_at: String,

    /// File category classification
    pub category: FileCategory,

    /// File extension (lowercase, without dot), empty string for directories
    pub extension: String,

    /// Depth relative to scan root directory (root = 0)
    pub depth: u32,

    /// Parent folder path
    pub parent_path: String,
}

impl FileEntry {
    /// Create a new FileEntry
    pub fn new(
        path: String,
        name: String,
        is_directory: bool,
        size: u64,
        modified_at: String,
        category: FileCategory,
        extension: String,
        depth: u32,
        parent_path: String,
    ) -> Self {
        Self {
            path,
            name,
            is_directory,
            size,
            modified_at,
            category,
            extension,
            depth,
            parent_path,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_file_category_serialization() {
        let category = FileCategory::Document;
        let json = serde_json::to_string(&category).unwrap();
        assert_eq!(json, "\"document\"");

        let deserialized: FileCategory = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized, FileCategory::Document);
    }

    #[test]
    fn test_file_entry_serialization() {
        let entry = FileEntry::new(
            "/path/to/file.txt".to_string(),
            "file.txt".to_string(),
            false,
            1024,
            "2025-01-01T00:00:00Z".to_string(),
            FileCategory::Document,
            "txt".to_string(),
            1,
            "/path/to".to_string(),
        );

        let json = serde_json::to_string(&entry).unwrap();
        assert!(json.contains("\"path\":\"/path/to/file.txt\""));
        assert!(json.contains("\"isDirectory\":false"));
        assert!(json.contains("\"category\":\"document\""));
    }
}
