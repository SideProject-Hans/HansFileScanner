//! File type classification based on extension

use crate::models::FileCategory;

/// Classify a file extension into a FileCategory
pub fn classify_extension(extension: &str) -> FileCategory {
    match extension.to_lowercase().as_str() {
        // Documents
        "pdf" | "doc" | "docx" | "txt" | "xls" | "xlsx" | "ppt" | "pptx" | "odt" | "ods"
        | "odp" | "rtf" | "csv" | "md" | "json" | "xml" | "html" | "htm" => FileCategory::Document,

        // Images
        "jpg" | "jpeg" | "png" | "gif" | "bmp" | "svg" | "webp" | "ico" | "tiff" | "tif"
        | "raw" | "heic" | "heif" => FileCategory::Image,

        // Videos
        "mp4" | "avi" | "mkv" | "mov" | "wmv" | "flv" | "webm" | "m4v" | "mpeg" | "mpg" | "3gp"
        | "ts" => FileCategory::Video,

        // Audio
        "mp3" | "wav" | "flac" | "aac" | "ogg" | "m4a" | "wma" | "aiff" | "alac" | "opus" => {
            FileCategory::Audio
        }

        // Default to Other
        _ => FileCategory::Other,
    }
}

/// Get the extension from a filename (lowercase, without dot)
pub fn get_extension(filename: &str) -> String {
    std::path::Path::new(filename)
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.to_lowercase())
        .unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_classify_documents() {
        assert_eq!(classify_extension("pdf"), FileCategory::Document);
        assert_eq!(classify_extension("PDF"), FileCategory::Document);
        assert_eq!(classify_extension("docx"), FileCategory::Document);
        assert_eq!(classify_extension("txt"), FileCategory::Document);
        assert_eq!(classify_extension("xlsx"), FileCategory::Document);
    }

    #[test]
    fn test_classify_images() {
        assert_eq!(classify_extension("jpg"), FileCategory::Image);
        assert_eq!(classify_extension("JPEG"), FileCategory::Image);
        assert_eq!(classify_extension("png"), FileCategory::Image);
        assert_eq!(classify_extension("gif"), FileCategory::Image);
        assert_eq!(classify_extension("webp"), FileCategory::Image);
    }

    #[test]
    fn test_classify_videos() {
        assert_eq!(classify_extension("mp4"), FileCategory::Video);
        assert_eq!(classify_extension("MP4"), FileCategory::Video);
        assert_eq!(classify_extension("avi"), FileCategory::Video);
        assert_eq!(classify_extension("mkv"), FileCategory::Video);
        assert_eq!(classify_extension("webm"), FileCategory::Video);
    }

    #[test]
    fn test_classify_audio() {
        assert_eq!(classify_extension("mp3"), FileCategory::Audio);
        assert_eq!(classify_extension("MP3"), FileCategory::Audio);
        assert_eq!(classify_extension("wav"), FileCategory::Audio);
        assert_eq!(classify_extension("flac"), FileCategory::Audio);
        assert_eq!(classify_extension("aac"), FileCategory::Audio);
    }

    #[test]
    fn test_classify_other() {
        assert_eq!(classify_extension("exe"), FileCategory::Other);
        assert_eq!(classify_extension("dll"), FileCategory::Other);
        assert_eq!(classify_extension("unknown"), FileCategory::Other);
        assert_eq!(classify_extension(""), FileCategory::Other);
    }

    #[test]
    fn test_get_extension() {
        assert_eq!(get_extension("file.txt"), "txt");
        assert_eq!(get_extension("file.TXT"), "txt");
        assert_eq!(get_extension("file.tar.gz"), "gz");
        assert_eq!(get_extension("file"), "");
        assert_eq!(get_extension(".hidden"), "hidden");
    }
}
