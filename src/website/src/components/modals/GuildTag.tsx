import { FormEvent, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
	Button,
	IconButton,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	FormControl,
	FormLabel,
	InputGroup,
	Input,
	InputRightElement,
	Textarea,
	Box,
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionPanel,
	AccordionIcon,
	ButtonGroup,
	Center,
	useToast,
} from '@chakra-ui/react';
import { FiPlus, FiX } from 'react-icons/fi';
import TextareaAutosize from 'react-autosize-textarea';
import { useForm, useFieldArray } from 'react-hook-form';
import { DiscordMessages, DiscordMessage } from '@skyra/discord-components-react';
import { toHTML } from 'discord-markdown';

const Loading = dynamic(() => import('../Loading'));

import { useUserStore } from '~/store/index';

import { GuildTagPayload } from '~/interfaces/GuildTags';
import { GraphQLRole } from '~/interfaces/Role';

import { useQueryGuildTag } from '~/hooks/useQueryGuildTag';
import { useMutationUpdateGuildTag } from '~/hooks/useMutationUpdateGuildTag';
import { useMutationInsertGuildTag } from '~/hooks/useMutationInsertGuildTag';

const GuildTag = ({ name, isOpen, onClose }: { name?: string; isOpen: boolean; onClose: () => void }) => {
	const user = useUserStore();
	const router = useRouter();
	const toast = useToast();
	const [content, setContent] = useState('');
	const { handleSubmit, register, control, watch } = useForm<GuildTagPayload>();
	const { fields, append, remove } = useFieldArray({ control, name: 'aliases' });
	const { id } = router.query;

	const { data: gqlGuildTagData, isLoading: isLoadingGuildTag } = useQueryGuildTag(
		id as string,
		name!,
		Boolean(name) && isOpen,
	);
	const { mutateAsync: guildTagUpdateMutate, isLoading: isLoadingGuildTagUpdateMutate } = useMutationUpdateGuildTag(
		id as string,
		name!,
	);
	const { mutateAsync: guildTagInsertMutate, isLoading: isLoadingGuildTagInsertMutate } = useMutationInsertGuildTag(
		id as string,
	);

	const handleOnSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		await handleSubmit(async (values: Omit<GuildTagPayload, 'aliases'> & { aliases?: { value: string }[] }) => {
			const { aliases, ...rest } = values;
			const payload: GuildTagPayload = {
				...rest,
				aliases: `{${(aliases ?? [])
					.map((alias) => alias.value)
					.filter((v) => v)
					.join(',')}}`,
			};

			if (name) {
				await guildTagUpdateMutate(payload);
			} else {
				await guildTagInsertMutate(payload);
			}
		})(event);
	};

	const handleOnClose = () => {
		toast({
			title: name ? 'Tag edited.' : 'Tag created.',
			description: `You successfully ${name ? 'edited' : 'created'} the tag.`,
			status: 'success',
			isClosable: true,
			position: 'top',
		});
		onClose();
	};

	const watchContent = watch('content', gqlGuildTagData?.tag.content ?? '');
	useEffect(() => {
		setContent(watchContent);
	}, [watchContent, gqlGuildTagData?.tag.content]);

	useEffect(() => {
		remove();
		gqlGuildTagData?.tag.aliases.map((alias) => append({ value: alias }));
	}, [remove, gqlGuildTagData?.tag.aliases, append]);

	return (
		<Modal size="xl" isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Tag {gqlGuildTagData?.tag.name}</ModalHeader>
				<ModalCloseButton />
				{isLoadingGuildTag ? (
					<Center h="100%">
						<Loading />
					</Center>
				) : (
					<>
						<ModalBody>
							<form id="guild-tag-modal" onSubmit={handleOnSubmit}>
								<FormControl id="name" pb={4} isReadOnly={user.role === GraphQLRole.user}>
									<FormLabel>Name</FormLabel>
									<Input name="name" ref={register} defaultValue={gqlGuildTagData?.tag.name} />
								</FormControl>

								<Accordion allowToggle pb={4}>
									<AccordionItem>
										<AccordionButton>
											<Box flex="1" textAlign="left">
												Edit aliases
											</Box>
											<AccordionIcon />
										</AccordionButton>
										<AccordionPanel>
											{fields.map((item, i) => (
												<Box key={item.id}>
													<InputGroup>
														<Input
															mb={4}
															name={`aliases[${i.toString()}].value`}
															ref={register()}
															defaultValue={item.value}
															isReadOnly={user.role === GraphQLRole.user}
														/>
														<InputRightElement width="4rem" pr={0}>
															<IconButton
																colorScheme="red"
																size="sm"
																aria-label="Delete alias"
																icon={<FiX />}
																onClick={() => remove(i)}
																isDisabled={user.role === GraphQLRole.user}
															/>
														</InputRightElement>
													</InputGroup>
												</Box>
											))}
											<ButtonGroup d="flex" justifyContent="flex-end">
												<IconButton
													colorScheme="green"
													size="sm"
													aria-label="Delete alias"
													icon={<FiPlus />}
													onClick={() => append({ value: '' })}
													isDisabled={user.role === GraphQLRole.user}
												/>
											</ButtonGroup>
										</AccordionPanel>
									</AccordionItem>
								</Accordion>

								<FormControl id="content" pb={4} isReadOnly={user.role === GraphQLRole.user}>
									<FormLabel>Content</FormLabel>
									<Textarea
										minH="unset"
										overflow="hidden"
										resize="none"
										name="content"
										transition="height none"
										rows={5}
										ref={register}
										as={TextareaAutosize as any /* fuck ts */}
										defaultValue={gqlGuildTagData?.tag.content}
									/>
								</FormControl>

								<FormLabel>Preview</FormLabel>
								<DiscordMessages>
									<DiscordMessage
										author="Yuudachi"
										avatar="https://cdn.discordapp.com/app-icons/474807795183648809/9c72320c06dbaecac51fc1151aede1b6.png?size=256"
										bot
									>
										<Box dangerouslySetInnerHTML={{ __html: toHTML(content) }}></Box>
									</DiscordMessage>
								</DiscordMessages>
							</form>
						</ModalBody>
						<ModalFooter>
							<Button
								type="submit"
								form="guild-tag-modal"
								colorScheme="green"
								mr={3}
								onClick={handleOnClose}
								isLoading={isLoadingGuildTagUpdateMutate || isLoadingGuildTagInsertMutate}
								loadingText="Submitting"
								isDisabled={user.role === GraphQLRole.user}
							>
								Submit
							</Button>
							<Button onClick={onClose}>Close</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
};

export default GuildTag;
