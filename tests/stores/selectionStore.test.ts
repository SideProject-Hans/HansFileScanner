/**
 * Tests for selectionStore
 * Manages file selection state for multi-select operations
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useSelectionStore } from "@/stores/selectionStore";

describe("selectionStore", () => {
	beforeEach(() => {
		// Reset the store state before each test
		useSelectionStore.getState().reset();
	});

	describe("initial state", () => {
		it("should have empty selected files", () => {
			const { selectedPaths } = useSelectionStore.getState();
			expect(selectedPaths).toEqual(new Set());
		});

		it("should not be in select all mode", () => {
			const { isAllSelected } = useSelectionStore.getState();
			expect(isAllSelected).toBe(false);
		});
	});

	describe("toggleSelection", () => {
		it("should add path to selection if not selected", () => {
			const { toggleSelection } = useSelectionStore.getState();
			toggleSelection("/path/to/file.txt");

			const { selectedPaths } = useSelectionStore.getState();
			expect(selectedPaths.has("/path/to/file.txt")).toBe(true);
		});

		it("should remove path from selection if already selected", () => {
			const { toggleSelection } = useSelectionStore.getState();
			toggleSelection("/path/to/file.txt");
			toggleSelection("/path/to/file.txt");

			const { selectedPaths } = useSelectionStore.getState();
			expect(selectedPaths.has("/path/to/file.txt")).toBe(false);
		});

		it("should handle multiple selections", () => {
			const { toggleSelection } = useSelectionStore.getState();
			toggleSelection("/path/to/file1.txt");
			toggleSelection("/path/to/file2.txt");

			const { selectedPaths } = useSelectionStore.getState();
			expect(selectedPaths.size).toBe(2);
			expect(selectedPaths.has("/path/to/file1.txt")).toBe(true);
			expect(selectedPaths.has("/path/to/file2.txt")).toBe(true);
		});
	});

	describe("selectMultiple", () => {
		it("should add multiple paths to selection", () => {
			const { selectMultiple } = useSelectionStore.getState();
			selectMultiple(["/path/to/file1.txt", "/path/to/file2.txt"]);

			const { selectedPaths } = useSelectionStore.getState();
			expect(selectedPaths.size).toBe(2);
		});

		it("should not duplicate existing selections", () => {
			const { toggleSelection, selectMultiple } = useSelectionStore.getState();
			toggleSelection("/path/to/file1.txt");
			selectMultiple(["/path/to/file1.txt", "/path/to/file2.txt"]);

			const { selectedPaths } = useSelectionStore.getState();
			expect(selectedPaths.size).toBe(2);
		});
	});

	describe("deselectMultiple", () => {
		it("should remove multiple paths from selection", () => {
			const { selectMultiple, deselectMultiple } = useSelectionStore.getState();
			selectMultiple([
				"/path/to/file1.txt",
				"/path/to/file2.txt",
				"/path/to/file3.txt",
			]);
			deselectMultiple(["/path/to/file1.txt", "/path/to/file2.txt"]);

			const { selectedPaths } = useSelectionStore.getState();
			expect(selectedPaths.size).toBe(1);
			expect(selectedPaths.has("/path/to/file3.txt")).toBe(true);
		});
	});

	describe("selectAll", () => {
		it("should select all provided paths", () => {
			const { selectAll } = useSelectionStore.getState();
			selectAll(["/path/to/file1.txt", "/path/to/file2.txt"]);

			const { selectedPaths, isAllSelected } = useSelectionStore.getState();
			expect(selectedPaths.size).toBe(2);
			expect(isAllSelected).toBe(true);
		});

		it("should replace existing selection", () => {
			const { toggleSelection, selectAll } = useSelectionStore.getState();
			toggleSelection("/path/to/old-file.txt");
			selectAll(["/path/to/file1.txt", "/path/to/file2.txt"]);

			const { selectedPaths } = useSelectionStore.getState();
			expect(selectedPaths.size).toBe(2);
			expect(selectedPaths.has("/path/to/old-file.txt")).toBe(false);
		});
	});

	describe("deselectAll", () => {
		it("should clear all selections", () => {
			const { selectAll, deselectAll } = useSelectionStore.getState();
			selectAll(["/path/to/file1.txt", "/path/to/file2.txt"]);
			deselectAll();

			const { selectedPaths, isAllSelected } = useSelectionStore.getState();
			expect(selectedPaths.size).toBe(0);
			expect(isAllSelected).toBe(false);
		});
	});

	describe("isSelected", () => {
		it("should return true for selected path", () => {
			const { toggleSelection, isSelected } = useSelectionStore.getState();
			toggleSelection("/path/to/file.txt");

			expect(isSelected("/path/to/file.txt")).toBe(true);
		});

		it("should return false for unselected path", () => {
			const { isSelected } = useSelectionStore.getState();
			expect(isSelected("/path/to/file.txt")).toBe(false);
		});
	});

	describe("getSelectedCount", () => {
		it("should return correct count", () => {
			const { selectMultiple, getSelectedCount } = useSelectionStore.getState();
			selectMultiple(["/path/to/file1.txt", "/path/to/file2.txt"]);

			expect(getSelectedCount()).toBe(2);
		});

		it("should return 0 when no selection", () => {
			const { getSelectedCount } = useSelectionStore.getState();
			expect(getSelectedCount()).toBe(0);
		});
	});

	describe("getSelectedPaths", () => {
		it("should return array of selected paths", () => {
			const { selectMultiple, getSelectedPaths } = useSelectionStore.getState();
			selectMultiple(["/path/to/file1.txt", "/path/to/file2.txt"]);

			const paths = getSelectedPaths();
			expect(paths).toContain("/path/to/file1.txt");
			expect(paths).toContain("/path/to/file2.txt");
		});
	});

	describe("reset", () => {
		it("should reset all state to initial values", () => {
			const { selectAll, reset } = useSelectionStore.getState();
			selectAll(["/path/to/file1.txt", "/path/to/file2.txt"]);
			reset();

			const { selectedPaths, isAllSelected } = useSelectionStore.getState();
			expect(selectedPaths.size).toBe(0);
			expect(isAllSelected).toBe(false);
		});
	});
});
