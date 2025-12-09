/**
 * Zustand store for managing filter state
 * Handles view mode, search query, and file type filtering
 */

import { create } from "zustand";
import { ViewMode } from "@/types/scan";

/**
 * State interface for the filter store
 */
interface FilterState {
	/** Current view mode */
	viewMode: ViewMode;

	/** Current search query */
	searchQuery: string;

	/** Selected file extensions for filtering */
	selectedExtensions: string[];

	/** Available extensions from current scan result */
	availableExtensions: string[];
}

/**
 * Actions interface for the filter store
 */
interface FilterActions {
	/** Set the view mode */
	setViewMode: (mode: ViewMode) => void;

	/** Set the search query */
	setSearchQuery: (query: string) => void;

	/** Set selected extensions */
	setSelectedExtensions: (extensions: string[]) => void;

	/** Toggle a single extension selection */
	toggleExtension: (extension: string) => void;

	/** Set available extensions from scan result */
	setAvailableExtensions: (extensions: string[]) => void;

	/** Clear all filters (search and extensions) */
	clearFilters: () => void;

	/** Reset all state to initial values */
	reset: () => void;

	/** Check if any filters are active */
	hasActiveFilters: () => boolean;
}

/**
 * Initial state for the filter store
 */
const initialState: FilterState = {
	viewMode: ViewMode.Tree,
	searchQuery: "",
	selectedExtensions: [],
	availableExtensions: [],
};

/**
 * Zustand store for filter state management
 */
export const useFilterStore = create<FilterState & FilterActions>(
	(set, get) => ({
		...initialState,

		setViewMode: (mode) =>
			set({
				viewMode: mode,
			}),

		setSearchQuery: (query) =>
			set({
				searchQuery: query.trim(),
			}),

		setSelectedExtensions: (extensions) =>
			set({
				selectedExtensions: extensions,
			}),

		toggleExtension: (extension) =>
			set((state) => {
				const isSelected = state.selectedExtensions.includes(extension);
				return {
					selectedExtensions: isSelected
						? state.selectedExtensions.filter((ext) => ext !== extension)
						: [...state.selectedExtensions, extension],
				};
			}),

		setAvailableExtensions: (extensions) =>
			set({
				// Remove duplicates and sort alphabetically
				availableExtensions: [...new Set(extensions)].sort(),
			}),

		clearFilters: () =>
			set({
				searchQuery: "",
				selectedExtensions: [],
			}),

		reset: () => set(initialState),

		hasActiveFilters: () => {
			const state = get();
			return state.searchQuery !== "" || state.selectedExtensions.length > 0;
		},
	})
);
