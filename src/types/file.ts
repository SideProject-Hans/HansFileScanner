/**
 * File-related type definitions for the file scanner application
 * Based on data-model.md specifications
 */

/**
 * Sort field for file list
 */
export type SortField = "name" | "path" | "size" | "modified_at";

/**
 * Sort order for file list
 */
export type SortOrder = "asc" | "desc";

/**
 * File category classification
 */
export enum FileCategory {
	Document = "document",
	Image = "image",
	Video = "video",
	Audio = "audio",
	Folder = "folder",
	Other = "other",
}

/**
 * Represents a single file or folder entry from scan results
 */
export interface FileEntry {
	/** Full file path (serves as unique identifier) */
	path: string;

	/** File name (including extension) */
	name: string;

	/** Whether this entry is a directory */
	isDirectory: boolean;

	/** File size in bytes (0 for directories) */
	size: number;

	/** Last modified time (ISO 8601 format) */
	modifiedAt: string;

	/** File category classification */
	category: FileCategory;

	/** File extension (lowercase, without dot), empty string for directories */
	extension: string;

	/** Depth relative to scan root directory (root = 0) */
	depth: number;

	/** Parent folder path */
	parentPath: string;
}

/**
 * Failure reason for files that couldn't be processed
 */
export enum FailureReason {
	PermissionDenied = "permission_denied",
	FileLocked = "file_locked",
	PathNotFound = "path_not_found",
	Unknown = "unknown",
}

/**
 * Represents a file that failed to be processed during scanning
 */
export interface FailedEntry {
	/** File path */
	path: string;

	/** Failure reason */
	reason: FailureReason;

	/** Error message */
	errorMessage: string;
}

/**
 * Statistics from a scan operation
 */
export interface ScanStats {
	/** Total number of files (excluding folders) */
	totalFiles: number;

	/** Total number of folders */
	totalFolders: number;

	/** Total size in bytes */
	totalSize: number;

	/** Count of document files */
	documentCount: number;

	/** Count of image files */
	imageCount: number;

	/** Count of video files */
	videoCount: number;

	/** Count of audio files */
	audioCount: number;

	/** Count of other files */
	otherCount: number;
}

/**
 * Complete result of a scan operation
 */
export interface ScanResult {
	/** Root directory path that was scanned */
	rootPath: string;

	/** All file entries found */
	entries: FileEntry[];

	/** Scan statistics */
	stats: ScanStats;

	/** Files that failed to be scanned */
	failedEntries: FailedEntry[];

	/** Scan completion time (ISO 8601 format) */
	completedAt: string;

	/** Scan duration in milliseconds */
	durationMs: number;
}

/**
 * File operation types
 */
export enum OperationType {
	Delete = "delete",
	Copy = "copy",
}

/**
 * Result of a file operation (delete/copy)
 */
export interface FileOperationResult {
	/** Operation type */
	operation: OperationType;

	/** Number of successfully processed files */
	successCount: number;

	/** Number of failed files */
	failedCount: number;

	/** Details of failed files */
	failedFiles: FailedEntry[];

	/** Operation duration in milliseconds */
	durationMs: number;
}
