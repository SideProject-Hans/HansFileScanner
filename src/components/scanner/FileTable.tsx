import type { FileEntry, SortField, SortOrder } from "@/types/file";
import type { ScanResult } from "@/types/file";
import { formatFileSize } from "@/lib/file-utils";
import { FileItem } from "./FileItem";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { FileCheckbox } from "@/components/file-list/FileCheckbox";
import { SelectAllCheckbox } from "@/components/file-list/SelectAllCheckbox";
import { useFileSelection } from "@/hooks/useFileSelection";

export interface FileTableProps {
	result: ScanResult | null;
	/** Search query for filtering */
	searchQuery?: string;
	/** Selected extensions for filtering */
	selectedExtensions?: string[];
	/** Whether to enable file selection */
	enableSelection?: boolean;
}

function sortFiles(
	files: FileEntry[],
	sortField: SortField,
	sortOrder: SortOrder
): FileEntry[] {
	return [...files].sort((a, b) => {
		let comparison = 0;

		switch (sortField) {
			case "name":
				comparison = a.name.localeCompare(b.name);
				break;
			case "path":
				comparison = a.path.localeCompare(b.path);
				break;
			case "size":
				comparison = a.size - b.size;
				break;
			case "modified_at":
				comparison =
					new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
				break;
		}

		return sortOrder === "asc" ? comparison : -comparison;
	});
}

function SortIcon({
	field,
	currentField,
	order,
}: {
	field: SortField;
	currentField: SortField;
	order: SortOrder;
}) {
	if (field !== currentField) {
		return <ArrowUpDown className="ml-1 h-3 w-3" aria-hidden="true" />;
	}
	return order === "asc" ? (
		<ArrowUp className="ml-1 h-3 w-3" aria-hidden="true" />
	) : (
		<ArrowDown className="ml-1 h-3 w-3" aria-hidden="true" />
	);
}

export function FileTable({
	result,
	searchQuery = "",
	selectedExtensions = [],
	enableSelection = false,
}: FileTableProps) {
	const [sortField, setSortField] = useState<SortField>("name");
	const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

	// Filter files based on search and extensions
	const filteredFiles = useMemo(() => {
		if (!result?.entries) return [];

		let files = result.entries;

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			files = files.filter((file) => file.name.toLowerCase().includes(query));
		}

		// Apply extension filter
		if (selectedExtensions.length > 0) {
			files = files.filter(
				(file) =>
					file.isDirectory || selectedExtensions.includes(file.extension)
			);
		}

		return files;
	}, [result?.entries, searchQuery, selectedExtensions]);

	// File selection hooks
	const {
		isAllSelected,
		hasSelection,
		selectedCount,
		isSelected,
		toggleSelection,
		selectAll,
		deselectAll,
	} = useFileSelection(filteredFiles);

	const sortedFiles = useMemo(() => {
		return sortFiles(filteredFiles, sortField, sortOrder);
	}, [filteredFiles, sortField, sortOrder]);

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortOrder("asc");
		}
	};

	if (!result) {
		return (
			<div className="text-muted-foreground flex h-64 items-center justify-center">
				請選擇資料夾並開始掃描
			</div>
		);
	}

	if (result.entries.length === 0) {
		return (
			<div className="text-muted-foreground flex h-64 items-center justify-center">
				此資料夾為空
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="text-muted-foreground flex items-center justify-between text-sm">
				<span>
					共 {result.stats.totalFiles} 個檔案，{result.stats.totalFolders}{" "}
					個資料夾
					{enableSelection && hasSelection && (
						<span className="text-primary ml-2">
							(已選擇 {selectedCount} 項)
						</span>
					)}
				</span>
				<span>總大小: {formatFileSize(result.stats.totalSize)}</span>
			</div>

			<div className="overflow-hidden rounded-md border">
				<table className="w-full" role="grid" aria-label="檔案列表">
					<thead className="bg-muted/50">
						<tr>
							{enableSelection && (
								<th className="w-10 p-2">
									<SelectAllCheckbox
										isAllSelected={isAllSelected}
										isPartialSelected={hasSelection && !isAllSelected}
										onToggle={isAllSelected ? deselectAll : selectAll}
									/>
								</th>
							)}
							<th className="p-2 text-left font-medium">
								<Button
									variant="ghost"
									size="sm"
									className="h-auto p-0 hover:bg-transparent"
									onClick={() => handleSort("name")}
									aria-label={`依名稱排序 ${sortField === "name" ? (sortOrder === "asc" ? "升冪" : "降冪") : ""}`}
								>
									名稱
									<SortIcon
										field="name"
										currentField={sortField}
										order={sortOrder}
									/>
								</Button>
							</th>
							<th className="p-2 text-left font-medium">
								<Button
									variant="ghost"
									size="sm"
									className="h-auto p-0 hover:bg-transparent"
									onClick={() => handleSort("path")}
									aria-label={`依路徑排序 ${sortField === "path" ? (sortOrder === "asc" ? "升冪" : "降冪") : ""}`}
								>
									路徑
									<SortIcon
										field="path"
										currentField={sortField}
										order={sortOrder}
									/>
								</Button>
							</th>
							<th className="p-2 text-right font-medium">
								<Button
									variant="ghost"
									size="sm"
									className="h-auto p-0 hover:bg-transparent"
									onClick={() => handleSort("size")}
									aria-label={`依大小排序 ${sortField === "size" ? (sortOrder === "asc" ? "升冪" : "降冪") : ""}`}
								>
									大小
									<SortIcon
										field="size"
										currentField={sortField}
										order={sortOrder}
									/>
								</Button>
							</th>
							<th className="p-2 text-left font-medium">
								<Button
									variant="ghost"
									size="sm"
									className="h-auto p-0 hover:bg-transparent"
									onClick={() => handleSort("modified_at")}
									aria-label={`依修改日期排序 ${sortField === "modified_at" ? (sortOrder === "asc" ? "升冪" : "降冪") : ""}`}
								>
									修改日期
									<SortIcon
										field="modified_at"
										currentField={sortField}
										order={sortOrder}
									/>
								</Button>
							</th>
						</tr>
					</thead>
					<tbody>
						{sortedFiles.map((entry) => (
							<tr
								key={entry.path}
								className={`hover:bg-muted/50 border-b last:border-b-0 ${
									enableSelection && isSelected(entry.path) ? "bg-muted/30" : ""
								}`}
							>
								{enableSelection && !entry.isDirectory && (
									<td className="w-10 p-2">
										<FileCheckbox
											isSelected={isSelected(entry.path)}
											onToggle={() => toggleSelection(entry.path)}
											ariaLabel={`選擇 ${entry.name}`}
										/>
									</td>
								)}
								{enableSelection && entry.isDirectory && (
									<td className="w-10 p-2" />
								)}
								<FileItem entry={entry} />
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
