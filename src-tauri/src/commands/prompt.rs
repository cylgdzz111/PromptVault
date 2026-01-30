use serde::{Deserialize, Serialize};
use chrono::Utc;

use crate::storage::{ensure_data_dir, index, prompt};

/// Prompt 摘要（用于列表显示）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptSummary {
    pub name: String,
    pub latest: String,
    pub updated_at: String,
}

/// Prompt 完整数据
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptData {
    pub content: String,
    pub meta: prompt::PromptMeta,
    pub version: String,
}

/// 用于创建/保存时的 Meta 输入
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptMetaInput {
    pub description: String,
    pub model: String,
    pub temperature: f32,
}

/// 获取所有 Prompt 列表
#[tauri::command]
pub fn list_prompts() -> Result<Vec<PromptSummary>, String> {
    ensure_data_dir()?;
    
    let idx = index::read_index()?;
    
    let mut prompts: Vec<PromptSummary> = idx
        .into_iter()
        .map(|(name, entry)| PromptSummary {
            name,
            latest: entry.latest,
            updated_at: entry.updated_at,
        })
        .collect();
    
    // 按更新时间排序（最新的在前）
    prompts.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    
    Ok(prompts)
}

/// 获取指定 Prompt
#[tauri::command]
pub fn get_prompt(name: String, version: Option<String>) -> Result<PromptData, String> {
    ensure_data_dir()?;
    
    let meta = prompt::read_prompt_meta(&name)?;
    
    let target_version = match version {
        Some(v) => v,
        None => {
            let entry = index::get_index_entry(&name)?
                .ok_or_else(|| format!("Prompt '{}' 不存在", name))?;
            entry.latest
        }
    };
    
    let content = prompt::read_prompt_content(&name, &target_version)?;
    
    Ok(PromptData {
        content,
        meta,
        version: target_version,
    })
}

/// 保存 Prompt（自动创建新版本）
#[tauri::command]
pub fn save_prompt(name: String, content: String, meta: PromptMetaInput) -> Result<String, String> {
    ensure_data_dir()?;
    
    // 获取当前索引条目
    let entry = index::get_index_entry(&name)?
        .ok_or_else(|| format!("Prompt '{}' 不存在", name))?;
    
    // 检查内容是否有变化
    let current_content = prompt::read_prompt_content(&name, &entry.latest).unwrap_or_default();
    if current_content == content {
        return Err("内容没有变化，无需保存".to_string());
    }
    
    // 计算新版本号
    let new_version = prompt::next_version(Some(&entry.latest));
    let now = Utc::now().to_rfc3339();
    
    // 读取现有 meta 并更新
    let mut existing_meta = prompt::read_prompt_meta(&name)?;
    existing_meta.description = meta.description;
    existing_meta.model = meta.model;
    existing_meta.temperature = meta.temperature;
    
    // 保存新版本内容
    prompt::write_prompt_content(&name, &new_version, &content)?;
    
    // 更新 meta
    prompt::write_prompt_meta(&name, &existing_meta)?;
    
    // 更新索引
    let new_entry = index::PromptIndexEntry {
        latest: new_version.clone(),
        created_at: entry.created_at,
        updated_at: now,
        tags: entry.tags,
    };
    index::update_index_entry(&name, new_entry)?;
    
    Ok(new_version)
}

/// 创建新 Prompt
#[tauri::command]
pub fn create_prompt(name: String, meta: PromptMetaInput) -> Result<(), String> {
    ensure_data_dir()?;
    
    // 检查是否已存在
    if index::get_index_entry(&name)?.is_some() {
        return Err(format!("Prompt '{}' 已存在", name));
    }
    
    // 验证名称
    if name.is_empty() || name.contains('/') || name.contains('\\') {
        return Err("Prompt 名称无效".to_string());
    }
    
    let now = Utc::now().to_rfc3339();
    let initial_version = "0.1.0";
    
    // 创建 meta
    let prompt_meta = prompt::PromptMeta {
        name: name.clone(),
        description: meta.description,
        model: meta.model,
        temperature: meta.temperature,
        created_at: now.clone(),
    };
    
    // 保存 meta
    prompt::write_prompt_meta(&name, &prompt_meta)?;
    
    // 创建初始版本（空内容）
    let initial_content = "# System\n\n# User\n\n# Rules\n";
    prompt::write_prompt_content(&name, initial_version, initial_content)?;
    
    // 添加到索引
    let entry = index::PromptIndexEntry {
        latest: initial_version.to_string(),
        created_at: now.clone(),
        updated_at: now,
        tags: std::collections::HashMap::new(),
    };
    index::update_index_entry(&name, entry)?;
    
    Ok(())
}

/// 删除 Prompt
#[tauri::command]
pub fn delete_prompt(name: String) -> Result<(), String> {
    ensure_data_dir()?;
    
    // 检查是否存在
    if index::get_index_entry(&name)?.is_none() {
        return Err(format!("Prompt '{}' 不存在", name));
    }
    
    // 删除目录
    prompt::delete_prompt_dir(&name)?;
    
    // 从索引中移除
    index::remove_index_entry(&name)?;
    
    Ok(())
}
