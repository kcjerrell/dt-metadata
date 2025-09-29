export function areEquivalent(a: unknown[], b: unknown[]) {
	if (a.length !== b.length) return false
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false
	}
	return true
}

export async function uint8ArrayToBase64(uint8: Uint8Array<ArrayBuffer>): Promise<string> {
	// Wrap in a Blob and read it as a DataURL
	const blob = new Blob([uint8])
	const reader = new FileReader()

	return new Promise((resolve, reject) => {
		reader.onloadend = () => {
			const dataUrl = reader.result as string
			// Strip the "data:*/*;base64," prefix
			const base64 = dataUrl.split(",")[1]
			resolve(base64)
		}
		reader.onerror = reject
		reader.readAsDataURL(blob)
	})
}

/**
 * Determines if a click is in the actual image area for an img that is object-fit: contain
 * @param e the event
 * @param img the image
 * @returns whether or not the click is inside the image
 */
export function isInsideImage(e: React.MouseEvent, img: HTMLImageElement): boolean {
	const rect = img.getBoundingClientRect()

	// mouse coords relative to element
	const x = e.clientX - rect.left
	const y = e.clientY - rect.top

	// calculate contained image size
	const scale = Math.min(rect.width / img.naturalWidth, rect.height / img.naturalHeight)
	const drawnWidth = img.naturalWidth * scale
	const drawnHeight = img.naturalHeight * scale
	const offsetX = (rect.width - drawnWidth) / 2
	const offsetY = (rect.height - drawnHeight) / 2

	return x >= offsetX && x <= offsetX + drawnWidth && y >= offsetY && y <= offsetY + drawnHeight
}

/**
 * Fisher–Yates shuffle
 * Shuffles the array in-place and also returns it
 */
export function shuffle<T>(array: T[]): T[] {
	let m = array.length

	while (m > 0) {
		// Pick a random index
		const i = Math.floor(Math.random() * m--)

		// Swap element at m with element at i
		;[array[m], array[i]] = [array[i], array[m]]
	}

	return array
}