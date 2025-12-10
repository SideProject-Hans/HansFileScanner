/**
 * FileTree component
 * Displays files in a hierarchical tree structure
 */

import { useState, useMemo, useCallback } from "react";
import {
	ChevronRight,
	ChevronDown,
	Folder,
	FolderOpen,
	File,
	FileText,
	Image,
	Video,
	Music,
	ChevronsUpDown,
	ChevronsDownUp,
} from "lucide-react";
import type { FileEntry, ScanResult } from "@/types/file";
import { FileCategory } from "@/types/file";
import { formatFileSize } from "@/lib/file-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileTreeProps {
	/** Scan result to display */
	result: ScanResult | null;

	/** Search query for filtering */
	searchQuery?: string;

	/** Selected extensions for filtering */
	selectedExtensions?: string[];
}

interface TreeNode {
	entry: FileEntry;
	children: TreeNode[];
}

/**
 * Build a tree structure from flat file entries
 */
function buildTree(files: FileEntry[]): TreeNode[] {
	const nodeMap = new Map<string, TreeNode>();
	const roots: TreeNode[] = [];

	// Sort files by depth first, then by path
	const sortedFiles = [...files].sort((a, b) => {
		if (a.depth !== b.depth) return a.depth - b.depth;
		return a.path.localeCompare(b.path);
	});

	for (const entry of sortedFiles) {
		const node: TreeNode = { entry, children: [] };
		nodeMap.set(entry.path, node);

		if (entry.depth === 0 || !entry.parentPath) {
			roots.push(node);
		} else {
			const parent = nodeMap.get(entry.parentPath);
			if (parent) {
				parent.children.push(node);
			} else {
				// Parent not found, add to roots
				roots.push(node);
			}
		}
	}

	return roots;
}

/**
 * Get icon for file category
 */
function getFileIcon(category: FileCategory, isDirectory: boolean) {
	if (isDirectory) {
		return Folder;
	}

	switch (category) {
		case FileCategory.Document:
			return FileText;
		case FileCategory.Image:
			return Image;
		case FileCategory.Video:
			return Video;
		case FileCategory.Audio:
			return Music;
		default:
			return File;
	}
}

interface TreeNodeItemProps {
	node: TreeNode;
	level: number;
	expandedPaths: Set<string>;
	onToggle: (path: string) => void;
}

function TreeNodeItem({
	node,
	level,
	expandedPaths,
	onToggle,
}: TreeNodeItemProps) {
	const { entry, children } = node;
	const isExpanded = expandedPaths.has(entry.path);
	const hasChildren = children.length > 0;
	const isDirectory = entry.isDirectory;

	const Icon = isDirectory
		? isExpanded
			? FolderOpen
			: Folder
		: getFileIcon(entry.category, false);

	const handleClick = () => {
		if (hasChildren) {
			onToggle(entry.path);
		}
	};

	return (
		<div data-type={isDirectory ? "folder" : "file"}>
			<div
				className={cn(
					"group flex cursor-pointer items-center gap-1 rounded px-2 py-1",
					"hover:bg-accent hover:text-accent-foreground",
					level > 0 && "ml-4"
				)}
				style={{ paddingLeft: `${level * 16 + 8}px` }}
				onClick={handleClick}
				role="treeitem"
				aria-expanded={hasChildren ? isExpanded : undefined}
			>
				{/* Expand/Collapse indicator */}
				<span className="w-4 shrink-0">
					{hasChildren && (
						<span className="text-muted-foreground">
							{isExpanded ? (
								<ChevronDown className="h-4 w-4" />
							) : (
								<ChevronRight className="h-4 w-4" />
							)}
						</span>
					)}
				</span>

				{/* File/Folder icon */}
				<Icon
					className={cn(
						"h-4 w-4 shrink-0",
						isDirectory ? "text-amber-500" : "text-muted-foreground"
					)}
				/>

				{/* Name */}
				<span className="truncate">{entry.name}</span>

				{/* File size (for files only) */}
				{!isDirectory && (
					<span className="text-muted-foreground ml-auto shrink-0 text-xs">
						{formatFileSize(entry.size)}
					</span>
				)}
			</div>

			{/* Children */}
			{hasChildren && isExpanded && (
				<div role="group">
					{children.map((child) => (
						<TreeNodeItem
							key={child.entry.path}
							node={child}
							level={level + 1}
							expandedPaths={expandedPaths}
							onToggle={onToggle}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export function FileTree({
	result,
	searchQuery = "",
	selectedExtensions = [],
}: FileTreeProps) {
	const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

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

	// Build tree structure
	const tree = useMemo(() => buildTree(filteredFiles), [filteredFiles]);

	// Get all folder paths for expand/collapse all
	const allFolderPaths = useMemo(() => {
		const paths = new Set<string>();
		const collectPaths = (nodes: TreeNode[]) => {
			for (const node of nodes) {
				if (node.entry.isDirectory && node.children.length > 0) {
					paths.add(node.entry.path);
					collectPaths(node.children);
				}
			}
		};
		collectPaths(tree);
		return paths;
	}, [tree]);

	const handleToggle = useCallback((path: string) => {
		setExpandedPaths((prev) => {
			const next = new Set(prev);
			if (next.has(path)) {
				next.delete(path);
			} else {
				next.add(path);
			}
			return next;
		});
	}, []);

	const handleExpandAll = useCallback(() => {
		setExpandedPaths(allFolderPaths);
	}, [allFolderPaths]);

	const handleCollapseAll = useCallback(() => {
		setExpandedPaths(new Set());
	}, []);

	if (!result) {
		return null;
	}

	if (filteredFiles.length === 0) {
		return (
			<div className="text-muted-foreground flex h-64 items-center justify-center">
				沒有檔案
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{/* Toolbar */}
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={handleExpandAll}
					aria-label="全部展開"
					className="gap-1"
				>
					<ChevronsUpDown className="h-4 w-4" />
					<span className="hidden sm:inline">全部展開</span>
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={handleCollapseAll}
					aria-label="全部收合"
					className="gap-1"
				>
					<ChevronsDownUp className="h-4 w-4" />
					<span className="hidden sm:inline">全部收合</span>
				</Button>
			</div>

			{/* Tree */}
			<div
				className="rounded-md border p-2"
				role="tree"
				aria-label="檔案樹狀結構"
			>
				{tree.map((node) => (
					<TreeNodeItem
						key={node.entry.path}
						node={node}
						level={0}
						expandedPaths={expandedPaths}
						onToggle={handleToggle}
					/>
				))}
			</div>
		</div>
	);
}
