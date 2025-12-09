/**
 * Tests for useScanner hook
 * TDD: T038
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useScanner } from "@/hooks/useScanner";
import { useScanStore } from "@/stores/scanStore";
import { ScanStatus } from "@/types/scan";

// Mock Tauri API
vi.mock("@/lib/tauri", () => ({
	scanFolder: vi.fn(),
	selectFolder: vi.fn(),
	onScanProgress: vi.fn().mockResolvedValue(() => {}),
}));

// Import mocked modules
import { scanFolder, selectFolder, onScanProgress } from "@/lib/tauri";

const mockScanFolder = vi.mocked(scanFolder);
const mockSelectFolder = vi.mocked(selectFolder);
const mockOnScanProgress = vi.mocked(onScanProgress);

describe("useScanner", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useScanStore.getState().reset();
	});

	describe("initial state", () => {
		it("should have idle status initially", () => {
			const { result } = renderHook(() => useScanner());
			expect(result.current.status).toBe(ScanStatus.Idle);
		});

		it("should have isScanning as false initially", () => {
			const { result } = renderHook(() => useScanner());
			expect(result.current.isScanning).toBe(false);
		});

		it("should have null progress initially", () => {
			const { result } = renderHook(() => useScanner());
			expect(result.current.progress).toBeNull();
		});

		it("should have null result initially", () => {
			const { result } = renderHook(() => useScanner());
			expect(result.current.result).toBeNull();
		});

		it("should have null error initially", () => {
			const { result } = renderHook(() => useScanner());
			expect(result.current.error).toBeNull();
		});

		it("should have null selectedFolder initially", () => {
			const { result } = renderHook(() => useScanner());
			expect(result.current.selectedFolder).toBeNull();
		});
	});

	describe("openFolderDialog", () => {
		it("should call selectFolder from Tauri API", async () => {
			mockSelectFolder.mockResolvedValueOnce("/test/folder");
			const { result } = renderHook(() => useScanner());

			await act(async () => {
				await result.current.openFolderDialog();
			});

			expect(mockSelectFolder).toHaveBeenCalledTimes(1);
		});

		it("should update selectedFolder when folder is selected", async () => {
			mockSelectFolder.mockResolvedValueOnce("/test/folder");
			const { result } = renderHook(() => useScanner());

			await act(async () => {
				await result.current.openFolderDialog();
			});

			expect(result.current.selectedFolder).toBe("/test/folder");
		});

		it("should not update selectedFolder when dialog is cancelled", async () => {
			mockSelectFolder.mockResolvedValueOnce(null);
			const { result } = renderHook(() => useScanner());

			await act(async () => {
				await result.current.openFolderDialog();
			});

			expect(result.current.selectedFolder).toBeNull();
		});

		it("should set error when selectFolder throws", async () => {
			mockSelectFolder.mockRejectedValueOnce(new Error("Dialog error"));
			const { result } = renderHook(() => useScanner());

			await act(async () => {
				await result.current.openFolderDialog();
			});

			expect(result.current.error).toBe("Dialog error");
		});
	});

	describe("startScan", () => {
		it("should set error if no folder is selected", async () => {
			const { result } = renderHook(() => useScanner());

			await act(async () => {
				await result.current.startScan();
			});

			expect(result.current.error).toBe("No folder selected");
		});

		it("should call scanFolder with selected folder", async () => {
			const mockResult = {
				rootPath: "/test/folder",
				entries: [],
				stats: {
					totalFiles: 0,
					totalFolders: 0,
					totalSize: 0,
					documentCount: 0,
					imageCount: 0,
					videoCount: 0,
					audioCount: 0,
					otherCount: 0,
				},
				failedEntries: [],
				completedAt: "2024-01-01T00:00:00Z",
				durationMs: 100,
			};
			mockScanFolder.mockResolvedValueOnce(mockResult);
			mockSelectFolder.mockResolvedValueOnce("/test/folder");

			const { result } = renderHook(() => useScanner());

			await act(async () => {
				await result.current.openFolderDialog();
			});

			await act(async () => {
				await result.current.startScan();
			});

			expect(mockScanFolder).toHaveBeenCalledWith("/test/folder");
		});

		it("should set status to scanning while scan is in progress", async () => {
			let resolvePromise: (value: unknown) => void;
			const pendingPromise = new Promise((resolve) => {
				resolvePromise = resolve;
			});
			mockScanFolder.mockReturnValueOnce(pendingPromise as Promise<never>);
			mockSelectFolder.mockResolvedValueOnce("/test/folder");

			const { result } = renderHook(() => useScanner());

			await act(async () => {
				await result.current.openFolderDialog();
			});

			act(() => {
				result.current.startScan();
			});

			// Check status is scanning while promise is pending
			await waitFor(() => {
				expect(result.current.status).toBe(ScanStatus.Scanning);
				expect(result.current.isScanning).toBe(true);
			});

			// Resolve the promise to complete the test
			resolvePromise!({
				rootPath: "/test/folder",
				entries: [],
				stats: {
					totalFiles: 0,
					totalFolders: 0,
					totalSize: 0,
					documentCount: 0,
					imageCount: 0,
					videoCount: 0,
					audioCount: 0,
					otherCount: 0,
				},
				failedEntries: [],
				completedAt: "2024-01-01T00:00:00Z",
				durationMs: 100,
			});
		});

		it("should set result when scan completes successfully", async () => {
			const mockResult = {
				rootPath: "/test/folder",
				entries: [
					{
						path: "/test/folder/file.txt",
						name: "file.txt",
						isDirectory: false,
						size: 100,
						modifiedAt: "2024-01-01T00:00:00Z",
						category: "document" as const,
						extension: "txt",
						depth: 1,
						parentPath: "/test/folder",
					},
				],
				stats: {
					totalFiles: 1,
					totalFolders: 0,
					totalSize: 100,
					documentCount: 1,
					imageCount: 0,
					videoCount: 0,
					audioCount: 0,
					otherCount: 0,
				},
				failedEntries: [],
				completedAt: "2024-01-01T00:00:00Z",
				durationMs: 100,
			};
			mockScanFolder.mockResolvedValueOnce(mockResult);
			mockSelectFolder.mockResolvedValueOnce("/test/folder");

			const { result } = renderHook(() => useScanner());

			await act(async () => {
				await result.current.openFolderDialog();
			});

			await act(async () => {
				await result.current.startScan();
			});

			expect(result.current.status).toBe(ScanStatus.Completed);
			expect(result.current.result).toEqual(mockResult);
		});

		it("should set error when scan fails", async () => {
			mockScanFolder.mockRejectedValueOnce(new Error("Scan failed"));
			mockSelectFolder.mockResolvedValueOnce("/test/folder");

			const { result } = renderHook(() => useScanner());

			await act(async () => {
				await result.current.openFolderDialog();
			});

			await act(async () => {
				await result.current.startScan();
			});

			expect(result.current.status).toBe(ScanStatus.Error);
			expect(result.current.error).toBe("Scan failed");
		});

		it("should handle non-Error rejection from scan", async () => {
			mockScanFolder.mockRejectedValueOnce("string error");
			mockSelectFolder.mockResolvedValueOnce("/test/folder");

			const { result } = renderHook(() => useScanner());

			await act(async () => {
				await result.current.openFolderDialog();
			});

			await act(async () => {
				await result.current.startScan();
			});

			expect(result.current.status).toBe(ScanStatus.Error);
			expect(result.current.error).toBe("Scan failed");
		});

		it("should handle non-Error rejection from folder dialog", async () => {
			mockSelectFolder.mockRejectedValueOnce("string error");
			const { result } = renderHook(() => useScanner());

			await act(async () => {
				await result.current.openFolderDialog();
			});

			expect(result.current.error).toBe("Failed to select folder");
		});
	});

	describe("reset", () => {
		it("should reset all state to initial values", async () => {
			mockSelectFolder.mockResolvedValueOnce("/test/folder");

			const { result } = renderHook(() => useScanner());

			await act(async () => {
				await result.current.openFolderDialog();
			});

			act(() => {
				result.current.reset();
			});

			expect(result.current.status).toBe(ScanStatus.Idle);
			expect(result.current.progress).toBeNull();
			expect(result.current.result).toBeNull();
			expect(result.current.error).toBeNull();
			expect(result.current.selectedFolder).toBeNull();
		});
	});

	describe("progress listener", () => {
		it("should set up progress listener on mount", () => {
			renderHook(() => useScanner());
			expect(mockOnScanProgress).toHaveBeenCalled();
		});
	});
});
