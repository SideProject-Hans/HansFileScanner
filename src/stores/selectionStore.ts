/**
 * Zustand store for managing file selection state
 * Handles multi-select operations for file management
 */

import { create } from "zustand";

/**
 * State interface for the selection store
 */
interface SelectionState {
	/** Set of selected file paths */
	selectedPaths: Set<string>;

	/** Whether all files are selected */
	isAllSelected: boolean;
}

/**
 * Actions interface for the selection store
 */
interface SelectionActions {
	/** Toggle selection for a single path */
	toggleSelection: (path: string) => void;

	/** Add multiple paths to selection */
	selectMultiple: (paths: string[]) => void;

	/** Remove multiple paths from selection */
	deselectMultiple: (paths: string[]) => void;

	/** Select all provided paths */
	selectAll: (paths: string[]) => void;

	/** Clear all selections */
	deselectAll: () => void;

	/** Check if a path is selected */
	isSelected: (path: string) => boolean;

	/** Get the count of selected paths */
	getSelectedCount: () => number;

	/** Get array of selected paths */
	getSelectedPaths: () => string[];

	/** Reset all state to initial values */
	reset: () => void;
}

/**
 * Initial state for the selection store
 */
const initialState: SelectionState = {
	selectedPaths: new Set<string>(),
	isAllSelected: false,
};

/**
 * Selection store for managing file selection state
 */
export const useSelectionStore = create<SelectionState & SelectionActions>(
	(set, get) => ({
		...initialState,

		toggleSelection: (path: string) => {
			set((state) => {
				const newSelectedPaths = new Set(state.selectedPaths);
				if (newSelectedPaths.has(path)) {
					newSelectedPaths.delete(path);
				} else {
					newSelectedPaths.add(path);
				}
				return {
					selectedPaths: newSelectedPaths,
					isAllSelected: false, // Reset isAllSelected when manually toggling
				};
			});
		},

		selectMultiple: (paths: string[]) => {
			set((state) => {
				const newSelectedPaths = new Set(state.selectedPaths);
				paths.forEach((path) => newSelectedPaths.add(path));
				return { selectedPaths: newSelectedPaths };
			});
		},

		deselectMultiple: (paths: string[]) => {
			set((state) => {
				const newSelectedPaths = new Set(state.selectedPaths);
				paths.forEach((path) => newSelectedPaths.delete(path));
				return {
					selectedPaths: newSelectedPaths,
					isAllSelected: false,
				};
			});
		},

		selectAll: (paths: string[]) => {
			set({
				selectedPaths: new Set(paths),
				isAllSelected: true,
			});
		},

		deselectAll: () => {
			set({
				selectedPaths: new Set<string>(),
				isAllSelected: false,
			});
		},

		isSelected: (path: string) => {
			return get().selectedPaths.has(path);
		},

		getSelectedCount: () => {
			return get().selectedPaths.size;
		},

		getSelectedPaths: () => {
			return Array.from(get().selectedPaths);
		},

		reset: () => {
			set({
				selectedPaths: new Set<string>(),
				isAllSelected: false,
			});
		},
	})
);
