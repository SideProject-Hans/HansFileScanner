/**
 * Tests for FolderSelector component
 * TDD: T040
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FolderSelector } from "@/components/scanner/FolderSelector";

describe("FolderSelector", () => {
	const defaultProps = {
		selectedFolder: null,
		onSelectFolder: vi.fn(),
		onClearFolder: vi.fn(),
	};

	describe("rendering", () => {
		it("should render the folder selection label", () => {
			render(<FolderSelector {...defaultProps} />);
			expect(screen.getByText("選擇資料夾")).toBeInTheDocument();
		});

		it("should render the input field", () => {
			render(<FolderSelector {...defaultProps} />);
			expect(screen.getByLabelText("選擇的資料夾路徑")).toBeInTheDocument();
		});

		it("should render the browse button", () => {
			render(<FolderSelector {...defaultProps} />);
			expect(
				screen.getByRole("button", { name: /開啟資料夾選擇對話框/i })
			).toBeInTheDocument();
		});

		it("should show placeholder when no folder is selected", () => {
			render(<FolderSelector {...defaultProps} />);
			expect(
				screen.getByPlaceholderText("選擇要掃描的資料夾...")
			).toBeInTheDocument();
		});
	});

	describe("with selected folder", () => {
		it("should display the selected folder path", () => {
			render(
				<FolderSelector {...defaultProps} selectedFolder="/test/folder/path" />
			);
			const input = screen.getByLabelText(
				"選擇的資料夾路徑"
			) as HTMLInputElement;
			expect(input.value).toBe("/test/folder/path");
		});

		it("should show clear button when folder is selected", () => {
			render(
				<FolderSelector {...defaultProps} selectedFolder="/test/folder" />
			);
			expect(
				screen.getByRole("button", { name: /清除選擇的資料夾/i })
			).toBeInTheDocument();
		});

		it("should not show clear button when no folder is selected", () => {
			render(<FolderSelector {...defaultProps} />);
			expect(
				screen.queryByRole("button", { name: /清除選擇的資料夾/i })
			).not.toBeInTheDocument();
		});
	});

	describe("interactions", () => {
		it("should call onSelectFolder when browse button is clicked", () => {
			const onSelectFolder = vi.fn();
			render(
				<FolderSelector {...defaultProps} onSelectFolder={onSelectFolder} />
			);

			fireEvent.click(
				screen.getByRole("button", { name: /開啟資料夾選擇對話框/i })
			);
			expect(onSelectFolder).toHaveBeenCalledTimes(1);
		});

		it("should call onClearFolder when clear button is clicked", () => {
			const onClearFolder = vi.fn();
			render(
				<FolderSelector
					{...defaultProps}
					selectedFolder="/test/folder"
					onClearFolder={onClearFolder}
				/>
			);

			fireEvent.click(
				screen.getByRole("button", { name: /清除選擇的資料夾/i })
			);
			expect(onClearFolder).toHaveBeenCalledTimes(1);
		});

		it("should have readonly input field", () => {
			render(<FolderSelector {...defaultProps} />);
			const input = screen.getByLabelText("選擇的資料夾路徑");
			expect(input).toHaveAttribute("readonly");
		});
	});

	describe("disabled state", () => {
		it("should disable input when disabled prop is true", () => {
			render(<FolderSelector {...defaultProps} disabled />);
			expect(screen.getByLabelText("選擇的資料夾路徑")).toBeDisabled();
		});

		it("should disable browse button when disabled prop is true", () => {
			render(<FolderSelector {...defaultProps} disabled />);
			expect(
				screen.getByRole("button", { name: /開啟資料夾選擇對話框/i })
			).toBeDisabled();
		});

		it("should not show clear button when disabled even with selected folder", () => {
			render(
				<FolderSelector
					{...defaultProps}
					selectedFolder="/test/folder"
					disabled
				/>
			);
			expect(
				screen.queryByRole("button", { name: /清除選擇的資料夾/i })
			).not.toBeInTheDocument();
		});
	});

	describe("accessibility", () => {
		it("should have accessible label for input", () => {
			render(<FolderSelector {...defaultProps} />);
			const input = screen.getByLabelText("選擇的資料夾路徑");
			expect(input).toBeInTheDocument();
		});

		it("should have accessible label for browse button", () => {
			render(<FolderSelector {...defaultProps} />);
			const button = screen.getByRole("button", {
				name: /開啟資料夾選擇對話框/i,
			});
			expect(button).toBeInTheDocument();
		});

		it("should have accessible label for clear button", () => {
			render(
				<FolderSelector {...defaultProps} selectedFolder="/test/folder" />
			);
			const button = screen.getByRole("button", {
				name: /清除選擇的資料夾/i,
			});
			expect(button).toBeInTheDocument();
		});
	});
});
