import { FormEvent, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Center, Text, Button, Box, ButtonGroup, FormControl, FormLabel, Select, useToast } from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';

const Loading = dynamic(() => import('./Loading'));

import { useUserStore } from '~/store/index';

import { useQueryGuild } from '~/hooks/useQueryGuild';
import { useQueryGuildRoles } from '~/hooks/useQueryGuildRoles';
import { useQueryGuildChannels } from '~/hooks/useQueryGuildChannels';
import { useQueryGuildModerationSettings } from '~/hooks/useQueryGuildModerationSettings';
import { useMutationInsertGuildModerationSettings } from '~/hooks/useMutationInsertGuildModerationSettings';
import { useMutationUpdateGuildModerationSettings } from '~/hooks/useMutationUpdateGuildModerationSettings';

import { GuildModerationSettingsPayload } from '~/interfaces/GuildSettings';
import { GraphQLRole } from '~/interfaces/Role';

const GuildModerationSettings = () => {
	const user = useUserStore();
	const router = useRouter();
	const toast = useToast();
	const { handleSubmit, control, formState } = useForm<GuildModerationSettingsPayload>();
	const { id } = router.query;

	const { data: gqlGuildData, isLoading: isLoadingGuild } = useQueryGuild(id as string);
	const { data: gqlGuildRolesData, isLoading: isLoadingGuildRoles } = useQueryGuildRoles(
		id as string,
		Boolean(gqlGuildData?.guild),
	);
	const { data: gqlGuildChannelsData, isLoading: isLoadingGuildChannels } = useQueryGuildChannels(
		id as string,
		Boolean(gqlGuildData?.guild),
	);
	const {
		data: gqlGuildModerationSettingsData,
		isLoading: isLoadingGuildModerationSettings,
	} = useQueryGuildModerationSettings(id as string, Boolean(gqlGuildData?.guild) && user.role !== GraphQLRole.user);

	const guildModerationSettingsData = useMemo(() => gqlGuildModerationSettingsData?.guild, [
		gqlGuildModerationSettingsData,
	]);
	const guildRolesData = useMemo(() => gqlGuildRolesData?.roles?.filter((r) => r.id !== id), [gqlGuildRolesData, id]);
	const guildChannelsData = useMemo(() => gqlGuildChannelsData?.channels?.filter((c) => c.type === 0), [
		gqlGuildChannelsData,
	]);

	const {
		mutateAsync: guildModerationSettingsInsertMutate,
		isLoading: isLoadingGuildModerationSettingsInsertMutate,
	} = useMutationInsertGuildModerationSettings(id as string);
	const {
		mutateAsync: guildModerationSettingsUpdateMutate,
		isLoading: isLoadingGuildModerationSettingsUpdateMutate,
	} = useMutationUpdateGuildModerationSettings(id as string);

	const handleOnInitialize = async () => {
		await guildModerationSettingsInsertMutate();

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
			await guildModerationSettingsUpdateMutate(values, {
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

	if (user.role === GraphQLRole.user) {
		return <Text textAlign="center">You need to be a moderator to see the guilds moderation settings.</Text>;
	}

	if (isLoadingGuild || isLoadingGuildRoles || isLoadingGuildChannels || isLoadingGuildModerationSettings) {
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
					defaultValue={guildModerationSettingsData.mod_role_id ?? undefined}
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
					defaultValue={guildModerationSettingsData.mod_log_channel_id ?? undefined}
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
					defaultValue={guildModerationSettingsData.guild_log_channel_id ?? undefined}
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
					defaultValue={guildModerationSettingsData.member_log_channel_id ?? undefined}
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
					defaultValue={guildModerationSettingsData.mute_role_id ?? undefined}
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
					defaultValue={guildModerationSettingsData.embed_role_id ?? undefined}
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
					defaultValue={guildModerationSettingsData.emoji_role_id ?? undefined}
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
					defaultValue={guildModerationSettingsData.reaction_role_id ?? undefined}
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
					defaultValue={guildModerationSettingsData.tag_role_id ?? undefined}
				/>
			</FormControl>

			<ButtonGroup d="flex" justifyContent="flex-end">
				<Button
					type="submit"
					colorScheme="green"
					isLoading={formState.isSubmitting || isLoadingGuildModerationSettingsUpdateMutate}
					loadingText="Submitting"
					isDisabled={isLoadingGuildModerationSettingsUpdateMutate}
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
					isLoading={isLoadingGuildModerationSettingsInsertMutate}
					loadingText="Initializing"
					isDisabled={isLoadingGuildModerationSettingsInsertMutate}
				>
					Initialize
				</Button>
			</Box>
		</>
	);
};

export default GuildModerationSettings;
