/**
 * DeleteButton component
 * Button to trigger file deletion
 */

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DeleteButtonProps {
	/** Callback when button is clicked */
	onClick: () => void;
	/** Number of selected files */
	selectedCount: number;
	/** Whether delete operation is in progress */
	isLoading?: boolean;
}

/**
 * Button component for triggering file deletion
 */
export function DeleteButton({
	onClick,
	selectedCount,
	isLoading = false,
}: DeleteButtonProps) {
	const isDisabled = selectedCount === 0 || isLoading;

	return (
		<Button
			variant="destructive"
			size="sm"
			onClick={onClick}
			disabled={isDisabled}
			className="gap-2"
		>
			<Trash2 className="h-4 w-4" />
			<span>刪除 {selectedCount > 0 ? `(${selectedCount})` : ""}</span>
		</Button>
	);
}
