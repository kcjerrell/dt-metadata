use cocoa::appkit::NSPasteboard;
use cocoa::base::{nil, id};
use cocoa::foundation::NSArray;
use objc::runtime::Object;
use std::slice;

#[tauri::command]
fn read_clipboard_png() -> Result<Vec<u8>, String> {
    unsafe {
        let pb: id = NSPasteboard::generalPasteboard(nil);

        // We want `public.png` UTI
        let available_types: id = msg_send![pb, types];
        let count: usize = msg_send![available_types, count];

        let mut has_png = false;
        for i in 0..count {
            let t: id = msg_send![available_types, objectAtIndex: i];
            let utf8: *const std::os::raw::c_char = msg_send![t, UTF8String];
            let s = std::ffi::CStr::from_ptr(utf8).to_string_lossy().into_owned();
            if s == "public.png" {
                has_png = true;
                break;
            }
        }

        if !has_png {
            return Err("No PNG in clipboard".into());
        }

        let data: id = msg_send![pb, dataForType: cocoa::foundation::NSString::alloc(nil).init_str("public.png")];
        if data == nil {
            return Err("Failed to get PNG data".into());
        }

        let length: usize = msg_send![data, length];
        let bytes: *const u8 = msg_send![data, bytes];
        let slice = slice::from_raw_parts(bytes, length);

        Ok(slice.to_vec())
    }
}