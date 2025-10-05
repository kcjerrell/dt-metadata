use tauri::{Manager, TitleBarStyle};
use tauri::{WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_http::reqwest;

use objc2::rc::Retained;
use objc2_app_kit::{NSPasteboard, NSPasteboardNameDrag};
use objc2_foundation::{NSArray, NSData, NSString};
use tauri_plugin_window_state::StateFlags;

// mod metadata;

fn get_clipboard(pasteboard: Option<String>) -> Result<Retained<NSPasteboard>, String> {
    unsafe {
        match pasteboard.as_deref() {
            Some("drag") => Ok(NSPasteboard::pasteboardWithName(&*NSPasteboardNameDrag)),
            Some("general") | None => Ok(NSPasteboard::generalPasteboard()),
            Some(other) => return Err(format!("Unknown pasteboard name: {other}")),
        }
    }
}

#[tauri::command]
fn read_clipboard_types(pasteboard: Option<String>) -> Result<Vec<String>, String> {
    // Select pasteboard based on argument
    let pb: Retained<NSPasteboard> = get_clipboard(pasteboard)?;

    // Get available types (NSArray<NSString>)
    let available = unsafe { pb.types() }.ok_or("Failed to get available types")?;

    // Convert NSArray<NSString> → Vec<String>
    let mut result = Vec::with_capacity(available.len());
    for i in 0..available.len() {
        let ty: Retained<NSString> = available.objectAtIndex(i);
        result.push(ty.to_string());
    }

    Ok(result)
}

#[tauri::command]
fn read_clipboard_strings(
    types: Vec<String>,
    pasteboard: Option<String>,
) -> Result<std::collections::HashMap<String, String>, String> {
    let pb = get_clipboard(pasteboard)?;
    let mut results = std::collections::HashMap::new();

    for ty in types {
        let ns_type = NSString::from_str(&ty);
        let type_array = NSArray::from_slice(&[&*ns_type]);

        // Only proceed if available
        if unsafe { pb.availableTypeFromArray(&*type_array) }.is_none() {
            continue;
        }

        // Try to read as NSString
        if let Some(s) = unsafe { pb.stringForType(&*ns_type) } {
            results.insert(ty, s.to_string());
        }
    }

    Ok(results)
}

#[tauri::command]
fn read_clipboard_binary(ty: String, pasteboard: Option<String>) -> Result<Vec<u8>, String> {
    let pb = get_clipboard(pasteboard)?;
    let ns_type = NSString::from_str(&ty);
    let type_array = NSArray::from_slice(&[&*ns_type]);

    if unsafe { pb.availableTypeFromArray(&*type_array) }.is_none() {
        return Err(format!("Type {} not available", ty));
    }

    let data: Option<Retained<NSData>> = unsafe { pb.dataForType(&*ns_type) };
    let data = data.ok_or_else(|| format!("Failed to read binary data for {}", ty))?;
    let bytes = unsafe { data.as_bytes_unchecked() };

    Ok(bytes.to_vec())
}

#[tauri::command]
fn write_clipboard_binary(ty: String, data: Vec<u8>) -> Result<(), String> {
    let pb = get_clipboard(None)?; // general pasteboard only
    let ns_type = NSString::from_str(&ty);

    // Convert Vec<u8> into NSData
    let binding = NSData::from_vec(data);
    let ns_data = binding.as_ref();

    unsafe {
        pb.clearContents();
        let ok = pb.setData_forType(Some(ns_data), &ns_type);
        if !ok {
            return Err(format!("Failed to write binary data for {}", ty));
        }
    }

    Ok(())
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
