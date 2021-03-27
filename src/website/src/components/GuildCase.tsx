import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { ButtonGroup, IconButton, useDisclosure } from '@chakra-ui/react';
import { FiEye, FiEdit } from 'react-icons/fi';

const GuildCaseModal = dynamic(() => import('~/components/modals/GuildCase'));

import { useUserStore } from '~/store/index';

const GuildCase = ({ caseId }: { caseId: number }) => {
	const user = useUserStore();
	const router = useRouter();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [readOnly, setReadOnly] = useState(false);
	const { id } = router.query;
	const isModerator = user.guilds?.some((moderators) => moderators.guild_id === (id as string));

	return (
		<>
			{isModerator ? (
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
			) : (
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
			)}

			<GuildCaseModal caseId={caseId} readOnly={readOnly} isOpen={isOpen} onClose={onClose} />
		</>
	);
};

export default GuildCase;
