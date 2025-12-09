/**
 * File-related utility functions
 */

/**
 * Format file size in human-readable format
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";

	const units = ["B", "KB", "MB", "GB", "TB"];
	const k = 1024;
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

/**
 * Format date in localized format
 * @param isoString - ISO 8601 date string
 * @returns Formatted date string
 */
export function formatDate(isoString: string): string {
	try {
		const date = new Date(isoString);
		return date.toLocaleString("zh-TW", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return isoString;
	}
}

/**
 * Get file extension from filename (lowercase, without dot)
 * @param filename - The filename
 * @returns File extension or empty string
 */
export function getExtension(filename: string): string {
	const lastDot = filename.lastIndexOf(".");
	if (lastDot === -1 || lastDot === filename.length - 1) return "";
	return filename.slice(lastDot + 1).toLowerCase();
}

/**
 * Get filename without extension
 * @param filename - The filename
 * @returns Filename without extension
 */
export function getBasename(filename: string): string {
	const lastDot = filename.lastIndexOf(".");
	if (lastDot === -1) return filename;
	return filename.slice(0, lastDot);
}

/**
 * Check if a path is a hidden file/folder
 * @param path - File path
 * @returns True if hidden
 */
export function isHiddenPath(path: string): boolean {
	const parts = path.split(/[\\/]/);
	return parts.some((part) => part.startsWith(".") && part.length > 1);
}

/**
 * Get parent directory path
 * @param path - File path
 * @returns Parent directory path
 */
export function getParentPath(path: string): string {
	const normalized = path.replace(/\\/g, "/");
	const lastSlash = normalized.lastIndexOf("/");
	if (lastSlash === -1) return "";
	return normalized.slice(0, lastSlash);
}

/**
 * Get filename from path
 * @param path - File path
 * @returns Filename
 */
export function getFilename(path: string): string {
	const normalized = path.replace(/\\/g, "/");
	const lastSlash = normalized.lastIndexOf("/");
	if (lastSlash === -1) return path;
	return normalized.slice(lastSlash + 1);
}

/**
 * Sort file entries by field
 * @param entries - Array of file entries
 * @param field - Field to sort by
 * @param direction - Sort direction
 * @returns Sorted array (does not mutate original)
 */
export function sortFileEntries<
	T extends { name: string; size: number; modifiedAt: string },
>(
	entries: T[],
	field: "name" | "size" | "modifiedAt",
	direction: "asc" | "desc" = "asc"
): T[] {
	const sorted = [...entries].sort((a, b) => {
		let comparison = 0;

		switch (field) {
			case "name":
				comparison = a.name.localeCompare(b.name);
				break;
			case "size":
				comparison = a.size - b.size;
				break;
			case "modifiedAt":
				comparison =
					new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
				break;
		}

		return direction === "asc" ? comparison : -comparison;
	});

	return sorted;
}

/**
 * Extract unique file extensions from file entries
 * @param entries - Array of file entries
 * @returns Array of unique extensions sorted alphabetically
 */
export function extractExtensions<
	T extends { extension: string; isDirectory: boolean },
>(entries: T[]): string[] {
	const extensionSet = new Set<string>();

	for (const entry of entries) {
		if (!entry.isDirectory && entry.extension) {
			extensionSet.add(entry.extension.toLowerCase());
		}
	}

	return Array.from(extensionSet).sort((a, b) => a.localeCompare(b));
}
