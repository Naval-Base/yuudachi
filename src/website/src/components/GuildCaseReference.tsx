import dynamic from 'next/dynamic';
import { Button, useDisclosure } from '@chakra-ui/react';

const GuildCaseModal = dynamic(() => import('~/components/modals/GuildCase'));

const GuildCaseReference = ({ caseId }: { caseId?: number }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	return caseId ? (
		<>
			<Button size="sm" onClick={onOpen}>
				{caseId}
			</Button>

			<GuildCaseModal caseId={caseId} readOnly isOpen={isOpen} onClose={onClose} />
		</>
	) : null;
};

export default GuildCaseReference;
