use objc2::rc::Retained;
use objc2_app_kit::NSPasteboard;
use objc2_foundation::{NSArray, NSData, NSString};

#[tauri::command]
fn read_clipboard_png() -> Result<Vec<u8>, String> {
    // Pasteboard
    let pb = unsafe { NSPasteboard::generalPasteboard() };

    // Target type
    let png_type = NSString::from_str("public.png");

    // Build NSArray<NSString>
    let types = NSArray::from_slice(&[&*png_type]);

    // Check if available
    let available = unsafe { pb.availableTypeFromArray(&*types) };
    if available.is_none() {
        return Err("No PNG in clipboard".into());
    }

    // Read as NSData
    let data: Option<Retained<NSData>> = unsafe { pb.dataForType(&*png_type) };
    let data = data.ok_or("Failed to get PNG data")?;

    // Convert NSData → Vec<u8>
    let bytes = unsafe { data.as_bytes_unchecked() };

    Ok(bytes.to_vec())
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, read_clipboard_png])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
