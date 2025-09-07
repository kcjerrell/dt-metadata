import TabPage from '@/components/scrollTabs/TabPage'
import { Box, HStack, SimpleGrid, VStack } from '@chakra-ui/react'
import DataItem from './DataItem'
import ScrollTabs from './ScrollTabs'
import { Store } from './store'
import { proxy, useSnapshot } from 'valtio'
import { useColorMode } from '@/components/ui/color-mode'
import { FiMoon } from 'react-icons/fi'
import TempImage from '../assets/tempimage.png'
import { useRef } from 'react'

type InfoPanelProps = {}

function InfoPane(props: InfoPanelProps) {
  const { ...restProps } = props

  const snap = useSnapshot(Store)
  const { currentImage: image } = snap

  const { toggleColorMode } = useColorMode()

  const { exif, info, dtData } = image ?? {}

  const temp = useRef(
    proxy({
      weight: 300,
      size: 32,
    })
  )
  const tempSnap = useSnapshot(temp.current)
  console.log(tempSnap)
  // const disabled = [false, dtData == undefined, dtData == undefined]

  return (
    <ScrollTabs
      tabTransform={'capitalize'}
      rightButtons={[
        {
          content: <FiMoon />,
          onClick: () => toggleColorMode(),
        },
      ]}
    >
      <TabPage label={'image'}>
        <SimpleGrid columns={2}>
          <DataItem label={'Size'} data={formatByte(info?.size)} />
          {Object.entries(
            (exif ?? {}) as Record<string, { value: string; description?: string }>
          ).map(([k, v]) => {
            const data = v.description || v.value
            const cols = data.length > 50 ? 2 : undefined
            return <DataItem key={k} label={k} data={data} cols={cols} />
          })}
        </SimpleGrid>
      </TabPage>
      <TabPage label={'config'}>
        <SimpleGrid columns={2}>
          <DataItem
            label={'Size'}
            data={`${dtData?.config.width} x ${dtData?.config.height}`}
            ignore={dtData?.config.width == undefined || dtData?.config.height == undefined}
          />
          <DataItem label={'Seed'} data={dtData?.config.seed} decimalPlaces={0} />
          {null}
          <DataItem label={'Model'} data={dtData?.config.model} cols={2} />
          <DataItem label={'Steps'} data={dtData?.config.steps} decimalPlaces={0} />
          <DataItem
            label={'ImageGuidance'}
            data={dtData?.config.imageGuidanceScale}
            decimalPlaces={1}
          />
          <DataItem label={'Shift'} data={dtData?.config.shift} decimalPlaces={2} />
          <DataItem label={'Prompt'} data={dtData?.prompt} cols={2} />
          <DataItem label={'Negative Prompt'} data={dtData?.negativePrompt} cols={2} />
          <DataItem label={'Config'} data={dtData?.config} cols={2} expandByDefault />
        </SimpleGrid>
      </TabPage>
      <TabPage label={'gen'}>
        {dtData?.profile?.timings?.map((t, i) => (
          <DataItem key={i} label={t.name} data={t.durations} />
        ))}
      </TabPage>
      <TabPage label={'test'}>
        <VStack>
          <input
            type="range"
            min={0}
            max={1000}
            value={tempSnap.weight}
            onChange={e => {
              temp.current.weight = Math.round(e.target.valueAsNumber / 100) * 100
            }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={tempSnap.size}
            onChange={e => {
              temp.current.size = e.target.valueAsNumber
            }}
          />
          <Box
            fontFamily={'-apple-system, BlinkMacSystemFont, sans-serif;'}
            fontSize={`${tempSnap.size}px`}
            lineHeight={'1.4rem'}
            fontWeight={tempSnap.weight}
            padding={3}
            bgColor={'#F5F6F7'}
            color={'#8E97A2}'}
            whiteSpace={'preserve'}
          >
            Choose which model to use for image generation. A generic model is better for
            everything, while certain models (e.g. waifu-diffusion) are good for anime style
            generation.
          </Box>
          <img src={TempImage} width={'100%'} height={'100%'} />
          {[
            '#FFFFFF',
            '#EDEDED',
            '#F4F5F6',
            '#E0E1E2',
            '#EC6956',
            '#C7B9FB',
            '#21252E',
            '#434754',
            '#565E67',
            '#74B0EA',
            '#CFFBC8',
          ].map(color => (
            <HStack key={color}>
              <Box width={'1rem'} height={'1rem'} bgColor={color} />
              {color}
            </HStack>
          ))}
        </VStack>
      </TabPage>
    </ScrollTabs>
  )
}

export default InfoPane

function formatByte(size: number | undefined): string {
  if (typeof size !== 'number' || isNaN(size)) return ''
  if (size < 1024) return `${size} B`
  const units = ['KB', 'MB', 'GB', 'TB', 'PB']
  let i = -1
  let s = size
  do {
    s = s / 1024
    i++
  } while (s >= 1024 && i < units.length - 1)
  return `${s.toFixed(1)} ${units[i]}`
}
