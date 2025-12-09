/**
 * Tests for FileCheckbox component
 * Checkbox for selecting individual files
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileCheckbox } from "@/components/file-list/FileCheckbox";

describe("FileCheckbox", () => {
	describe("rendering", () => {
		it("should render unchecked checkbox when not selected", () => {
			render(
				<FileCheckbox
					isSelected={false}
					onToggle={() => {}}
					ariaLabel="Select file"
				/>
			);

			const checkbox = screen.getByRole("checkbox", { name: "Select file" });
			expect(checkbox).not.toBeChecked();
		});

		it("should render checked checkbox when selected", () => {
			render(
				<FileCheckbox
					isSelected={true}
					onToggle={() => {}}
					ariaLabel="Select file"
				/>
			);

			const checkbox = screen.getByRole("checkbox", { name: "Select file" });
			expect(checkbox).toBeChecked();
		});

		it("should render with custom aria-label", () => {
			render(
				<FileCheckbox
					isSelected={false}
					onToggle={() => {}}
					ariaLabel="Select document.pdf"
				/>
			);

			expect(
				screen.getByRole("checkbox", { name: "Select document.pdf" })
			).toBeInTheDocument();
		});
	});

	describe("interaction", () => {
		it("should call onToggle when clicked", () => {
			const onToggle = vi.fn();
			render(
				<FileCheckbox
					isSelected={false}
					onToggle={onToggle}
					ariaLabel="Select file"
				/>
			);

			fireEvent.click(screen.getByRole("checkbox"));
			expect(onToggle).toHaveBeenCalledTimes(1);
		});

		it("should stop event propagation", () => {
			const onToggle = vi.fn();
			const onParentClick = vi.fn();

			render(
				<div onClick={onParentClick}>
					<FileCheckbox
						isSelected={false}
						onToggle={onToggle}
						ariaLabel="Select file"
					/>
				</div>
			);

			fireEvent.click(screen.getByRole("checkbox"));
			expect(onToggle).toHaveBeenCalled();
			expect(onParentClick).not.toHaveBeenCalled();
		});
	});

	describe("disabled state", () => {
		it("should be disabled when disabled prop is true", () => {
			render(
				<FileCheckbox
					isSelected={false}
					onToggle={() => {}}
					ariaLabel="Select file"
					disabled={true}
				/>
			);

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).toBeDisabled();
		});

		it("should not call onToggle when disabled", () => {
			const onToggle = vi.fn();
			render(
				<FileCheckbox
					isSelected={false}
					onToggle={onToggle}
					ariaLabel="Select file"
					disabled={true}
				/>
			);

			fireEvent.click(screen.getByRole("checkbox"));
			expect(onToggle).not.toHaveBeenCalled();
		});
	});
});
