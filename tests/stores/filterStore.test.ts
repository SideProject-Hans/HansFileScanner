/**
 * Tests for filterStore
 * Manages view mode, search query, and file type filtering
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useFilterStore } from "@/stores/filterStore";
import { ViewMode } from "@/types/scan";

describe("filterStore", () => {
	beforeEach(() => {
		// Reset the store state before each test
		useFilterStore.getState().reset();
	});

	describe("initial state", () => {
		it("should have default view mode as Tree", () => {
			const { viewMode } = useFilterStore.getState();
			expect(viewMode).toBe(ViewMode.Tree);
		});

		it("should have empty search query", () => {
			const { searchQuery } = useFilterStore.getState();
			expect(searchQuery).toBe("");
		});

		it("should have no selected extensions", () => {
			const { selectedExtensions } = useFilterStore.getState();
			expect(selectedExtensions).toEqual([]);
		});

		it("should have empty available extensions", () => {
			const { availableExtensions } = useFilterStore.getState();
			expect(availableExtensions).toEqual([]);
		});
	});

	describe("setViewMode", () => {
		it("should update view mode to Documents", () => {
			const { setViewMode } = useFilterStore.getState();
			setViewMode(ViewMode.Documents);

			const { viewMode } = useFilterStore.getState();
			expect(viewMode).toBe(ViewMode.Documents);
		});

		it("should update view mode to Images", () => {
			const { setViewMode } = useFilterStore.getState();
			setViewMode(ViewMode.Images);

			const { viewMode } = useFilterStore.getState();
			expect(viewMode).toBe(ViewMode.Images);
		});

		it("should update view mode to Videos", () => {
			const { setViewMode } = useFilterStore.getState();
			setViewMode(ViewMode.Videos);

			const { viewMode } = useFilterStore.getState();
			expect(viewMode).toBe(ViewMode.Videos);
		});

		it("should update view mode to Audio", () => {
			const { setViewMode } = useFilterStore.getState();
			setViewMode(ViewMode.Audio);

			const { viewMode } = useFilterStore.getState();
			expect(viewMode).toBe(ViewMode.Audio);
		});
	});

	describe("setSearchQuery", () => {
		it("should update search query", () => {
			const { setSearchQuery } = useFilterStore.getState();
			setSearchQuery("test.txt");

			const { searchQuery } = useFilterStore.getState();
			expect(searchQuery).toBe("test.txt");
		});

		it("should trim whitespace from search query", () => {
			const { setSearchQuery } = useFilterStore.getState();
			setSearchQuery("  test.txt  ");

			const { searchQuery } = useFilterStore.getState();
			expect(searchQuery).toBe("test.txt");
		});

		it("should handle empty search query", () => {
			const { setSearchQuery } = useFilterStore.getState();
			setSearchQuery("test");
			setSearchQuery("");

			const { searchQuery } = useFilterStore.getState();
			expect(searchQuery).toBe("");
		});
	});

	describe("setSelectedExtensions", () => {
		it("should update selected extensions", () => {
			const { setSelectedExtensions } = useFilterStore.getState();
			setSelectedExtensions(["jpg", "png"]);

			const { selectedExtensions } = useFilterStore.getState();
			expect(selectedExtensions).toEqual(["jpg", "png"]);
		});

		it("should replace existing extensions", () => {
			const { setSelectedExtensions } = useFilterStore.getState();
			setSelectedExtensions(["jpg"]);
			setSelectedExtensions(["pdf", "doc"]);

			const { selectedExtensions } = useFilterStore.getState();
			expect(selectedExtensions).toEqual(["pdf", "doc"]);
		});

		it("should handle empty extensions array", () => {
			const { setSelectedExtensions } = useFilterStore.getState();
			setSelectedExtensions(["jpg"]);
			setSelectedExtensions([]);

			const { selectedExtensions } = useFilterStore.getState();
			expect(selectedExtensions).toEqual([]);
		});
	});

	describe("toggleExtension", () => {
		it("should add extension if not selected", () => {
			const { toggleExtension } = useFilterStore.getState();
			toggleExtension("jpg");

			const { selectedExtensions } = useFilterStore.getState();
			expect(selectedExtensions).toContain("jpg");
		});

		it("should remove extension if already selected", () => {
			const { setSelectedExtensions, toggleExtension } =
				useFilterStore.getState();
			setSelectedExtensions(["jpg", "png"]);
			toggleExtension("jpg");

			const { selectedExtensions } = useFilterStore.getState();
			expect(selectedExtensions).not.toContain("jpg");
			expect(selectedExtensions).toContain("png");
		});

		it("should handle multiple toggles", () => {
			const { toggleExtension } = useFilterStore.getState();
			toggleExtension("jpg");
			toggleExtension("png");
			toggleExtension("jpg");

			const { selectedExtensions } = useFilterStore.getState();
			expect(selectedExtensions).toEqual(["png"]);
		});
	});

	describe("setAvailableExtensions", () => {
		it("should update available extensions", () => {
			const { setAvailableExtensions } = useFilterStore.getState();
			setAvailableExtensions(["jpg", "png", "pdf", "doc"]);

			const { availableExtensions } = useFilterStore.getState();
			// Extensions are sorted alphabetically
			expect(availableExtensions).toEqual(["doc", "jpg", "pdf", "png"]);
		});

		it("should sort extensions alphabetically", () => {
			const { setAvailableExtensions } = useFilterStore.getState();
			setAvailableExtensions(["png", "jpg", "doc", "pdf"]);

			const { availableExtensions } = useFilterStore.getState();
			expect(availableExtensions).toEqual(["doc", "jpg", "pdf", "png"]);
		});

		it("should remove duplicates", () => {
			const { setAvailableExtensions } = useFilterStore.getState();
			setAvailableExtensions(["jpg", "png", "jpg", "png"]);

			const { availableExtensions } = useFilterStore.getState();
			expect(availableExtensions).toEqual(["jpg", "png"]);
		});
	});

	describe("clearFilters", () => {
		it("should clear search query", () => {
			const { setSearchQuery, clearFilters } = useFilterStore.getState();
			setSearchQuery("test");
			clearFilters();

			const { searchQuery } = useFilterStore.getState();
			expect(searchQuery).toBe("");
		});

		it("should clear selected extensions", () => {
			const { setSelectedExtensions, clearFilters } = useFilterStore.getState();
			setSelectedExtensions(["jpg", "png"]);
			clearFilters();

			const { selectedExtensions } = useFilterStore.getState();
			expect(selectedExtensions).toEqual([]);
		});

		it("should keep view mode unchanged", () => {
			const { setViewMode, clearFilters } = useFilterStore.getState();
			setViewMode(ViewMode.Images);
			clearFilters();

			const { viewMode } = useFilterStore.getState();
			expect(viewMode).toBe(ViewMode.Images);
		});

		it("should keep available extensions unchanged", () => {
			const { setAvailableExtensions, clearFilters } =
				useFilterStore.getState();
			setAvailableExtensions(["jpg", "png"]);
			clearFilters();

			const { availableExtensions } = useFilterStore.getState();
			expect(availableExtensions).toEqual(["jpg", "png"]);
		});
	});

	describe("reset", () => {
		it("should reset all state to initial values", () => {
			const {
				setViewMode,
				setSearchQuery,
				setSelectedExtensions,
				setAvailableExtensions,
				reset,
			} = useFilterStore.getState();

			setViewMode(ViewMode.Images);
			setSearchQuery("test");
			setSelectedExtensions(["jpg"]);
			setAvailableExtensions(["jpg", "png"]);

			reset();

			const { viewMode, searchQuery, selectedExtensions, availableExtensions } =
				useFilterStore.getState();
			expect(viewMode).toBe(ViewMode.Tree);
			expect(searchQuery).toBe("");
			expect(selectedExtensions).toEqual([]);
			expect(availableExtensions).toEqual([]);
		});
	});

	describe("hasActiveFilters", () => {
		it("should return false when no filters are active", () => {
			const { hasActiveFilters } = useFilterStore.getState();
			expect(hasActiveFilters()).toBe(false);
		});

		it("should return true when search query is set", () => {
			const { setSearchQuery, hasActiveFilters } = useFilterStore.getState();
			setSearchQuery("test");
			expect(hasActiveFilters()).toBe(true);
		});

		it("should return true when extensions are selected", () => {
			const { setSelectedExtensions, hasActiveFilters } =
				useFilterStore.getState();
			setSelectedExtensions(["jpg"]);
			expect(hasActiveFilters()).toBe(true);
		});

		it("should return true when both search and extensions are set", () => {
			const { setSearchQuery, setSelectedExtensions, hasActiveFilters } =
				useFilterStore.getState();
			setSearchQuery("test");
			setSelectedExtensions(["jpg"]);
			expect(hasActiveFilters()).toBe(true);
		});
	});
});
