export type VideoCodec = "libx264" | "libx265" | "vp9" | "mpeg4" | "copy"
export type AudioCodec = "aac" | "mp3" | "opus" | "pcm_s16le" | "copy"
export type Format = "mp4" | "mkv" | "webm" | "mov" | "avi" | "flv"

export type Filter = {
	name: string
	options?: Record<string, string | number>
}

export type StreamSpecifier = string
