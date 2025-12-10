/**
 * CopyButton component
 * Button to trigger file copy operation
 */

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CopyButtonProps {
	/** Callback when button is clicked */
	onClick: () => void;
	/** Number of selected files */
	selectedCount: number;
	/** Whether copy operation is in progress */
	isLoading?: boolean;
}

/**
 * Button component for triggering file copy operation
 */
export function CopyButton({
	onClick,
	selectedCount,
	isLoading = false,
}: CopyButtonProps) {
	const isDisabled = selectedCount === 0 || isLoading;

	return (
		<Button
			variant="secondary"
			size="sm"
			onClick={onClick}
			disabled={isDisabled}
			className="gap-2"
		>
			<Copy className="h-4 w-4" />
			<span>複製 {selectedCount > 0 ? `(${selectedCount})` : ""}</span>
		</Button>
	);
}
