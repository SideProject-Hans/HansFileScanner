/**
 * TypeFilter component
 * Allows users to filter files by extension using a multi-select dropdown
 * Connected to filterStore for state management
 */

import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useFilterStore } from "@/stores/filterStore";

interface TypeFilterProps {
	/** Available extensions to filter by (overrides store if provided) */
	extensions?: string[];

	/** Whether the filter is disabled */
	disabled?: boolean;
}

export function TypeFilter({ extensions, disabled = false }: TypeFilterProps) {
	const [open, setOpen] = useState(false);

	const availableExtensions = useFilterStore(
		(state) => state.availableExtensions
	);
	const selectedExtensions = useFilterStore(
		(state) => state.selectedExtensions
	);
	const toggleExtension = useFilterStore((state) => state.toggleExtension);
	const setSelectedExtensions = useFilterStore(
		(state) => state.setSelectedExtensions
	);

	// Use provided extensions or fall back to store
	const displayExtensions = extensions ?? availableExtensions;

	const hasSelection = selectedExtensions.length > 0;

	const displayText = hasSelection
		? `${selectedExtensions.length} 個已選`
		: "所有類型";

	const handleClearExtensions = () => {
		setSelectedExtensions([]);
	};

	return (
		<div className="flex items-center gap-2">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						disabled={disabled}
						className="w-[160px] justify-between"
					>
						<span className="truncate">{displayText}</span>
						<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0" align="start">
					<div className="max-h-[300px] overflow-auto">
						{displayExtensions.length === 0 ? (
							<div className="text-muted-foreground py-6 text-center text-sm">
								沒有可用的副檔名
							</div>
						) : (
							<div className="p-1">
								{displayExtensions.map((extension) => {
									const isSelected = selectedExtensions.includes(extension);

									return (
										<div
											key={extension}
											role="option"
											aria-selected={isSelected}
											data-selected={isSelected}
											onClick={() => toggleExtension(extension)}
											className={cn(
												"flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
												"hover:bg-accent hover:text-accent-foreground",
												isSelected && "bg-accent/50"
											)}
										>
											<div
												className={cn(
													"flex h-4 w-4 items-center justify-center rounded-sm border",
													isSelected
														? "border-primary bg-primary text-primary-foreground"
														: "border-muted-foreground/30"
												)}
											>
												{isSelected && <Check className="h-3 w-3" />}
											</div>
											<span>.{extension}</span>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</PopoverContent>
			</Popover>

			{hasSelection && (
				<Button
					variant="ghost"
					size="sm"
					onClick={handleClearExtensions}
					disabled={disabled}
					aria-label="清除"
					className="h-8 px-2"
				>
					<X className="h-4 w-4" />
					<span className="sr-only">清除</span>
				</Button>
			)}
		</div>
	);
}
