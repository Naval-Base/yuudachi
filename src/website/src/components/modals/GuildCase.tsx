import { FormEvent, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Controller, useForm } from 'react-hook-form';
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
	useToast,
	FormErrorMessage,
	FormErrorIcon,
} from '@chakra-ui/react';
import TextareaAutosize from 'react-autosize-textarea';
import DatePicker from '~/components/DatePicker';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const Loading = dynamic(() => import('../Loading'));
const GuildCaseReference = dynamic(() => import('~/components/GuildCaseReference'));

import { useUserStore } from '~/store/index';

import type { GuildCasePayload } from '~/interfaces/GuildCases';

import { useQueryGuildCase } from '~/hooks/useQueryGuildCase';
import { useQueryGuildRoles } from '~/hooks/useQueryGuildRoles';
import { useQueryUser } from '~/hooks/useQueryUser';
import { useMutationUpdateGuildCase } from '~/hooks/useMutationUpdateGuildCase';

import { DATE_FORMAT_WITH_SECONDS } from '../../Constants';

const GuildCase = ({
	caseId,
	readOnly = false,
	isOpen,
	onClose,
}: {
	caseId?: number;
	readOnly?: boolean;
	isOpen: boolean;
	onClose: () => void;
}) => {
	const user = useUserStore();
	const router = useRouter();
	const toast = useToast();
	const {
		handleSubmit,
		register,
		control,
		formState: { errors, isSubmitting },
	} = useForm<GuildCasePayload>();

	const [expirationTime, setExpirationTime] = useState<string | null>(null);
	const { id } = router.query;
	const isModerator = user.guilds?.some((moderators) => moderators.guild_id === (id as string));

	const { data: gqlGuildCaseData, isLoading: isLoadingGuildCase } = useQueryGuildCase(
		id as string,
		caseId!,
		Boolean(caseId) && isOpen,
	);
	const { data: gqlGuildRolesData } = useQueryGuildRoles(id as string, isOpen);
	const { data: gqlUserData } = useQueryUser(user.id!, !Boolean(gqlGuildCaseData?.case.mod_id) && isOpen);

	const guildCaseData = useMemo(() => gqlGuildCaseData, [gqlGuildCaseData]);
	const guildRolesData = useMemo(() => gqlGuildRolesData, [gqlGuildRolesData]);
	const userData = useMemo(() => gqlUserData, [gqlUserData]);

	const { mutateAsync: guildCaseUpdateMutate, isLoading: isLoadingGuildCaseUpdateMutate } = useMutationUpdateGuildCase(
		id as string,
		caseId!,
	);

	useEffect(() => {
		if (isOpen) {
			setExpirationTime(guildCaseData?.case.action_expiration ?? null);
		}
	}, [isOpen, guildCaseData?.case.action_expiration]);

	const handleOnSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		await handleSubmit(async (values: { action_expiration: Date | null; ref_id: string; reason: string }) => {
			const { ref_id, action_expiration, ...rest } = values;
			let payload: GuildCasePayload = {
				...rest,
				ref_id: ref_id ? Number(ref_id) : null,
				action_expiration: action_expiration?.toISOString() ?? null,
			};

			if (!guildCaseData?.case.mod_id) {
				if (userData) {
					payload = {
						...payload,
						mod_id: user.id!,
						mod_tag: `${userData.user.username as string}#${userData.user.discriminator as string}`,
					};
				}
			}

			await guildCaseUpdateMutate(payload, {
				onSuccess: () => {
					toast({
						title: 'Case edited.',
						description: `You successfully edited the case.`,
						status: 'success',
						isClosable: true,
						position: 'top',
					});
				},
			});

			onClose();
		})(event);
	};

	return (
		<Modal size="xl" isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Case {guildCaseData ? `#${guildCaseData.case.case_id.toString()}` : ''}</ModalHeader>
				<ModalCloseButton />
				{isLoadingGuildCase ? (
					<Center h="100%">
						<Loading />
					</Center>
				) : (
					<>
						<ModalBody>
							<form id="guild-case-modal" onSubmit={handleOnSubmit}>
								<Box mb={4}>
									<FormLabel as="legend">Created at</FormLabel>
									<Text>
										{dayjs(guildCaseData?.case.created_at).format(DATE_FORMAT_WITH_SECONDS)} (UTC) (
										{dayjs(guildCaseData?.case.created_at).fromNow()})
									</Text>
								</Box>

								<FormControl id="reference" mb={4} isReadOnly={readOnly || !isModerator}>
									<FormLabel>Reference</FormLabel>
									<Box d="flex">
										<NumberInput
											d="inline-block"
											mr={2}
											w={'100%'}
											defaultValue={guildCaseData?.case.ref_id ?? undefined}
											isReadOnly={readOnly || !isModerator}
										>
											<NumberInputField {...register('ref_id')} />
											<NumberInputStepper>
												<NumberIncrementStepper />
												<NumberDecrementStepper />
											</NumberInputStepper>
										</NumberInput>
										{guildCaseData?.case.ref_id ? (
											<Box d="inline-block">
												<GuildCaseReference caseId={guildCaseData.case.ref_id} size="md" />
											</Box>
										) : null}
									</Box>
								</FormControl>

								<Box mb={4}>
									<FormLabel as="legend">Action</FormLabel>
									<Text>
										{CaseAction[guildCaseData?.case.action ?? 0][0].toUpperCase() +
											CaseAction[guildCaseData?.case.action ?? 0].substr(1).toLowerCase()}
									</Text>
								</Box>

								{guildCaseData?.case.role_id ? (
									<Box mb={4}>
										<FormLabel as="legend">Role</FormLabel>
										<Text>
											{guildRolesData?.roles?.find((role) => role.id === guildCaseData.case.role_id)?.name} (
											{guildRolesData?.roles?.find((role) => role.id === guildCaseData.case.role_id)?.id})
										</Text>
									</Box>
								) : null}

								{guildCaseData?.case.action_expiration ? (
									<>
										<Box mb={4}>
											<FormLabel as="legend">Expiration</FormLabel>
											<Controller
												name="action_expiration"
												control={control}
												defaultValue={dayjs(guildCaseData.case.action_expiration).toDate() as unknown as string}
												render={(props: any) => (
													<DatePicker
														selectedDate={props.value}
														onChange={(d) => {
															if (isOpen) {
																setExpirationTime(d);
															}
															props.onChange(d);
														}}
														filterDate={(date) => dayjs(date).add(1, 'd') > dayjs(guildCaseData.case.created_at)}
														filterTime={(time) => {
															if (expirationTime) {
																if (dayjs(expirationTime).isSame(dayjs(), 'd')) {
																	return dayjs(time).add(-10, 'm') > dayjs(guildCaseData.case.created_at);
																}
																return dayjs(expirationTime).isAfter(dayjs(guildCaseData.case.created_at), 'd');
															}
															return false;
														}}
														isReadOnly={readOnly || !isModerator}
														isDisabled={guildCaseData.case.action_processed}
													/>
												)}
											/>
										</Box>

										<Box mb={4}>
											<FormLabel as="legend">Duration</FormLabel>
											<Text>
												{dayjs(guildCaseData.case.action_expiration).from(dayjs(guildCaseData.case.created_at), true)}
											</Text>
										</Box>
									</>
								) : null}

								<Box mb={4}>
									<FormLabel as="legend">Moderator</FormLabel>
									<Text>{`${guildCaseData?.case.mod_tag as string} (${guildCaseData?.case.mod_id as string})`}</Text>
								</Box>

								<Box mb={4}>
									<FormLabel as="legend">Target</FormLabel>
									<Text>{`${guildCaseData?.case.target_tag as string} (${
										guildCaseData?.case.target_id as string
									})`}</Text>
								</Box>

								<FormControl
									id="reason"
									mb={4}
									isReadOnly={readOnly || !isModerator}
									isInvalid={Boolean(errors.reason)}
								>
									<FormLabel>Reason</FormLabel>
									<Textarea
										minH="unset"
										overflow="hidden"
										resize="none"
										{...register('reason', { maxLength: { value: 1900, message: 'Max length of 1900 exceeded' } })}
										transition="height none"
										rows={5}
										as={TextareaAutosize}
										defaultValue={guildCaseData?.case.reason ?? undefined}
									/>
									<FormErrorMessage>
										<FormErrorIcon /> {errors.reason?.message}
									</FormErrorMessage>
								</FormControl>
							</form>
						</ModalBody>
						<ModalFooter>
							<ButtonGroup>
								<Button
									type="submit"
									form="guild-case-modal"
									colorScheme="green"
									isLoading={isSubmitting || isLoadingGuildCaseUpdateMutate}
									loadingText="Submitting"
									isDisabled={readOnly || !isModerator || isSubmitting || isLoadingGuildCaseUpdateMutate}
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
