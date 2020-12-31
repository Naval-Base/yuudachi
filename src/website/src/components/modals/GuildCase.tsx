import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { CaseAction } from '@yuudachi/types';
import {
	Box,
	Text,
	Button,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	FormControl,
	FormLabel,
	Textarea,
	Center,
	ButtonGroup,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
} from '@chakra-ui/react';
import TextareaAutosize from 'react-autosize-textarea';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const Loading = dynamic(() => import('../Loading'));

import { useUserStore } from '~/store/index';

import { GuildTagPayload } from '~/interfaces/GuildTags';
import { GraphQLRole } from '~/interfaces/Role';

import { useQueryGuildCase } from '~/hooks/useQueryGuildCase';
import { useQueryGuildRoles } from '~/hooks/useQueryGuildRoles';
import { useMutationUpdateGuildCase } from '~/hooks/useMutationUpdateGuildCase';
import { GuildCasePayload } from '~/interfaces/GuildCases';
import { DATE_FORMAT_WITH_SECONDS } from 'src/Constants';
import { useQueryUser } from '~/hooks/useQueryUser';

const GuildCase = ({
	caseId,
	readOnly,
	isOpen,
	onClose,
}: {
	caseId?: number;
	readOnly: boolean;
	isOpen: boolean;
	onClose: () => void;
}) => {
	const user = useUserStore();
	const router = useRouter();
	const { handleSubmit, register } = useForm<GuildTagPayload>();

	const { id } = router.query;

	const { data: gqlGuildCaseData, isLoading: isLoadingGuildCase } = useQueryGuildCase(
		id as string,
		caseId!,
		Boolean(caseId) && isOpen,
	);
	const { data: gqlGuildRolesData } = useQueryGuildRoles(id as string, isOpen);
	const { data: gqlUserData } = useQueryUser(user.id!, Boolean(gqlGuildCaseData?.case.mod_id));
	const { mutateAsync: guildCaseUpdateMutate, isLoading: isLoadingGuildCaseUpdateMutate } = useMutationUpdateGuildCase(
		id as string,
		caseId!,
	);

	async function onSubmit(values: { reference: number; reason: string }) {
		const { reference, ...rest } = values;
		let payload: GuildCasePayload = {
			...rest,
			ref_id: reference,
		};

		if (!gqlGuildCaseData?.case.mod_id) {
			if (gqlUserData) {
				payload = {
					...payload,
					mod_id: user.id!,
					mod_tag: `${gqlUserData.user.username as string}#${gqlUserData.user.discriminator as string}`,
				};
			}
		}

		await guildCaseUpdateMutate(payload);
	}

	return (
		<Modal size="xl" isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>
					Case {gqlGuildCaseData ? `#${gqlGuildCaseData.case.case_id.toString() as string}` : ''}
				</ModalHeader>
				<ModalCloseButton />
				{isLoadingGuildCase ? (
					<Center h="100%">
						<Loading />
					</Center>
				) : (
					<>
						<ModalBody>
							<form id="guild-case-modal" onSubmit={handleSubmit(onSubmit)}>
								<Box pb={4}>
									<FormLabel as="legend">Created at</FormLabel>
									<Text>
										{dayjs(gqlGuildCaseData?.case.created_at).format(DATE_FORMAT_WITH_SECONDS)} (UTC) (
										{dayjs(gqlGuildCaseData?.case.created_at).fromNow()})
									</Text>
								</Box>

								<FormControl id="reference" pb={4} isReadOnly={readOnly || user.role === GraphQLRole.user}>
									<FormLabel>Reference</FormLabel>
									<NumberInput
										defaultValue={gqlGuildCaseData?.case.ref_id ?? undefined}
										isReadOnly={readOnly || user.role === GraphQLRole.user}
									>
										<NumberInputField name="reference" ref={register} />
										<NumberInputStepper>
											<NumberIncrementStepper />
											<NumberDecrementStepper />
										</NumberInputStepper>
									</NumberInput>
								</FormControl>

								<Box pb={4}>
									<FormLabel as="legend">Action</FormLabel>
									<Text>
										{CaseAction[gqlGuildCaseData?.case.action ?? 0][0].toUpperCase() +
											CaseAction[gqlGuildCaseData?.case.action ?? 0].substr(1).toLowerCase()}
									</Text>
								</Box>

								{gqlGuildCaseData?.case.role_id ? (
									<Box pb={4}>
										<FormLabel as="legend">Role</FormLabel>
										<Text>
											{gqlGuildRolesData?.roles?.find((role) => role.id === gqlGuildCaseData.case.role_id)?.name} (
											{gqlGuildRolesData?.roles?.find((role) => role.id === gqlGuildCaseData.case.role_id)?.id})
										</Text>
									</Box>
								) : null}

								{gqlGuildCaseData?.case.action_processed ? null : (
									<Box pb={4}>
										<FormLabel as="legend">Expires in</FormLabel>
										<Text>{dayjs(gqlGuildCaseData?.case.action_expiration ?? undefined).fromNow(true)}</Text>
									</Box>
								)}

								<Box pb={4}>
									<FormLabel as="legend">Moderator</FormLabel>
									<Text>{`${gqlGuildCaseData?.case.mod_tag as string} (${
										gqlGuildCaseData?.case.mod_id as string
									})`}</Text>
								</Box>

								<Box pb={4}>
									<FormLabel as="legend">Target</FormLabel>
									<Text>{`${gqlGuildCaseData?.case.target_tag as string} (${
										gqlGuildCaseData?.case.target_id as string
									})`}</Text>
								</Box>

								<FormControl id="reason" pb={4} isReadOnly={readOnly || user.role === GraphQLRole.user}>
									<FormLabel>Reason</FormLabel>
									<Textarea
										minH="unset"
										overflow="hidden"
										resize="none"
										name="reason"
										transition="height none"
										rows={5}
										ref={register}
										as={TextareaAutosize as any /* fuck ts */}
										defaultValue={gqlGuildCaseData?.case.reason ?? undefined}
									/>
								</FormControl>
							</form>
						</ModalBody>
						<ModalFooter>
							<ButtonGroup>
								<Button
									type="submit"
									form="guild-case-modal"
									colorScheme="green"
									onClick={onClose}
									isLoading={isLoadingGuildCaseUpdateMutate}
									loadingText="Submitting"
									isDisabled={readOnly || user.role === GraphQLRole.user}
								>
									Submit
								</Button>
								<Button onClick={onClose}>Close</Button>
							</ButtonGroup>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
};

export default GuildCase;
