import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { PromptEditor } from "@/components/prompt/PromptEditor";
import { VersionHistory } from "@/components/version/VersionHistory";
import { api } from "@/lib/api";
import type { PromptSummary, PromptData } from "@/lib/types";
import { Toaster } from "@/components/ui/toaster";

type View = "editor" | "history";

function App() {
  const [prompts, setPrompts] = useState<PromptSummary[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<PromptData | null>(null);
  const [view, setView] = useState<View>("editor");

  const loadPrompts = async () => {
    try {
      const list = await api.listPrompts();
      setPrompts(list);
    } catch (err) {
      console.error("Failed to load prompts:", err);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  useEffect(() => {
    if (selectedPrompt) {
      api.getPrompt(selectedPrompt).then(setCurrentPrompt).catch(console.error);
    } else {
      setCurrentPrompt(null);
    }
  }, [selectedPrompt]);

  const handlePromptCreated = (name: string) => {
    loadPrompts();
    setSelectedPrompt(name);
  };

  const handlePromptDeleted = () => {
    setSelectedPrompt(null);
    setCurrentPrompt(null);
    loadPrompts();
  };

  const handlePromptSaved = () => {
    loadPrompts();
    if (selectedPrompt) {
      api.getPrompt(selectedPrompt).then(setCurrentPrompt).catch(console.error);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar
        prompts={prompts}
        selectedPrompt={selectedPrompt}
        onSelectPrompt={setSelectedPrompt}
        onPromptCreated={handlePromptCreated}
        view={view}
        onViewChange={setView}
      />
      <main className="flex-1 overflow-hidden">
        {selectedPrompt && currentPrompt ? (
          view === "editor" ? (
            <PromptEditor
              prompt={currentPrompt}
              onSave={handlePromptSaved}
              onDelete={handlePromptDeleted}
            />
          ) : (
            <VersionHistory
              promptName={selectedPrompt}
              onBack={() => setView("editor")}
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">PromptVault</h2>
              <p>选择或创建一个 Prompt 开始</p>
            </div>
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
}

export default App;
