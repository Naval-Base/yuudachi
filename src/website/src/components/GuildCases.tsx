import { useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useQueryClient } from 'react-query';
import { CaseAction } from '@yuudachi/types';
import { useBreakpointValue } from '@chakra-ui/react';

import EllipsisPopover from '~/components/EllipsisPopover';

const Loading = dynamic(() => import('~/components/Loading'));
const Table = dynamic(() => import('~/components/Table'));
import { useTableStore } from '~/store/index';

import { useQueryGuildCases } from '~/hooks/useQueryGuildCases';

const GuildCasesPage = () => {
	const router = useRouter();
	const cache = useQueryClient();
	const table = useTableStore();
	const actionColumWidth = useBreakpointValue({ base: '40%', sm: '30%', md: '20%', lg: '20%' });

	useEffect(() => {
		return () => table.reset();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const { id } = router.query;
	const { data: gqlData, isLoading } = useQueryGuildCases(
		id as string,
		[{ case_id: 'desc' }],
		table.limit,
		table.limit * (table.page - 1),
		table.search,
	);

	const columns = useMemo(
		() => [
			{
				Header: 'Case',
				accessor: 'case_id',
				search: true,
			},
			{
				Header: 'Action',
				accessor: 'action',
				Cell: ({ value }: { value: number }) => {
					const action = CaseAction[value];
					return `${action[0].toUpperCase() + action.substr(1).toLowerCase()}`;
				},
			},
			{
				Header: 'Moderator',
				accessor: 'mod_tag',
				// eslint-disable-next-line react/display-name
				Cell: ({ value }: { value: string | null }) => <EllipsisPopover text={value ?? ''} total={20} />,
				search: true,
			},
			{
				Header: 'Target',
				accessor: 'target_tag',
				// eslint-disable-next-line react/display-name
				Cell: ({ value }: { value: string }) => <EllipsisPopover text={value} total={20} />,
				search: true,
			},
			{
				Header: 'Reason',
				accessor: 'reason',
				// eslint-disable-next-line react/display-name
				Cell: ({ value }: { value: string | null }) => <EllipsisPopover text={value ?? ''} total={20} />,
				search: {
					op: '_ilike',
				},
			},
			{
				Header: 'Reference',
				accessor: 'ref_id',
				search: true,
			},
		],
		[],
	);

	if (isLoading) {
		return <Loading />;
	}

	const handleRefreshChange = () => {
		void cache.invalidateQueries(['guilds', id, 'cases']);
	};

	return (
		<Table
			columns={columns}
			hiddenColumns={['ref_id']}
			data={gqlData?.cases ?? []}
			count={gqlData?.caseCount.aggregate.count ?? 0}
			onRefreshChange={handleRefreshChange}
		/>
	);
};

export default GuildCasesPage;
