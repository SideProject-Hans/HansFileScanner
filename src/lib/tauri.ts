/**
 * Tauri API wrapper functions
 * Provides typed wrappers around Tauri invoke and event APIs
 */

import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";

import type { ScanResult, FileOperationResult } from "@/types/file";
import type { ScanProgressPayload } from "@/types/scan";

/**
 * Scan a folder and return all file entries
 * @param path - The folder path to scan
 * @returns Promise resolving to scan result
 */
export async function scanFolder(path: string): Promise<ScanResult> {
	return await invoke<ScanResult>("scan_folder", { path });
}

/**
 * Delete multiple files (move to trash)
 * @param paths - Array of file paths to delete
 * @returns Promise resolving to operation result
 */
export async function deleteFiles(
	paths: string[]
): Promise<FileOperationResult> {
	return await invoke<FileOperationResult>("delete_files", { paths });
}

/**
 * Copy multiple files to a target folder
 * @param sourcePaths - Array of source file paths
 * @param targetFolder - Target folder path
 * @returns Promise resolving to operation result
 */
export async function copyFiles(
	sourcePaths: string[],
	targetFolder: string
): Promise<FileOperationResult> {
	return await invoke<FileOperationResult>("copy_files", {
		sourcePaths,
		targetFolder,
	});
}

/**
 * Open a folder selection dialog for scanning
 * @returns Promise resolving to selected folder path or null if cancelled
 */
export async function selectFolder(): Promise<string | null> {
	const selected = await open({
		directory: true,
		multiple: false,
		title: "選擇要掃描的資料夾",
	});
	return selected as string | null;
}

/**
 * Open a folder selection dialog for copy target
 * @returns Promise resolving to selected folder path or null if cancelled
 */
export async function selectTargetFolder(): Promise<string | null> {
	const selected = await open({
		directory: true,
		multiple: false,
		title: "選擇目標資料夾",
	});
	return selected as string | null;
}

/**
 * Listen to scan progress events
 * @param callback - Callback function to handle progress updates
 * @returns Promise resolving to unlisten function
 */
export async function onScanProgress(
	callback: (payload: ScanProgressPayload) => void
): Promise<UnlistenFn> {
	return await listen<ScanProgressPayload>("scan_progress", (event) => {
		callback(event.payload);
	});
}
