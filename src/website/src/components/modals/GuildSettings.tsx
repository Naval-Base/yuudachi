import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
	Text,
	Button,
	Box,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';

const Loading = dynamic(() => import('../Loading'));
const GuildSettingsFormControl = dynamic(() => import('../GuildSettingsFormControl'));

import { RootState } from '~/store/index';

import { useQueryGuildSettings } from '~/hooks/useQueryGuildSettings';
import { useMutationInsertGuildSettings } from '~/hooks/useMutationInsertGuildSettings';
import { useMutationUpdateGuildSettings } from '~/hooks/useMutationUpdateGuildSettings';

import { GuildSettingsPayload } from '~/interfaces/GuildSettings';
import { GraphQLRole } from '~/interfaces/Role';

const GuildSettings = (props: any) => {
	const user = useSelector((state: RootState) => state.user);
	const router = useRouter();
	const { handleSubmit, register } = useForm<GuildSettingsPayload>({
		defaultValues: {
			prefix: '?',
		},
	});
	const { id } = router.query;

	const { data: gqlGuildSettingsData, isLoading: isLoadingGuildSettings } = useQueryGuildSettings(
		id as string,
		user.loggedIn && props.isOpen,
		props,
	);
	const {
		mutateAsync: guildSettingsInsertMutate,
		isLoading: isLoadingGuildSettingsInsertMutate,
	} = useMutationInsertGuildSettings(id as string, props);
	const {
		mutateAsync: guildSettingsUpdateMutate,
		isLoading: isLoadingGuildSettingsUpdateMutate,
	} = useMutationUpdateGuildSettings(id as string, props);

	async function onInitialize() {
		await guildSettingsInsertMutate();
	}

	async function onSubmit(values: GuildSettingsPayload) {
		await guildSettingsUpdateMutate(values);
	}

	return (
		<Modal size="lg" isOpen={props.isOpen} onClose={props.onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Guild Settings</ModalHeader>
				<ModalCloseButton />
				{isLoadingGuildSettings ? (
					<Loading />
				) : gqlGuildSettingsData?.guild ? (
					<form onSubmit={handleSubmit(onSubmit)}>
						<ModalBody>
							<GuildSettingsFormControl
								register={register}
								guildData={gqlGuildSettingsData}
								id="prefix"
								label="Prefix"
								name="prefix"
							/>
						</ModalBody>
						<ModalFooter>
							<Button
								type="submit"
								colorScheme="green"
								mr={3}
								onClick={props.onClose}
								isLoading={isLoadingGuildSettingsUpdateMutate}
								loadingText="Submitting"
							>
								Submit
							</Button>
							<Button onClick={props.onClose}>Close</Button>
						</ModalFooter>
					</form>
				) : (
					<>
						<ModalBody>
							<Box textAlign="center">
								<Text mb={6}>No guild settings initialized yet.</Text>
							</Box>
						</ModalBody>
						<ModalFooter justifyContent="center">
							<Button
								colorScheme="green"
								onClick={onInitialize}
								isLoading={isLoadingGuildSettingsInsertMutate}
								loadingText="Initializing"
								disabled={user.role === GraphQLRole.user}
							>
								Initialize
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
};

export default GuildSettings;
