use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use semver::Version;

use super::get_prompts_dir;

/// Prompt 元信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptMeta {
    pub name: String,
    pub description: String,
    pub model: String,
    pub temperature: f32,
    pub created_at: String,
}

/// 获取指定 Prompt 的目录
pub fn get_prompt_dir(name: &str) -> Result<PathBuf, String> {
    Ok(get_prompts_dir()?.join(name))
}

/// 确保 Prompt 目录存在
pub fn ensure_prompt_dir(name: &str) -> Result<PathBuf, String> {
    let dir = get_prompt_dir(name)?;
    fs::create_dir_all(&dir).map_err(|e| format!("创建 Prompt 目录失败: {}", e))?;
    Ok(dir)
}

/// 读取 Prompt 元信息
pub fn read_prompt_meta(name: &str) -> Result<PromptMeta, String> {
    let meta_path = get_prompt_dir(name)?.join("meta.json");
    
    let content = fs::read_to_string(&meta_path)
        .map_err(|e| format!("读取 meta.json 失败: {}", e))?;
    
    serde_json::from_str(&content)
        .map_err(|e| format!("解析 meta.json 失败: {}", e))
}

/// 写入 Prompt 元信息
pub fn write_prompt_meta(name: &str, meta: &PromptMeta) -> Result<(), String> {
    let prompt_dir = ensure_prompt_dir(name)?;
    let meta_path = prompt_dir.join("meta.json");
    
    let content = serde_json::to_string_pretty(meta)
        .map_err(|e| format!("序列化 meta.json 失败: {}", e))?;
    
    fs::write(&meta_path, content)
        .map_err(|e| format!("写入 meta.json 失败: {}", e))
}

/// 读取 Prompt 内容（指定版本）
pub fn read_prompt_content(name: &str, version: &str) -> Result<String, String> {
    let content_path = get_prompt_dir(name)?.join(format!("{}.md", version));
    
    fs::read_to_string(&content_path)
        .map_err(|e| format!("读取 Prompt 内容失败: {}", e))
}

/// 写入 Prompt 内容（指定版本）
pub fn write_prompt_content(name: &str, version: &str, content: &str) -> Result<(), String> {
    let prompt_dir = ensure_prompt_dir(name)?;
    let content_path = prompt_dir.join(format!("{}.md", version));
    
    fs::write(&content_path, content)
        .map_err(|e| format!("写入 Prompt 内容失败: {}", e))
}

/// 获取所有版本列表
pub fn list_prompt_versions(name: &str) -> Result<Vec<String>, String> {
    let prompt_dir = get_prompt_dir(name)?;
    
    if !prompt_dir.exists() {
        return Ok(vec![]);
    }
    
    let mut versions: Vec<String> = fs::read_dir(&prompt_dir)
        .map_err(|e| format!("读取 Prompt 目录失败: {}", e))?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let file_name = entry.file_name().to_string_lossy().to_string();
            if file_name.ends_with(".md") {
                Some(file_name.trim_end_matches(".md").to_string())
            } else {
                None
            }
        })
        .collect();
    
    // 按版本号排序
    versions.sort_by(|a, b| {
        let va = Version::parse(a).unwrap_or(Version::new(0, 0, 0));
        let vb = Version::parse(b).unwrap_or(Version::new(0, 0, 0));
        vb.cmp(&va) // 降序，最新版本在前
    });
    
    Ok(versions)
}

/// 计算下一个版本号
pub fn next_version(current: Option<&str>) -> String {
    match current {
        Some(v) => {
            if let Ok(mut version) = Version::parse(v) {
                version.patch += 1;
                version.to_string()
            } else {
                "0.1.0".to_string()
            }
        }
        None => "0.1.0".to_string(),
    }
}

/// 删除 Prompt 目录
pub fn delete_prompt_dir(name: &str) -> Result<(), String> {
    let prompt_dir = get_prompt_dir(name)?;
    
    if prompt_dir.exists() {
        fs::remove_dir_all(&prompt_dir)
            .map_err(|e| format!("删除 Prompt 目录失败: {}", e))?;
    }
    
    Ok(())
}
