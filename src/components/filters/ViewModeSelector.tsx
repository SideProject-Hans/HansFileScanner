/**
 * ViewModeSelector component
 * Allows users to switch between different view modes (Tree, Documents, Images, Videos, Audio)
 * Connected to filterStore for state management
 */

import {
	FolderTree,
	FileText,
	Image,
	Video,
	Music,
	type LucideIcon,
} from "lucide-react";
import { ViewMode } from "@/types/scan";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFilterStore } from "@/stores/filterStore";

interface ViewModeOption {
	mode: ViewMode;
	label: string;
	icon: LucideIcon;
}

const viewModeOptions: ViewModeOption[] = [
	{ mode: ViewMode.Tree, label: "樹狀結構", icon: FolderTree },
	{ mode: ViewMode.Documents, label: "文件", icon: FileText },
	{ mode: ViewMode.Images, label: "圖片", icon: Image },
	{ mode: ViewMode.Videos, label: "影片", icon: Video },
	{ mode: ViewMode.Audio, label: "音訊", icon: Music },
];

interface ViewModeSelectorProps {
	/** Whether the selector is disabled */
	disabled?: boolean;
}

export function ViewModeSelector({ disabled = false }: ViewModeSelectorProps) {
	const viewMode = useFilterStore((state) => state.viewMode);
	const setViewMode = useFilterStore((state) => state.setViewMode);

	const handleClick = (mode: ViewMode) => {
		if (mode !== viewMode && !disabled) {
			setViewMode(mode);
		}
	};

	return (
		<div className="flex flex-wrap gap-1" role="group" aria-label="顯示模式">
			{viewModeOptions.map(({ mode, label, icon: Icon }) => {
				const isSelected = viewMode === mode;

				return (
					<Button
						key={mode}
						variant={isSelected ? "default" : "outline"}
						size="sm"
						onClick={() => handleClick(mode)}
						disabled={disabled}
						data-state={isSelected ? "on" : "off"}
						aria-pressed={isSelected}
						className={cn(
							"flex items-center gap-1.5",
							isSelected && "pointer-events-none"
						)}
					>
						<Icon className="h-4 w-4" />
						<span className="hidden sm:inline">{label}</span>
					</Button>
				);
			})}
		</div>
	);
}
