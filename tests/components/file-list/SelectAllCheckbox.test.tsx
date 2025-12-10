/**
 * Tests for SelectAllCheckbox component
 * Checkbox for selecting/deselecting all files
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SelectAllCheckbox } from "@/components/file-list/SelectAllCheckbox";

describe("SelectAllCheckbox", () => {
	describe("rendering", () => {
		it("should render unchecked when isAllSelected is false", () => {
			render(
				<SelectAllCheckbox
					isAllSelected={false}
					isPartialSelected={false}
					onToggle={() => {}}
				/>
			);

			const checkbox = screen.getByRole("checkbox", { name: /全選/i });
			expect(checkbox).not.toBeChecked();
		});

		it("should render checked when isAllSelected is true", () => {
			render(
				<SelectAllCheckbox
					isAllSelected={true}
					isPartialSelected={false}
					onToggle={() => {}}
				/>
			);

			const checkbox = screen.getByRole("checkbox", { name: /全選/i });
			expect(checkbox).toBeChecked();
		});

		it("should render with indeterminate state when partially selected", () => {
			render(
				<SelectAllCheckbox
					isAllSelected={false}
					isPartialSelected={true}
					onToggle={() => {}}
				/>
			);

			const checkbox = screen.getByRole("checkbox", { name: /全選/i });
			expect(checkbox).toHaveAttribute("data-state", "indeterminate");
		});

		it("should render label text", () => {
			render(
				<SelectAllCheckbox
					isAllSelected={false}
					isPartialSelected={false}
					onToggle={() => {}}
				/>
			);

			expect(screen.getByText(/全選/i)).toBeInTheDocument();
		});
	});

	describe("interaction", () => {
		it("should call onToggle when clicked", () => {
			const onToggle = vi.fn();
			render(
				<SelectAllCheckbox
					isAllSelected={false}
					isPartialSelected={false}
					onToggle={onToggle}
				/>
			);

			fireEvent.click(screen.getByRole("checkbox"));
			expect(onToggle).toHaveBeenCalledTimes(1);
		});

		it("should call onToggle when label is clicked", () => {
			const onToggle = vi.fn();
			render(
				<SelectAllCheckbox
					isAllSelected={false}
					isPartialSelected={false}
					onToggle={onToggle}
				/>
			);

			fireEvent.click(screen.getByText(/全選/i));
			expect(onToggle).toHaveBeenCalledTimes(1);
		});
	});

	describe("disabled state", () => {
		it("should be disabled when disabled prop is true", () => {
			render(
				<SelectAllCheckbox
					isAllSelected={false}
					isPartialSelected={false}
					onToggle={() => {}}
					disabled={true}
				/>
			);

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).toBeDisabled();
		});

		it("should not call onToggle when disabled", () => {
			const onToggle = vi.fn();
			render(
				<SelectAllCheckbox
					isAllSelected={false}
					isPartialSelected={false}
					onToggle={onToggle}
					disabled={true}
				/>
			);

			fireEvent.click(screen.getByRole("checkbox"));
			expect(onToggle).not.toHaveBeenCalled();
		});
	});
});
