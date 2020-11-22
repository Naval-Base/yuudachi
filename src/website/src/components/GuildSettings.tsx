import { useRouter } from 'next/router';
import { FormControl, FormLabel, Switch, Text, Input, Button, Box } from '@chakra-ui/react';
import { useForm, UseFormMethods } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { RootState } from '../store';
import { useQueryGuildSettings } from '../hooks/useQueryGuildSettings';
import { useMutationInsertGuildSettings } from '../hooks/useMutationInsertGuildSettings';
import { useMutationUpdateGuildSettings } from '../hooks/useMutationUpdateGuildSettings';
import { GuildSetingsPayload, GuildSettings as IGuildSettings } from '../interfaces/GuildSettings';

const CustomFormControl = ({
	register,
	guildData,
	id,
	label,
	name,
	placeholder = '',
}: {
	register: UseFormMethods['register'];
	guildData: IGuildSettings['data'];
	id: string;
	label: string;
	name: string;
	placeholder?: string;
}) => (
	<FormControl id={id} pb={4}>
		<FormLabel>{label}</FormLabel>
		<Input
			name={name}
			placeholder={placeholder}
			ref={register}
			defaultValue={(guildData.guild![id] as string | null) ?? undefined}
		/>
	</FormControl>
);

const GuildSettings = (props: any) => {
	const user = useSelector((state: RootState) => state.user);
	const router = useRouter();
	const { handleSubmit, register } = useForm<GuildSetingsPayload>({
		defaultValues: {
			prefix: '?',
			moderation: false,
			mod_role_id: null,
			mod_log_channel_id: null,
			guild_log_channel_id: null,
			member_log_channel_id: null,
			mute_role_id: null,
			tag_role_id: null,
			embed_role_id: null,
			emoji_role_id: null,
			reaction_role_id: null,
			role_state: false,
		},
	});
	const { id } = router.query;

	const { data: gqlData, isLoading } = useQueryGuildSettings(id as string, user.loggedIn, props);
	const [guildSettingsInsertMutate, guildSettingsInsertMutateStatus] = useMutationInsertGuildSettings(
		id as string,
		props,
	);
	const [guildSettingsUpdateMutate, guildSettingsUpdateMutateStatus] = useMutationUpdateGuildSettings(
		id as string,
		props,
	);

	async function onInitialize() {
		await guildSettingsInsertMutate();
	}

	async function onSubmit(values: GuildSetingsPayload) {
		const guildSettings: GuildSetingsPayload = {
			...values,
			mod_role_id: values.mod_role_id ?? null,
			mod_log_channel_id: values.mod_log_channel_id ?? null,
			guild_log_channel_id: values.guild_log_channel_id ?? null,
			member_log_channel_id: values.member_log_channel_id ?? null,
			mute_role_id: values.mute_role_id ?? null,
			tag_role_id: values.tag_role_id ?? null,
			embed_role_id: values.embed_role_id ?? null,
			emoji_role_id: values.emoji_role_id ?? null,
			reaction_role_id: values.reaction_role_id ?? null,
		};
		await guildSettingsUpdateMutate(guildSettings);
	}

	return gqlData?.guild ? (
		<form onSubmit={handleSubmit(onSubmit)}>
			<CustomFormControl register={register} guildData={gqlData} id="prefix" label="Prefix" name="prefix" />
			<FormControl id="moderation" pb={4}>
				<FormLabel>Moderation</FormLabel>
				<Switch
					name="moderation"
					ref={register}
					isChecked={gqlData.guild.moderation}
					onChange={handleSubmit(onSubmit)}
				/>
			</FormControl>
			{gqlData.guild.moderation ? (
				<>
					<CustomFormControl
						register={register}
						guildData={gqlData}
						id="mod_role_id"
						label="Moderator Role Id"
						name="mod_role_id"
						placeholder="The discord role id for moderators"
					/>
					<CustomFormControl
						register={register}
						guildData={gqlData}
						id="mod_log_channel_id"
						label="Moderation Log Channel Id"
						name="mod_log_channel_id"
						placeholder="The discord channel id for moderation logs"
					/>
					<CustomFormControl
						register={register}
						guildData={gqlData}
						id="guild_log_channel_id"
						label="Guild Log Channel Id"
						name="guild_log_channel_id"
						placeholder="The discord channel id for guild logs"
					/>
					<CustomFormControl
						register={register}
						guildData={gqlData}
						id="member_log_channel_id"
						label="Member Log Channel Id"
						name="member_log_channel_id"
						placeholder="The discord channel id for member logs"
					/>
					<CustomFormControl
						register={register}
						guildData={gqlData}
						id="mute_role_id"
						label="Mute Role Id"
						name="mute_role_id"
						placeholder="The discord role id for mutes"
					/>
					<CustomFormControl
						register={register}
						guildData={gqlData}
						id="tag_role_id"
						label="Tag Role Id"
						name="tag_role_id"
						placeholder="The discord role id for tag restrictions"
					/>
					<CustomFormControl
						register={register}
						guildData={gqlData}
						id="embed_role_id"
						label="Embed Role Id"
						name="embed_role_id"
						placeholder="The discord role id for embed restrictions"
					/>
					<CustomFormControl
						register={register}
						guildData={gqlData}
						id="emoji_role_id"
						label="Emoji Role Id"
						name="emoji_role_id"
						placeholder="The discord role id for emoji restrictions"
					/>
					<CustomFormControl
						register={register}
						guildData={gqlData}
						id="reaction_role_id"
						label="Reaction Role Id"
						name="reaction_role_id"
						placeholder="The discord role id for reaction restrictions"
					/>
					<FormControl id="role_state" pb={4}>
						<FormLabel>Role State</FormLabel>
						<Switch name="role_state" ref={register} isChecked={gqlData.guild.role_state} />
					</FormControl>
				</>
			) : (
				<></>
			)}

			<Box textAlign="right">
				<Button type="submit" isLoading={guildSettingsUpdateMutateStatus.isLoading} loadingText="Submitting">
					Submit
				</Button>
			</Box>
		</form>
	) : isLoading ? (
		<Text textAlign="center">Loading...</Text>
	) : (
		<Box textAlign="center">
			<Text mb={6}>No guild settings initialized yet.</Text>
			<Button onClick={onInitialize} isLoading={guildSettingsInsertMutateStatus.isLoading} loadingText="Initializing">
				Initialize
			</Button>
		</Box>
	);
};

export default GuildSettings;
