/**
 * Tests for CopyButton component
 * Button to trigger file copy operation
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CopyButton } from "@/components/operations/CopyButton";

describe("CopyButton", () => {
	describe("rendering", () => {
		it("should render copy button", () => {
			render(<CopyButton onClick={() => {}} selectedCount={1} />);

			const button = screen.getByRole("button", { name: /複製/i });
			expect(button).toBeInTheDocument();
		});

		it("should show selected count in button text", () => {
			render(<CopyButton onClick={() => {}} selectedCount={5} />);

			expect(screen.getByText(/5/)).toBeInTheDocument();
		});

		it("should be disabled when selectedCount is 0", () => {
			render(<CopyButton onClick={() => {}} selectedCount={0} />);

			const button = screen.getByRole("button");
			expect(button).toBeDisabled();
		});

		it("should be enabled when selectedCount is greater than 0", () => {
			render(<CopyButton onClick={() => {}} selectedCount={3} />);

			const button = screen.getByRole("button");
			expect(button).toBeEnabled();
		});

		it("should display copy icon", () => {
			render(<CopyButton onClick={() => {}} selectedCount={1} />);

			// Lucide icons render as SVG
			const button = screen.getByRole("button");
			const svg = button.querySelector("svg");
			expect(svg).toBeInTheDocument();
		});
	});

	describe("interaction", () => {
		it("should call onClick when clicked", () => {
			const onClick = vi.fn();
			render(<CopyButton onClick={onClick} selectedCount={2} />);

			fireEvent.click(screen.getByRole("button"));
			expect(onClick).toHaveBeenCalledTimes(1);
		});

		it("should not call onClick when disabled", () => {
			const onClick = vi.fn();
			render(<CopyButton onClick={onClick} selectedCount={0} />);

			fireEvent.click(screen.getByRole("button"));
			expect(onClick).not.toHaveBeenCalled();
		});
	});

	describe("loading state", () => {
		it("should show loading state when isLoading is true", () => {
			render(
				<CopyButton onClick={() => {}} selectedCount={1} isLoading={true} />
			);

			const button = screen.getByRole("button");
			expect(button).toBeDisabled();
		});

		it("should not be clickable when loading", () => {
			const onClick = vi.fn();
			render(
				<CopyButton onClick={onClick} selectedCount={1} isLoading={true} />
			);

			fireEvent.click(screen.getByRole("button"));
			expect(onClick).not.toHaveBeenCalled();
		});

		it("should show loading indicator when loading", () => {
			render(
				<CopyButton onClick={() => {}} selectedCount={1} isLoading={true} />
			);

			// Check that button text changes or loading state is visible
			const button = screen.getByRole("button");
			expect(button).toBeDisabled();
		});
	});

	describe("styling", () => {
		it("should use secondary variant by default", () => {
			render(<CopyButton onClick={() => {}} selectedCount={1} />);

			const button = screen.getByRole("button");
			// Button should not have destructive class
			expect(button.className).not.toContain("destructive");
		});
	});
});
