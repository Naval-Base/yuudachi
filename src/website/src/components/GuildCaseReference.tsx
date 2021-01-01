import dynamic from 'next/dynamic';
import { Button, useDisclosure } from '@chakra-ui/react';

const GuildCaseModal = dynamic(() => import('~/components/modals/GuildCase'));

const GuildCaseReference = ({ caseId, size = 'sm' }: { caseId?: number; size?: 'md' | 'sm' }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	return caseId ? (
		<>
			<Button size={size} onClick={onOpen}>
				{caseId}
			</Button>

			<GuildCaseModal caseId={caseId} readOnly isOpen={isOpen} onClose={onClose} />
		</>
	) : null;
};

export default GuildCaseReference;
