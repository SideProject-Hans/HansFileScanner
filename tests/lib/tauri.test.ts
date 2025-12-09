import { describe, it, expect, vi, beforeEach } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";

import {
	scanFolder,
	deleteFiles,
	copyFiles,
	selectFolder,
	selectTargetFolder,
	onScanProgress,
} from "@/lib/tauri";
import type { ScanResult, FileOperationResult } from "@/types/file";
import type { ScanProgressPayload } from "@/types/scan";

// Mock the event listener
vi.mock("@tauri-apps/api/event", () => ({
	listen: vi.fn(),
}));

describe("tauri", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("scanFolder", () => {
		it("should invoke scan_folder command with correct path", async () => {
			const mockResult: ScanResult = {
				files: [],
				stats: {
					totalFiles: 0,
					totalFolders: 0,
					totalSize: 0,
					categories: {
						document: { count: 0, size: 0 },
						image: { count: 0, size: 0 },
						video: { count: 0, size: 0 },
						audio: { count: 0, size: 0 },
						archive: { count: 0, size: 0 },
						code: { count: 0, size: 0 },
						other: { count: 0, size: 0 },
					},
				},
				rootPath: "/test/path",
				scanDuration: 100,
			};

			vi.mocked(invoke).mockResolvedValue(mockResult);

			const result = await scanFolder("/test/path");

			expect(invoke).toHaveBeenCalledWith("scan_folder", { path: "/test/path" });
			expect(result).toEqual(mockResult);
		});

		it("should throw error when scan fails", async () => {
			vi.mocked(invoke).mockRejectedValue(new Error("Scan failed"));

			await expect(scanFolder("/invalid/path")).rejects.toThrow("Scan failed");
		});
	});

	describe("deleteFiles", () => {
		it("should invoke delete_files command with correct paths", async () => {
			const mockResult: FileOperationResult = {
				success: true,
				processedCount: 2,
				failedPaths: [],
			};

			vi.mocked(invoke).mockResolvedValue(mockResult);

			const paths = ["/file1.txt", "/file2.txt"];
			const result = await deleteFiles(paths);

			expect(invoke).toHaveBeenCalledWith("delete_files", { paths });
			expect(result).toEqual(mockResult);
		});

		it("should return failed paths when some files fail to delete", async () => {
			const mockResult: FileOperationResult = {
				success: false,
				processedCount: 1,
				failedPaths: ["/file2.txt"],
				error: "Permission denied",
			};

			vi.mocked(invoke).mockResolvedValue(mockResult);

			const paths = ["/file1.txt", "/file2.txt"];
			const result = await deleteFiles(paths);

			expect(result.success).toBe(false);
			expect(result.failedPaths).toContain("/file2.txt");
		});
	});

	describe("copyFiles", () => {
		it("should invoke copy_files command with correct parameters", async () => {
			const mockResult: FileOperationResult = {
				success: true,
				processedCount: 2,
				failedPaths: [],
			};

			vi.mocked(invoke).mockResolvedValue(mockResult);

			const sourcePaths = ["/source/file1.txt", "/source/file2.txt"];
			const targetFolder = "/target/folder";
			const result = await copyFiles(sourcePaths, targetFolder);

			expect(invoke).toHaveBeenCalledWith("copy_files", {
				sourcePaths,
				targetFolder,
			});
			expect(result).toEqual(mockResult);
		});

		it("should handle copy failures", async () => {
			const mockResult: FileOperationResult = {
				success: false,
				processedCount: 0,
				failedPaths: ["/source/file1.txt"],
				error: "Target folder does not exist",
			};

			vi.mocked(invoke).mockResolvedValue(mockResult);

			const result = await copyFiles(["/source/file1.txt"], "/invalid/target");

			expect(result.success).toBe(false);
			expect(result.error).toBe("Target folder does not exist");
		});
	});

	describe("selectFolder", () => {
		it("should open folder selection dialog and return selected path", async () => {
			vi.mocked(open).mockResolvedValue("/selected/folder");

			const result = await selectFolder();

			expect(open).toHaveBeenCalledWith({
				directory: true,
				multiple: false,
				title: "選擇要掃描的資料夾",
			});
			expect(result).toBe("/selected/folder");
		});

		it("should return null when dialog is cancelled", async () => {
			vi.mocked(open).mockResolvedValue(null);

			const result = await selectFolder();

			expect(result).toBeNull();
		});
	});

	describe("selectTargetFolder", () => {
		it("should open folder selection dialog for copy target and return selected path", async () => {
			vi.mocked(open).mockResolvedValue("/target/folder");

			const result = await selectTargetFolder();

			expect(open).toHaveBeenCalledWith({
				directory: true,
				multiple: false,
				title: "選擇目標資料夾",
			});
			expect(result).toBe("/target/folder");
		});

		it("should return null when dialog is cancelled", async () => {
			vi.mocked(open).mockResolvedValue(null);

			const result = await selectTargetFolder();

			expect(result).toBeNull();
		});
	});

	describe("onScanProgress", () => {
		it("should register event listener for scan progress", async () => {
			const mockUnlisten = vi.fn();
			vi.mocked(listen).mockResolvedValue(mockUnlisten);

			const callback = vi.fn();
			const unlisten = await onScanProgress(callback);

			expect(listen).toHaveBeenCalledWith("scan_progress", expect.any(Function));
			expect(unlisten).toBe(mockUnlisten);
		});

		it("should call callback with payload when event is received", async () => {
			const mockUnlisten = vi.fn();
			let registeredCallback: ((event: { payload: ScanProgressPayload }) => void) | null = null;

			vi.mocked(listen).mockImplementation(async (_eventName, callback) => {
				registeredCallback = callback as (event: { payload: ScanProgressPayload }) => void;
				return mockUnlisten;
			});

			const userCallback = vi.fn();
			await onScanProgress(userCallback);

			// Simulate event emission
			const mockPayload: ScanProgressPayload = {
				scannedFiles: 50,
				currentFile: "/test/file.txt",
			};

			if (registeredCallback) {
				registeredCallback({ payload: mockPayload });
			}

			expect(userCallback).toHaveBeenCalledWith(mockPayload);
		});

		it("should return working unlisten function", async () => {
			const mockUnlisten = vi.fn();
			vi.mocked(listen).mockResolvedValue(mockUnlisten);

			const callback = vi.fn();
			const unlisten = await onScanProgress(callback);

			unlisten();

			expect(mockUnlisten).toHaveBeenCalled();
		});
	});
});
