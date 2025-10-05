import { chakra } from '@chakra-ui/react';
import { motion } from 'motion/react';

export const MotionBox = chakra(motion.div, {}, {forwardProps: ['transition']})

export const Panel = chakra('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 2,
    borderRadius: 'md',
    boxShadow: 'lg',
    backgroundColor: 'bg.1'
  }
})