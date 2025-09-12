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
- must reorganize all the image loading functions

ui things
- toolbar shadow on image
- fix image preview (only zoom when clicking on actual image)
- I don't love the theme button where it is
- need feedback for dragging in an image

---

okay data persistence. need to save
- options values (see above)
- images list
  - each image needs to save the information required to restore its state 
    - for files, that is simply a file path
    - for clipboard items that aren't files, we'll need to save them, and save their file path
    - the data should like this
    {
        maxHistory: 10,
        clearHistoryOnExist: true,
        clearPinsOnExit: true,
        currentImageIndex: number, // might as well
        images: [
          {
            path: (the actual file path or the cached path)
            source: (an object describing where the image was loaded from)
            pin: the pin order
            thumbnail: (not sure if I will have separate thumbnails, but this will the path)
          }
        ]
    }

    sources: 
      - { file: (original file path) }
      - { clipboard: "png" }
      - { url: (original image url) }

okay to get app state to save and load, I need to first tackle the image loadeers. 
at first I had tried to make a single function that would take anything, since I wasn't sure what I would end up needing
but it all boils down to 
  - file drops
  - clipboard stuff
And I need to ensure that...
  - context about the image origin is retained
  - everything needed to recreate the image item on the next app run
    - make sure file permissions are saved (tauri persisted-scope?)
    - clipbard images need to be cached

pasting from 
  - finder
    - NSFilenamesPboardType
  - draw things
    - public.png
  - lunacy
    - public.png
  - chromium (right click image in page, copy image)
    - public.png 
    - public.html seems to have the original as a data url
    - I know that to get dt data out of a discord image, you have to open in browser and download, copying doesn't work. 
      BUT I see that when you copy from either chromium or discord, there is also public.html which has the discord url.
  - discord
    - easiest way is to copy link 

Okay, so the types i'm interested in are:
- public.png
- public.utf8-plain-text
- NSFilenamesPboardType
- org.chromium.source-url
- public.file-url
- public.url

- Draw Things
  - public.png
- Finder
  - public.file-url will not have a valid path
    - check for "file:///.file/"
  - NSFilenamesPboardType has full path
    - there is a lib for parsing this
- Picarrange, Marta
  - public.file-url has full paths
  - NSFilenamesPboardType has full path
- Discord
  - sometimes an alternate format is specified in the query string. It can be removed to get the image with the metadata
- Safari
  - public.url, public.utf8-plain-text

https://cdn.discordapp.com/attachments/1095620416065781790/1413489634838839438/0_scaly_crocodile_unicorn___pegasus_full_body_portrait_2171547597.png?ex=68bf6a0e&is=68be188e&hm=c5b0df21d73ef39bb8036285f1b47a15809852d652a603f46312d7dbc4531438&

https://media.discordapp.net/attachments/1095620416065781790/1413489634838839438/0_scaly_crocodile_unicorn___pegasus_full_body_portrait_2171547597.png?ex=68bf6a0e&is=68be188e&hm=c5b0df21d73ef39bb8036285f1b47a15809852d652a603f46312d7dbc4531438&=&format=webp&quality=lossless


---

now for storing images

we'll use apppDataDir/cache

file names will use nanoid with the proper file extension

how to keep it clean?
  - when removing/clearing an image item, if backed by cache, delete it
  - clean on exit
    - i'd rather just clean on start, but I guess I should do both. exit routine can remove history or pins depending on user setting, and then delete any images that aren't supposed to be saved
  - clean on start
    - once app has finished loading, delete any images that aren't specifed in app state

Maybe I should even cache file drops. that way all images can be handle the same once loaded.

Hmm, so valtio-store is cool. Except there's no finegrained control over nested objects

I don't have any image data in state anymore, just the metadata/exif - which is perhaps more than I want persisted (it can easily be read again on demand)

since I can't filter by nest key (images[number].exif), I'll split the images list between state to be serialized and state that can be lazy loaded.

---

- change store to use string ids for images
- update imagestore to manage ids
- just always use png for image cache

imageStore api:
  - saveImage(data: Uint8Array): {id: string, url: string, thumbUrl: string}
  - getImage(id: string): {id: string, url: string, thumbUrl: string}
  - sync(ids: string[]): void

If I'm using pngs only, how will I save metadata for other file types?
- .json? yeah that will work

no I think images should be stored as is, with metadata intact

---

so I guess we're gonna go without file paths. 

Still need to figure out how to resolve drop/clip inputs.

I guess the way the DataTransferItems work makes it difficult to get all the items. I guess just have to do them all at once - although if the image doesn't have the metadata it's unlikely the url would. Chromium drags images as the original (unlike copying which removes the metadata)

Okay, so now I have both clipboard and drops distilled into files and a list of text items

However the only instance I know of where text > files is when copying from chromium.

damn I thought it would be simple enough to go images > text. But it looks like I might need to mix precedence or have special rules are something....

Finder
  - Copy: NSFilenamesPboardType**
  - Drop: file image/png**
Draw Things
  - Copy: public.png* or public.tiff
  - Drop: none
Discord:
  - Copy image (thumbnail and full): public.png (no metadata)
  - Drop (thumbnail): text/plain text/uri-list
  - Drop (full): image/webp (no metadata) text/uri-list (change format in query string)
  - Copy link: public.utf8-plain-text NSStringPboardType
  - Copy link (full): public.utf8-plain-text NSStringPboardType (change format query string)
Chromium (Edge, presumably Chrome):
  - Copy image: public.png (no metadata)
    - org.chromium.source-url is the page url, which could be the image url
    - public.html** has the img element with src
  - Copy image link: public.utf8-plain-text**
  - Drop image: image/png**
Safari
  - Copy image: pubic.tiff (no metadata) public.url** public.utf8-plain-text** NSStringPboardType
  - Copy image address: public.url** public.utf8-plain-text** NSStringPboardType
  - Drop image: image/png**
PicArrange
  - Copy: NSFilenamesPboardType**
  - Drop: image/png**


Maybe i should just provide all the types, and have a set of rules that can cone through

when it comes to drops, image/*** seems to always be preferred unless it's a full size drop from discord, in which case the best option is text/uri-list (with a changed query)

NSFilenamesPboardType is always the best

if there's a public.html

so maybe the rule definitions would be like

rule = {
  types: [']
}

---

okay it seems that for drops, you have to get text itmes right away, but for files, as long as you have the file from .getAsFile, you can get the actual array buffer later.

so we'll go with the 'look at all the available types and run through some rules' strategy, I guess.


---

I'm probably over thinking it

- Get the first image in the drop/clip
  - if it has DT metadata, you win!
- Look through text types for paths 
  - Local path - if it exists, load that image and return
  - Url - check url, if exists, return
- If no paths produced images, return the original image without metadata

And maybe I should set the store up so I can load the image immediately, and replace it if a better alternative is found.

--

okay so that strategy still has problems because the public.tiff when you copy from finder is the png icon.

---

okay finally got it. turns out that (on mac at least) drag and drop comes from the same api that copy/paste does. that simplies things a lot, because I can load with the exact same function, just changing "general" to "drag". 

So now, whenever 'loadImage' is triggered
- Clip/drag types are retrieved
- if there's an image type it will be loaded and a new imageitem created
- if no image or the imageitem has no metadata
  - grab all the familiar text entries
  - for each type:
    - extract any urls or paths
      - for each path/url:
        - try loading it
        - if it loads, create the imageItem or update the one that was already loaded
        - return

Still need to...
  - mechanism for creating a new image item to replace an existing one
    - I think it should probably be replaced rather updated since the url is tied to the id
  - skip loading an image type under certain circumstances

and then more generally:
  - feedback for when an image is loading
  - feedback for when an image can't be loaded
  - image cache clean up
  - thumbnails
  - clear history/pins on exit
  - ui for closing/clearing items
  - suspense/lazy loading (splash screen)
  - button to copy an image