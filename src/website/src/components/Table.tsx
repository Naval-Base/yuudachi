/* eslint-disable react/jsx-key */

import { ChangeEvent, Fragment, useState } from 'react';
import dynamic from 'next/dynamic';
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
	ButtonGroup,
	useToast,
} from '@chakra-ui/react';
import { FiMoreVertical, FiMoreHorizontal, FiRefreshCw, FiX } from 'react-icons/fi';
import { useTable, useExpanded } from 'react-table';

const TableColumnSearch = dynamic(() => import('~/components/TableColumnSearch'));

import { useTableStore } from '~/store/index';

const Table = ({
	columns,
	hiddenColumns = [],
	data = [],
	count,
	onRefreshChange,
}: {
	columns: {
		Header: string;
		accessor: string;
	}[];
	hiddenColumns?: string[];
	data: any[];
	count: number;
	onRefreshChange: (...args: any) => void;
}) => {
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, allColumns, visibleColumns } = useTable(
		{
			columns,
			data,
			initialState: {
				hiddenColumns,
			},
		},
		useExpanded,
	);
	const table = useTableStore();
	const [menuOpen, setMenuOpen] = useState(false);
	const toast = useToast();

	const handleLimitChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const limit = Number(event.target.value);
		table.setLimit(limit);
	};

	const handleClearSearchChange = () => {
		toast({
			title: 'Cleared search.',
			status: 'info',
			isClosable: true,
			position: 'top',
		});
		table.setSearch(null);
	};

	const handleRefreshChange = () => {
		toast({
			title: 'Refreshed table.',
			status: 'info',
			isClosable: true,
			position: 'top',
		});
		table.setSearch(null);
		onRefreshChange();
	};

	return (
		<>
			<Box mb={4} mr={2} d="flex" justifyContent={table.search ? 'space-between' : 'flex-end'}>
				{table.search ? (
					<Box d="inline-flex">
						<FormLabel ml={5} alignSelf="center" as="legend">
							Current search on column &quot;{table.search.header}&quot; | Query: {table.search.query}
						</FormLabel>
						<IconButton
							aria-label="Clear search"
							icon={<FiX />}
							colorScheme="red"
							size="sm"
							onClick={handleClearSearchChange}
						></IconButton>
					</Box>
				) : null}
				<Box>
					<Box d="inline-block">
						<FormLabel as="legend">Items per page</FormLabel>
					</Box>
					<Box d="inline-block" mr={2}>
						<Select defaultValue={50} size="sm" onChange={handleLimitChange}>
							<option value={50}>50</option>
							<option value={100}>100</option>
							<option value={150}>150</option>
						</Select>
					</Box>
					<Menu onOpen={() => setMenuOpen(true)} onClose={() => setMenuOpen(false)} closeOnSelect={false} isLazy>
						<MenuButton
							mr={2}
							as={IconButton}
							aria-label="Column selection"
							icon={menuOpen ? <FiMoreHorizontal /> : <FiMoreVertical />}
							size="sm"
						/>
						<MenuList minWidth="150px">
							{allColumns
								.filter((column) => column.id !== 'expander')
								.map((column) => (
									<MenuItem key={column.id}>
										<Checkbox
											onChange={(e) => {
												e.preventDefault();
												column.toggleHidden();
											}}
											defaultChecked={column.isVisible}
										>
											{column.Header}
										</Checkbox>
									</MenuItem>
								))}
						</MenuList>
					</Menu>
					<IconButton aria-label="Refresh table" icon={<FiRefreshCw />} size="sm" onClick={handleRefreshChange} />
				</Box>
			</Box>
			<ChakraTable {...getTableProps()}>
				<Thead>
					{headerGroups.map((headerGroup) => (
						<Tr {...headerGroup.getHeaderGroupProps()}>
							{headerGroup.headers.map((column) => (
								<Th style={(column as any).style ?? {}} {...column.getHeaderProps()}>
									{column.render('Header')}{' '}
									{(column as any).search ? (
										<Box d="inline-block">
											<TableColumnSearch
												header={column.Header as string | undefined}
												id={column.id}
												op={(column as any).search.op ?? '_eq'}
												onSearchChange={(searchQ) => table.setSearch(searchQ)}
											/>
										</Box>
									) : (
										''
									)}
								</Th>
							))}
						</Tr>
					))}
				</Thead>
				<Tbody {...getTableBodyProps()}>
					{rows.map((row: any) => {
						prepareRow(row);
						return (
							<Fragment key={row.getRowProps().key}>
								<Tr>
									{row.cells.map((cell: any) => (
										<Td {...cell.getCellProps()}>{cell.render('Cell')}</Td>
									))}
								</Tr>
								{row.isExpanded ? (
									<Tr>
										<Td colSpan={visibleColumns.length}>Test</Td>
									</Tr>
								) : null}
							</Fragment>
						);
					})}
				</Tbody>
			</ChakraTable>

			<ButtonGroup mt={4} d="flex" justifyContent="flex-end">
				<Button size="sm" onClick={() => table.prevPage()} isDisabled={table.page <= 1}>
					Previous Page
				</Button>
				<Button
					size="sm"
					onClick={() => table.nextPage()}
					isDisabled={!count || table.page === Math.ceil(count / table.limit)}
				>
					Next Page
				</Button>
			</ButtonGroup>
		</>
	);
};

export default Table;
