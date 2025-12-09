/**
 * Zustand store for managing scan state
 * Handles scan results, progress, and status
 */

import { create } from "zustand";
import type { ScanResult } from "@/types/file";
import { ScanStatus, type ScanProgress } from "@/types/scan";

/**
 * State interface for the scan store
 */
interface ScanState {
	/** Current scan status */
	status: ScanStatus;

	/** Current scan progress information */
	progress: ScanProgress | null;

	/** Scan result after completion */
	result: ScanResult | null;

	/** Error message if scan failed */
	error: string | null;

	/** Currently selected folder path */
	selectedFolder: string | null;
}

/**
 * Actions interface for the scan store
 */
interface ScanActions {
	/** Set the selected folder path */
	setSelectedFolder: (path: string | null) => void;

	/** Start a new scan */
	startScan: () => void;

	/** Update scan progress */
	updateProgress: (progress: ScanProgress) => void;

	/** Complete the scan with results */
	completeScan: (result: ScanResult) => void;

	/** Set scan error */
	setError: (error: string) => void;

	/** Reset scan state to initial */
	reset: () => void;
}

/**
 * Initial state for the scan store
 */
const initialState: ScanState = {
	status: ScanStatus.Idle,
	progress: null,
	result: null,
	error: null,
	selectedFolder: null,
};

/**
 * Zustand store for scan state management
 */
export const useScanStore = create<ScanState & ScanActions>((set) => ({
	...initialState,

	setSelectedFolder: (path) =>
		set({
			selectedFolder: path,
			// Reset error when selecting a new folder
			error: null,
		}),

	startScan: () =>
		set({
			status: ScanStatus.Scanning,
			progress: {
				current: 0,
				total: 0,
				currentPath: "",
				status: ScanStatus.Scanning,
			},
			result: null,
			error: null,
		}),

	updateProgress: (progress) =>
		set({
			progress,
		}),

	completeScan: (result) =>
		set({
			status: ScanStatus.Completed,
			result,
			progress: null,
		}),

	setError: (error) =>
		set({
			status: ScanStatus.Error,
			error,
			progress: null,
		}),

	reset: () => set(initialState),
}));
