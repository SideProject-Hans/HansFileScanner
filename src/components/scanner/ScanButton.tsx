import { FolderSearch, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScanStatus } from "@/types/scan";

export interface ScanButtonProps {
	status: ScanStatus;
	disabled?: boolean;
	onStartScan: () => void;
	onCancelScan?: () => void;
}

export function ScanButton({
	status,
	disabled = false,
	onStartScan,
	onCancelScan,
}: ScanButtonProps) {
	const isScanning = status === "scanning";
	const isDisabled = disabled || status === "completed";

	const handleClick = () => {
		if (isScanning && onCancelScan) {
			onCancelScan();
		} else if (!isScanning) {
			onStartScan();
		}
	};

	const getButtonContent = () => {
		if (isScanning) {
			return (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
					掃描中...
				</>
			);
		}

		return (
			<>
				<FolderSearch className="mr-2 h-4 w-4" aria-hidden="true" />
				開始掃描
			</>
		);
	};

	const getButtonVariant = () => {
		if (isScanning && onCancelScan) {
			return "destructive";
		}
		return "default";
	};

	return (
		<Button
			variant={getButtonVariant()}
			disabled={isDisabled}
			onClick={handleClick}
			aria-label={isScanning ? "掃描中" : "開始掃描"}
			aria-busy={isScanning}
		>
			{getButtonContent()}
		</Button>
	);
}
