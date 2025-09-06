import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const themeConfig = defineConfig({
  globalCss: {
    html: {
      overscrollBehavior: 'none'
    },
    ".hide-scrollbar": {
      scrollbarWidth: "none",
    },
    ".hide-scrollbar::-webkit-scrollbar": {
      /*Chrome, Safari, Edge*/
      display: 'none'
    }
  },
  theme: {
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: {
            value: {
              _light: '{colors.gray.100}',
              _dark: '{colors.gray.900}'
            }
          },
          0: {
            value: {
              _light: '{colors.gray.200}',
              _dark: '{colors.gray.800}'
            }
          },
          1: {
            value: {
              _light: '{colors.gray.300}',
              _dark: '{colors.gray.700}'
            }
          },
          2: {
            value: {
              _light: '{colors.gray.400}',
              _dark: '{colors.gray.600}'
            }
          }
        },
        fg: {
          DEFAULT: {
            value: {
              _dark: '{colors.gray.100}',
              _light: '{colors.gray.900}'
            }
          },
          0: {
            value: {
              _dark: '{colors.gray.200}',
              _light: '{colors.gray.800}'
            }
          },
          1: {
            value: {
              _dark: '{colors.gray.300}',
              _light: '{colors.gray.700}'
            }
          },
          2: {
            value: {
              _dark: '{colors.gray.400}',
              _light: '{colors.gray.600}'
            }
          }
        }
      }
    }
  }
})

export const system = createSystem(defaultConfig, themeConfig)
