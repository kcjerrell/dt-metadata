use objc2::rc::Retained;
use objc2_app_kit::NSPasteboard;
use objc2_foundation::{NSArray, NSData, NSString};
#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;
use tauri::{WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_http::reqwest;

#[tauri::command]
fn read_clipboard_types() -> Result<Vec<String>, String> {
    // Get general pasteboard
    let pb = unsafe { NSPasteboard::generalPasteboard() };

    // Get types (NSArray<NSString *>)
    let available = unsafe { pb.types() }.ok_or("Failed to get available types")?;

    // Convert NSArray<NSString *> to Vec<String>
    let mut result = Vec::new();
    for i in 0..available.count() {
        let ty = available.objectAtIndex(i);
        result.push(ty.to_string()); // `Retained<NSString>` → String
    }

    Ok(result)
}

#[tauri::command]
fn read_clipboard_strings(types: Vec<String>) -> Result<std::collections::HashMap<String, String>, String> {
    let pb = unsafe { NSPasteboard::generalPasteboard() };
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
fn read_clipboard_binary(ty: String) -> Result<Vec<u8>, String> {
    let pb = unsafe { NSPasteboard::generalPasteboard() };
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
async fn fetch_image_file(url: String) -> Result<Vec<u8>, String> {
    let resp = reqwest::get(&url)
        .await
        .map_err(|e| e.to_string())?;
    let bytes = resp.bytes().await.map_err(|e| e.to_string())?;
    Ok(bytes.to_vec())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard::init())
        .plugin(tauri_plugin_valtio::init())
        .invoke_handler(tauri::generate_handler![
            read_clipboard_types,
            read_clipboard_binary,
            read_clipboard_strings,
            fetch_image_file
        ])
        .setup(|app| {
            let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .title("Transparent Titlebar Window")
                .inner_size(800.0, 600.0);

            // set transparent title bar only when building for macOS
            #[cfg(target_os = "macos")]
            let win_builder = win_builder
                .title_bar_style(TitleBarStyle::Overlay)
                .hidden_title(true);

            let window = win_builder.build().unwrap();

            // set background color only when building for macOS
            #[cfg(target_os = "macos")]
            {
                use cocoa::appkit::{NSColor, NSWindow};
                use cocoa::base::{id, nil};

                let ns_window = window.ns_window().unwrap() as id;
                unsafe {
                    let bg_color = NSColor::colorWithRed_green_blue_alpha_(
                        nil,
                        50.0 / 255.0,
                        158.0 / 255.0,
                        163.5 / 255.0,
                        1.0,
                    );
                    ns_window.setBackgroundColor_(bg_color);
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
