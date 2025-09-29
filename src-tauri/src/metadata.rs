use std::collections::HashMap;

use quick_xml::escape::unescape;
use quick_xml::{events::Event, Reader};
use web_image_meta::png;

pub fn load_metadata(path: &String) -> Result<Option<HashMap<String, String>>, tauri::Error> {
    let input_data = std::fs::read(path)?;

    let chunks = match png::read_text_chunks(&input_data) {
        Ok(chunks) => chunks,
        Err(e) => return Err(tauri::Error::InvalidArgs())
    };
    for chunk in chunks {
        println!("{}: {}", chunk.keyword, chunk.text);
        println!();

        if chunk.keyword == "XML:com.adobe.xmp" {
            // let xmp = String::from_utf8_lossy(&chunk.text);
            return Ok(Some::<HashMap<String, String>>(parse_xmp(&chunk.text)));
        }
    }
    Ok(None)
}

fn parse_xmp(xmp: &str) -> HashMap<String, String> {
    let mut reader = Reader::from_str(xmp);
    reader.config_mut().trim_text(true);

    let mut buf = Vec::new();
    let mut map = HashMap::new();

    let mut current_tag: Option<String> = None;

    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Start(e)) => {
                let tag_name = String::from_utf8_lossy(e.name().as_ref()).to_string();
                current_tag = Some(tag_name);
            }
            Ok(Event::Text(e)) => {
                if let Some(tag) = &current_tag {
                    // FIX: unescape manually
                    let raw = String::from_utf8_lossy(e.as_ref());
                    let text = unescape(&raw).unwrap().into_owned();

                    match tag.as_str() {
                        "li" => {
                            if !map.contains_key("description") {
                                map.insert("description".to_string(), text.clone());
                            } else {
                                map.insert("UserComment".to_string(), text.clone());
                            }
                        }
                        "CreatorTool" => {
                            map.insert("CreatorTool".to_string(), text.clone());
                        }
                        _ => {}
                    }
                }
            }
            Ok(Event::End(_)) => {
                current_tag = None;
            }
            Ok(Event::Eof) => break,
            Err(e) => panic!("Error parsing XML: {:?}", e),
            _ => {}
        }
        buf.clear();
    }

    map
}
