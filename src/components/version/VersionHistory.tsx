import { useState, useEffect } from "react";
import { ArrowLeft, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DiffView } from "./DiffView";
import { api } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import type { VersionInfo, DiffResult } from "@/lib/types";

interface VersionHistoryProps {
  promptName: string;
  onBack: () => void;
}

export function VersionHistory({ promptName, onBack }: VersionHistoryProps) {
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.listVersions(promptName).then(setVersions).catch(console.error);
  }, [promptName]);

  const handleVersionClick = (version: string) => {
    setSelectedVersions((prev) => {
      if (prev.includes(version)) {
        return prev.filter((v) => v !== version);
      }
      if (prev.length >= 2) {
        return [prev[1], version];
      }
      return [...prev, version];
    });
  };

  const handleCompare = async () => {
    if (selectedVersions.length !== 2) return;

    setIsLoading(true);
    try {
      // 按版本号排序，旧版本在前
      const sorted = [...selectedVersions].sort((a, b) => {
        const va = a.split(".").map(Number);
        const vb = b.split(".").map(Number);
        for (let i = 0; i < 3; i++) {
          if (va[i] !== vb[i]) return va[i] - vb[i];
        }
        return 0;
      });

      const result = await api.diffPrompt(promptName, sorted[0], sorted[1]);
      setDiffResult(result);
    } catch (err) {
      console.error("对比失败:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{promptName} - 版本历史</h2>
        </div>
        <Button
          onClick={handleCompare}
          disabled={selectedVersions.length !== 2 || isLoading}
        >
          <GitCompare className="h-4 w-4 mr-2" />
          {isLoading ? "对比中..." : "对比选中版本"}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Version List */}
        <div className="w-64 border-r border-border">
          <div className="p-3 border-b border-border">
            <p className="text-sm text-muted-foreground">
              选择两个版本进行对比
            </p>
          </div>
          <ScrollArea className="h-[calc(100%-48px)]">
            <div className="p-2 space-y-1">
              {versions.map((v, index) => (
                <div
                  key={v.version}
                  className={cn(
                    "px-3 py-2 rounded-md cursor-pointer transition-colors relative",
                    selectedVersions.includes(v.version)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                  onClick={() => handleVersionClick(v.version)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium">v{v.version}</span>
                    {index === 0 && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                        最新
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-1 opacity-70">
                    {formatDate(v.created_at)}
                  </div>
                </div>
              ))}
              {versions.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  暂无版本记录
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Diff View */}
        <div className="flex-1 overflow-hidden">
          {diffResult ? (
            <DiffView result={diffResult} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>选择两个版本后点击对比按钮</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
