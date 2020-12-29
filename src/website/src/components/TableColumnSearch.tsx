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
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';

import { SearchQuery } from '~/interfaces/SearchQuery';

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
	header,
	id,
	op = '_eq',
	onSearchChange,
}: {
	header?: string;
	id: string;
	op?: SearchQuery['op'];
	onSearchChange: (searchQ: SearchQuery) => void;
}) => {
	const { onOpen, onClose, isOpen } = useDisclosure();
	const { handleSubmit, register } = useForm<{ search: string }>();

	const onSubmit = ({ search }: { search: string }) => {
		onSearchChange({ header: header!, key: transformId(id), op, query: op === '_ilike' ? `%${search}%` : search });
		onClose();
	};

	return (
		<Popover isLazy isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
			<PopoverTrigger>
				<IconButton aria-label={`Search ${id}`} icon={<FiSearch />} size="sm" />
			</PopoverTrigger>
			<PopoverContent p={5}>
				<PopoverArrow />
				<PopoverCloseButton />
				<form onSubmit={handleSubmit(onSubmit)}>
					<Stack spacing={2}>
						<FormControl id="search">
							<FormLabel>Search {header ?? ''}</FormLabel>
							<Input name="search" ref={register} size="sm" />
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
