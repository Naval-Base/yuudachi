import dynamic from 'next/dynamic';
import { ButtonGroup, IconButton, useDisclosure } from '@chakra-ui/react';
import { FiEye, FiEdit } from 'react-icons/fi';

const GuildCaseModal = dynamic(() => import('~/components/modals/GuildCase'));

import { useUserStore } from '~/store/index';

import { GraphQLRole } from '~/interfaces/Role';
import { useState } from 'react';

const GuildCase = ({ caseId }: { caseId: number }) => {
	const user = useUserStore();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [readOnly, setReadOnly] = useState(false);

	return (
		<>
			{user.role === GraphQLRole.user ? (
				<IconButton size="sm" aria-label="Show case" icon={<FiEye />} onClick={onOpen} isDisabled={isOpen} />
			) : (
				<ButtonGroup>
					<IconButton
						size="sm"
						aria-label="Show case"
						icon={<FiEye />}
						onClick={() => {
							setReadOnly(true);
							onOpen();
						}}
						isDisabled={isOpen}
					/>
					<IconButton
						size="sm"
						aria-label="Edit case"
						icon={<FiEdit />}
						onClick={() => {
							setReadOnly(false);
							onOpen();
						}}
						isDisabled={isOpen}
					/>
				</ButtonGroup>
			)}

			<GuildCaseModal caseId={caseId} readOnly={readOnly} isOpen={isOpen} onClose={onClose} />
		</>
	);
};

export default GuildCase;
