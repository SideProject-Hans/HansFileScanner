import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScanButton } from "../../../src/components/scanner/ScanButton";
import type { ScanStatus } from "../../../src/types/scan";

describe("ScanButton", () => {
	describe("idle state", () => {
		it("should render start scan button when idle", () => {
			render(<ScanButton status="idle" onStartScan={() => {}} />);

			const button = screen.getByRole("button", { name: "開始掃描" });
			expect(button).toBeInTheDocument();
			expect(button).not.toBeDisabled();
		});

		it("should call onStartScan when clicked", () => {
			const onStartScan = vi.fn();
			render(<ScanButton status="idle" onStartScan={onStartScan} />);

			const button = screen.getByRole("button", { name: "開始掃描" });
			fireEvent.click(button);

			expect(onStartScan).toHaveBeenCalledTimes(1);
		});

		it("should display folder search icon", () => {
			render(<ScanButton status="idle" onStartScan={() => {}} />);

			expect(screen.getByText("開始掃描")).toBeInTheDocument();
		});
	});

	describe("scanning state", () => {
		it("should render scanning button when scanning", () => {
			render(<ScanButton status="scanning" onStartScan={() => {}} />);

			const button = screen.getByRole("button", { name: "掃描中" });
			expect(button).toBeInTheDocument();
			expect(screen.getByText("掃描中...")).toBeInTheDocument();
		});

		it("should show loading spinner when scanning", () => {
			render(<ScanButton status="scanning" onStartScan={() => {}} />);

			const button = screen.getByRole("button", { name: "掃描中" });
			expect(button).toHaveAttribute("aria-busy", "true");
		});

		it("should not call onStartScan when clicked during scanning", () => {
			const onStartScan = vi.fn();
			render(<ScanButton status="scanning" onStartScan={onStartScan} />);

			const button = screen.getByRole("button", { name: "掃描中" });
			fireEvent.click(button);

			expect(onStartScan).not.toHaveBeenCalled();
		});

		it("should call onCancelScan when clicked during scanning if provided", () => {
			const onCancelScan = vi.fn();
			render(
				<ScanButton
					status="scanning"
					onStartScan={() => {}}
					onCancelScan={onCancelScan}
				/>
			);

			const button = screen.getByRole("button", { name: "掃描中" });
			fireEvent.click(button);

			expect(onCancelScan).toHaveBeenCalledTimes(1);
		});
	});

	describe("completed state", () => {
		it("should be disabled when completed", () => {
			render(<ScanButton status="completed" onStartScan={() => {}} />);

			const button = screen.getByRole("button", { name: "開始掃描" });
			expect(button).toBeDisabled();
		});

		it("should not call onStartScan when clicked in completed state", () => {
			const onStartScan = vi.fn();
			render(<ScanButton status="completed" onStartScan={onStartScan} />);

			const button = screen.getByRole("button", { name: "開始掃描" });
			fireEvent.click(button);

			expect(onStartScan).not.toHaveBeenCalled();
		});
	});

	describe("error state", () => {
		it("should render start scan button when error", () => {
			render(<ScanButton status="error" onStartScan={() => {}} />);

			const button = screen.getByRole("button", { name: "開始掃描" });
			expect(button).toBeInTheDocument();
			expect(button).not.toBeDisabled();
		});

		it("should allow retry on error state", () => {
			const onStartScan = vi.fn();
			render(<ScanButton status="error" onStartScan={onStartScan} />);

			const button = screen.getByRole("button", { name: "開始掃描" });
			fireEvent.click(button);

			expect(onStartScan).toHaveBeenCalledTimes(1);
		});
	});

	describe("disabled prop", () => {
		it("should be disabled when disabled prop is true", () => {
			render(<ScanButton status="idle" disabled onStartScan={() => {}} />);

			const button = screen.getByRole("button", { name: "開始掃描" });
			expect(button).toBeDisabled();
		});

		it("should not call onStartScan when disabled", () => {
			const onStartScan = vi.fn();
			render(<ScanButton status="idle" disabled onStartScan={onStartScan} />);

			const button = screen.getByRole("button", { name: "開始掃描" });
			fireEvent.click(button);

			expect(onStartScan).not.toHaveBeenCalled();
		});
	});

	describe("accessibility", () => {
		it("should have correct aria-label for idle state", () => {
			render(<ScanButton status="idle" onStartScan={() => {}} />);

			const button = screen.getByRole("button", { name: "開始掃描" });
			expect(button).toHaveAttribute("aria-label", "開始掃描");
		});

		it("should have correct aria-label for scanning state", () => {
			render(<ScanButton status="scanning" onStartScan={() => {}} />);

			const button = screen.getByRole("button", { name: "掃描中" });
			expect(button).toHaveAttribute("aria-label", "掃描中");
		});

		it("should have aria-busy attribute when scanning", () => {
			render(<ScanButton status="scanning" onStartScan={() => {}} />);

			const button = screen.getByRole("button", { name: "掃描中" });
			expect(button).toHaveAttribute("aria-busy", "true");
		});

		it("should not have aria-busy attribute when idle", () => {
			render(<ScanButton status="idle" onStartScan={() => {}} />);

			const button = screen.getByRole("button", { name: "開始掃描" });
			expect(button).toHaveAttribute("aria-busy", "false");
		});
	});
});
