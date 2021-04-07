import { HTMLChakraProps, chakra } from '@chakra-ui/react';
import { motion, HTMLMotionProps } from 'framer-motion';

type Merge<P, T> = Omit<P, keyof T> & T;
type MotionBoxProps = Merge<HTMLChakraProps<'div'>, HTMLMotionProps<'div'>>;

const MotionBox: React.FC<MotionBoxProps> = motion(chakra.div);

export default MotionBox;
