import { Box, Button } from '@chakra-ui/react'
import IconButton, { IconButtonProps } from './iconButton'
import { useToolTip } from './tooltip/ToolTip'
import { Fragment } from 'react/jsx-runtime'

interface ToolButtonProps extends IconButtonProps {
  tooltip: string
}

function ToolButton(props: ToolButtonProps) {
  const { tooltip, onMouseEnter, onMouseLeave, icon: Icon = Box, ...iconProps } = props

  const handlers = useToolTip({ text: tooltip, onMouseEnter, onMouseLeave })

  return (
    <Button
      size={'sm'}
      bgColor={'bg.1'}
      hoverBg={'bg.2'}
      hoverColor={'fg.0'}
      padding={'2px'}
      borderRadius={'lg'}
      _hover={{}}
      {...iconProps}
      {...handlers}
    >
      <Icon height={'100%'} width={'100%'} padding={'3px'} flex={'0 0 auto'} />
    </Button>
  )
}

export default ToolButton
