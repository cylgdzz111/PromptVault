import { useState, useEffect, useRef, useCallback } from "react";
import { Save } from "lucide-react";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { Button } from "@/components/ui/button";
import { MetaForm } from "./MetaForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import type { PromptData, PromptMeta, VersionInfo } from "@/lib/types";

interface PromptEditorProps {
  prompt: PromptData;
  onSave: () => void;
  onDelete: () => void;
}

export function PromptEditor({ prompt, onSave }: PromptEditorProps) {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const [content, setContent] = useState(prompt.content);
  const [meta, setMeta] = useState<Omit<PromptMeta, "name" | "created_at">>({
    description: prompt.meta.description,
    model: prompt.meta.model,
    temperature: prompt.meta.temperature,
  });
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [currentVersion, setCurrentVersion] = useState(prompt.version);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 加载版本列表
  useEffect(() => {
    api.listVersions(prompt.meta.name).then(setVersions).catch(console.error);
  }, [prompt.meta.name, prompt.version]);

  // 初始化编辑器
  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newContent = update.state.doc.toString();
        setContent(newContent);
        setHasChanges(newContent !== prompt.content);
      }
    });

    const state = EditorState.create({
      doc: prompt.content,
      extensions: [
        basicSetup,
        markdown(),
        updateListener,
        EditorView.theme({
          "&": {
            height: "100%",
          },
          ".cm-scroller": {
            overflow: "auto",
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [prompt.meta.name]);

  // 同步编辑器内容
  useEffect(() => {
    if (viewRef.current) {
      const currentContent = viewRef.current.state.doc.toString();
      if (currentContent !== prompt.content) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: prompt.content,
          },
        });
      }
    }
    setContent(prompt.content);
    setMeta({
      description: prompt.meta.description,
      model: prompt.meta.model,
      temperature: prompt.meta.temperature,
    });
    setCurrentVersion(prompt.version);
    setHasChanges(false);
  }, [prompt]);

  // 切换版本
  const handleVersionChange = useCallback(
    async (version: string) => {
      try {
        const data = await api.getPrompt(prompt.meta.name, version);
        if (viewRef.current) {
          const currentContent = viewRef.current.state.doc.toString();
          viewRef.current.dispatch({
            changes: {
              from: 0,
              to: currentContent.length,
              insert: data.content,
            },
          });
        }
        setContent(data.content);
        setCurrentVersion(version);
        setHasChanges(false);
      } catch (err) {
        console.error("切换版本失败:", err);
      }
    },
    [prompt.meta.name]
  );

  // 保存
  const handleSave = async () => {
    if (!hasChanges) {
      toast({
        title: "提示",
        description: "内容没有变化",
      });
      return;
    }

    setIsSaving(true);
    try {
      const newVersion = await api.savePrompt(prompt.meta.name, content, meta);
      toast({
        title: "保存成功",
        description: `已创建版本 ${newVersion}`,
      });
      setHasChanges(false);
      onSave();
    } catch (err) {
      toast({
        title: "保存失败",
        description: String(err),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">{prompt.meta.name}</h2>
          <Select value={currentVersion} onValueChange={handleVersionChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="选择版本" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((v) => (
                <SelectItem key={v.version} value={v.version}>
                  v{v.version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasChanges && (
            <span className="text-sm text-muted-foreground">• 未保存</span>
          )}
        </div>
        <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "保存中..." : "保存新版本"}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Meta Panel */}
        <div className="w-64 border-r border-border overflow-y-auto">
          <MetaForm
            meta={meta}
            onChange={(newMeta) => {
              setMeta(newMeta);
              setHasChanges(true);
            }}
          />
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <div ref={editorRef} className="h-full" />
        </div>
      </div>
    </div>
  );
}
