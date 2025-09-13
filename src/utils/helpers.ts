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
