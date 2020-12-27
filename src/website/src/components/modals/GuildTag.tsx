import { useEffect, useState } from 'react';
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
} from '@chakra-ui/react';
import { FiPlus, FiX } from 'react-icons/fi';
import { useForm, useFieldArray } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { DiscordMessages, DiscordMessage } from '@skyra/discord-components-react';
import { toHTML } from 'discord-markdown';

const Loading = dynamic(() => import('../Loading'));

import { RootState } from '~/store/index';

import { useQueryGuildTag } from '~/hooks/useQueryGuildTag';
import { useMutationUpdateGuildTag } from '~/hooks/useMutationUpdateGuildTag';

import { GuildTagPayload } from '~/interfaces/GuildTags';

const GuildSettings = ({ name, isOpen, onClose }: { name: string; isOpen: boolean; onClose: () => void }) => {
	const user = useSelector((state: RootState) => state.user);
	const router = useRouter();
	const [content, setContent] = useState('');
	const { handleSubmit, register, control, watch } = useForm<GuildTagPayload>();
	const { fields, append, remove } = useFieldArray({ control, name: 'alias' });
	const { id } = router.query;

	const { data: gqlGuildTagData, isLoading: isLoadingGuildTag } = useQueryGuildTag(
		id as string,
		name,
		user.loggedIn && isOpen,
	);
	const { mutateAsync: guildTagUpdateMutate, isLoading: isLoadingTagUpdateMutate } = useMutationUpdateGuildTag(
		id as string,
		name,
	);

	async function onSubmit(values: Omit<GuildTagPayload, 'aliases'> & { aliases?: { value: string }[] }) {
		const { aliases, ...rest } = values;
		const payload: GuildTagPayload = {
			...rest,
			aliases: `{${fields
				.map((alias) => alias.value)
				.filter((v) => v)
				.join(',')}}`,
		};
		await guildTagUpdateMutate(payload);
	}

	const watchContent = watch('content', gqlGuildTagData?.tag.content ?? '');
	useEffect(() => {
		setContent(watchContent);
	}, [watchContent, gqlGuildTagData?.tag.content]);

	useEffect(() => {
		gqlGuildTagData?.tag.aliases.map((alias) => append({ value: alias }));
	}, [append, gqlGuildTagData?.tag.aliases]);

	return (
		<Modal size="xl" isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Tag {gqlGuildTagData?.tag.name}</ModalHeader>
				<ModalCloseButton />
				{isLoadingGuildTag ? (
					<Loading />
				) : gqlGuildTagData?.tag ? (
					<form onSubmit={handleSubmit(onSubmit)}>
						<ModalBody>
							<FormControl id="name" pb={4}>
								<FormLabel>Name</FormLabel>
								<Input name="name" ref={register} defaultValue={gqlGuildTagData.tag.name} />
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
										<FormControl id="aliases" pb={4}>
											{fields.map((item, i) => (
												<Box key={item.id}>
													<InputGroup>
														<Input
															mb={4}
															name={`aliases[${i.toString()}].value`}
															ref={register()}
															defaultValue={item.value}
														/>
														<InputRightElement width="4rem" pr={0}>
															<IconButton
																colorScheme="red"
																size="sm"
																aria-label="Delete alias"
																icon={<FiX />}
																onClick={() => remove(i)}
															/>
														</InputRightElement>
													</InputGroup>
												</Box>
											))}
										</FormControl>
										<Box textAlign="right">
											<IconButton
												colorScheme="green"
												size="sm"
												aria-label="Delete alias"
												icon={<FiPlus />}
												onClick={() => append({ value: '' })}
											/>
										</Box>
									</AccordionPanel>
								</AccordionItem>
							</Accordion>

							<FormControl id="content" pb={4}>
								<FormLabel>Content</FormLabel>
								<Textarea resize="vertical" name="content" ref={register} defaultValue={gqlGuildTagData.tag.content} />
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
						</ModalBody>
						<ModalFooter>
							<Button
								type="submit"
								colorScheme="green"
								mr={3}
								onClick={onClose}
								isLoading={isLoadingTagUpdateMutate}
								loadingText="Submitting"
							>
								Submit
							</Button>
							<Button onClick={onClose}>Close</Button>
						</ModalFooter>
					</form>
				) : (
					<></>
				)}
			</ModalContent>
		</Modal>
	);
};

export default GuildSettings;
