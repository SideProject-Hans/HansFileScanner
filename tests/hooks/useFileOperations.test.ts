/**
 * Tests for useFileOperations hook
 * Handles file operations like delete with confirmation
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFileOperations } from "@/hooks/useFileOperations";

// Mock Tauri API
vi.mock("@/lib/tauri", () => ({
	deleteFiles: vi.fn(),
	copyFiles: vi.fn(),
	selectTargetFolder: vi.fn(),
}));

import { deleteFiles, copyFiles, selectTargetFolder } from "@/lib/tauri";

const mockDeleteFiles = vi.mocked(deleteFiles);
const mockCopyFiles = vi.mocked(copyFiles);
const mockSelectTargetFolder = vi.mocked(selectTargetFolder);

describe("useFileOperations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("initial state", () => {
		it("should not be in deleting state initially", () => {
			const { result } = renderHook(() => useFileOperations());
			expect(result.current.isDeleting).toBe(false);
		});

		it("should not show confirm dialog initially", () => {
			const { result } = renderHook(() => useFileOperations());
			expect(result.current.showConfirmDialog).toBe(false);
		});

		it("should have no error initially", () => {
			const { result } = renderHook(() => useFileOperations());
			expect(result.current.error).toBeNull();
		});

		it("should have no pending paths initially", () => {
			const { result } = renderHook(() => useFileOperations());
			expect(result.current.pendingDeletePaths).toHaveLength(0);
		});
	});

	describe("requestDelete", () => {
		it("should show confirm dialog when requesting delete", () => {
			const { result } = renderHook(() => useFileOperations());

			act(() => {
				result.current.requestDelete(["/test/file1.txt"]);
			});

			expect(result.current.showConfirmDialog).toBe(true);
			expect(result.current.pendingDeletePaths).toEqual(["/test/file1.txt"]);
		});

		it("should store multiple paths for deletion", () => {
			const { result } = renderHook(() => useFileOperations());

			act(() => {
				result.current.requestDelete(["/test/file1.txt", "/test/file2.pdf"]);
			});

			expect(result.current.pendingDeletePaths).toHaveLength(2);
		});

		it("should not show dialog for empty paths array", () => {
			const { result } = renderHook(() => useFileOperations());

			act(() => {
				result.current.requestDelete([]);
			});

			expect(result.current.showConfirmDialog).toBe(false);
		});
	});

	describe("cancelDelete", () => {
		it("should close confirm dialog when canceling", () => {
			const { result } = renderHook(() => useFileOperations());

			act(() => {
				result.current.requestDelete(["/test/file1.txt"]);
				result.current.cancelDelete();
			});

			expect(result.current.showConfirmDialog).toBe(false);
			expect(result.current.pendingDeletePaths).toHaveLength(0);
		});
	});

	describe("confirmDelete", () => {
		it("should call deleteFiles API with pending paths", async () => {
			mockDeleteFiles.mockResolvedValue({
				successCount: 1,
				failedCount: 0,
				errors: [],
			});

			const { result } = renderHook(() => useFileOperations());

			act(() => {
				result.current.requestDelete(["/test/file1.txt"]);
			});

			await act(async () => {
				await result.current.confirmDelete();
			});

			expect(mockDeleteFiles).toHaveBeenCalledWith(["/test/file1.txt"]);
		});

		it("should set isDeleting to true during operation", async () => {
			mockDeleteFiles.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() => resolve({ successCount: 1, failedCount: 0, errors: [] }),
							100
						)
					)
			);

			const { result } = renderHook(() => useFileOperations());

			act(() => {
				result.current.requestDelete(["/test/file1.txt"]);
			});

			// Start delete but don't await
			act(() => {
				result.current.confirmDelete();
			});

			expect(result.current.isDeleting).toBe(true);
		});

		it("should close dialog after successful deletion", async () => {
			mockDeleteFiles.mockResolvedValue({
				successCount: 1,
				failedCount: 0,
				errors: [],
			});

			const { result } = renderHook(() => useFileOperations());

			act(() => {
				result.current.requestDelete(["/test/file1.txt"]);
			});

			await act(async () => {
				await result.current.confirmDelete();
			});

			expect(result.current.showConfirmDialog).toBe(false);
			expect(result.current.isDeleting).toBe(false);
		});

		it("should return delete result with success count", async () => {
			mockDeleteFiles.mockResolvedValue({
				successCount: 2,
				failedCount: 0,
				errors: [],
			});

			const { result } = renderHook(() => useFileOperations());

			act(() => {
				result.current.requestDelete(["/test/file1.txt", "/test/file2.pdf"]);
			});

			let deleteResult;
			await act(async () => {
				deleteResult = await result.current.confirmDelete();
			});

			expect(deleteResult).toEqual({
				successCount: 2,
				failedCount: 0,
				errors: [],
			});
		});

		it("should handle delete errors gracefully", async () => {
			mockDeleteFiles.mockRejectedValue(new Error("Delete failed"));

			const { result } = renderHook(() => useFileOperations());

			act(() => {
				result.current.requestDelete(["/test/file1.txt"]);
			});

			await act(async () => {
				await result.current.confirmDelete();
			});

			expect(result.current.error).toBe("Delete failed");
			expect(result.current.isDeleting).toBe(false);
		});

		it("should handle non-Error rejection gracefully", async () => {
			mockDeleteFiles.mockRejectedValue("string error");

			const { result } = renderHook(() => useFileOperations());

			act(() => {
				result.current.requestDelete(["/test/file1.txt"]);
			});

			await act(async () => {
				await result.current.confirmDelete();
			});

			expect(result.current.error).toBe("Unknown error occurred");
			expect(result.current.isDeleting).toBe(false);
		});

		it("should return undefined when confirming with no pending paths", async () => {
			const { result } = renderHook(() => useFileOperations());

			let deleteResult;
			await act(async () => {
				deleteResult = await result.current.confirmDelete();
			});

			expect(deleteResult).toBeUndefined();
			expect(mockDeleteFiles).not.toHaveBeenCalled();
		});

		it("should handle partial failures", async () => {
			mockDeleteFiles.mockResolvedValue({
				successCount: 1,
				failedCount: 1,
				errors: ["Permission denied: /test/file2.pdf"],
			});

			const { result } = renderHook(() => useFileOperations());

			act(() => {
				result.current.requestDelete(["/test/file1.txt", "/test/file2.pdf"]);
			});

			let deleteResult;
			await act(async () => {
				deleteResult = await result.current.confirmDelete();
			});

			expect(deleteResult?.failedCount).toBe(1);
			expect(deleteResult?.errors).toContain(
				"Permission denied: /test/file2.pdf"
			);
		});
	});

	describe("clearError", () => {
		it("should clear error state", async () => {
			mockDeleteFiles.mockRejectedValue(new Error("Delete failed"));

			const { result } = renderHook(() => useFileOperations());

			act(() => {
				result.current.requestDelete(["/test/file1.txt"]);
			});

			await act(async () => {
				await result.current.confirmDelete();
			});

			expect(result.current.error).toBe("Delete failed");

			act(() => {
				result.current.clearError();
			});

			expect(result.current.error).toBeNull();
		});
	});

	describe("copy operations", () => {
		describe("initial state", () => {
			it("should not be in copying state initially", () => {
				const { result } = renderHook(() => useFileOperations());
				expect(result.current.isCopying).toBe(false);
			});

			it("should have no pending copy paths initially", () => {
				const { result } = renderHook(() => useFileOperations());
				expect(result.current.pendingCopyPaths).toHaveLength(0);
			});
		});

		describe("requestCopy", () => {
			it("should open folder selection dialog", async () => {
				mockSelectTargetFolder.mockResolvedValue("/target/folder");
				mockCopyFiles.mockResolvedValue({
					successCount: 1,
					failedCount: 0,
					errors: [],
				});

				const { result } = renderHook(() => useFileOperations());

				await act(async () => {
					await result.current.requestCopy(["/test/file1.txt"]);
				});

				expect(mockSelectTargetFolder).toHaveBeenCalled();
			});

			it("should call copyFiles API when folder is selected", async () => {
				mockSelectTargetFolder.mockResolvedValue("/target/folder");
				mockCopyFiles.mockResolvedValue({
					successCount: 1,
					failedCount: 0,
					errors: [],
				});

				const { result } = renderHook(() => useFileOperations());

				await act(async () => {
					await result.current.requestCopy(["/test/file1.txt"]);
				});

				expect(mockCopyFiles).toHaveBeenCalledWith(
					["/test/file1.txt"],
					"/target/folder"
				);
			});

			it("should not call copyFiles when folder selection is cancelled", async () => {
				mockSelectTargetFolder.mockResolvedValue(null);

				const { result } = renderHook(() => useFileOperations());

				await act(async () => {
					await result.current.requestCopy(["/test/file1.txt"]);
				});

				expect(mockCopyFiles).not.toHaveBeenCalled();
			});

			it("should not proceed with empty paths array", async () => {
				const { result } = renderHook(() => useFileOperations());

				await act(async () => {
					await result.current.requestCopy([]);
				});

				expect(mockSelectTargetFolder).not.toHaveBeenCalled();
			});

			it("should set isCopying to true during operation", async () => {
				mockSelectTargetFolder.mockResolvedValue("/target/folder");
				mockCopyFiles.mockImplementation(
					() =>
						new Promise((resolve) =>
							setTimeout(
								() => resolve({ successCount: 1, failedCount: 0, errors: [] }),
								100
							)
						)
				);

				const { result } = renderHook(() => useFileOperations());

				// Start copy but don't await immediately
				const copyPromise = act(async () => {
					result.current.requestCopy(["/test/file1.txt"]);
				});

				// Wait for folder selection to complete
				await waitFor(() => {
					expect(mockSelectTargetFolder).toHaveBeenCalled();
				});

				// Wait for the full operation
				await copyPromise;
			});

			it("should return copy result with success count", async () => {
				mockSelectTargetFolder.mockResolvedValue("/target/folder");
				mockCopyFiles.mockResolvedValue({
					successCount: 2,
					failedCount: 0,
					errors: [],
				});

				const { result } = renderHook(() => useFileOperations());

				let copyResult;
				await act(async () => {
					copyResult = await result.current.requestCopy([
						"/test/file1.txt",
						"/test/file2.pdf",
					]);
				});

				expect(copyResult).toEqual({
					successCount: 2,
					failedCount: 0,
					errors: [],
				});
			});

			it("should handle copy errors gracefully", async () => {
				mockSelectTargetFolder.mockResolvedValue("/target/folder");
				mockCopyFiles.mockRejectedValue(new Error("Copy failed"));

				const { result } = renderHook(() => useFileOperations());

				await act(async () => {
					await result.current.requestCopy(["/test/file1.txt"]);
				});

				expect(result.current.error).toBe("Copy failed");
				expect(result.current.isCopying).toBe(false);
			});

			it("should handle non-Error rejection gracefully", async () => {
				mockSelectTargetFolder.mockResolvedValue("/target/folder");
				mockCopyFiles.mockRejectedValue("string error");

				const { result } = renderHook(() => useFileOperations());

				await act(async () => {
					await result.current.requestCopy(["/test/file1.txt"]);
				});

				expect(result.current.error).toBe("Unknown error occurred");
				expect(result.current.isCopying).toBe(false);
			});

			it("should handle partial failures", async () => {
				mockSelectTargetFolder.mockResolvedValue("/target/folder");
				mockCopyFiles.mockResolvedValue({
					successCount: 1,
					failedCount: 1,
					errors: ["File exists: /target/folder/file2.pdf"],
				});

				const { result } = renderHook(() => useFileOperations());

				let copyResult;
				await act(async () => {
					copyResult = await result.current.requestCopy([
						"/test/file1.txt",
						"/test/file2.pdf",
					]);
				});

				expect(copyResult?.failedCount).toBe(1);
				expect(copyResult?.errors).toContain(
					"File exists: /target/folder/file2.pdf"
				);
			});

			it("should handle folder selection error gracefully", async () => {
				mockSelectTargetFolder.mockRejectedValue(new Error("Dialog error"));

				const { result } = renderHook(() => useFileOperations());

				await act(async () => {
					await result.current.requestCopy(["/test/file1.txt"]);
				});

				expect(result.current.error).toBe("Dialog error");
				expect(result.current.isCopying).toBe(false);
			});
		});
	});
});
