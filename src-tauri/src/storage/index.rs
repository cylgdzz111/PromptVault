use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;

use super::get_data_dir;

/// 索引条目
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptIndexEntry {
    pub latest: String,
    pub created_at: String,
    pub updated_at: String,
    #[serde(default)]
    pub tags: HashMap<String, String>,
}

/// 全局索引类型
pub type PromptIndex = HashMap<String, PromptIndexEntry>;

/// 读取全局索引
pub fn read_index() -> Result<PromptIndex, String> {
    let index_path = get_data_dir()?.join("index.json");
    
    if !index_path.exists() {
        return Ok(HashMap::new());
    }
    
    let content = fs::read_to_string(&index_path)
        .map_err(|e| format!("读取 index.json 失败: {}", e))?;
    
    serde_json::from_str(&content)
        .map_err(|e| format!("解析 index.json 失败: {}", e))
}

/// 写入全局索引
pub fn write_index(index: &PromptIndex) -> Result<(), String> {
    let index_path = get_data_dir()?.join("index.json");
    
    let content = serde_json::to_string_pretty(index)
        .map_err(|e| format!("序列化 index.json 失败: {}", e))?;
    
    fs::write(&index_path, content)
        .map_err(|e| format!("写入 index.json 失败: {}", e))
}

/// 更新索引条目
pub fn update_index_entry(name: &str, entry: PromptIndexEntry) -> Result<(), String> {
    let mut index = read_index()?;
    index.insert(name.to_string(), entry);
    write_index(&index)
}

/// 删除索引条目
pub fn remove_index_entry(name: &str) -> Result<(), String> {
    let mut index = read_index()?;
    index.remove(name);
    write_index(&index)
}

/// 获取索引条目
pub fn get_index_entry(name: &str) -> Result<Option<PromptIndexEntry>, String> {
    let index = read_index()?;
    Ok(index.get(name).cloned())
}
