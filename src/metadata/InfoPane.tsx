import TabPage from '@/components/scrollTabs/TabPage'
import {
  SimpleGrid
} from '@chakra-ui/react'
import DataItem from './DataItem'
import ScrollTabs from './ScrollTabs'
import { ImageItem } from './useMetadata'

type InfoPanelProps = {
  image?: ImageItem
  setTab?: (tab: 'image' | 'config' | 'gen') => void
}

const tabPos = {
  image: {
    image: '0%',
    config: '120%',
    gen: '240%',
  },
  config: {
    image: '-120%',
    config: '0%',
    gen: '120%',
  },
  gen: {
    image: '-240%',
    config: '-120%',
    gen: '0%',
  },
}

function InfoPane(props: InfoPanelProps) {
  const { image, setTab } = props

  const { exif, info, dtData } = image ?? {}

  const disabled = [false, dtData == undefined, dtData == undefined]

  return (
    <ScrollTabs defaultTab={image?.infoTab} onChanged={setTab}>
      <TabPage label={'image'}>
        <SimpleGrid columns={2}>
          <DataItem label={'Size'} data={formatByte(info?.size)} />
          {Object.entries(exif ?? {}).map(([k, v]) => {
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
