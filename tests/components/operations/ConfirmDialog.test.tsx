/**
 * Tests for ConfirmDialog component
 * Modal dialog for confirming destructive actions
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConfirmDialog } from "@/components/operations/ConfirmDialog";

describe("ConfirmDialog", () => {
	describe("rendering", () => {
		it("should render dialog when open", async () => {
			render(
				<ConfirmDialog
					open={true}
					onOpenChange={() => {}}
					title="確認刪除"
					description="確定要刪除選取的檔案嗎？"
					onConfirm={() => {}}
				/>
			);

			await waitFor(() => {
				expect(screen.getByRole("dialog")).toBeInTheDocument();
			});
		});

		it("should not render when closed", () => {
			render(
				<ConfirmDialog
					open={false}
					onOpenChange={() => {}}
					title="確認刪除"
					description="確定要刪除選取的檔案嗎？"
					onConfirm={() => {}}
				/>
			);

			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});

		it("should render title", async () => {
			render(
				<ConfirmDialog
					open={true}
					onOpenChange={() => {}}
					title="確認刪除"
					description="確定要刪除選取的檔案嗎？"
					onConfirm={() => {}}
				/>
			);

			await waitFor(() => {
				expect(screen.getByText("確認刪除")).toBeInTheDocument();
			});
		});

		it("should render description", async () => {
			render(
				<ConfirmDialog
					open={true}
					onOpenChange={() => {}}
					title="確認刪除"
					description="確定要刪除選取的檔案嗎？"
					onConfirm={() => {}}
				/>
			);

			await waitFor(() => {
				expect(screen.getByText("確定要刪除選取的檔案嗎？")).toBeInTheDocument();
			});
		});

		it("should render confirm and cancel buttons", async () => {
			render(
				<ConfirmDialog
					open={true}
					onOpenChange={() => {}}
					title="確認刪除"
					description="確定要刪除選取的檔案嗎？"
					onConfirm={() => {}}
				/>
			);

			await waitFor(() => {
				expect(screen.getByRole("button", { name: /確認/i })).toBeInTheDocument();
				expect(screen.getByRole("button", { name: /取消/i })).toBeInTheDocument();
			});
		});
	});

	describe("interaction", () => {
		it("should call onConfirm when confirm button is clicked", async () => {
			const onConfirm = vi.fn();
			render(
				<ConfirmDialog
					open={true}
					onOpenChange={() => {}}
					title="確認刪除"
					description="確定要刪除選取的檔案嗎？"
					onConfirm={onConfirm}
				/>
			);

			await waitFor(() => {
				expect(screen.getByRole("button", { name: /確認/i })).toBeInTheDocument();
			});

			fireEvent.click(screen.getByRole("button", { name: /確認/i }));
			expect(onConfirm).toHaveBeenCalledTimes(1);
		});

		it("should call onOpenChange with false when cancel is clicked", async () => {
			const onOpenChange = vi.fn();
			render(
				<ConfirmDialog
					open={true}
					onOpenChange={onOpenChange}
					title="確認刪除"
					description="確定要刪除選取的檔案嗎？"
					onConfirm={() => {}}
				/>
			);

			await waitFor(() => {
				expect(screen.getByRole("button", { name: /取消/i })).toBeInTheDocument();
			});

			fireEvent.click(screen.getByRole("button", { name: /取消/i }));
			expect(onOpenChange).toHaveBeenCalledWith(false);
		});
	});

	describe("loading state", () => {
		it("should disable confirm button when loading", async () => {
			render(
				<ConfirmDialog
					open={true}
					onOpenChange={() => {}}
					title="確認刪除"
					description="確定要刪除選取的檔案嗎？"
					onConfirm={() => {}}
					isLoading={true}
				/>
			);

			await waitFor(() => {
				const confirmButton = screen.getByRole("button", {
					name: /確認|處理中/i,
				});
				expect(confirmButton).toBeDisabled();
			});
		});

		it("should show loading text when loading", async () => {
			render(
				<ConfirmDialog
					open={true}
					onOpenChange={() => {}}
					title="確認刪除"
					description="確定要刪除選取的檔案嗎？"
					onConfirm={() => {}}
					isLoading={true}
				/>
			);

			await waitFor(() => {
				expect(screen.getByText(/處理中/i)).toBeInTheDocument();
			});
		});
	});

	describe("custom button text", () => {
		it("should use custom confirm text", async () => {
			render(
				<ConfirmDialog
					open={true}
					onOpenChange={() => {}}
					title="確認刪除"
					description="確定要刪除選取的檔案嗎？"
					onConfirm={() => {}}
					confirmText="刪除"
				/>
			);

			await waitFor(() => {
				expect(screen.getByRole("button", { name: "刪除" })).toBeInTheDocument();
			});
		});

		it("should use custom cancel text", async () => {
			render(
				<ConfirmDialog
					open={true}
					onOpenChange={() => {}}
					title="確認刪除"
					description="確定要刪除選取的檔案嗎？"
					onConfirm={() => {}}
					cancelText="返回"
				/>
			);

			await waitFor(() => {
				expect(screen.getByRole("button", { name: "返回" })).toBeInTheDocument();
			});
		});
	});
});
