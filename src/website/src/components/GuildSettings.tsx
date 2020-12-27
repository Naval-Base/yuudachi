import dynamic from 'next/dynamic';
import { Button, useDisclosure } from '@chakra-ui/react';

const GuildSettingsModal = dynamic(() => import('~/components/modals/GuildSettings'));

const GuildSettings = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	return (
		<>
			<Button onClick={onOpen}>Open Guild Settings</Button>

			<GuildSettingsModal isOpen={isOpen} onClose={onClose} />
		</>
	);
};

export default GuildSettings;
