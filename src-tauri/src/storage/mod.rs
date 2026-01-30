pub mod index;
pub mod prompt;

use std::path::PathBuf;
use std::fs;

/// 获取数据目录路径 ~/.promptlab
pub fn get_data_dir() -> Result<PathBuf, String> {
    dirs::home_dir()
        .map(|home| home.join(".promptlab"))
        .ok_or_else(|| "无法获取 home 目录".to_string())
}

/// 获取 prompts 目录路径
pub fn get_prompts_dir() -> Result<PathBuf, String> {
    Ok(get_data_dir()?.join("prompts"))
}

/// 确保数据目录存在
pub fn ensure_data_dir() -> Result<(), String> {
    let data_dir = get_data_dir()?;
    let prompts_dir = get_prompts_dir()?;
    
    fs::create_dir_all(&data_dir).map_err(|e| format!("创建数据目录失败: {}", e))?;
    fs::create_dir_all(&prompts_dir).map_err(|e| format!("创建 prompts 目录失败: {}", e))?;
    
    // 确保 index.json 存在
    let index_path = data_dir.join("index.json");
    if !index_path.exists() {
        fs::write(&index_path, "{}").map_err(|e| format!("创建 index.json 失败: {}", e))?;
    }
    
    Ok(())
}
