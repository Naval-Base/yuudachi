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

import { useQueryGuildSettings } from '~/hooks/useQueryGuildSettings';
import { useMutationInsertGuildSettings } from '~/hooks/useMutationInsertGuildSettings';
import { useMutationUpdateGuildSettings } from '~/hooks/useMutationUpdateGuildSettings';

import { GuildSettingsPayload } from '~/interfaces/GuildSettings';
import { GraphQLRole } from '~/interfaces/Role';

const GuildSettings = () => {
	const user = useUserStore();
	const router = useRouter();
	const toast = useToast();
	const { handleSubmit, register, errors, formState } = useForm<GuildSettingsPayload>({
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

		toast({
			title: 'Guild settings initialized.',
			description: `You successfully initialized the guild settings.`,
			status: 'success',
			isClosable: true,
			position: 'top',
		});
	}

	async function onSubmit(values: GuildSettingsPayload) {
		await guildSettingsUpdateMutate(values);

		toast({
			title: 'Guild settings edited.',
			description: `You successfully edited the guild settings.`,
			status: 'success',
			isClosable: true,
			position: 'top',
		});
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
			<FormControl id="prefix" pb={4} isInvalid={Boolean(errors.prefix)}>
				<FormLabel>Prefix</FormLabel>
				<Input
					name="prefix"
					placeholder="Guild prefix"
					ref={register({
						required: { value: true, message: 'No empty prefix allowed' },
						maxLength: { value: 5, message: 'Max length of 5 exceeded' },
					})}
					defaultValue={gqlGuildSettingsData.guild.prefix}
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
