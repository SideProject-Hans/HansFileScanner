/**
 * FolderSelector component for selecting folders to scan
 */

import { FolderOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FolderSelectorProps {
	/** Currently selected folder path */
	selectedFolder: string | null;
	/** Callback to open folder selection dialog */
	onSelectFolder: () => void;
	/** Callback to clear selected folder */
	onClearFolder: () => void;
	/** Whether the selector is disabled */
	disabled?: boolean;
}

/**
 * Component for selecting folders to scan
 * Shows the selected folder path with options to change or clear
 */
export function FolderSelector({
	selectedFolder,
	onSelectFolder,
	onClearFolder,
	disabled = false,
}: FolderSelectorProps) {
	return (
		<div className="space-y-2">
			<label
				htmlFor="folder-path"
				className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				選擇資料夾
			</label>
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Input
						id="folder-path"
						type="text"
						value={selectedFolder ?? ""}
						placeholder="選擇要掃描的資料夾..."
						readOnly
						disabled={disabled}
						className="pr-8"
						aria-label="選擇的資料夾路徑"
					/>
					{selectedFolder && !disabled && (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2"
							onClick={onClearFolder}
							aria-label="清除選擇的資料夾"
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>
				<Button
					type="button"
					variant="outline"
					onClick={onSelectFolder}
					disabled={disabled}
					aria-label="開啟資料夾選擇對話框"
				>
					<FolderOpen className="mr-2 h-4 w-4" />
					瀏覽
				</Button>
			</div>
		</div>
	);
}
