use objc2::rc::Retained;
use objc2_app_kit::NSPasteboard;
use objc2_foundation::{NSArray, NSData, NSString};
#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;
use tauri::{WebviewUrl, WebviewWindowBuilder};

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
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, read_clipboard_png])
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
