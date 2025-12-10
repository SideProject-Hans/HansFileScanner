/**
 * SearchBox component
 * Provides real-time search functionality for file names
 * Connected to filterStore for state management
 */

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFilterStore } from "@/stores/filterStore";

interface SearchBoxProps {
	/** Whether the search box is disabled */
	disabled?: boolean;

	/** Placeholder text */
	placeholder?: string;
}

export function SearchBox({
	disabled = false,
	placeholder = "搜尋檔案...",
}: SearchBoxProps) {
	const searchQuery = useFilterStore((state) => state.searchQuery);
	const setSearchQuery = useFilterStore((state) => state.setSearchQuery);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const handleClear = () => {
		setSearchQuery("");
	};

	const hasValue = searchQuery.length > 0;

	return (
		<div className="relative flex items-center">
			<Search className="text-muted-foreground absolute left-2.5 h-4 w-4" />
			<Input
				type="text"
				placeholder={placeholder}
				value={searchQuery}
				onChange={handleChange}
				disabled={disabled}
				className="pr-8 pl-8"
				aria-label="搜尋檔案"
			/>
			{hasValue && (
				<Button
					variant="ghost"
					size="sm"
					onClick={handleClear}
					disabled={disabled}
					aria-label="清除搜尋"
					className="absolute right-0 h-full px-2 hover:bg-transparent"
				>
					<X className="h-4 w-4" />
				</Button>
			)}
		</div>
	);
}
