/**
 * Tests for TypeFilter component
 * Allows users to filter files by extension using a multi-select dropdown
 * Uses filterStore for state management
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TypeFilter } from "@/components/filters/TypeFilter";
import { useFilterStore } from "@/stores/filterStore";

// Store the original state for reset
const initialStoreState = useFilterStore.getState();

describe("TypeFilter", () => {
	beforeEach(() => {
		// Reset store to initial state before each test
		useFilterStore.setState({
			...initialStoreState,
			availableExtensions: ["txt", "pdf", "jpg", "png"],
			selectedExtensions: [],
		});
	});

	afterEach(() => {
		cleanup();
		useFilterStore.setState(initialStoreState);
	});

	it("should render with default text when no extensions selected", () => {
		render(<TypeFilter />);

		expect(screen.getByRole("combobox")).toHaveTextContent("所有類型");
	});

	it("should show selected count when extensions are selected", () => {
		useFilterStore.setState({
			availableExtensions: ["txt", "pdf", "jpg"],
			selectedExtensions: ["txt", "pdf"],
		});
		render(<TypeFilter />);

		expect(screen.getByRole("combobox")).toHaveTextContent("2 個已選");
	});

	it("should open dropdown when clicked", async () => {
		const user = userEvent.setup();
		render(<TypeFilter />);

		await user.click(screen.getByRole("combobox"));

		expect(screen.getByText(".txt")).toBeInTheDocument();
		expect(screen.getByText(".pdf")).toBeInTheDocument();
	});

	it("should update store when extension is toggled", async () => {
		const user = userEvent.setup();
		render(<TypeFilter />);

		await user.click(screen.getByRole("combobox"));
		await user.click(screen.getByText(".txt"));

		expect(useFilterStore.getState().selectedExtensions).toContain("txt");
	});

	it("should remove extension from store when toggled off", async () => {
		useFilterStore.setState({
			availableExtensions: ["txt", "pdf"],
			selectedExtensions: ["txt"],
		});
		const user = userEvent.setup();
		render(<TypeFilter />);

		await user.click(screen.getByRole("combobox"));
		await user.click(screen.getByText(".txt"));

		expect(useFilterStore.getState().selectedExtensions).not.toContain("txt");
	});

	it("should show clear button when extensions are selected", () => {
		useFilterStore.setState({
			availableExtensions: ["txt"],
			selectedExtensions: ["txt"],
		});
		render(<TypeFilter />);

		expect(screen.getByRole("button", { name: /清除/i })).toBeInTheDocument();
	});

	it("should not show clear button when no extensions selected", () => {
		useFilterStore.setState({
			availableExtensions: ["txt"],
			selectedExtensions: [],
		});
		render(<TypeFilter />);

		expect(
			screen.queryByRole("button", { name: /清除/i })
		).not.toBeInTheDocument();
	});

	it("should clear all selected extensions when clear is clicked", async () => {
		useFilterStore.setState({
			availableExtensions: ["txt", "pdf"],
			selectedExtensions: ["txt", "pdf"],
		});
		const user = userEvent.setup();
		render(<TypeFilter />);

		await user.click(screen.getByRole("button", { name: /清除/i }));

		expect(useFilterStore.getState().selectedExtensions).toHaveLength(0);
	});

	it("should be disabled when disabled prop is true", () => {
		render(<TypeFilter disabled />);

		expect(screen.getByRole("combobox")).toBeDisabled();
	});

	it("should show empty message when no extensions available", async () => {
		useFilterStore.setState({
			availableExtensions: [],
			selectedExtensions: [],
		});
		const user = userEvent.setup();
		render(<TypeFilter />);

		await user.click(screen.getByRole("combobox"));

		expect(screen.getByText(/沒有可用的副檔名/i)).toBeInTheDocument();
	});

	it("should mark selected extensions visually", async () => {
		useFilterStore.setState({
			availableExtensions: ["txt", "pdf"],
			selectedExtensions: ["txt"],
		});
		const user = userEvent.setup();
		render(<TypeFilter />);

		await user.click(screen.getByRole("combobox"));

		const txtOption = screen.getByRole("option", { name: /.txt/i });
		expect(txtOption).toHaveAttribute("data-selected", "true");

		const pdfOption = screen.getByRole("option", { name: /.pdf/i });
		expect(pdfOption).toHaveAttribute("data-selected", "false");
	});

	it("should use provided extensions prop over store", async () => {
		useFilterStore.setState({
			availableExtensions: ["txt", "pdf"],
			selectedExtensions: [],
		});
		const user = userEvent.setup();
		render(<TypeFilter extensions={["doc", "xls"]} />);

		await user.click(screen.getByRole("combobox"));

		expect(screen.getByText(".doc")).toBeInTheDocument();
		expect(screen.getByText(".xls")).toBeInTheDocument();
		expect(screen.queryByText(".txt")).not.toBeInTheDocument();
	});
});
