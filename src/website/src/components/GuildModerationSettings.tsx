import { FormEvent, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Center, Text, Button, Box, ButtonGroup, FormControl, FormLabel, Select, useToast } from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';

const Loading = dynamic(() => import('./Loading'));

import { useUserStore } from '~/store/index';

import { useQueryGuild } from '~/hooks/useQueryGuild';
import { useQueryGuildChannels } from '~/hooks/useQueryGuildChannels';
import { useQueryGuildSettings } from '~/hooks/useQueryGuildSettings';
import { useMutationInsertGuildSettings } from '~/hooks/useMutationInsertGuildSettings';
import { useMutationUpdateGuildSettings } from '~/hooks/useMutationUpdateGuildSettings';

import { GuildModerationSettingsPayload } from '~/interfaces/GuildSettings';

const GuildModerationSettings = () => {
	const user = useUserStore();
	const router = useRouter();
	const toast = useToast();
	const { handleSubmit, control, formState } = useForm<GuildModerationSettingsPayload>();
	const { id } = router.query;

	const { data: gqlGuildData, isLoading: isLoadingGuild } = useQueryGuild(id as string);
	const { data: gqlGuildChannelsData, isLoading: isLoadingGuildChannels } = useQueryGuildChannels(
		id as string,
		Boolean(gqlGuildData?.guild),
	);
	const { data: gqlGuildSettingsData, isLoading: isLoadingGuildSettings } = useQueryGuildSettings(
		id as string,
		Boolean(gqlGuildData?.guild) && user.guilds?.includes(id as string),
	);

	const guildModerationSettingsData = useMemo(() => gqlGuildSettingsData?.guild, [gqlGuildSettingsData]);
	const guildRolesData = useMemo(() => gqlGuildData?.guild?.roles?.filter((r) => r.id !== id), [gqlGuildData, id]);
	const guildChannelsData = useMemo(() => gqlGuildChannelsData?.channels?.filter((c) => c.type === 0), [
		gqlGuildChannelsData,
	]);

	const {
		mutateAsync: guildSettingsInsertMutate,
		isLoading: isLoadingGuildSettingsInsertMutate,
	} = useMutationInsertGuildSettings(id as string);
	const {
		mutateAsync: guildSettingsUpdateMutate,
		isLoading: isLoadingGuildSettingsUpdateMutate,
	} = useMutationUpdateGuildSettings(id as string);

	const handleOnInitialize = async () => {
		await guildSettingsInsertMutate();

		toast({
			title: 'Guild moderation settings initialized.',
			description: `You successfully initialized the guilds moderation settings.`,
			status: 'success',
			isClosable: true,
			position: 'top',
		});
	};

	const handleOnSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		await handleSubmit(async (values: GuildModerationSettingsPayload) => {
			await guildSettingsUpdateMutate(values, {
				onSuccess: () => {
					toast({
						title: 'Guild moderation settings edited.',
						description: `You successfully edited the guilds moderation settings.`,
						status: 'success',
						isClosable: true,
						position: 'top',
					});
				},
			});
		})(event);
	};

	if (!user.guilds?.includes(id as string)) {
		return <Text textAlign="center">You need to be a moderator to see the guilds moderation settings.</Text>;
	}

	if (!user.loggedIn || isLoadingGuild || isLoadingGuildChannels || isLoadingGuildSettings) {
		return (
			<Center h="100%">
				<Loading />
			</Center>
		);
	}

	return guildModerationSettingsData ? (
		<form onSubmit={handleOnSubmit}>
			<FormControl id="mod_role_id" mb={4}>
				<FormLabel>Moderation role</FormLabel>
				<Controller
					as={
						<Select>
							{guildRolesData?.map((option, i) => (
								<option key={i} value={option.id}>
									&{option.name}
								</option>
							))}
						</Select>
					}
					name="mod_role_id"
					placeholder="The discord role id for moderators"
					control={control}
					defaultValue={guildModerationSettingsData.mod_role_id ?? ''}
				/>
			</FormControl>

			<FormControl id="mod_log_channel_id" mb={4}>
				<FormLabel>Moderation log channel</FormLabel>
				<Controller
					as={
						<Select>
							{guildChannelsData?.map((option, i) => (
								<option key={i} value={option.id}>
									#{option.name}
								</option>
							))}
						</Select>
					}
					name="mod_log_channel_id"
					placeholder="The discord channel id for moderation logs"
					control={control}
					defaultValue={guildModerationSettingsData.mod_log_channel_id ?? ''}
				/>
			</FormControl>

			<FormControl id="guild_log_channel_id" mb={4}>
				<FormLabel>Guild log channel</FormLabel>
				<Controller
					as={
						<Select>
							{guildChannelsData?.map((option, i) => (
								<option key={i} value={option.id}>
									#{option.name}
								</option>
							))}
						</Select>
					}
					name="guild_log_channel_id"
					placeholder="The discord channel id for guild logs"
					control={control}
					defaultValue={guildModerationSettingsData.guild_log_channel_id ?? ''}
				/>
			</FormControl>

			<FormControl id="member_log_channel_id" mb={4}>
				<FormLabel>Member log channel</FormLabel>
				<Controller
					as={
						<Select>
							{guildChannelsData?.map((option, i) => (
								<option key={i} value={option.id}>
									#{option.name}
								</option>
							))}
						</Select>
					}
					name="member_log_channel_id"
					placeholder="The discord channel id for member logs"
					control={control}
					defaultValue={guildModerationSettingsData.member_log_channel_id ?? ''}
				/>
			</FormControl>

			<FormControl id="mute_role_id" mb={4}>
				<FormLabel>Mute restriction role</FormLabel>
				<Controller
					as={
						<Select>
							{guildRolesData?.map((option, i) => (
								<option key={i} value={option.id}>
									&{option.name}
								</option>
							))}
						</Select>
					}
					name="mute_role_id"
					placeholder="The discord role id for mutes"
					control={control}
					defaultValue={guildModerationSettingsData.mute_role_id ?? ''}
				/>
			</FormControl>

			<FormControl id="embed_role_id" mb={4}>
				<FormLabel>Embed restriction role</FormLabel>
				<Controller
					as={
						<Select>
							{guildRolesData?.map((option, i) => (
								<option key={i} value={option.id}>
									&{option.name}
								</option>
							))}
						</Select>
					}
					name="embed_role_id"
					placeholder="The discord role id for embed restrictions"
					control={control}
					defaultValue={guildModerationSettingsData.embed_role_id ?? ''}
				/>
			</FormControl>

			<FormControl id="emoji_role_id" mb={4}>
				<FormLabel>Emoji restriction role</FormLabel>
				<Controller
					as={
						<Select>
							{guildRolesData?.map((option, i) => (
								<option key={i} value={option.id}>
									&{option.name}
								</option>
							))}
						</Select>
					}
					name="emoji_role_id"
					placeholder="The discord role id for emoji restrictions"
					control={control}
					defaultValue={guildModerationSettingsData.emoji_role_id ?? ''}
				/>
			</FormControl>

			<FormControl id="reaction_role_id" mb={4}>
				<FormLabel>Reaction restriction role</FormLabel>
				<Controller
					as={
						<Select>
							{guildRolesData?.map((option, i) => (
								<option key={i} value={option.id}>
									&{option.name}
								</option>
							))}
						</Select>
					}
					name="reaction_role_id"
					placeholder="The discord role id for reaction restrictions"
					control={control}
					defaultValue={guildModerationSettingsData.reaction_role_id ?? ''}
				/>
			</FormControl>

			<FormControl id="tag_role_id" mb={4}>
				<FormLabel>Tag restriction role</FormLabel>
				<Controller
					as={
						<Select>
							{guildRolesData?.map((option, i) => (
								<option key={i} value={option.id}>
									&{option.name}
								</option>
							))}
						</Select>
					}
					name="tag_role_id"
					placeholder="The discord role id for tag restrictions"
					control={control}
					defaultValue={guildModerationSettingsData.tag_role_id ?? ''}
				/>
			</FormControl>

			<ButtonGroup d="flex" justifyContent="flex-end">
				<Button
					type="submit"
					colorScheme="green"
					isLoading={formState.isSubmitting || isLoadingGuildSettingsUpdateMutate}
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
				<Text mb={6}>No guild moderation settings initialized yet.</Text>
			</Box>
			<Box textAlign="center">
				<Button
					colorScheme="green"
					onClick={handleOnInitialize}
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

export default GuildModerationSettings;
