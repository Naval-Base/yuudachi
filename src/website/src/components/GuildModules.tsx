import { ChangeEvent, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useToast, Center, Grid, Box, Text } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { CommandModules } from '@yuudachi/types';

const Loading = dynamic(() => import('./Loading'));
const GuildModule = dynamic(() => import('./GuildModule'));

import { useUserStore } from '~/store/index';

import { useQueryGuildSettings } from '~/hooks/useQueryGuildSettings';
import { useMutationUpdateGuildSettings } from '~/hooks/useMutationUpdateGuildSettings';

import { GuildModulesPayload } from '~/interfaces/GuildSettings';

const GuildModules = () => {
	const user = useUserStore();
	const router = useRouter();
	const toast = useToast();
	const { handleSubmit, control, formState } = useForm<GuildModulesPayload>();
	const { id } = router.query;

	const CommandModulesInfo = useMemo(
		() => [
			{
				name: CommandModules[CommandModules.Config],
				perm: CommandModules.Config,
				description: 'Configuration commands.',
			},
			{
				name: CommandModules[CommandModules.Utility],
				perm: CommandModules.Utility,
				description: 'Utility commands.',
			},
			{
				name: CommandModules[CommandModules.Moderation],
				perm: CommandModules.Moderation,
				description: 'Moderation commands.',
				settings: `/guilds/${id as string}/modules/moderation`,
			},
			{
				name: CommandModules[CommandModules.Tags],
				perm: CommandModules.Tags,
				description: 'Tag commands.',
			},
		],
		[id],
	);

	const { data: gqlGuildSettingsData, isLoading: isLoadingGuildSettings } = useQueryGuildSettings(
		id as string,
		user.guilds?.includes(id as string),
	);

	const guildSettingsData = useMemo(() => gqlGuildSettingsData, [gqlGuildSettingsData]);

	const {
		mutateAsync: guildSettingsUpdateMutate,
		isLoading: isLoadingGuildSettingsUpdateMutate,
	} = useMutationUpdateGuildSettings(id as string);

	const handleOnSubmit = async (event: ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		await handleSubmit(async (values: Record<CommandModules, boolean>) => {
			const payload = {
				modules: Object.entries(values).reduce(
					(acc, [key, value]) => (value ? acc | Number(key) : acc & ~Number(key)),
					guildSettingsData?.guild?.modules ?? 2,
				),
			};

			await guildSettingsUpdateMutate(payload, {
				onSuccess: () => {
					toast({
						title: 'Guild modules edited.',
						description: `You successfully edited the guild modules.`,
						status: 'success',
						isClosable: true,
						position: 'top',
					});
				},
			});
		})(event);
	};

	if (!user.guilds?.includes(id as string)) {
		return <Text textAlign="center">You need to be a moderator to see the guild modules.</Text>;
	}

	if (!user.loggedIn || isLoadingGuildSettings) {
		return (
			<Center h="100%">
				<Loading />
			</Center>
		);
	}

	return guildSettingsData?.guild ? (
		<Grid templateColumns="repeat(auto-fit, minmax(280px, 350px))" gap="16px" justifyContent="center" mb={16}>
			{CommandModulesInfo.map((commandModule, i) => (
				<Box key={i}>
					<GuildModule
						guildModule={commandModule}
						control={control}
						gqlGuildSettingsData={guildSettingsData}
						handleOnSubmit={handleOnSubmit}
						isLoading={formState.isSubmitting || isLoadingGuildSettings || isLoadingGuildSettingsUpdateMutate}
					/>
				</Box>
			))}
		</Grid>
	) : null;
};

export default GuildModules;
