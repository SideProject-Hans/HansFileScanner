/**
 * useFileOperations hook
 * Handles file operations like delete and copy with confirmation
 */

import { useState, useCallback } from "react";
import { deleteFiles, copyFiles, selectTargetFolder } from "@/lib/tauri";
import type { FileOperationResult } from "@/types/file";

export interface UseFileOperationsReturn {
	/** Whether a delete operation is in progress */
	isDeleting: boolean;
	/** Whether a copy operation is in progress */
	isCopying: boolean;
	/** Whether the confirm dialog should be shown */
	showConfirmDialog: boolean;
	/** Current error message, if any */
	error: string | null;
	/** Paths pending deletion (waiting for confirmation) */
	pendingDeletePaths: string[];
	/** Paths pending copy */
	pendingCopyPaths: string[];
	/** Request deletion of files (shows confirmation dialog) */
	requestDelete: (paths: string[]) => void;
	/** Cancel the pending delete operation */
	cancelDelete: () => void;
	/** Confirm and execute the delete operation */
	confirmDelete: () => Promise<FileOperationResult | undefined>;
	/** Request copy of files (opens folder selection dialog) */
	requestCopy: (paths: string[]) => Promise<FileOperationResult | undefined>;
	/** Clear the current error */
	clearError: () => void;
}

/**
 * Hook for managing file operations with confirmation
 */
export function useFileOperations(): UseFileOperationsReturn {
	const [isDeleting, setIsDeleting] = useState(false);
	const [isCopying, setIsCopying] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pendingDeletePaths, setPendingDeletePaths] = useState<string[]>([]);
	const [pendingCopyPaths, setPendingCopyPaths] = useState<string[]>([]);

	const requestDelete = useCallback((paths: string[]) => {
		if (paths.length === 0) {
			return;
		}
		setPendingDeletePaths(paths);
		setShowConfirmDialog(true);
		setError(null);
	}, []);

	const cancelDelete = useCallback(() => {
		setShowConfirmDialog(false);
		setPendingDeletePaths([]);
	}, []);

	const confirmDelete = useCallback(async (): Promise<
		FileOperationResult | undefined
	> => {
		if (pendingDeletePaths.length === 0) {
			return undefined;
		}

		setIsDeleting(true);
		setError(null);

		try {
			const result = await deleteFiles(pendingDeletePaths);
			setShowConfirmDialog(false);
			setPendingDeletePaths([]);
			return result;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error occurred";
			setError(errorMessage);
			return undefined;
		} finally {
			setIsDeleting(false);
		}
	}, [pendingDeletePaths]);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	const requestCopy = useCallback(
		async (paths: string[]): Promise<FileOperationResult | undefined> => {
			if (paths.length === 0) {
				return undefined;
			}

			setPendingCopyPaths(paths);
			setError(null);

			try {
				// Open folder selection dialog
				const targetFolder = await selectTargetFolder();

				if (!targetFolder) {
					// User cancelled folder selection
					setPendingCopyPaths([]);
					return undefined;
				}

				setIsCopying(true);

				const result = await copyFiles(paths, targetFolder);
				setPendingCopyPaths([]);
				return result;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error occurred";
				setError(errorMessage);
				return undefined;
			} finally {
				setIsCopying(false);
				setPendingCopyPaths([]);
			}
		},
		[]
	);

	return {
		isDeleting,
		isCopying,
		showConfirmDialog,
		error,
		pendingDeletePaths,
		pendingCopyPaths,
		requestDelete,
		cancelDelete,
		confirmDelete,
		requestCopy,
		clearError,
	};
}
