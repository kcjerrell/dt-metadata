import type { AudioCodec, Filter, Format, StreamSpecifier, VideoCodec } from "./types"

export class FFMpegCommand {
	private args: string[] = []

	input(file: string): this {
		this.args.push("-i", file)
		return this
	}

	output(file: string): this {
		this.args.push(file)
		return this
	}

	videoCodec(codec: VideoCodec): this {
		this.args.push("-c:v", codec)
		return this
	}

	audioCodec(codec: AudioCodec): this {
		this.args.push("-c:a", codec)
		return this
	}

	outputFormat(format: Format): this {
		this.args.push("-f", format)
		return this
	}

	map(stream: StreamSpecifier): this {
		this.args.push("-map", stream)
		return this
	}

	addFlag(flag: string): this {
		this.args.push(flag)
		return this
	}

	addOption(key: string, value?: string): this {
		this.args.push(key)
		if (value) this.args.push(value)
		return this
	}

	addFilter(stream: "v" | "a", filter: Filter): this {
		const opts = filter.options
			? Object.entries(filter.options)
					.map(([k, v]) => `${k}=${v}`)
					.join(":")
			: ""
		this.args.push(`-filter:${stream}`, `${filter.name}${opts ? `=${opts}` : ""}`)
		return this
	}

	build(): string {
		return ["ffmpeg", ...this.args].join(" ")
	}
}

const cmd = new FFMpegCommand()