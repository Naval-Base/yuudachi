import dynamic from 'next/dynamic';
import { Button, useDisclosure } from '@chakra-ui/react';

const GuildTagModal = dynamic(() => import('~/components/modals/GuildTag'));

const GuildTag = ({ name }: { name: string }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	return (
		<>
			<Button onClick={onOpen}>Edit Tag</Button>

			<GuildTagModal name={name} isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
		</>
	);
};

export default GuildTag;
