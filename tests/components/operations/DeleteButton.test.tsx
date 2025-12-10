/**
 * Tests for DeleteButton component
 * Button to trigger file deletion
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteButton } from "@/components/operations/DeleteButton";

describe("DeleteButton", () => {
	describe("rendering", () => {
		it("should render delete button", () => {
			render(<DeleteButton onClick={() => {}} selectedCount={1} />);

			const button = screen.getByRole("button", { name: /刪除/i });
			expect(button).toBeInTheDocument();
		});

		it("should show selected count in button text", () => {
			render(<DeleteButton onClick={() => {}} selectedCount={5} />);

			expect(screen.getByText(/5/)).toBeInTheDocument();
		});

		it("should be disabled when selectedCount is 0", () => {
			render(<DeleteButton onClick={() => {}} selectedCount={0} />);

			const button = screen.getByRole("button");
			expect(button).toBeDisabled();
		});

		it("should be enabled when selectedCount is greater than 0", () => {
			render(<DeleteButton onClick={() => {}} selectedCount={3} />);

			const button = screen.getByRole("button");
			expect(button).toBeEnabled();
		});
	});

	describe("interaction", () => {
		it("should call onClick when clicked", () => {
			const onClick = vi.fn();
			render(<DeleteButton onClick={onClick} selectedCount={2} />);

			fireEvent.click(screen.getByRole("button"));
			expect(onClick).toHaveBeenCalledTimes(1);
		});

		it("should not call onClick when disabled", () => {
			const onClick = vi.fn();
			render(<DeleteButton onClick={onClick} selectedCount={0} />);

			fireEvent.click(screen.getByRole("button"));
			expect(onClick).not.toHaveBeenCalled();
		});
	});

	describe("loading state", () => {
		it("should show loading state when isLoading is true", () => {
			render(
				<DeleteButton onClick={() => {}} selectedCount={1} isLoading={true} />
			);

			const button = screen.getByRole("button");
			expect(button).toBeDisabled();
		});

		it("should not be clickable when loading", () => {
			const onClick = vi.fn();
			render(
				<DeleteButton onClick={onClick} selectedCount={1} isLoading={true} />
			);

			fireEvent.click(screen.getByRole("button"));
			expect(onClick).not.toHaveBeenCalled();
		});
	});
});
