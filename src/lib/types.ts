export interface PromptMeta {
  name: string;
  description: string;
  model: string;
  temperature: number;
  created_at: string;
}

export interface PromptSummary {
  name: string;
  latest: string;
  updated_at: string;
}

export interface PromptData {
  content: string;
  meta: PromptMeta;
  version: string;
}

export interface VersionInfo {
  version: string;
  created_at: string;
}

export interface DiffChunk {
  tag: "equal" | "insert" | "delete";
  old_start: number;
  old_end: number;
  new_start: number;
  new_end: number;
  lines: string[];
}

export interface DiffResult {
  from_version: string;
  to_version: string;
  chunks: DiffChunk[];
}
