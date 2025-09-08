state is kind of becomming messy

logical
- settings (not implemented)
  - max history
  - clear pins on exit
  - clear history on exit
- images[]
  - url
  - exif
  - dtmetadfata
  - fileinfo
  - selectedtab (this is problematic currently)
  - path
  - id
  - pin
  - loaded at
- selectedImage

I think I jsut don't like mutative. and it doesn't solve the problem of fine grained renders.
Gonna try jotai, starting with useMetadata context.

I think the atoms can be created in the module scope.

---

So there's two options for dropping. but first, what do I want out of dropping
- the actual image file with metadata
- a file path

options
- Tauri
  - File drop: full file path is provided
  - Image drop: not supported. only dropping actual files.
- html5
  - File drop: no file path, file name only
  - Image drop: should be supported

Oh well. Not gonna worry about image drop at the moment

but I do want to handle pasting urls and file paths (as well as the files and images)

---

so to match the styling of dt's ui, I started to bust out a color picker with a dropper and a screenshot

then I was like, hey, why not just count the colors programatically? GENIUS

except font smoothing ruins that idea.

but Im gonna have some fun with it anyway because I'm a dork

---

as always, stop fiddling with style and get r done

- image info layout
  - add fs stats to page
- reveal in finder
- handle all inputs
  - clipboard file
  - clipboard image
  - drag file
  - clipboard url
  - clipboard file path
- state persistence
- options
  - clear history on exit (default true)
  - clear pins on exit (default false)
  - max history items
- mini mode
- fix image preview (only zoom when clicking on actual image)