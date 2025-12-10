/**
 * Tests for FileTree component
 * Displays files in a hierarchical tree structure
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileTree } from "@/components/file-list/FileTree";
import { FileEntry, FileCategory, ScanResult } from "@/types/file";

describe("FileTree", () => {
	const mockFiles: FileEntry[] = [
		{
			path: "/root",
			name: "root",
			isDirectory: true,
			size: 0,
			modifiedAt: "2024-01-01T00:00:00Z",
			category: FileCategory.Folder,
			extension: "",
			depth: 0,
			parentPath: "",
		},
		{
			path: "/root/docs",
			name: "docs",
			isDirectory: true,
			size: 0,
			modifiedAt: "2024-01-01T00:00:00Z",
			category: FileCategory.Folder,
			extension: "",
			depth: 1,
			parentPath: "/root",
		},
		{
			path: "/root/docs/readme.md",
			name: "readme.md",
			isDirectory: false,
			size: 1024,
			modifiedAt: "2024-01-01T00:00:00Z",
			category: FileCategory.Document,
			extension: "md",
			depth: 2,
			parentPath: "/root/docs",
		},
		{
			path: "/root/images",
			name: "images",
			isDirectory: true,
			size: 0,
			modifiedAt: "2024-01-01T00:00:00Z",
			category: FileCategory.Folder,
			extension: "",
			depth: 1,
			parentPath: "/root",
		},
		{
			path: "/root/images/photo.jpg",
			name: "photo.jpg",
			isDirectory: false,
			size: 2048,
			modifiedAt: "2024-01-01T00:00:00Z",
			category: FileCategory.Image,
			extension: "jpg",
			depth: 2,
			parentPath: "/root/images",
		},
	];

	const mockResult: ScanResult = {
		rootPath: "/root",
		entries: mockFiles,
		failedEntries: [],
		stats: {
			totalFiles: 2,
			totalFolders: 3,
			totalSize: 3072,
			documentCount: 1,
			imageCount: 1,
			videoCount: 0,
			audioCount: 0,
			otherCount: 0,
		},
		completedAt: "2024-01-01T00:00:00Z",
		durationMs: 100,
	};

	it("should render the tree structure", () => {
		render(<FileTree result={mockResult} />);

		expect(screen.getByText("root")).toBeInTheDocument();
	});

	it("should display folders with folder icon", () => {
		render(<FileTree result={mockResult} />);

		// Folders should have expand/collapse indicators
		const rootFolder = screen.getByText("root").closest("[data-type='folder']");
		expect(rootFolder).toBeInTheDocument();
	});

	it("should expand folder when clicked", async () => {
		const user = userEvent.setup();
		render(<FileTree result={mockResult} />);

		// Click on root folder to expand
		const rootFolder = screen.getByText("root");
		await user.click(rootFolder);

		// Child folders should be visible
		expect(screen.getByText("docs")).toBeInTheDocument();
		expect(screen.getByText("images")).toBeInTheDocument();
	});

	it("should collapse folder when clicked again", async () => {
		const user = userEvent.setup();
		render(<FileTree result={mockResult} />);

		// Expand then collapse
		const rootFolder = screen.getByText("root");
		await user.click(rootFolder);
		await user.click(rootFolder);

		// Child folders should be hidden (either not in DOM or not visible)
		const docs = screen.queryByText("docs");
		if (docs !== null) {
			expect(docs).not.toBeVisible();
		} else {
			expect(docs).toBeNull();
		}
	});

	it("should display files with appropriate icons based on category", async () => {
		const user = userEvent.setup();
		render(<FileTree result={mockResult} />);

		// Expand folders
		await user.click(screen.getByText("root"));
		await user.click(screen.getByText("docs"));

		// File should be visible
		expect(screen.getByText("readme.md")).toBeInTheDocument();
	});

	it("should display file size for files", async () => {
		const user = userEvent.setup();
		render(<FileTree result={mockResult} />);

		// Expand folders
		await user.click(screen.getByText("root"));
		await user.click(screen.getByText("docs"));

		// File size should be shown
		expect(screen.getByText(/1.*KB/i)).toBeInTheDocument();
	});

	it("should show empty state when no files", () => {
		const emptyResult: ScanResult = {
			...mockResult,
			entries: [],
			stats: {
				...mockResult.stats,
				totalFiles: 0,
				totalFolders: 0,
			},
		};

		render(<FileTree result={emptyResult} />);

		expect(screen.getByText(/沒有檔案/i)).toBeInTheDocument();
	});

	it("should render null when result is null", () => {
		const { container } = render(<FileTree result={null} />);

		expect(container.firstChild).toBeNull();
	});

	it("should show expand/collapse all buttons", () => {
		render(<FileTree result={mockResult} />);

		expect(
			screen.getByRole("button", { name: /全部展開/i })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /全部收合/i })
		).toBeInTheDocument();
	});

	it("should expand all folders when expand all is clicked", async () => {
		const user = userEvent.setup();
		render(<FileTree result={mockResult} />);

		await user.click(screen.getByRole("button", { name: /全部展開/i }));

		// All nested items should be visible
		expect(screen.getByText("docs")).toBeInTheDocument();
		expect(screen.getByText("images")).toBeInTheDocument();
		expect(screen.getByText("readme.md")).toBeInTheDocument();
		expect(screen.getByText("photo.jpg")).toBeInTheDocument();
	});

	it("should collapse all folders when collapse all is clicked", async () => {
		const user = userEvent.setup();
		render(<FileTree result={mockResult} />);

		// First expand all
		await user.click(screen.getByRole("button", { name: /全部展開/i }));
		// Verify items are visible first
		expect(screen.getByText("docs")).toBeInTheDocument();

		// Then collapse all
		await user.click(screen.getByRole("button", { name: /全部收合/i }));

		// Nested items should not be in the document (removed from DOM when collapsed)
		expect(screen.queryByText("docs")).not.toBeInTheDocument();
	});
});
