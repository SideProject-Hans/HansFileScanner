/**
 * Tests for scanStore - Zustand store for scan state management
 * TDD: T039
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useScanStore } from "@/stores/scanStore";
import { ScanStatus } from "@/types/scan";
import type { ScanResult } from "@/types/file";

describe("scanStore", () => {
	beforeEach(() => {
		// Reset the store before each test
		useScanStore.getState().reset();
	});

	describe("initial state", () => {
		it("should have idle status initially", () => {
			const state = useScanStore.getState();
			expect(state.status).toBe(ScanStatus.Idle);
		});

		it("should have null progress initially", () => {
			const state = useScanStore.getState();
			expect(state.progress).toBeNull();
		});

		it("should have null result initially", () => {
			const state = useScanStore.getState();
			expect(state.result).toBeNull();
		});

		it("should have null error initially", () => {
			const state = useScanStore.getState();
			expect(state.error).toBeNull();
		});

		it("should have null selectedFolder initially", () => {
			const state = useScanStore.getState();
			expect(state.selectedFolder).toBeNull();
		});
	});

	describe("setSelectedFolder", () => {
		it("should update selected folder path", () => {
			useScanStore.getState().setSelectedFolder("/test/path");
			expect(useScanStore.getState().selectedFolder).toBe("/test/path");
		});

		it("should clear error when selecting a new folder", () => {
			useScanStore.getState().setError("Previous error");
			useScanStore.getState().setSelectedFolder("/test/path");
			expect(useScanStore.getState().error).toBeNull();
		});

		it("should allow setting folder to null", () => {
			useScanStore.getState().setSelectedFolder("/test/path");
			useScanStore.getState().setSelectedFolder(null);
			expect(useScanStore.getState().selectedFolder).toBeNull();
		});
	});

	describe("startScan", () => {
		it("should set status to scanning", () => {
			useScanStore.getState().startScan();
			expect(useScanStore.getState().status).toBe(ScanStatus.Scanning);
		});

		it("should initialize progress with zeros", () => {
			useScanStore.getState().startScan();
			const progress = useScanStore.getState().progress;
			expect(progress).not.toBeNull();
			expect(progress?.current).toBe(0);
			expect(progress?.total).toBe(0);
			expect(progress?.currentPath).toBe("");
			expect(progress?.status).toBe(ScanStatus.Scanning);
		});

		it("should clear previous result", () => {
			// Set a previous result
			const mockResult: ScanResult = {
				rootPath: "/test",
				entries: [],
				stats: {
					totalFiles: 10,
					totalFolders: 2,
					totalSize: 1000,
					documentCount: 5,
					imageCount: 3,
					videoCount: 1,
					audioCount: 1,
					otherCount: 0,
				},
				failedEntries: [],
				completedAt: "2024-01-01T00:00:00Z",
				durationMs: 100,
			};
			useScanStore.getState().completeScan(mockResult);
			useScanStore.getState().startScan();
			expect(useScanStore.getState().result).toBeNull();
		});

		it("should clear previous error", () => {
			useScanStore.getState().setError("Previous error");
			useScanStore.getState().startScan();
			expect(useScanStore.getState().error).toBeNull();
		});
	});

	describe("updateProgress", () => {
		it("should update progress state", () => {
			const newProgress = {
				current: 50,
				total: 100,
				currentPath: "/test/file.txt",
				status: ScanStatus.Scanning,
			};
			useScanStore.getState().updateProgress(newProgress);
			expect(useScanStore.getState().progress).toEqual(newProgress);
		});
	});

	describe("completeScan", () => {
		const mockResult: ScanResult = {
			rootPath: "/test",
			entries: [
				{
					path: "/test/file.txt",
					name: "file.txt",
					isDirectory: false,
					size: 100,
					modifiedAt: "2024-01-01T00:00:00Z",
					category: "document",
					extension: "txt",
					depth: 1,
					parentPath: "/test",
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

		it("should set status to completed", () => {
			useScanStore.getState().completeScan(mockResult);
			expect(useScanStore.getState().status).toBe(ScanStatus.Completed);
		});

		it("should store the scan result", () => {
			useScanStore.getState().completeScan(mockResult);
			expect(useScanStore.getState().result).toEqual(mockResult);
		});

		it("should clear progress", () => {
			useScanStore.getState().startScan();
			useScanStore.getState().completeScan(mockResult);
			expect(useScanStore.getState().progress).toBeNull();
		});
	});

	describe("setError", () => {
		it("should set status to error", () => {
			useScanStore.getState().setError("Test error");
			expect(useScanStore.getState().status).toBe(ScanStatus.Error);
		});

		it("should store the error message", () => {
			useScanStore.getState().setError("Test error message");
			expect(useScanStore.getState().error).toBe("Test error message");
		});

		it("should clear progress", () => {
			useScanStore.getState().startScan();
			useScanStore.getState().setError("Test error");
			expect(useScanStore.getState().progress).toBeNull();
		});
	});

	describe("reset", () => {
		it("should reset all state to initial values", () => {
			// First, modify the state
			useScanStore.getState().setSelectedFolder("/test/path");
			useScanStore.getState().startScan();
			useScanStore.getState().setError("Some error");

			// Then reset
			useScanStore.getState().reset();

			const state = useScanStore.getState();
			expect(state.status).toBe(ScanStatus.Idle);
			expect(state.progress).toBeNull();
			expect(state.result).toBeNull();
			expect(state.error).toBeNull();
			expect(state.selectedFolder).toBeNull();
		});
	});
});
