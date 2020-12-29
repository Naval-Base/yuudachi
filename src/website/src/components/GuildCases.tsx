import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { CaseAction } from '@yuudachi/types';
import { useBreakpointValue } from '@chakra-ui/react';

import EllipsisPopover from '~/components/EllipsisPopover';

const Loading = dynamic(() => import('~/components/Loading'));
const Table = dynamic(() => import('~/components/Table'));

import { useQueryGuildCases } from '~/hooks/useQueryGuildCases';

const GuildCasesPage = () => {
	const router = useRouter();
	const [limit, setLimit] = useState(50);
	const [page, setPage] = useState(1);
	const actionColumWidth = useBreakpointValue({ base: '40%', sm: '30%', md: '20%', lg: '20%' });

	const { id } = router.query;
	const { data: gqlData, isLoading } = useQueryGuildCases(
		id as string,
		[{ case_id: 'desc' }],
		limit,
		limit * (page - 1),
	);

	const columns = useMemo(
		() => [
			{
				Header: 'Case',
				accessor: 'case_id',
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
			},
			{
				Header: 'Target',
				accessor: 'target_tag',
				// eslint-disable-next-line react/display-name
				Cell: ({ value }: { value: string }) => <EllipsisPopover text={value} total={20} />,
			},
			{
				Header: 'Reason',
				accessor: 'reason',
				// eslint-disable-next-line react/display-name
				Cell: ({ value }: { value: string | null }) => <EllipsisPopover text={value ?? ''} total={20} />,
			},
			{
				Header: 'Reference',
				accessor: 'ref_id',
			},
		],
		[],
	);

	if (isLoading) {
		return <Loading />;
	}

	const handlePageChange = (next: boolean) => {
		setPage((old) => (next ? old++ : old--));
	};

	const handleLimitChange = (limit: number) => {
		setLimit(limit);
	};

	return (
		<Table
			columns={columns}
			hiddenColumns={['ref_id']}
			data={gqlData?.cases ?? []}
			count={gqlData?.caseCount.aggregate.count ?? 0}
			onPageChange={handlePageChange}
			onLimitChange={handleLimitChange}
			invalidateKey={['guilds', id as string, 'cases']}
		/>
	);
};

export default GuildCasesPage;
