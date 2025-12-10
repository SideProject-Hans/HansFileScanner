import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileTable } from "../../../src/components/scanner/FileTable";
import {
	FileCategory,
	type FileEntry,
	type ScanResult,
} from "../../../src/types/file";

// Mock the selection store
vi.mock("../../../src/stores/selectionStore", () => ({
	useSelectionStore: vi.fn(() => ({
		selectedPaths: new Set<string>(),
		isAllSelected: false,
		isSelected: vi.fn(() => false),
		toggleSelection: vi.fn(),
		selectAll: vi.fn(),
		deselectAll: vi.fn(),
		getSelectedCount: vi.fn(() => 0),
		getSelectedPaths: vi.fn(() => []),
		setSelectableFiles: vi.fn(),
	})),
}));

describe("FileTable", () => {
	const mockEntries: FileEntry[] = [
		{
			name: "alpha.txt",
			path: "C:\\Users\\Test\\alpha.txt",
			size: 1024,
			isDirectory: false,
			modifiedAt: "2024-01-15T10:30:00Z",
			extension: "txt",
			category: FileCategory.Document,
			depth: 0,
			parentPath: "C:\\Users\\Test",
		},
		{
			name: "beta.pdf",
			path: "C:\\Users\\Test\\beta.pdf",
			size: 2048,
			isDirectory: false,
			modifiedAt: "2024-01-14T09:00:00Z",
			extension: "pdf",
			category: FileCategory.Document,
			depth: 0,
			parentPath: "C:\\Users\\Test",
		},
		{
			name: "gamma-folder",
			path: "C:\\Users\\Test\\gamma-folder",
			size: 0,
			isDirectory: true,
			modifiedAt: "2024-01-13T08:00:00Z",
			extension: "",
			category: FileCategory.Folder,
			depth: 0,
			parentPath: "C:\\Users\\Test",
		},
	];

	const mockResult: ScanResult = {
		rootPath: "C:\\Users\\Test",
		entries: mockEntries,
		stats: {
			totalFiles: 2,
			totalFolders: 1,
			totalSize: 3072,
			documentCount: 2,
			imageCount: 0,
			videoCount: 0,
			audioCount: 0,
			otherCount: 0,
		},
		failedEntries: [],
		completedAt: "2024-01-15T12:00:00Z",
		durationMs: 150,
	};

	const emptyResult: ScanResult = {
		rootPath: "C:\\Users\\Test\\Empty",
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
		completedAt: "2024-01-15T12:00:00Z",
		durationMs: 10,
	};

	describe("rendering", () => {
		it("should render table with column headers", () => {
			render(<FileTable result={mockResult} />);

			expect(screen.getByText("名稱")).toBeInTheDocument();
			expect(screen.getByText("路徑")).toBeInTheDocument();
			expect(screen.getByText("大小")).toBeInTheDocument();
			expect(screen.getByText("修改日期")).toBeInTheDocument();
		});

		it("should render all files", () => {
			render(<FileTable result={mockResult} />);

			expect(screen.getByText("alpha.txt")).toBeInTheDocument();
			expect(screen.getByText("beta.pdf")).toBeInTheDocument();
			expect(screen.getByText("gamma-folder")).toBeInTheDocument();
		});

		it("should render empty state when no files", () => {
			render(<FileTable result={emptyResult} />);

			expect(screen.getByText(/此資料夾為空/)).toBeInTheDocument();
		});

		it("should render initial state when no result", () => {
			render(<FileTable result={null} />);

			expect(screen.getByText(/請選擇資料夾並開始掃描/)).toBeInTheDocument();
		});
	});

	describe("sorting", () => {
		it("should sort by name when name header is clicked", () => {
			render(<FileTable result={mockResult} />);

			const nameHeader = screen.getByText("名稱");
			fireEvent.click(nameHeader);

			const rows = screen.getAllByRole("row");
			// First row is header, so check data rows
			expect(rows.length).toBeGreaterThan(1);
		});

		it("should toggle sort order on repeated clicks", () => {
			render(<FileTable result={mockResult} />);

			const nameHeader = screen.getByText("名稱");

			// First click - ascending
			fireEvent.click(nameHeader);

			// Second click - descending
			fireEvent.click(nameHeader);

			// Table should still render correctly
			expect(screen.getByText("alpha.txt")).toBeInTheDocument();
		});

		it("should sort by size when size header is clicked", () => {
			render(<FileTable result={mockResult} />);

			const sizeHeader = screen.getByText("大小");
			fireEvent.click(sizeHeader);

			const rows = screen.getAllByRole("row");
			expect(rows.length).toBeGreaterThan(1);
		});

		it("should sort by modified date when date header is clicked", () => {
			render(<FileTable result={mockResult} />);

			const dateHeader = screen.getByText("修改日期");
			fireEvent.click(dateHeader);

			const rows = screen.getAllByRole("row");
			expect(rows.length).toBeGreaterThan(1);
		});
	});

	describe("accessibility", () => {
		it("should have accessible table structure", () => {
			render(<FileTable result={mockResult} />);

			// The table has role="grid" for better accessibility
			expect(screen.getByRole("grid")).toBeInTheDocument();
		});

		it("should have column headers as th elements", () => {
			render(<FileTable result={mockResult} />);

			const headers = screen.getAllByRole("columnheader");
			expect(headers.length).toBeGreaterThanOrEqual(4);
		});
	});

	describe("edge cases", () => {
		it("should handle single file", () => {
			const singleResult: ScanResult = {
				...mockResult,
				entries: [mockEntries[0]],
				stats: {
					...mockResult.stats,
					totalFiles: 1,
					totalFolders: 0,
				},
			};

			render(<FileTable result={singleResult} />);

			expect(screen.getByText("alpha.txt")).toBeInTheDocument();
		});

		it("should handle many files", () => {
			const manyEntries = Array.from({ length: 100 }, (_, i) => ({
				...mockEntries[0],
				name: `file-${i}.txt`,
				path: `C:\\Users\\Test\\file-${i}.txt`,
			}));

			const manyResult: ScanResult = {
				...mockResult,
				entries: manyEntries,
				stats: {
					...mockResult.stats,
					totalFiles: 100,
					totalFolders: 0,
				},
			};

			render(<FileTable result={manyResult} />);

			expect(screen.getByText("file-0.txt")).toBeInTheDocument();
			expect(screen.getByText("file-99.txt")).toBeInTheDocument();
		});
	});

	describe("filtering", () => {
		it("should filter files by search query", () => {
			render(<FileTable result={mockResult} searchQuery="alpha" />);

			expect(screen.getByText("alpha.txt")).toBeInTheDocument();
			expect(screen.queryByText("beta.pdf")).not.toBeInTheDocument();
		});

		it("should filter files by selected extensions", () => {
			render(<FileTable result={mockResult} selectedExtensions={["txt"]} />);

			expect(screen.getByText("alpha.txt")).toBeInTheDocument();
			// Folders should still be visible regardless of extension filter
			expect(screen.getByText("gamma-folder")).toBeInTheDocument();
			expect(screen.queryByText("beta.pdf")).not.toBeInTheDocument();
		});

		it("should show empty table body when search has no results", () => {
			render(<FileTable result={mockResult} searchQuery="nonexistent" />);

			// When filtered, the table renders with an empty tbody
			const table = screen.getByRole("grid");
			expect(table).toBeInTheDocument();
			// No data rows (only header row exists)
			const rows = screen.getAllByRole("row");
			expect(rows.length).toBe(1); // Only header row
		});

		it("should combine search and extension filters", () => {
			const extendedEntries: FileEntry[] = [
				...mockEntries,
				{
					name: "alpha.pdf",
					path: "C:\\Users\\Test\\alpha.pdf",
					size: 3072,
					isDirectory: false,
					modifiedAt: "2024-01-16T11:00:00Z",
					extension: "pdf",
					category: FileCategory.Document,
					depth: 0,
					parentPath: "C:\\Users\\Test",
				},
			];

			const extendedResult: ScanResult = {
				...mockResult,
				entries: extendedEntries,
			};

			render(
				<FileTable
					result={extendedResult}
					searchQuery="alpha"
					selectedExtensions={["txt"]}
				/>
			);

			expect(screen.getByText("alpha.txt")).toBeInTheDocument();
			expect(screen.queryByText("alpha.pdf")).not.toBeInTheDocument();
		});
	});

	describe("selection mode", () => {
		it("should render checkboxes when enableSelection is true", () => {
			render(<FileTable result={mockResult} enableSelection={true} />);

			// Should have checkboxes: SelectAllCheckbox + non-directory files (alpha.txt, beta.pdf)
			const checkboxes = screen.getAllByRole("checkbox");
			expect(checkboxes.length).toBe(3); // SelectAllCheckbox + 2 file checkboxes
		});

		it("should not render checkboxes when enableSelection is false", () => {
			render(<FileTable result={mockResult} enableSelection={false} />);

			const checkboxes = screen.queryAllByRole("checkbox");
			expect(checkboxes.length).toBe(0);
		});

		it("should render empty cell for directories when enableSelection is true", () => {
			render(<FileTable result={mockResult} enableSelection={true} />);

			// Find the row for gamma-folder and verify it has an empty cell
			const folderRow = screen.getByText("gamma-folder").closest("tr");
			expect(folderRow).toBeInTheDocument();
		});
	});

	describe("sort icon states", () => {
		it("should show neutral icon for non-active sort column", () => {
			render(<FileTable result={mockResult} />);

			// Click on name to activate it
			fireEvent.click(screen.getByText("名稱"));

			// Size column should have neutral icon (ArrowUpDown)
			const sizeButton = screen.getByRole("button", { name: /依大小排序/i });
			expect(sizeButton).toBeInTheDocument();
		});

		it("should show ascending icon after first click", () => {
			render(<FileTable result={mockResult} />);

			// Click on size header
			fireEvent.click(screen.getByText("大小"));

			// aria-label should indicate ascending
			const sizeButton = screen.getByRole("button", { name: /依大小排序.*升冪/i });
			expect(sizeButton).toBeInTheDocument();
		});

		it("should show descending icon after second click", () => {
			render(<FileTable result={mockResult} />);

			// Click twice on modified date header
			const dateHeader = screen.getByText("修改日期");
			fireEvent.click(dateHeader);
			fireEvent.click(dateHeader);

			// aria-label should indicate descending
			const dateButton = screen.getByRole("button", {
				name: /依修改日期排序.*降冪/i,
			});
			expect(dateButton).toBeInTheDocument();
		});
	});

	describe("sorting behavior", () => {
		it("should sort by path when path header is clicked", () => {
			render(<FileTable result={mockResult} />);

			const pathHeader = screen.getByText("路徑");
			fireEvent.click(pathHeader);

			const rows = screen.getAllByRole("row");
			expect(rows.length).toBeGreaterThan(1);
		});

		it("should reset to ascending when changing sort field", () => {
			render(<FileTable result={mockResult} />);

			// Sort by name descending
			const nameHeader = screen.getByText("名稱");
			fireEvent.click(nameHeader);
			fireEvent.click(nameHeader);

			// Change to size - should reset to ascending
			const sizeHeader = screen.getByText("大小");
			fireEvent.click(sizeHeader);

			const sizeButton = screen.getByRole("button", { name: /依大小排序.*升冪/i });
			expect(sizeButton).toBeInTheDocument();
		});
	});
});
