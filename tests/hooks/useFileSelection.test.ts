/**
 * Tests for useFileSelection hook
 * Provides file selection functionality with integration to selectionStore
 */

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileSelection } from "@/hooks/useFileSelection";
import { useSelectionStore } from "@/stores/selectionStore";
import type { FileEntry } from "@/types/file";
import { FileCategory } from "@/types/file";

// Mock file entries for testing
const mockFiles: FileEntry[] = [
	{
		path: "/test/file1.txt",
		name: "file1.txt",
		isDirectory: false,
		size: 1024,
		modifiedAt: "2024-01-01T00:00:00Z",
		category: FileCategory.Document,
		extension: "txt",
		depth: 1,
		parentPath: "/test",
	},
	{
		path: "/test/file2.pdf",
		name: "file2.pdf",
		isDirectory: false,
		size: 2048,
		modifiedAt: "2024-01-02T00:00:00Z",
		category: FileCategory.Document,
		extension: "pdf",
		depth: 1,
		parentPath: "/test",
	},
	{
		path: "/test/folder",
		name: "folder",
		isDirectory: true,
		size: 0,
		modifiedAt: "2024-01-03T00:00:00Z",
		category: FileCategory.Folder,
		extension: "",
		depth: 1,
		parentPath: "/test",
	},
];

describe("useFileSelection", () => {
	beforeEach(() => {
		// Reset the selection store before each test
		useSelectionStore.getState().reset();
	});

	describe("initial state", () => {
		it("should have no selections initially", () => {
			const { result } = renderHook(() => useFileSelection(mockFiles));
			expect(result.current.selectedCount).toBe(0);
			expect(result.current.hasSelection).toBe(false);
		});

		it("should not be in all selected state initially", () => {
			const { result } = renderHook(() => useFileSelection(mockFiles));
			expect(result.current.isAllSelected).toBe(false);
		});
	});

	describe("toggleSelection", () => {
		it("should select a file when toggling unselected file", () => {
			const { result } = renderHook(() => useFileSelection(mockFiles));

			act(() => {
				result.current.toggleSelection("/test/file1.txt");
			});

			expect(result.current.selectedCount).toBe(1);
			expect(result.current.isSelected("/test/file1.txt")).toBe(true);
		});

		it("should deselect a file when toggling selected file", () => {
			const { result } = renderHook(() => useFileSelection(mockFiles));

			act(() => {
				result.current.toggleSelection("/test/file1.txt");
				result.current.toggleSelection("/test/file1.txt");
			});

			expect(result.current.selectedCount).toBe(0);
			expect(result.current.isSelected("/test/file1.txt")).toBe(false);
		});
	});

	describe("selectAll", () => {
		it("should select all non-directory files", () => {
			const { result } = renderHook(() => useFileSelection(mockFiles));

			act(() => {
				result.current.selectAll();
			});

			// Should select only files (2), not the folder
			expect(result.current.selectedCount).toBe(2);
			expect(result.current.isAllSelected).toBe(true);
		});
	});

	describe("deselectAll", () => {
		it("should clear all selections", () => {
			const { result } = renderHook(() => useFileSelection(mockFiles));

			act(() => {
				result.current.selectAll();
				result.current.deselectAll();
			});

			expect(result.current.selectedCount).toBe(0);
			expect(result.current.hasSelection).toBe(false);
		});
	});

	describe("getSelectedFiles", () => {
		it("should return array of selected file entries", () => {
			const { result } = renderHook(() => useFileSelection(mockFiles));

			act(() => {
				result.current.toggleSelection("/test/file1.txt");
			});

			const selectedFiles = result.current.getSelectedFiles();
			expect(selectedFiles).toHaveLength(1);
			expect(selectedFiles[0].path).toBe("/test/file1.txt");
		});
	});

	describe("getSelectedPaths", () => {
		it("should return array of selected paths", () => {
			const { result } = renderHook(() => useFileSelection(mockFiles));

			act(() => {
				result.current.toggleSelection("/test/file1.txt");
				result.current.toggleSelection("/test/file2.pdf");
			});

			const paths = result.current.getSelectedPaths();
			expect(paths).toContain("/test/file1.txt");
			expect(paths).toContain("/test/file2.pdf");
		});
	});

	describe("with empty file list", () => {
		it("should handle empty file list gracefully", () => {
			const { result } = renderHook(() => useFileSelection([]));

			act(() => {
				result.current.selectAll();
			});

			expect(result.current.selectedCount).toBe(0);
		});
	});
});
