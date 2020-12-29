import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { IconButton, useDisclosure } from '@chakra-ui/react';
import { FiEye, FiEdit, FiX } from 'react-icons/fi';

const GuildTagModal = dynamic(() => import('~/components/modals/GuildTag'));

import { useUserStore } from '~/store/index';

import { GraphQLRole } from '~/interfaces/Role';

import { useMutationDeleteGuildTag } from '~/hooks/useMutationDeleteGuildTag';

const GuildTag = ({ name }: { name: string }) => {
	const user = useUserStore();
	const router = useRouter();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { id } = router.query;

	const { mutate: guildTagDeleteMutate, isLoading: isLoadingGuildTagDeleteMutate } = useMutationDeleteGuildTag(
		id as string,
		name,
	);

	return (
		<>
			{user.role === GraphQLRole.user ? (
				<IconButton
					mr={2}
					size="sm"
					aria-label="Show tag"
					icon={<FiEye />}
					onClick={onOpen}
					isDisabled={isOpen || isLoadingGuildTagDeleteMutate}
				/>
			) : (
				<>
					<IconButton
						mr={2}
						size="sm"
						aria-label="Edit tag"
						icon={<FiEdit />}
						onClick={onOpen}
						isDisabled={isOpen || isLoadingGuildTagDeleteMutate}
					/>
					<IconButton
						colorScheme="red"
						size="sm"
						aria-label="Delete tag"
						icon={<FiX />}
						onClick={() => guildTagDeleteMutate()}
						isLoading={isLoadingGuildTagDeleteMutate}
						isDisabled={isOpen || isLoadingGuildTagDeleteMutate}
					/>
				</>
			)}

			<GuildTagModal name={name} isOpen={isOpen} onClose={onClose} />
		</>
	);
};

export default GuildTag;
