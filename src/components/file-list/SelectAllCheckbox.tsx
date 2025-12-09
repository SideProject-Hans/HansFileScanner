/**
 * SelectAllCheckbox component
 * Checkbox for selecting/deselecting all files
 */

import { Checkbox } from "@/components/ui/checkbox";

export interface SelectAllCheckboxProps {
	/** Whether all files are selected */
	isAllSelected: boolean;
	/** Whether some (but not all) files are selected */
	isPartialSelected: boolean;
	/** Callback when checkbox is toggled */
	onToggle: () => void;
	/** Whether the checkbox is disabled */
	disabled?: boolean;
}

/**
 * Checkbox component for selecting/deselecting all files
 */
export function SelectAllCheckbox({
	isAllSelected,
	isPartialSelected,
	onToggle,
	disabled = false,
}: SelectAllCheckboxProps) {
	const handleChange = () => {
		if (!disabled) {
			onToggle();
		}
	};

	// Determine the checked state
	const checkedState = isAllSelected
		? true
		: isPartialSelected
			? "indeterminate"
			: false;

	return (
		<label className="flex cursor-pointer items-center gap-2 select-none">
			<Checkbox
				checked={checkedState}
				onCheckedChange={handleChange}
				aria-label="全選"
				disabled={disabled}
			/>
			<span className="text-sm">全選</span>
		</label>
	);
}
