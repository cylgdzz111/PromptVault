use serde::{Deserialize, Serialize};
use similar::{ChangeTag, TextDiff};

/// Diff 块
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiffChunk {
    pub tag: String, // "equal" | "insert" | "delete"
    pub old_start: usize,
    pub old_end: usize,
    pub new_start: usize,
    pub new_end: usize,
    pub lines: Vec<String>,
}

/// 计算两个文本的 diff
pub fn compute_diff(old_text: &str, new_text: &str) -> Vec<DiffChunk> {
    let diff = TextDiff::from_lines(old_text, new_text);
    let mut chunks: Vec<DiffChunk> = Vec::new();
    
    let mut old_line = 0usize;
    let mut new_line = 0usize;
    
    for change in diff.iter_all_changes() {
        let tag = match change.tag() {
            ChangeTag::Delete => "delete",
            ChangeTag::Insert => "insert",
            ChangeTag::Equal => "equal",
        };
        
        let line_content = change.value().to_string();
        let line_count = 1;
        
        // 尝试合并相同类型的连续块
        if let Some(last) = chunks.last_mut() {
            if last.tag == tag {
                last.lines.push(line_content);
                match tag {
                    "delete" => {
                        last.old_end = old_line + line_count;
                        old_line += line_count;
                    }
                    "insert" => {
                        last.new_end = new_line + line_count;
                        new_line += line_count;
                    }
                    _ => {
                        last.old_end = old_line + line_count;
                        last.new_end = new_line + line_count;
                        old_line += line_count;
                        new_line += line_count;
                    }
                }
                continue;
            }
        }
        
        let (old_start, old_end, new_start, new_end) = match tag {
            "delete" => {
                let start = old_line;
                old_line += line_count;
                (start, old_line, new_line, new_line)
            }
            "insert" => {
                let start = new_line;
                new_line += line_count;
                (old_line, old_line, start, new_line)
            }
            _ => {
                let old_start = old_line;
                let new_start = new_line;
                old_line += line_count;
                new_line += line_count;
                (old_start, old_line, new_start, new_line)
            }
        };
        
        chunks.push(DiffChunk {
            tag: tag.to_string(),
            old_start,
            old_end,
            new_start,
            new_end,
            lines: vec![line_content],
        });
    }
    
    chunks
}
