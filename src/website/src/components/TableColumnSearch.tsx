import { useForm } from 'react-hook-form';
import {
	FormControl,
	FormLabel,
	Input,
	IconButton,
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverArrow,
	PopoverCloseButton,
	useDisclosure,
	ButtonGroup,
	Button,
	Stack,
	NumberInput,
	NumberInputField,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';

import type { SearchQuery } from '~/interfaces/SearchQuery';

const transformId = (id: string) => {
	switch (id) {
		case 'mod_tag': {
			return 'mod_id';
		}

		case 'target_tag': {
			return 'target_id';
		}

		default: {
			return id;
		}
	}
};

const TableColumnSearch = ({
	label,
	id,
	op = '_eq',
	type = 'string',
	onSearchChange,
}: {
	label?: string;
	id: string;
	op?: SearchQuery['op'];
	type?: string;
	onSearchChange: (searchQ: SearchQuery) => void;
}) => {
	const { onOpen, onClose, isOpen } = useDisclosure();
	const { handleSubmit, register } = useForm<{ search: string }>();

	let CustomInput: (() => JSX.Element) | null = null;
	switch (type) {
		case 'number':
			CustomInput = () => (
				<NumberInput size="sm">
					<NumberInputField name="search" ref={register} />
				</NumberInput>
			);
			break;
		default:
			CustomInput = () => <Input name="search" ref={register} size="sm" />;
			break;
	}

	const onSubmit = ({ search }: { search: string }) => {
		onSearchChange({ label: label!, key: transformId(id), op, query: op === '_ilike' ? `%${search}%` : search });
		onClose();
	};

	return (
		<Popover isLazy isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
			<PopoverTrigger>
				<IconButton aria-label={`Search ${id}`} icon={<FiSearch />} size="sm" variant="ghost" />
			</PopoverTrigger>
			<PopoverContent p={5}>
				<PopoverArrow />
				<PopoverCloseButton />
				<form onSubmit={handleSubmit(onSubmit)}>
					<Stack spacing={2}>
						<FormControl id="search">
							<FormLabel>Search {label ?? ''}</FormLabel>
							<CustomInput />
						</FormControl>
						<ButtonGroup size="sm" d="flex" justifyContent="flex-end">
							<Button type="submit" colorScheme="green">
								Search
							</Button>
						</ButtonGroup>
					</Stack>
				</form>
			</PopoverContent>
		</Popover>
	);
};

export default TableColumnSearch;
