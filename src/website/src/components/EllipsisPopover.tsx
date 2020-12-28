import {
	Text,
	Popover,
	PopoverTrigger,
	PopoverBody,
	PopoverArrow,
	PopoverCloseButton,
	PopoverContent,
} from '@chakra-ui/react';

const EllipsisTooltip = ({ text, total }: { text: string; total: number }) => {
	if (text.length <= total) {
		return <Text>{text}</Text>;
	}

	const keep = total - 3;
	if (keep < 1) {
		return <Text>{text.slice(0, total)}</Text>;
	}

	return (
		<Popover>
			<PopoverTrigger>
				<Text>{`${text.slice(0, keep)}...`}</Text>
			</PopoverTrigger>
			<PopoverContent>
				<PopoverArrow />
				<PopoverCloseButton />
				<PopoverBody pr={8}>{text}</PopoverBody>
			</PopoverContent>
		</Popover>
	);
};

export default EllipsisTooltip;
