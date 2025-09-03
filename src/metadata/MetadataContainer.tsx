import { PropsWithChildren } from 'react'
import Metadata from './Metadata'
import { MetadataContext, useCreateMetadataContext } from './useMetadata'

interface MetadataContainerProps {
  // nothing here at the moment
}

function MetadataContainer(props: PropsWithChildren<MetadataContainerProps>) {
  const { ...restProps } = props
  const cv = useCreateMetadataContext()

  return (
    <MetadataContext value={cv}>
      <Metadata {...restProps} />
    </MetadataContext>
  )
}

export default MetadataContainer
