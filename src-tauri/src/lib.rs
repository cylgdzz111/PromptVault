mod commands;
mod storage;
mod diff;

use commands::prompt::*;
use commands::version::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            list_prompts,
            get_prompt,
            save_prompt,
            create_prompt,
            delete_prompt,
            list_versions,
            diff_prompt
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
