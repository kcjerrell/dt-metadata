use tauri::{TitleBarStyle};
use tauri::{WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_http::reqwest;

use tauri_plugin_window_state::StateFlags;

mod clipboard;

#[tauri::command]
fn read_clipboard_types(pasteboard: Option<String>) -> Result<Vec<String>, String> {
    clipboard::read_clipboard_types(pasteboard)
}

#[tauri::command]
fn read_clipboard_strings(
    types: Vec<String>,
    pasteboard: Option<String>,
) -> Result<std::collections::HashMap<String, String>, String> {
    clipboard::read_clipboard_strings(types, pasteboard)
}

#[tauri::command]
fn read_clipboard_binary(ty: String, pasteboard: Option<String>) -> Result<Vec<u8>, String> {
    clipboard::read_clipboard_binary(ty, pasteboard)
}

#[tauri::command]
fn write_clipboard_binary(ty: String, data: Vec<u8>) -> Result<(), String> {
    clipboard::write_clipboard_binary(ty, data)
}

#[tauri::command]
async fn fetch_image_file(url: String) -> Result<Vec<u8>, String> {
    let resp = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    let bytes = resp.bytes().await.map_err(|e| e.to_string())?;
    Ok(bytes.to_vec())
}

// #[tauri::command]
// async fn load_metadata(filepath: String) -> Result<Option<HashMap<String, String>>, Box<dyn std::error::Error + 'static>> {
//     // let path = std::path::Path::new(&filepath);
//     // let pb = path.to_path_buf();
//     let _metadata = metadata::load_metadata(&filepath);

//     _metadata
// }

// #[tauri::command]
// fn init_panel(app: tauri::AppHandle) -> Result<(), String> {
//     let _panel = app.get_webview_window("panel").unwrap();
//     _panel.to_popover(ToPopoverOptions {
//         is_fullsize_content: true,
//     });
//     Ok(())
// }

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(
            tauri_plugin_window_state::Builder::new()
                .with_state_flags(StateFlags::all() & !StateFlags::VISIBLE)
                .build(),
        )
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard::init())
        .plugin(tauri_plugin_valtio::Builder::new().build())
        // .plugin(tauri_plugin_nspopover::init())
        .invoke_handler(tauri::generate_handler![
            read_clipboard_types,
            read_clipboard_binary,
            write_clipboard_binary,
            read_clipboard_strings,
            fetch_image_file,
            // load_metadata
            // init_panel,
        ])
        .setup(|app| {
            let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .title("DTM")
                .inner_size(800.0, 600.0)
                .min_inner_size(600.0, 400.0)
                .visible(false)
                .disable_drag_drop_handler();

            // set transparent title bar only when building for macOS
            #[cfg(target_os = "macos")]
            let win_builder = win_builder
                .hidden_title(true)
                .title_bar_style(TitleBarStyle::Overlay);

            let _window = win_builder.build().unwrap();

            // let _panel_builder =
            //     WebviewWindowBuilder::new(app, "panel", WebviewUrl::App(PathBuf::from("#mini")))
            //         .title("DT Metadata Mini")
            //         .inner_size(400.0, 400.0)
            //         .disable_drag_drop_handler()
            //         .visible(false);

            // let _panel = _panel_builder.build().unwrap();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
