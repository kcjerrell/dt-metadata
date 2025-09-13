export function useColor() {
	const color = [
		"rose.500/20",
		"pink.500/20",
		"fuchsia.500/20",
		"purple.500/20",
		"violet.500/20",
		"indigo.500/20",
		"blue.500/20",
		"sky.500/20",
		"cyan.500/20",
		"teal.500/20",
		"emerald.500/20",
		"green.500/20",
		"lime.500/20",
		"yellow.500/20",
		"amber.500/20",
		"orange.500/20",
		"red.500/20",
		"neutral.500/20",
		"stone.500/20",
		"zinc.500/20",
		"gray.500/20",
		"slate.500/20",
	]
	let i = 0

	return () =>
		`${color[i++ % color.length]}.500` as
			| "rose.500/20"
			| "pink.500/20"
			| "fuchsia.500/20"
			| "purple.500/20"
			| "violet.500/20"
			| "indigo.500/20"
			| "blue.500/20"
			| "sky.500/20"
			| "cyan.500/20"
			| "teal.500/20"
			| "emerald.500/20"
			| "green.500/20"
			| "lime.500/20"
			| "yellow.500/20"
			| "amber.500/20"
			| "orange.500/20"
			| "red.500/20"
			| "neutral.500/20"
			| "stone.500/20"
			| "zinc.500/20"
			| "gray.500/20"
			| "slate.500/20"
}
