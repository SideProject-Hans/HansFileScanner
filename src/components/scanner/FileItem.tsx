import {
	File,
	Folder,
	Image,
	Music,
	Video,
	FileText,
	FileCode,
} from "lucide-react";
import type { FileEntry } from "@/types/file";
import { formatFileSize, formatDate } from "@/lib/file-utils";

export interface FileItemProps {
	entry: FileEntry;
}

function getFileIcon(category: string, isDirectory: boolean) {
	if (isDirectory) {
		return <Folder className="h-4 w-4 text-yellow-500" aria-hidden="true" />;
	}

	switch (category) {
		case "image":
			return <Image className="h-4 w-4 text-purple-500" aria-hidden="true" />;
		case "video":
			return <Video className="h-4 w-4 text-red-500" aria-hidden="true" />;
		case "audio":
			return <Music className="h-4 w-4 text-green-500" aria-hidden="true" />;
		case "document":
			return <FileText className="h-4 w-4 text-blue-500" aria-hidden="true" />;
		case "code":
			return (
				<FileCode className="h-4 w-4 text-orange-500" aria-hidden="true" />
			);
		default:
			return <File className="h-4 w-4 text-gray-500" aria-hidden="true" />;
	}
}

export function FileItem({ entry }: FileItemProps) {
	const icon = getFileIcon(entry.category, entry.isDirectory);
	const sizeText = entry.isDirectory ? "-" : formatFileSize(entry.size);
	const modifiedText = formatDate(entry.modifiedAt);

	return (
		<>
			<td className="p-2">
				<div className="flex items-center gap-2">
					{icon}
					<span className="max-w-[300px] truncate" title={entry.name}>
						{entry.name}
					</span>
				</div>
			</td>
			<td
				className="text-muted-foreground max-w-[400px] truncate p-2"
				title={entry.path}
			>
				{entry.path}
			</td>
			<td className="p-2 text-right tabular-nums">{sizeText}</td>
			<td className="text-muted-foreground p-2 tabular-nums">{modifiedText}</td>
		</>
	);
}
