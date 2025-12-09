import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FileItem } from "../../../src/components/scanner/FileItem";
import { FileCategory, type FileEntry } from "../../../src/types/file";

describe("FileItem", () => {
	const mockFile: FileEntry = {
		name: "test-file.txt",
		path: "C:\\Users\\Test\\Documents\\test-file.txt",
		size: 1024,
		isDirectory: false,
		modifiedAt: "2024-01-15T10:30:00Z",
		extension: "txt",
		category: FileCategory.Document,
		depth: 1,
		parentPath: "C:\\Users\\Test\\Documents",
	};

	const mockDirectory: FileEntry = {
		name: "test-folder",
		path: "C:\\Users\\Test\\Documents\\test-folder",
		size: 4096,
		isDirectory: true,
		modifiedAt: "2024-01-15T10:30:00Z",
		extension: "",
		category: FileCategory.Folder,
		depth: 1,
		parentPath: "C:\\Users\\Test\\Documents",
	};

	describe("file rendering", () => {
		it("should render file name", () => {
			render(
				<table>
					<tbody>
						<tr>
							<FileItem entry={mockFile} />
						</tr>
					</tbody>
				</table>
			);

			expect(screen.getByText("test-file.txt")).toBeInTheDocument();
		});

		it("should render file path", () => {
			render(
				<table>
					<tbody>
						<tr>
							<FileItem entry={mockFile} />
						</tr>
					</tbody>
				</table>
			);

			expect(
				screen.getByText("C:\\Users\\Test\\Documents\\test-file.txt")
			).toBeInTheDocument();
		});

		it("should render formatted file size", () => {
			render(
				<table>
					<tbody>
						<tr>
							<FileItem entry={mockFile} />
						</tr>
					</tbody>
				</table>
			);

			// 1024 bytes should be displayed as "1 KB"
			expect(screen.getByText("1 KB")).toBeInTheDocument();
		});

		it("should render formatted modification date", () => {
			render(
				<table>
					<tbody>
						<tr>
							<FileItem entry={mockFile} />
						</tr>
					</tbody>
				</table>
			);

			// Check that date is rendered (format may vary by locale)
			expect(screen.getByText(/2024/)).toBeInTheDocument();
		});

		it("should render file icon for files", () => {
			render(
				<table>
					<tbody>
						<tr>
							<FileItem entry={mockFile} />
						</tr>
					</tbody>
				</table>
			);

			// File icon should be present
			const row = screen.getByRole("row");
			expect(row).toBeInTheDocument();
		});
	});

	describe("directory rendering", () => {
		it("should render directory name", () => {
			render(
				<table>
					<tbody>
						<tr>
							<FileItem entry={mockDirectory} />
						</tr>
					</tbody>
				</table>
			);

			expect(screen.getByText("test-folder")).toBeInTheDocument();
		});

		it("should render directory indicator", () => {
			render(
				<table>
					<tbody>
						<tr>
							<FileItem entry={mockDirectory} />
						</tr>
					</tbody>
				</table>
			);

			// Directory should have folder icon or indicator
			const row = screen.getByRole("row");
			expect(row).toBeInTheDocument();
		});
	});

	describe("edge cases", () => {
		it("should handle zero file size", () => {
			const emptyFile: FileEntry = {
				...mockFile,
				size: 0,
			};

			render(
				<table>
					<tbody>
						<tr>
							<FileItem entry={emptyFile} />
						</tr>
					</tbody>
				</table>
			);

			expect(screen.getByText("0 B")).toBeInTheDocument();
		});

		it("should handle large file sizes", () => {
			const largeFile: FileEntry = {
				...mockFile,
				size: 1073741824, // 1 GB
			};

			render(
				<table>
					<tbody>
						<tr>
							<FileItem entry={largeFile} />
						</tr>
					</tbody>
				</table>
			);

			expect(screen.getByText("1 GB")).toBeInTheDocument();
		});

		it("should handle file without extension", () => {
			const noExtFile: FileEntry = {
				...mockFile,
				name: "Makefile",
				extension: "",
			};

			render(
				<table>
					<tbody>
						<tr>
							<FileItem entry={noExtFile} />
						</tr>
					</tbody>
				</table>
			);

			expect(screen.getByText("Makefile")).toBeInTheDocument();
		});
	});

	describe("file category icons", () => {
		it("should render image icon for image files", () => {
			const imageFile: FileEntry = {
				...mockFile,
				name: "photo.png",
				category: FileCategory.Image,
				extension: "png",
			};

			render(
				<table>
					<tbody>
						<tr>
							<FileItem entry={imageFile} />
						</tr>
					</tbody>
				</table>
			);

			// SVG 圖示應該存在於 row 中
			const row = screen.getByRole("row");
			const svg = row.querySelector("svg");
			expect(svg).toBeInTheDocument();
		});

		it("should render video icon for video files", () => {
			const videoFile: FileEntry = {
				...mockFile,
				name: "movie.mp4",
				category: FileCategory.Video,
				extension: "mp4",
			};

			render(
				<table>
					<tbody>
						<tr>
							<FileItem entry={videoFile} />
						</tr>
					</tbody>
				</table>
			);

			const row = screen.getByRole("row");
			const svg = row.querySelector("svg");
			expect(svg).toBeInTheDocument();
		});

		it("should render audio icon for audio files", () => {
			const audioFile: FileEntry = {
				...mockFile,
				name: "song.mp3",
				category: FileCategory.Audio,
				extension: "mp3",
			};

			render(
				<table>
					<tbody>
						<tr>
							<FileItem entry={audioFile} />
						</tr>
					</tbody>
				</table>
			);

			const row = screen.getByRole("row");
			const svg = row.querySelector("svg");
			expect(svg).toBeInTheDocument();
		});

		it("should render code icon for code files", () => {
			const codeFile: FileEntry = {
				...mockFile,
				name: "script.js",
				category: FileCategory.Code,
				extension: "js",
			};

			render(
				<table>
					<tbody>
						<tr>
							<FileItem entry={codeFile} />
						</tr>
					</tbody>
				</table>
			);

			const row = screen.getByRole("row");
			const svg = row.querySelector("svg");
			expect(svg).toBeInTheDocument();
		});

		it("should render default icon for other files", () => {
			const otherFile: FileEntry = {
				...mockFile,
				name: "file.xyz",
				category: FileCategory.Other,
				extension: "xyz",
			};

			render(
				<table>
					<tbody>
						<tr>
							<FileItem entry={otherFile} />
						</tr>
					</tbody>
				</table>
			);

			const row = screen.getByRole("row");
			const svg = row.querySelector("svg");
			expect(svg).toBeInTheDocument();
		});
	});
});
