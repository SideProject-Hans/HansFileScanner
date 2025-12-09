/**
 * Main layout component for the file scanner application
 * Provides the overall structure with header, main content area, and footer
 */

import { useEffect } from "react";
import { FolderSelector } from "@/components/scanner/FolderSelector";
import { ScanButton } from "@/components/scanner/ScanButton";
import { ProgressBar } from "@/components/scanner/ProgressBar";
import { FileTable } from "@/components/scanner/FileTable";
import { FileTree } from "@/components/file-list/FileTree";
import { ViewModeSelector } from "@/components/filters/ViewModeSelector";
import { TypeFilter } from "@/components/filters/TypeFilter";
import { SearchBox } from "@/components/filters/SearchBox";
import { DeleteButton } from "@/components/operations/DeleteButton";
import { CopyButton } from "@/components/operations/CopyButton";
import { ConfirmDialog } from "@/components/operations/ConfirmDialog";
import { useScanner } from "@/hooks/useScanner";
import { useFilterStore } from "@/stores/filterStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { useFileOperations } from "@/hooks/useFileOperations";
import { extractExtensions } from "@/lib/file-utils";
import { toast } from "sonner";

export function MainLayout() {
	const {
		status,
		progress,
		result,
		error,
		selectedFolder,
		openFolderDialog,
		startScan,
		reset,
	} = useScanner();

	const {
		viewMode,
		searchQuery,
		selectedExtensions,
		availableExtensions,
		setAvailableExtensions,
		clearFilters,
	} = useFilterStore();

	const {
		getSelectedCount,
		getSelectedPaths,
		reset: resetSelection,
	} = useSelectionStore();
	const selectedCount = getSelectedCount();
	const {
		isDeleting,
		isCopying,
		showConfirmDialog,
		pendingDeletePaths,
		requestDelete,
		cancelDelete,
		confirmDelete,
		requestCopy,
	} = useFileOperations();

	// Update available extensions when scan result changes
	useEffect(() => {
		if (result?.entries) {
			const extensions = extractExtensions(result.entries);
			setAvailableExtensions(extensions);
		}
	}, [result?.entries, setAvailableExtensions]);

	const handleClearFolder = () => {
		reset();
		clearFilters();
		resetSelection();
	};

	const handleDeleteClick = () => {
		const paths = getSelectedPaths();
		requestDelete(paths);
	};

	const handleCopyClick = async () => {
		const paths = getSelectedPaths();
		const result = await requestCopy(paths);
		if (result) {
			if (result.successCount > 0) {
				toast.success(`成功複製 ${result.successCount} 個檔案`);
			}
			if (result.failedCount > 0) {
				toast.error(`${result.failedCount} 個檔案複製失敗`);
			}
		}
	};

	const handleConfirmDelete = async () => {
		const result = await confirmDelete();
		if (result) {
			if (result.successCount > 0) {
				toast.success(`成功刪除 ${result.successCount} 個檔案`);
				resetSelection();
				// Rescan the folder to update the file list
				if (selectedFolder) {
					startScan();
				}
			}
			if (result.failedCount > 0) {
				toast.error(`${result.failedCount} 個檔案刪除失敗`);
			}
		}
	};

	return (
		<div className="bg-background text-foreground flex h-screen flex-col">
			{/* Header */}
			<header className="flex h-14 items-center justify-between border-b px-4">
				<h1 className="text-lg font-semibold">檔案掃描工具</h1>
				<div className="flex items-center gap-2">
					<CopyButton
						onClick={handleCopyClick}
						selectedCount={selectedCount}
						isLoading={isCopying}
					/>
					<DeleteButton
						onClick={handleDeleteClick}
						selectedCount={selectedCount}
						isLoading={isDeleting}
					/>
					<SearchBox disabled={!result} />
					<TypeFilter
						extensions={availableExtensions}
						disabled={!result || availableExtensions.length === 0}
					/>
					<ViewModeSelector disabled={!result} />
				</div>
			</header>

			{/* Main Content */}
			<main className="flex flex-1 overflow-hidden">
				{/* Sidebar for folder selection and controls */}
				<aside className="flex w-72 flex-col gap-4 border-r p-4">
					<div className="space-y-4">
						<h2 className="text-sm font-medium">資料夾選擇</h2>
						<FolderSelector
							selectedFolder={selectedFolder}
							onSelectFolder={openFolderDialog}
							onClearFolder={handleClearFolder}
							disabled={status === "scanning"}
						/>
						<ScanButton
							status={status}
							disabled={!selectedFolder}
							onStartScan={startScan}
						/>
					</div>

					{/* Progress section */}
					{(status === "scanning" || status === "completed") && progress && (
						<div className="space-y-2">
							<h2 className="text-sm font-medium">掃描進度</h2>
							<ProgressBar
								status={status}
								current={progress.current}
								total={progress.total}
								currentPath={progress.currentPath}
							/>
						</div>
					)}

					{/* Error display */}
					{error && (
						<div className="border-destructive/50 bg-destructive/10 rounded-md border p-3">
							<p className="text-destructive text-sm">{error}</p>
						</div>
					)}
				</aside>

				{/* File list area */}
				<div className="flex flex-1 flex-col overflow-hidden">
					{/* File list content */}
					<div className="flex-1 overflow-auto p-4">
						{viewMode === "tree" ? (
							<FileTree
								result={result}
								searchQuery={searchQuery}
								selectedExtensions={selectedExtensions}
							/>
						) : (
							<FileTable
								result={result}
								searchQuery={searchQuery}
								selectedExtensions={selectedExtensions}
								enableSelection={true}
							/>
						)}
					</div>
				</div>
			</main>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				open={showConfirmDialog}
				onOpenChange={(open) => {
					if (!open) cancelDelete();
				}}
				title="確認刪除"
				description={`確定要刪除選取的 ${pendingDeletePaths.length} 個檔案嗎？檔案將被移至資源回收筒。`}
				onConfirm={handleConfirmDelete}
				isLoading={isDeleting}
				confirmText="刪除"
				cancelText="取消"
			/>

			{/* Status bar */}
			<footer className="text-muted-foreground flex h-8 items-center justify-between border-t px-4 text-sm">
				<span>
					{status === "idle" && "準備就緒"}
					{status === "scanning" &&
						`掃描中... ${progress?.current ?? 0} 個檔案`}
					{status === "completed" &&
						result &&
						`完成 - ${result.stats.totalFiles} 個檔案`}
					{status === "error" && "發生錯誤"}
				</span>
				<span>
					{result && `總大小: ${formatBytesSimple(result.stats.totalSize)}`}
				</span>
			</footer>
		</div>
	);
}

function formatBytesSimple(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
