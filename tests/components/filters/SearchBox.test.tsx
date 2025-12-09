/**
 * Tests for SearchBox component
 * Provides real-time search functionality for file names
 * Uses filterStore for state management
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBox } from "@/components/filters/SearchBox";
import { useFilterStore } from "@/stores/filterStore";

// Store the original state for reset
const initialStoreState = useFilterStore.getState();

describe("SearchBox", () => {
	beforeEach(() => {
		// Reset store to initial state before each test
		useFilterStore.setState(initialStoreState);
	});

	afterEach(() => {
		cleanup();
		useFilterStore.setState(initialStoreState);
	});

	it("should render search input", () => {
		render(<SearchBox />);

		expect(screen.getByPlaceholderText(/搜尋檔案/i)).toBeInTheDocument();
	});

	it("should display the search query from store", () => {
		useFilterStore.setState({ searchQuery: "test.txt" });
		render(<SearchBox />);

		expect(screen.getByDisplayValue("test.txt")).toBeInTheDocument();
	});

	it("should update store when typing", async () => {
		const user = userEvent.setup();
		render(<SearchBox />);

		const input = screen.getByPlaceholderText(/搜尋檔案/i);
		await user.type(input, "doc");

		expect(useFilterStore.getState().searchQuery).toBe("doc");
	});

	it("should show clear button when search query is not empty", () => {
		useFilterStore.setState({ searchQuery: "test" });
		render(<SearchBox />);

		expect(
			screen.getByRole("button", { name: /清除搜尋/i })
		).toBeInTheDocument();
	});

	it("should not show clear button when search query is empty", () => {
		useFilterStore.setState({ searchQuery: "" });
		render(<SearchBox />);

		expect(
			screen.queryByRole("button", { name: /清除搜尋/i })
		).not.toBeInTheDocument();
	});

	it("should clear search query when clear button is clicked", async () => {
		useFilterStore.setState({ searchQuery: "test" });
		const user = userEvent.setup();
		render(<SearchBox />);

		await user.click(screen.getByRole("button", { name: /清除搜尋/i }));

		expect(useFilterStore.getState().searchQuery).toBe("");
	});

	it("should be disabled when disabled prop is true", () => {
		render(<SearchBox disabled />);

		expect(screen.getByPlaceholderText(/搜尋檔案/i)).toBeDisabled();
	});

	it("should have search icon", () => {
		render(<SearchBox />);

		// The search icon should be present as an SVG element
		const container = screen.getByPlaceholderText(/搜尋檔案/i).parentElement;
		expect(container?.querySelector("svg")).toBeInTheDocument();
	});

	it("should have accessible label", () => {
		render(<SearchBox />);

		const input = screen.getByPlaceholderText(/搜尋檔案/i);
		expect(input).toHaveAttribute("type", "text");
	});

	it("should accept custom placeholder", () => {
		render(<SearchBox placeholder="自訂提示" />);

		expect(screen.getByPlaceholderText("自訂提示")).toBeInTheDocument();
	});
});
