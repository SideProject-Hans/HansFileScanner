/**
 * Tests for ViewModeSelector component
 * Allows users to switch between different view modes
 * Uses filterStore for state management
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ViewModeSelector } from "@/components/filters/ViewModeSelector";
import { ViewMode } from "@/types/scan";
import { useFilterStore } from "@/stores/filterStore";

// Store the original state for reset
const initialStoreState = useFilterStore.getState();

describe("ViewModeSelector", () => {
	beforeEach(() => {
		// Reset store to initial state before each test
		useFilterStore.setState(initialStoreState);
	});

	afterEach(() => {
		cleanup();
		useFilterStore.setState(initialStoreState);
	});

	it("should render all view mode options", () => {
		render(<ViewModeSelector />);

		expect(
			screen.getByRole("button", { name: /樹狀結構/i })
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /文件/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /圖片/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /影片/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /音訊/i })).toBeInTheDocument();
	});

	it("should highlight the currently selected view mode from store", () => {
		useFilterStore.setState({ viewMode: ViewMode.Images });
		render(<ViewModeSelector />);

		const imagesButton = screen.getByRole("button", { name: /圖片/i });
		expect(imagesButton).toHaveAttribute("data-state", "on");
	});

	it("should update store when a different mode is selected", () => {
		useFilterStore.setState({ viewMode: ViewMode.Tree });
		render(<ViewModeSelector />);

		const documentsButton = screen.getByRole("button", { name: /文件/i });
		fireEvent.click(documentsButton);

		expect(useFilterStore.getState().viewMode).toBe(ViewMode.Documents);
	});

	it("should not update store when the same mode is selected", () => {
		useFilterStore.setState({ viewMode: ViewMode.Tree });
		render(<ViewModeSelector />);

		const treeButton = screen.getByRole("button", { name: /樹狀結構/i });
		fireEvent.click(treeButton);

		// viewMode should remain the same
		expect(useFilterStore.getState().viewMode).toBe(ViewMode.Tree);
	});

	it("should be disabled when disabled prop is true", () => {
		render(<ViewModeSelector disabled />);

		const buttons = screen.getAllByRole("button");
		buttons.forEach((button) => {
			expect(button).toBeDisabled();
		});
	});

	it("should not update store when disabled", () => {
		useFilterStore.setState({ viewMode: ViewMode.Tree });
		render(<ViewModeSelector disabled />);

		const documentsButton = screen.getByRole("button", { name: /文件/i });
		fireEvent.click(documentsButton);

		// viewMode should remain the same
		expect(useFilterStore.getState().viewMode).toBe(ViewMode.Tree);
	});

	it("should display icons for each view mode", () => {
		render(<ViewModeSelector />);

		// Check that SVG icons are rendered (lucide-react icons render as SVG)
		const buttons = screen.getAllByRole("button");
		buttons.forEach((button) => {
			expect(button.querySelector("svg")).toBeInTheDocument();
		});
	});

	it("should have accessible labels for each button", () => {
		render(<ViewModeSelector />);

		const buttons = screen.getAllByRole("button");
		buttons.forEach((button) => {
			expect(button).toHaveAttribute("aria-pressed");
		});
	});

	it("should have group role with aria-label", () => {
		render(<ViewModeSelector />);

		expect(
			screen.getByRole("group", { name: /顯示模式/i })
		).toBeInTheDocument();
	});
});
