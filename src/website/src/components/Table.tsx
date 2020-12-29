/* eslint-disable react/jsx-key */

import { ChangeEvent, useState } from 'react';
import {
	Table as ChakraTable,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Box,
	IconButton,
	Menu,
	MenuButton,
	MenuList,
	Checkbox,
	MenuItem,
	Select,
	Button,
	FormLabel,
} from '@chakra-ui/react';
import { FiMoreVertical, FiRefreshCw } from 'react-icons/fi';
import { useTable } from 'react-table';
import { useQueryClient } from 'react-query';

const Table = ({
	columns,
	hiddenColumns = [],
	data = [],
	count,
	onPageChange,
	onLimitChange,
	invalidateKey,
}: {
	columns: {
		Header: string;
		accessor: string;
	}[];
	hiddenColumns?: string[];
	data: any[];
	count: number;
	onPageChange: (...args: any) => void;
	onLimitChange: (...args: any) => void;
	invalidateKey: string[];
}) => {
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, allColumns } = useTable({
		columns,
		data,
		initialState: {
			hiddenColumns,
		},
	});
	const [limit, setLimit] = useState(50);
	const [page, setPage] = useState(1);
	const cache = useQueryClient();

	const handlePageChange = (next: boolean) => {
		setPage((old) => (next ? old++ : old--));
		onPageChange(next);
	};

	const handleLimitChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const limit = Number(event.target.value);
		setLimit(limit);
		onLimitChange(limit);
	};

	const handleRefreshChange = () => {
		void cache.invalidateQueries(invalidateKey);
	};

	return (
		<>
			<Box mb={4} mr={2} textAlign="right">
				<Box display="inline-block">
					<FormLabel as="legend">Items per page</FormLabel>
				</Box>
				<Box display="inline-block" mr={2}>
					<Select defaultValue={50} size="sm" onChange={handleLimitChange}>
						<option value={50}>50</option>
						<option value={100}>100</option>
						<option value={150}>150</option>
					</Select>
				</Box>
				<Menu closeOnSelect={false} isLazy>
					<MenuButton mr={2} as={IconButton} aria-label="Column selection" icon={<FiMoreVertical />} size="sm" />
					<MenuList minWidth="150px">
						{allColumns.map((column) => (
							<MenuItem key={column.id}>
								<Checkbox onChange={() => column.toggleHidden()} defaultIsChecked={column.isVisible}>
									{column.Header}
								</Checkbox>
							</MenuItem>
						))}
					</MenuList>
				</Menu>
				<IconButton aria-label="Refresh table" icon={<FiRefreshCw />} size="sm" onClick={handleRefreshChange} />
			</Box>
			<ChakraTable {...getTableProps()}>
				<Thead>
					{headerGroups.map((headerGroup) => (
						<Tr {...headerGroup.getHeaderGroupProps()}>
							{headerGroup.headers.map((column) => (
								<Th style={(column as any).style ?? {}} {...column.getHeaderProps()}>
									{column.render('Header')}
								</Th>
							))}
						</Tr>
					))}
				</Thead>
				<Tbody {...getTableBodyProps()}>
					{rows.map((row) => {
						prepareRow(row);
						return (
							<Tr {...row.getRowProps()}>
								{row.cells.map((cell) => (
									<Td {...cell.getCellProps()}>{cell.render('Cell')}</Td>
								))}
							</Tr>
						);
					})}
				</Tbody>
			</ChakraTable>

			<Box mt={4} textAlign="right">
				<Button mr={2} size="sm" onClick={() => handlePageChange(false)} isDisabled={page <= 1}>
					Previous Page
				</Button>
				<Button
					size="sm"
					onClick={() => handlePageChange(true)}
					isDisabled={!count || page === Math.ceil(count / limit)}
				>
					Next Page
				</Button>
			</Box>
		</>
	);
};

export default Table;
