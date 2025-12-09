/**
 * ProgressBar component for displaying scan progress
 */

import { Progress } from "@/components/ui/progress";
import { ScanStatus } from "@/types/scan";

interface ProgressBarProps {
	/** Current scan status */
	status: ScanStatus;
	/** Number of files scanned so far */
	current: number;
	/** Total estimated files (may be 0 if unknown) */
	total: number;
	/** Path of file currently being processed */
	currentPath?: string;
}

/**
 * Component for displaying scan progress
 * Shows a progress bar with percentage and current file info
 */
export function ProgressBar({
	status,
	current,
	total,
	currentPath,
}: ProgressBarProps) {
	// Calculate progress percentage
	const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
	const showIndeterminate = status === ScanStatus.Scanning && total === 0;

	// Format the current path for display (truncate if too long)
	const displayPath =
		currentPath && currentPath.length > 60
			? "..." + currentPath.slice(-57)
			: (currentPath ?? "");

	if (status === ScanStatus.Idle) {
		return null;
	}

	return (
		<div className="space-y-2" role="region" aria-label="掃描進度">
			<div className="flex items-center justify-between text-sm">
				<span className="text-muted-foreground">
					{status === ScanStatus.Scanning && "掃描中..."}
					{status === ScanStatus.Completed && "掃描完成"}
					{status === ScanStatus.Error && "掃描發生錯誤"}
				</span>
				<span className="font-medium">
					{total > 0 ? (
						<>
							{current.toLocaleString()} / {total.toLocaleString()} 個檔案
						</>
					) : (
						<>{current.toLocaleString()} 個檔案</>
					)}
				</span>
			</div>

			<Progress
				value={showIndeterminate ? undefined : percentage}
				className="h-2"
				aria-label={`掃描進度: ${Math.round(percentage)}%`}
				aria-valuenow={showIndeterminate ? undefined : Math.round(percentage)}
				aria-valuemin={0}
				aria-valuemax={100}
			/>

			{status === ScanStatus.Scanning && currentPath && (
				<p
					className="text-muted-foreground truncate text-xs"
					title={currentPath}
				>
					{displayPath}
				</p>
			)}
		</div>
	);
}
