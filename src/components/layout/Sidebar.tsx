import { useState } from "react";
import { Plus, FileText, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { PromptSummary } from "@/lib/types";

interface SidebarProps {
  prompts: PromptSummary[];
  selectedPrompt: string | null;
  onSelectPrompt: (name: string | null) => void;
  onPromptCreated: (name: string) => void;
  view: "editor" | "history";
  onViewChange: (view: "editor" | "history") => void;
}

export function Sidebar({
  prompts,
  selectedPrompt,
  onSelectPrompt,
  onPromptCreated,
  view,
  onViewChange,
}: SidebarProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    name: "",
    description: "",
    model: "gpt-4",
    temperature: 0.7,
  });

  const handleCreate = async () => {
    if (!newPrompt.name.trim()) return;

    try {
      await api.createPrompt(newPrompt.name, {
        description: newPrompt.description,
        model: newPrompt.model,
        temperature: newPrompt.temperature,
      });
      onPromptCreated(newPrompt.name);
      setIsCreateOpen(false);
      setNewPrompt({
        name: "",
        description: "",
        model: "gpt-4",
        temperature: 0.7,
      });
    } catch (err) {
      console.error("创建失败:", err);
    }
  };

  const handleDelete = async () => {
    if (!selectedPrompt) return;

    try {
      await api.deletePrompt(selectedPrompt);
      onSelectPrompt(null);
      setIsDeleteOpen(false);
      window.location.reload();
    } catch (err) {
      console.error("删除失败:", err);
    }
  };

  return (
    <div className="w-64 border-r border-border flex flex-col bg-muted/30">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold">PromptVault</h1>
        <p className="text-xs text-muted-foreground mt-1">Prompt 版本管理</p>
      </div>

      {/* Actions */}
      <div className="p-2 border-b border-border">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          新建 Prompt
        </Button>
      </div>

      {/* Prompt List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {prompts.map((prompt) => (
            <div
              key={prompt.name}
              className={cn(
                "px-3 py-2 rounded-md cursor-pointer transition-colors",
                selectedPrompt === prompt.name
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )}
              onClick={() => onSelectPrompt(prompt.name)}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 shrink-0" />
                <span className="font-medium truncate">{prompt.name}</span>
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                <span>v{prompt.latest}</span>
                <span>{formatDate(prompt.updated_at).split(" ")[0]}</span>
              </div>
            </div>
          ))}
          {prompts.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              暂无 Prompt
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      {selectedPrompt && (
        <div className="p-2 border-t border-border space-y-1">
          <Button
            variant={view === "editor" ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => onViewChange("editor")}
          >
            <FileText className="h-4 w-4 mr-2" />
            编辑器
          </Button>
          <Button
            variant={view === "history" ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => onViewChange("history")}
          >
            <History className="h-4 w-4 mr-2" />
            版本历史
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            删除
          </Button>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent onClose={() => setIsCreateOpen(false)}>
          <DialogHeader>
            <DialogTitle>新建 Prompt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">名称</Label>
              <Input
                id="name"
                placeholder="例如：summarize"
                value={newPrompt.name}
                onChange={(e) =>
                  setNewPrompt({ ...newPrompt, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                placeholder="Prompt 的用途说明"
                value={newPrompt.description}
                onChange={(e) =>
                  setNewPrompt({ ...newPrompt, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">模型</Label>
              <Input
                id="model"
                placeholder="gpt-4"
                value={newPrompt.model}
                onChange={(e) =>
                  setNewPrompt({ ...newPrompt, model: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Temperature: {newPrompt.temperature.toFixed(1)}</Label>
              <Slider
                value={newPrompt.temperature}
                onValueChange={(value) =>
                  setNewPrompt({ ...newPrompt, temperature: value })
                }
                min={0}
                max={1}
                step={0.1}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreate}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent onClose={() => setIsDeleteOpen(false)}>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            确定要删除 <strong>{selectedPrompt}</strong> 吗？此操作不可恢复。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
