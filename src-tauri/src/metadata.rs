use web_image_meta::png;

pub fn load_metadata(path: &String) -> Result<(), Box<dyn std::error::Error + 'static>> {
    let input_data = std::fs::read(path)?;

    let chunks = png::read_text_chunks(&input_data)?;
    for chunk in chunks {
        println!("{}: {}", chunk.keyword, chunk.text);
        println!();
    }
    Ok(())
}
