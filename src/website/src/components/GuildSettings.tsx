import { FormEvent, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
	Center,
	Text,
	Button,
	Box,
	ButtonGroup,
	FormControl,
	FormLabel,
	Input,
	FormErrorMessage,
	FormErrorIcon,
	useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

const Loading = dynamic(() => import('./Loading'));

import { useUserStore } from '~/store/index';

import type { GuildSettingsPayload } from '~/interfaces/GuildSettings';

import { useQueryGuild } from '~/hooks/useQueryGuild';
import { useQueryGuildSettings } from '~/hooks/useQueryGuildSettings';
import { useMutationInsertGuildSettings } from '~/hooks/useMutationInsertGuildSettings';
import { useMutationUpdateGuildSettings } from '~/hooks/useMutationUpdateGuildSettings';

const GuildSettings = () => {
	const user = useUserStore();
	const router = useRouter();
	const toast = useToast();
	const {
		handleSubmit,
		register,
		formState: { errors, isSubmitting },
	} = useForm<GuildSettingsPayload>({
		defaultValues: {
			prefix: '?',
		},
	});

	const { id } = router.query;
	const moderator = user.guilds?.find((moderators) => moderators.guild_id === (id as string));
	const isModerator = Boolean(moderator);
	const canManage = moderator?.manage;

	const { data: gqlDataGuild, isLoading: isLoadingGuild } = useQueryGuild(id as string);
	const { data: gqlGuildSettingsData, isLoading: isLoadingGuildSettings } = useQueryGuildSettings(
		id as string,
		Boolean(gqlDataGuild?.guild) && isModerator,
	);

	const guildSettingsData = useMemo(() => gqlGuildSettingsData?.guild, [gqlGuildSettingsData]);

	const { mutateAsync: guildSettingsInsertMutate, isLoading: isLoadingGuildSettingsInsertMutate } =
		useMutationInsertGuildSettings(id as string);
	const { mutateAsync: guildSettingsUpdateMutate, isLoading: isLoadingGuildSettingsUpdateMutate } =
		useMutationUpdateGuildSettings(id as string);

	const handleOnInitialize = async () => {
		await guildSettingsInsertMutate();

		toast({
			title: 'Guild settings initialized.',
			description: `You successfully initialized the guild settings.`,
			status: 'success',
			isClosable: true,
			position: 'top',
		});
	};

	const handleOnSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		await handleSubmit(async (values: GuildSettingsPayload) => {
			await guildSettingsUpdateMutate(values, {
				onSuccess: () => {
					toast({
						title: 'Guild settings edited.',
						description: `You successfully edited the guild settings.`,
						status: 'success',
						isClosable: true,
						position: 'top',
					});
				},
			});
		})(event);
	};

	if (!isModerator) {
		return <Text textAlign="center">You need to be a moderator to see the guild settings.</Text>;
	}

	if (!user.loggedIn || isLoadingGuild || isLoadingGuildSettings) {
		return (
			<Center h="100%">
				<Loading />
			</Center>
		);
	}

	return guildSettingsData ? (
		<form onSubmit={handleOnSubmit}>
			<FormControl id="prefix" mb={4} isInvalid={Boolean(errors.prefix)}>
				<FormLabel>Prefix</FormLabel>
				<Input
					{...register('prefix', {
						required: { value: true, message: 'No empty prefix allowed' },
						maxLength: { value: 5, message: 'Max length of 5 exceeded' },
					})}
					placeholder="Guild prefix"
					defaultValue={guildSettingsData.prefix}
					isDisabled={!canManage}
				/>
				<FormErrorMessage>
					<FormErrorIcon />
					{errors.prefix?.message}
				</FormErrorMessage>
			</FormControl>

			<ButtonGroup d="flex" justifyContent="flex-end">
				<Button
					type="submit"
					colorScheme="green"
					isLoading={isSubmitting || isLoadingGuildSettingsUpdateMutate}
					loadingText="Submitting"
					isDisabled={!canManage || isSubmitting || isLoadingGuildSettingsUpdateMutate}
				>
					Submit
				</Button>
			</ButtonGroup>
		</form>
	) : (
		<>
			<Box textAlign="center">
				<Text mb={6}>No guild settings initialized yet.</Text>
			</Box>
			<Box textAlign="center">
				<Button
					colorScheme="green"
					onClick={handleOnInitialize}
					isLoading={isLoadingGuildSettingsInsertMutate}
					loadingText="Initializing"
					isDisabled={!canManage || isLoadingGuildSettingsInsertMutate}
				>
					Initialize
				</Button>
			</Box>
		</>
	);
};

export default GuildSettings;
