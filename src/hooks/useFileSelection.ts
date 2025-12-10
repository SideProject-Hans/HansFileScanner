/**
 * useFileSelection hook
 * Provides file selection functionality with integration to selectionStore
 */

import { useMemo, useCallback } from "react";
import { useSelectionStore } from "@/stores/selectionStore";
import type { FileEntry } from "@/types/file";

export interface UseFileSelectionReturn {
	/** Number of currently selected files */
	selectedCount: number;
	/** Whether any files are selected */
	hasSelection: boolean;
	/** Whether all selectable files are selected */
	isAllSelected: boolean;
	/** Check if a specific path is selected */
	isSelected: (path: string) => boolean;
	/** Toggle selection of a single file */
	toggleSelection: (path: string) => void;
	/** Select all non-directory files */
	selectAll: () => void;
	/** Deselect all files */
	deselectAll: () => void;
	/** Get array of selected file entries */
	getSelectedFiles: () => FileEntry[];
	/** Get array of selected paths */
	getSelectedPaths: () => string[];
}

/**
 * Hook for managing file selection state
 * @param files - Array of file entries available for selection
 */
export function useFileSelection(files: FileEntry[]): UseFileSelectionReturn {
	const {
		isAllSelected,
		toggleSelection: storeToggle,
		selectAll: storeSelectAll,
		deselectAll: storeDeselectAll,
		isSelected,
		getSelectedCount,
		getSelectedPaths: storeGetSelectedPaths,
	} = useSelectionStore();

	// Get only selectable files (non-directories)
	const selectableFiles = useMemo(
		() => files.filter((file) => !file.isDirectory),
		[files]
	);

	const selectablePaths = useMemo(
		() => selectableFiles.map((file) => file.path),
		[selectableFiles]
	);

	const selectedCount = getSelectedCount();
	const hasSelection = selectedCount > 0;

	const toggleSelection = useCallback(
		(path: string) => {
			storeToggle(path);
		},
		[storeToggle]
	);

	const selectAll = useCallback(() => {
		if (selectablePaths.length > 0) {
			storeSelectAll(selectablePaths);
		}
	}, [storeSelectAll, selectablePaths]);

	const deselectAll = useCallback(() => {
		storeDeselectAll();
	}, [storeDeselectAll]);

	const getSelectedFiles = useCallback((): FileEntry[] => {
		const paths = storeGetSelectedPaths();
		return files.filter((file) => paths.includes(file.path));
	}, [files, storeGetSelectedPaths]);

	const getSelectedPaths = useCallback((): string[] => {
		return storeGetSelectedPaths();
	}, [storeGetSelectedPaths]);

	return {
		selectedCount,
		hasSelection,
		isAllSelected,
		isSelected,
		toggleSelection,
		selectAll,
		deselectAll,
		getSelectedFiles,
		getSelectedPaths,
	};
}
