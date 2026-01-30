import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { DiffResult, DiffChunk } from "@/lib/types";

interface DiffViewProps {
  result: DiffResult;
}

export function DiffView({ result }: DiffViewProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-mono">
            <span className="text-destructive">v{result.from_version}</span>
            <span className="mx-2">→</span>
            <span className="text-green-600">v{result.to_version}</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-100 border border-red-300 rounded" />
            删除
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-100 border border-green-300 rounded" />
            新增
          </span>
        </div>
      </div>

      {/* Diff Content */}
      <ScrollArea className="flex-1">
        <div className="font-mono text-sm">
          {result.chunks.map((chunk, chunkIndex) => (
            <DiffChunkView key={chunkIndex} chunk={chunk} />
          ))}
          {result.chunks.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              两个版本内容相同
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface DiffChunkViewProps {
  chunk: DiffChunk;
}

function DiffChunkView({ chunk }: DiffChunkViewProps) {
  const getLineNumber = (index: number) => {
    if (chunk.tag === "delete") {
      return chunk.old_start + index + 1;
    }
    if (chunk.tag === "insert") {
      return chunk.new_start + index + 1;
    }
    return chunk.old_start + index + 1;
  };

  return (
    <>
      {chunk.lines.map((line, lineIndex) => (
        <div
          key={lineIndex}
          className={cn(
            "flex",
            chunk.tag === "delete" && "bg-red-50 dark:bg-red-950/30",
            chunk.tag === "insert" && "bg-green-50 dark:bg-green-950/30"
          )}
        >
          {/* Line Number */}
          <div
            className={cn(
              "w-12 shrink-0 px-2 py-0.5 text-right text-muted-foreground select-none border-r",
              chunk.tag === "delete" && "bg-red-100/50 dark:bg-red-900/30",
              chunk.tag === "insert" && "bg-green-100/50 dark:bg-green-900/30"
            )}
          >
            {getLineNumber(lineIndex)}
          </div>

          {/* Tag Symbol */}
          <div
            className={cn(
              "w-6 shrink-0 text-center py-0.5 select-none",
              chunk.tag === "delete" && "text-red-600",
              chunk.tag === "insert" && "text-green-600"
            )}
          >
            {chunk.tag === "delete" && "-"}
            {chunk.tag === "insert" && "+"}
          </div>

          {/* Content */}
          <div className="flex-1 px-2 py-0.5 whitespace-pre-wrap break-all">
            {line || " "}
          </div>
        </div>
      ))}
    </>
  );
}
