/**
 * Scan-related type definitions for the file scanner application
 * Based on data-model.md specifications
 */

/**
 * Scan status enumeration
 */
export enum ScanStatus {
	Idle = "idle",
	Scanning = "scanning",
	Completed = "completed",
	Error = "error",
}

/**
 * View mode for displaying files
 */
export enum ViewMode {
	Tree = "tree",
	Documents = "documents",
	Images = "images",
	Videos = "videos",
	Audio = "audio",
}

/**
 * Scan progress information for real-time UI updates
 */
export interface ScanProgress {
	/** Current number of processed files */
	current: number;

	/** Estimated total files (may update dynamically) */
	total: number;

	/** Path of file currently being processed */
	currentPath: string;

	/** Current scan status */
	status: ScanStatus;
}

/**
 * Progress payload received from Tauri events
 */
export interface ScanProgressPayload {
	/** Number of files scanned so far */
	scannedCount: number;

	/** Path currently being scanned */
	currentPath: string;

	/** Estimated progress percentage (0-100), if calculable */
	estimatedProgress?: number;
}

/**
 * File selection state for batch operations
 */
export interface FileSelection {
	/** Set of selected file paths */
	selectedPaths: Set<string>;

	/** Last selected file path (for shift-click range selection) */
	lastSelectedPath: string | null;
}

/**
 * Sort direction for file list
 */
export type SortDirection = "asc" | "desc";

/**
 * Sortable fields in file list
 */
export type SortField =
	| "name"
	| "size"
	| "modifiedAt"
	| "category"
	| "extension";

/**
 * Sort configuration
 */
export interface SortConfig {
	field: SortField;
	direction: SortDirection;
}

/**
 * Filter configuration for file list
 */
export interface FilterConfig {
	/** Current view mode */
	viewMode: ViewMode;

	/** Selected file extensions to filter (empty = show all) */
	selectedExtensions: string[];

	/** Search query string */
	searchQuery: string;
}
