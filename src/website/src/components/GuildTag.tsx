import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { IconButton, useDisclosure } from '@chakra-ui/react';
import { FiEdit, FiX } from 'react-icons/fi';

const GuildTagModal = dynamic(() => import('~/components/modals/GuildTag'));

import { useMutationDeleteGuildTag } from '~/hooks/useMutationDeleteGuildTag';

const GuildTag = ({ name }: { name: string }) => {
	const router = useRouter();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { id } = router.query;

	const { mutate: guildTagDeleteMutate, isLoading: isLoadingGuildTagDeleteMutate } = useMutationDeleteGuildTag(
		id as string,
		name,
	);

	return (
		<>
			<IconButton
				mr={2}
				size="sm"
				aria-label="Edit tag"
				icon={<FiEdit />}
				onClick={onOpen}
				isDisabled={isLoadingGuildTagDeleteMutate}
			/>
			<IconButton
				colorScheme="red"
				size="sm"
				aria-label="Delete tag"
				icon={<FiX />}
				onClick={() => guildTagDeleteMutate}
				isDisabled={isLoadingGuildTagDeleteMutate}
			/>

			<GuildTagModal name={name} isOpen={isOpen} onClose={onClose} />
		</>
	);
};

export default GuildTag;
