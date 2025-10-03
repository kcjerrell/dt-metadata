import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const themeConfig = defineConfig({
	globalCss: {
		html: {
			overscrollBehavior: "none",
			fontSize: "14px",
			// zoom: 1.5
		},
		body: {
			fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif;",
		},
		".check-bg": {
			bgImage: {
				_light: "url(check_light.png)",
				_dark: "url(check_dark.png)",
			},
			bgSize: "50px 50px",
		},
		".hide-scrollbar": {
			scrollbarWidth: "none",
		},
		".hide-scrollbar::-webkit-scrollbar": {
			/*Chrome, Safari, Edge*/
			display: "none",
		},
		"#root": {
			bgColor: "#73747540",
			overflow: "clip",
			height: "100vh",
			width: "100vw",
			position: "relative"
		},
	},
	theme: {
		breakpoints: {
			tall: "300px",
			wide: "600px",
			// sm: "300px",
			// md: "600px",
			// lg: "900px",
			// xl: "1200px",
		},
		semanticTokens: {
			colors: {
				check: {
					"1": {
						value: {
							_light: "#f5f5f7",
							_dark: "#565e67",
						},
					},
					"2": {
						value: {
							_light: "#dbdddf",
							_dark: "#434753",
						},
					},
					"3": {
						value: {
							_light: "#e0e1e2",
							_dark: "#4c525b",
						},
					},
					"4": {
						value: {
							_light: "#c9cbcd",
							_dark: "#3b3f4a",
						},
					},
				},
				bg: {
					"1": {
						value: {
							_light: "#f2f3f4",
							_dark: "#141417",
						},
					},
					"2": {
						value: {
							_light: "#e8eaeb",
							_dark: "#252525",
						},
					},
					"3": {
						value: {
							_light: "#e0e1e2",
							_dark: "#272932",
						},
					},
					"0": {
						value: {
							_light: "#ffffff",
							_dark: "#434753",
						},
					},
				},
				fg: {
					"1": {
						value: {
							_light: "#272932",
							_dark: "#dbdddf",
						},
					},
					"2": {
						value: {
							_light: "#434753",
							_dark: "#b9bfc5",
						},
					},
					"3": {
						value: {
							_light: "#565e67",
							_dark: "#8e97a2",
						},
					},
				},
				highlight: {
					DEFAULT: {
						value: {
							_light: "#EC5F47",
							// _light: "#e9624dff",
							_dark: "#d25542",
						},
					},
				},
				info: {
					DEFAULT: {
						value: {
							_light: "#74b0ea",
							_dark: "#689fd3",
						},
					},
				},
				bonus: {
					DEFAULT: {
						value: {
							_light: "#c6b9fa",
							_dark: "#2d2244",
						},
					},
				},
				success: {
					"1": {
						value: {
							_light: "#51ac35",
							_dark: "#2d3d29",
						},
					},
					DEFAULT: {
						value: {
							_light: "#d0fcc9",
							_dark: "#316524",
						},
					},
				},
			},
		},
		tokens: {
			fontSizes: {
				// xs: { value: "0.75rem" },
				// sm: { value: "1rem" },
			},
		},
		keyframes: {
			test: {
				from: { transform: "translateX(0)" },
				to: { transform: "translateX(100%)" },
			},
		},
	},
})

export const system = createSystem(defaultConfig, themeConfig)
