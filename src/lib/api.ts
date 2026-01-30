import { invoke } from "@tauri-apps/api/core";
import type {
  PromptSummary,
  PromptData,
  PromptMeta,
  VersionInfo,
  DiffResult,
} from "./types";

export const api = {
  listPrompts: (): Promise<PromptSummary[]> => invoke("list_prompts"),

  getPrompt: (name: string, version?: string): Promise<PromptData> =>
    invoke("get_prompt", { name, version }),

  savePrompt: (
    name: string,
    content: string,
    meta: Omit<PromptMeta, "name" | "created_at">
  ): Promise<string> => invoke("save_prompt", { name, content, meta }),

  createPrompt: (
    name: string,
    meta: Omit<PromptMeta, "name" | "created_at">
  ): Promise<void> => invoke("create_prompt", { name, meta }),

  deletePrompt: (name: string): Promise<void> =>
    invoke("delete_prompt", { name }),

  listVersions: (name: string): Promise<VersionInfo[]> =>
    invoke("list_versions", { name }),

  diffPrompt: (name: string, from: string, to: string): Promise<DiffResult> =>
    invoke("diff_prompt", { name, from, to }),
};
