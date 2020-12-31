import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Center, Text, Button, Box, ButtonGroup } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

const Loading = dynamic(() => import('./Loading'));
const GuildSettingsFormControl = dynamic(() => import('./GuildSettingsFormControl'));

import { useUserStore } from '~/store/index';

import { useQueryGuildSettings } from '~/hooks/useQueryGuildSettings';
import { useMutationInsertGuildSettings } from '~/hooks/useMutationInsertGuildSettings';
import { useMutationUpdateGuildSettings } from '~/hooks/useMutationUpdateGuildSettings';

import { GuildSettingsPayload } from '~/interfaces/GuildSettings';
import { GraphQLRole } from '~/interfaces/Role';

const GuildSettings = () => {
	const user = useUserStore();
	const router = useRouter();
	const { handleSubmit, register } = useForm<GuildSettingsPayload>({
		defaultValues: {
			prefix: '?',
		},
	});
	const { id } = router.query;

	const { data: gqlGuildSettingsData, isLoading: isLoadingGuildSettings } = useQueryGuildSettings(
		id as string,
		user.role !== GraphQLRole.user,
	);
	const {
		mutateAsync: guildSettingsInsertMutate,
		isLoading: isLoadingGuildSettingsInsertMutate,
	} = useMutationInsertGuildSettings(id as string);
	const {
		mutateAsync: guildSettingsUpdateMutate,
		isLoading: isLoadingGuildSettingsUpdateMutate,
	} = useMutationUpdateGuildSettings(id as string);

	async function onInitialize() {
		await guildSettingsInsertMutate();
	}

	async function onSubmit(values: GuildSettingsPayload) {
		await guildSettingsUpdateMutate(values);
	}

	if (user.role === GraphQLRole.user) {
		return <Text textAlign="center">You need to be a moderator to see the guild settings.</Text>;
	}

	if (isLoadingGuildSettings) {
		return (
			<Center h="100%">
				<Loading />
			</Center>
		);
	}

	return gqlGuildSettingsData?.guild ? (
		<form onSubmit={handleSubmit(onSubmit)}>
			<GuildSettingsFormControl
				register={register}
				guildData={gqlGuildSettingsData}
				id="prefix"
				label="Prefix"
				name="prefix"
			/>
			<ButtonGroup d="flex" justifyContent="flex-end">
				<Button
					type="submit"
					colorScheme="green"
					isLoading={isLoadingGuildSettingsUpdateMutate}
					loadingText="Submitting"
					isDisabled={isLoadingGuildSettingsUpdateMutate}
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
					onClick={onInitialize}
					isLoading={isLoadingGuildSettingsInsertMutate}
					loadingText="Initializing"
					isDisabled={isLoadingGuildSettingsInsertMutate}
				>
					Initialize
				</Button>
			</Box>
		</>
	);
};

export default GuildSettings;
