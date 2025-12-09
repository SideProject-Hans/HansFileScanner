/**
 * ConfirmDialog component
 * Modal dialog for confirming destructive actions
 */

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmDialogProps {
	/** Whether the dialog is open */
	open: boolean;
	/** Callback when open state changes */
	onOpenChange: (open: boolean) => void;
	/** Dialog title */
	title: string;
	/** Dialog description */
	description: string;
	/** Callback when confirm is clicked */
	onConfirm: () => void;
	/** Whether an operation is in progress */
	isLoading?: boolean;
	/** Custom confirm button text */
	confirmText?: string;
	/** Custom cancel button text */
	cancelText?: string;
}

/**
 * Confirmation dialog component for destructive actions
 */
export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	onConfirm,
	isLoading = false,
	confirmText = "確認",
	cancelText = "取消",
}: ConfirmDialogProps) {
	const handleCancel = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={handleCancel} disabled={isLoading}>
						{cancelText}
					</Button>
					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={isLoading}
					>
						{isLoading ? "處理中..." : confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
