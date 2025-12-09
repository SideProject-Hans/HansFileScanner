/**
 * FileCheckbox component
 * Checkbox for selecting individual files
 */

import { Checkbox } from "@/components/ui/checkbox";

export interface FileCheckboxProps {
	/** Whether the file is selected */
	isSelected: boolean;
	/** Callback when checkbox is toggled */
	onToggle: () => void;
	/** Accessibility label */
	ariaLabel: string;
	/** Whether the checkbox is disabled */
	disabled?: boolean;
}

/**
 * Checkbox component for file selection
 */
export function FileCheckbox({
	isSelected,
	onToggle,
	ariaLabel,
	disabled = false,
}: FileCheckboxProps) {
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!disabled) {
			onToggle();
		}
	};

	return (
		<Checkbox
			checked={isSelected}
			onClick={handleClick}
			onCheckedChange={() => {}}
			aria-label={ariaLabel}
			disabled={disabled}
			className="shrink-0"
		/>
	);
}
