import { describe, it, expect } from "vitest";
import {
	formatFileSize,
	formatDate,
	getExtension,
	getBasename,
	isHiddenPath,
	getParentPath,
	getFilename,
	sortFileEntries,
} from "../../src/lib/file-utils";

describe("file-utils", () => {
	describe("formatFileSize", () => {
		it("should return '0 B' for zero bytes", () => {
			expect(formatFileSize(0)).toBe("0 B");
		});

		it("should format bytes correctly", () => {
			expect(formatFileSize(100)).toBe("100 B");
			expect(formatFileSize(500)).toBe("500 B");
		});

		it("should format kilobytes correctly", () => {
			expect(formatFileSize(1024)).toBe("1 KB");
			expect(formatFileSize(1536)).toBe("1.5 KB");
			expect(formatFileSize(2048)).toBe("2 KB");
		});

		it("should format megabytes correctly", () => {
			expect(formatFileSize(1024 * 1024)).toBe("1 MB");
			expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
		});

		it("should format gigabytes correctly", () => {
			expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
			expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe("2.5 GB");
		});

		it("should format terabytes correctly", () => {
			expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe("1 TB");
		});
	});

	describe("formatDate", () => {
		it("should format valid ISO date string", () => {
			const result = formatDate("2024-01-15T10:30:00Z");
			// 結果會是當地時區格式，所以只檢查是否包含數字格式
			expect(result).toMatch(/\d{4}\/\d{2}\/\d{2}/);
		});

		it("should return 'Invalid Date' for invalid date string", () => {
			const invalidDate = "not-a-date";
			const result = formatDate(invalidDate);
			// 無效日期會產生 'Invalid Date' 字串
			expect(result).toBe("Invalid Date");
		});

		it("should handle empty string as invalid date", () => {
			const result = formatDate("");
			// 空字串會產生 'Invalid Date' 字串
			expect(result).toBe("Invalid Date");
		});
	});

	describe("getExtension", () => {
		it("should return extension for normal filename", () => {
			expect(getExtension("document.pdf")).toBe("pdf");
			expect(getExtension("image.PNG")).toBe("png");
			expect(getExtension("script.js")).toBe("js");
		});

		it("should return empty string for no extension", () => {
			expect(getExtension("README")).toBe("");
			expect(getExtension("Makefile")).toBe("");
		});

		it("should handle multiple dots in filename", () => {
			expect(getExtension("archive.tar.gz")).toBe("gz");
			expect(getExtension("file.backup.txt")).toBe("txt");
		});

		it("should return empty string if dot is at end", () => {
			expect(getExtension("file.")).toBe("");
		});

		it("should handle hidden files with extension", () => {
			expect(getExtension(".gitignore")).toBe("gitignore");
			expect(getExtension(".env.local")).toBe("local");
		});
	});

	describe("getBasename", () => {
		it("should return filename without extension", () => {
			expect(getBasename("document.pdf")).toBe("document");
			expect(getBasename("image.png")).toBe("image");
		});

		it("should return full name if no extension", () => {
			expect(getBasename("README")).toBe("README");
			expect(getBasename("Makefile")).toBe("Makefile");
		});

		it("should handle multiple dots", () => {
			expect(getBasename("archive.tar.gz")).toBe("archive.tar");
			expect(getBasename("file.backup.txt")).toBe("file.backup");
		});

		it("should handle hidden files", () => {
			expect(getBasename(".gitignore")).toBe("");
			expect(getBasename(".env")).toBe("");
		});
	});

	describe("isHiddenPath", () => {
		it("should detect hidden files with forward slash", () => {
			expect(isHiddenPath("/home/user/.bashrc")).toBe(true);
			expect(isHiddenPath("/home/.config/app")).toBe(true);
		});

		it("should detect hidden files with backslash", () => {
			expect(isHiddenPath("C:\\Users\\.gitconfig")).toBe(true);
			expect(isHiddenPath("D:\\.hidden\\file.txt")).toBe(true);
		});

		it("should return false for non-hidden paths", () => {
			expect(isHiddenPath("/home/user/documents")).toBe(false);
			expect(isHiddenPath("C:\\Users\\Documents")).toBe(false);
		});

		it("should not treat single dot as hidden", () => {
			expect(isHiddenPath("/home/user/.")).toBe(false);
			expect(isHiddenPath("C:\\Users\\.")).toBe(false);
		});

		it("should handle paths without directory separators", () => {
			expect(isHiddenPath(".hidden")).toBe(true);
			expect(isHiddenPath("visible")).toBe(false);
		});
	});

	describe("getParentPath", () => {
		it("should return parent path for Unix paths", () => {
			expect(getParentPath("/home/user/file.txt")).toBe("/home/user");
			expect(getParentPath("/home/user")).toBe("/home");
		});

		it("should return parent path for Windows paths", () => {
			expect(getParentPath("C:\\Users\\Documents\\file.txt")).toBe(
				"C:/Users/Documents"
			);
			expect(getParentPath("D:\\Projects\\app")).toBe("D:/Projects");
		});

		it("should return empty string for root or no path", () => {
			expect(getParentPath("file.txt")).toBe("");
			expect(getParentPath("README")).toBe("");
		});

		it("should handle mixed separators", () => {
			expect(getParentPath("C:/Users\\Documents/file.txt")).toBe(
				"C:/Users/Documents"
			);
		});
	});

	describe("getFilename", () => {
		it("should return filename from Unix path", () => {
			expect(getFilename("/home/user/file.txt")).toBe("file.txt");
			expect(getFilename("/var/log/app.log")).toBe("app.log");
		});

		it("should return filename from Windows path", () => {
			expect(getFilename("C:\\Users\\Documents\\report.pdf")).toBe(
				"report.pdf"
			);
			expect(getFilename("D:\\Projects\\index.html")).toBe("index.html");
		});

		it("should return original if no path separator", () => {
			expect(getFilename("file.txt")).toBe("file.txt");
			expect(getFilename("README")).toBe("README");
		});

		it("should handle mixed separators", () => {
			expect(getFilename("C:/Users\\Documents/file.txt")).toBe("file.txt");
		});
	});

	describe("sortFileEntries", () => {
		const testEntries = [
			{ name: "banana.txt", size: 1000, modifiedAt: "2024-01-15T10:00:00Z" },
			{ name: "apple.txt", size: 500, modifiedAt: "2024-01-20T10:00:00Z" },
			{ name: "cherry.txt", size: 2000, modifiedAt: "2024-01-10T10:00:00Z" },
		];

		it("should sort by name ascending", () => {
			const result = sortFileEntries(testEntries, "name", "asc");
			expect(result[0].name).toBe("apple.txt");
			expect(result[1].name).toBe("banana.txt");
			expect(result[2].name).toBe("cherry.txt");
		});

		it("should sort by name descending", () => {
			const result = sortFileEntries(testEntries, "name", "desc");
			expect(result[0].name).toBe("cherry.txt");
			expect(result[1].name).toBe("banana.txt");
			expect(result[2].name).toBe("apple.txt");
		});

		it("should sort by size ascending", () => {
			const result = sortFileEntries(testEntries, "size", "asc");
			expect(result[0].size).toBe(500);
			expect(result[1].size).toBe(1000);
			expect(result[2].size).toBe(2000);
		});

		it("should sort by size descending", () => {
			const result = sortFileEntries(testEntries, "size", "desc");
			expect(result[0].size).toBe(2000);
			expect(result[1].size).toBe(1000);
			expect(result[2].size).toBe(500);
		});

		it("should sort by modifiedAt ascending", () => {
			const result = sortFileEntries(testEntries, "modifiedAt", "asc");
			expect(result[0].name).toBe("cherry.txt"); // Jan 10
			expect(result[1].name).toBe("banana.txt"); // Jan 15
			expect(result[2].name).toBe("apple.txt"); // Jan 20
		});

		it("should sort by modifiedAt descending", () => {
			const result = sortFileEntries(testEntries, "modifiedAt", "desc");
			expect(result[0].name).toBe("apple.txt"); // Jan 20
			expect(result[1].name).toBe("banana.txt"); // Jan 15
			expect(result[2].name).toBe("cherry.txt"); // Jan 10
		});

		it("should default to ascending order", () => {
			const result = sortFileEntries(testEntries, "name");
			expect(result[0].name).toBe("apple.txt");
		});

		it("should not mutate original array", () => {
			const original = [...testEntries];
			sortFileEntries(testEntries, "name", "desc");
			expect(testEntries).toEqual(original);
		});

		it("should handle empty array", () => {
			const result = sortFileEntries([], "name", "asc");
			expect(result).toEqual([]);
		});

		it("should handle single element array", () => {
			const single = [testEntries[0]];
			const result = sortFileEntries(single, "name", "asc");
			expect(result).toEqual(single);
		});
	});
});
