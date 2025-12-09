/**
 * Custom hook for managing folder scanning operations
 * Encapsulates scan logic and Tauri API interactions
 */

import { useCallback, useEffect } from "react";
import { useScanStore } from "@/stores/scanStore";
import { scanFolder, selectFolder, onScanProgress } from "@/lib/tauri";
import { ScanStatus, type ScanProgressPayload } from "@/types/scan";

/**
 * Hook return type
 */
interface UseScannerReturn {
	/** Current scan status */
	status: ScanStatus;

	/** Whether a scan is currently in progress */
	isScanning: boolean;

	/** Scan progress (null when not scanning) */
	progress: {
		current: number;
		total: number;
		currentPath: string;
		status: ScanStatus;
	} | null;

	/** Scan result (null before completion) */
	result: ReturnType<typeof useScanStore.getState>["result"];

	/** Error message (null if no error) */
	error: string | null;

	/** Currently selected folder path */
	selectedFolder: string | null;

	/** Open folder selection dialog */
	openFolderDialog: () => Promise<void>;

	/** Start scanning the selected folder */
	startScan: () => Promise<void>;

	/** Reset scan state */
	reset: () => void;
}

/**
 * Custom hook for folder scanning operations
 */
export function useScanner(): UseScannerReturn {
	const {
		status,
		progress,
		result,
		error,
		selectedFolder,
		setSelectedFolder,
		startScan: startScanState,
		updateProgress,
		completeScan,
		setError,
		reset,
	} = useScanStore();

	// Set up scan progress listener
	useEffect(() => {
		let unlistenFn: (() => void) | undefined;

		const setupListener = async () => {
			try {
				unlistenFn = await onScanProgress((payload: ScanProgressPayload) => {
					updateProgress({
						current: payload.scannedCount,
						total: payload.scannedCount, // Total is estimated
						currentPath: payload.currentPath,
						status: ScanStatus.Scanning,
					});
				});
			} catch {
				// Ignore errors in test environment
			}
		};

		setupListener();

		return () => {
			if (unlistenFn) {
				unlistenFn();
			}
		};
	}, [updateProgress]);

	/**
	 * Open folder selection dialog
	 */
	const openFolderDialog = useCallback(async () => {
		try {
			const path = await selectFolder();
			if (path) {
				setSelectedFolder(path);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to select folder");
		}
	}, [setSelectedFolder, setError]);

	/**
	 * Start scanning the selected folder
	 */
	const startScanAction = useCallback(async () => {
		if (!selectedFolder) {
			setError("No folder selected");
			return;
		}

		startScanState();

		try {
			const scanResult = await scanFolder(selectedFolder);
			completeScan(scanResult);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Scan failed");
		}
	}, [selectedFolder, startScanState, completeScan, setError]);

	return {
		status,
		isScanning: status === ScanStatus.Scanning,
		progress,
		result,
		error,
		selectedFolder,
		openFolderDialog,
		startScan: startScanAction,
		reset,
	};
}
