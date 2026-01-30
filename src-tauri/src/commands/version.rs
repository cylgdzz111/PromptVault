use serde::{Deserialize, Serialize};
use std::fs;

use crate::storage::{ensure_data_dir, prompt};
use crate::diff::compute_diff;

/// 版本信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionInfo {
    pub version: String,
    pub created_at: String,
}

/// 获取 Prompt 的所有版本
#[tauri::command]
pub fn list_versions(name: String) -> Result<Vec<VersionInfo>, String> {
    ensure_data_dir()?;
    
    let prompt_dir = prompt::get_prompt_dir(&name)?;
    
    if !prompt_dir.exists() {
        return Err(format!("Prompt '{}' 不存在", name));
    }
    
    let mut versions: Vec<VersionInfo> = fs::read_dir(&prompt_dir)
        .map_err(|e| format!("读取 Prompt 目录失败: {}", e))?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let file_name = entry.file_name().to_string_lossy().to_string();
            
            if file_name.ends_with(".md") {
                let version = file_name.trim_end_matches(".md").to_string();
                let metadata = entry.metadata().ok()?;
                let modified = metadata.modified().ok()?;
                let datetime: chrono::DateTime<chrono::Utc> = modified.into();
                
                Some(VersionInfo {
                    version,
                    created_at: datetime.to_rfc3339(),
                })
            } else {
                None
            }
        })
        .collect();
    
    // 按版本号降序排序
    versions.sort_by(|a, b| {
        let va = semver::Version::parse(&a.version).unwrap_or(semver::Version::new(0, 0, 0));
        let vb = semver::Version::parse(&b.version).unwrap_or(semver::Version::new(0, 0, 0));
        vb.cmp(&va)
    });
    
    Ok(versions)
}

/// Diff 结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiffResult {
    pub from_version: String,
    pub to_version: String,
    pub chunks: Vec<crate::diff::DiffChunk>,
}

/// 对比两个版本
#[tauri::command]
pub fn diff_prompt(name: String, from: String, to: String) -> Result<DiffResult, String> {
    ensure_data_dir()?;
    
    let from_content = prompt::read_prompt_content(&name, &from)?;
    let to_content = prompt::read_prompt_content(&name, &to)?;
    
    let chunks = compute_diff(&from_content, &to_content);
    
    Ok(DiffResult {
        from_version: from,
        to_version: to,
        chunks,
    })
}
