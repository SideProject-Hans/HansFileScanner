import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "../../../src/components/scanner/ProgressBar";
import { ScanStatus } from "../../../src/types/scan";

describe("ProgressBar", () => {
	describe("idle state", () => {
		it("should render nothing when status is idle", () => {
			const { container } = render(
				<ProgressBar status={ScanStatus.Idle} current={0} total={0} />
			);

			expect(container.firstChild).toBeNull();
		});
	});

	describe("scanning state", () => {
		it("should render scanning message", () => {
			render(
				<ProgressBar status={ScanStatus.Scanning} current={50} total={100} />
			);

			expect(screen.getByText("掃描中...")).toBeInTheDocument();
		});

		it("should render file count with format: current / total 個檔案", () => {
			render(
				<ProgressBar status={ScanStatus.Scanning} current={50} total={100} />
			);

			expect(screen.getByText(/50.*\/.*100.*個檔案/)).toBeInTheDocument();
		});

		it("should render progress bar with correct percentage", () => {
			render(
				<ProgressBar status={ScanStatus.Scanning} current={25} total={100} />
			);

			const progressBar = screen.getByRole("progressbar");
			expect(progressBar).toHaveAttribute("aria-valuenow", "25");
		});

		it("should render current path when provided", () => {
			render(
				<ProgressBar
					status={ScanStatus.Scanning}
					current={10}
					total={50}
					currentPath="C:\Users\Test\file.txt"
				/>
			);

			expect(screen.getByText("C:\\Users\\Test\\file.txt")).toBeInTheDocument();
		});

		it("should not render current path section when not provided", () => {
			const { container } = render(
				<ProgressBar status={ScanStatus.Scanning} current={10} total={50} />
			);

			// The path paragraph element should not exist
			const pathElement = container.querySelector("p[title]");
			expect(pathElement).toBeNull();
		});

		it("should handle zero total gracefully showing only current", () => {
			render(
				<ProgressBar status={ScanStatus.Scanning} current={5} total={0} />
			);

			// When total is 0, only show current count
			expect(screen.getByText("5 個檔案")).toBeInTheDocument();
		});

		it("should show indeterminate progress when total is zero", () => {
			render(
				<ProgressBar status={ScanStatus.Scanning} current={0} total={0} />
			);

			// When total is 0, progress should be indeterminate (no aria-valuenow)
			const progressBar = screen.getByRole("progressbar");
			expect(progressBar).not.toHaveAttribute("aria-valuenow");
		});
	});

	describe("completed state", () => {
		it("should render completed message", () => {
			render(
				<ProgressBar status={ScanStatus.Completed} current={150} total={150} />
			);

			expect(screen.getByText("掃描完成")).toBeInTheDocument();
		});

		it("should render file count", () => {
			render(
				<ProgressBar status={ScanStatus.Completed} current={150} total={150} />
			);

			expect(screen.getByText(/150.*\/.*150.*個檔案/)).toBeInTheDocument();
		});

		it("should render progress bar at 100%", () => {
			render(
				<ProgressBar status={ScanStatus.Completed} current={100} total={100} />
			);

			const progressBar = screen.getByRole("progressbar");
			expect(progressBar).toHaveAttribute("aria-valuenow", "100");
		});
	});

	describe("error state", () => {
		it("should render error message", () => {
			render(<ProgressBar status={ScanStatus.Error} current={0} total={0} />);

			expect(screen.getByText("掃描發生錯誤")).toBeInTheDocument();
		});

		it("should render progress bar at 0%", () => {
			render(<ProgressBar status={ScanStatus.Error} current={0} total={0} />);

			const progressBar = screen.getByRole("progressbar");
			expect(progressBar).toHaveAttribute("aria-valuenow", "0");
		});
	});

	describe("accessibility", () => {
		it("should have accessible progress bar", () => {
			render(
				<ProgressBar status={ScanStatus.Scanning} current={50} total={100} />
			);

			const progressBar = screen.getByRole("progressbar");
			expect(progressBar).toBeInTheDocument();
			expect(progressBar).toHaveAttribute("aria-valuemin", "0");
			expect(progressBar).toHaveAttribute("aria-valuemax", "100");
		});

		it("should have status region with aria-label", () => {
			render(
				<ProgressBar status={ScanStatus.Scanning} current={50} total={100} />
			);

			expect(screen.getByRole("region")).toHaveAttribute(
				"aria-label",
				"掃描進度"
			);
		});
	});

	describe("edge cases", () => {
		it("should handle large numbers with locale formatting", () => {
			render(
				<ProgressBar
					status={ScanStatus.Scanning}
					current={999999}
					total={1000000}
				/>
			);

			// toLocaleString adds commas for large numbers
			expect(screen.getByText(/999,999/)).toBeInTheDocument();
		});

		it("should cap progress at 100% when current exceeds total", () => {
			render(
				<ProgressBar status={ScanStatus.Scanning} current={150} total={100} />
			);

			const progressBar = screen.getByRole("progressbar");
			expect(progressBar).toHaveAttribute("aria-valuenow", "100");
		});

		it("should truncate long file paths with ellipsis prefix", () => {
			const longPath =
				"C:\\Users\\Test\\Very\\Deep\\Nested\\Directory\\Structure\\With\\Many\\Levels\\file.txt";
			render(
				<ProgressBar
					status={ScanStatus.Scanning}
					current={10}
					total={50}
					currentPath={longPath}
				/>
			);

			// The path element should have a title with full path
			const pathElement = screen.getByTitle(longPath);
			expect(pathElement).toBeInTheDocument();
			expect(pathElement).toHaveClass("truncate");
			// Truncated path should start with "..."
			expect(pathElement.textContent).toMatch(/^\.\.\./);
		});

		it("should not truncate short file paths", () => {
			const shortPath = "C:\\Users\\file.txt";
			render(
				<ProgressBar
					status={ScanStatus.Scanning}
					current={10}
					total={50}
					currentPath={shortPath}
				/>
			);

			// Short path should be displayed as-is
			expect(screen.getByText(shortPath)).toBeInTheDocument();
		});
	});
});
