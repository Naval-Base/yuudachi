import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { ButtonGroup, IconButton, useDisclosure, useToast } from '@chakra-ui/react';
import { FiEye, FiEdit, FiX } from 'react-icons/fi';

const GuildTagModal = dynamic(() => import('~/components/modals/GuildTag'));

import { useUserStore } from '~/store/index';

import { useMutationDeleteGuildTag } from '~/hooks/useMutationDeleteGuildTag';

const GuildTag = ({ name }: { name: string }) => {
	const user = useUserStore();
	const router = useRouter();
	const toast = useToast();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { id } = router.query;
	const isModerator = user.guilds?.some((moderators) => moderators.guild_id === (id as string));

	const { mutateAsync: guildTagDeleteMutate, isLoading: isLoadingGuildTagDeleteMutate } = useMutationDeleteGuildTag(
		id as string,
		name,
	);

	const handleOnClick = async () => {
		toast({
			title: 'Tag deleted.',
			description: `You successfully deleted the tag.`,
			status: 'success',
			isClosable: true,
			position: 'top',
		});
		await guildTagDeleteMutate();
	};

	return (
		<>
			{isModerator ? (
				<ButtonGroup>
					<IconButton
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
						onClick={handleOnClick}
						isLoading={isLoadingGuildTagDeleteMutate}
						isDisabled={isOpen || isLoadingGuildTagDeleteMutate}
					/>
				</ButtonGroup>
			) : (
				<IconButton
					size="sm"
					aria-label="Show tag"
					icon={<FiEye />}
					onClick={onOpen}
					isDisabled={isOpen || isLoadingGuildTagDeleteMutate}
				/>
			)}

			<GuildTagModal name={name} isOpen={isOpen} onClose={onClose} />
		</>
	);
};

export default GuildTag;
