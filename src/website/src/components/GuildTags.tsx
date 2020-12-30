import { useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useQueryClient } from 'react-query';
import { Button, ButtonGroup, useDisclosure } from '@chakra-ui/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const Loading = dynamic(() => import('~/components/Loading'));
const Table = dynamic(() => import('~/components/Table'));
const GuildTag = dynamic(() => import('~/components/GuildTag'));
const GuildTagModal = dynamic(() => import('~/components/modals/GuildTag'));

import { useUserStore, useTableStore } from '~/store/index';

import { GraphQLRole } from '~/interfaces/Role';

import { useQueryGuildTags } from '~/hooks/useQueryGuildTags';

const GuildTagsPage = () => {
	const user = useUserStore();
	const router = useRouter();
	const cache = useQueryClient();
	const table = useTableStore();
	const { isOpen, onOpen, onClose } = useDisclosure();

	useEffect(() => {
		return () => table.reset();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { id } = router.query;
	const { data: gqlData, isLoading } = useQueryGuildTags(
		id as string,
		[{ created_at: 'desc' }],
		table.limit,
		table.limit * (table.page - 1),
		table.search,
	);

	const columns = useMemo(
		() => [
			{
				Header: 'Name',
				accessor: 'name',
				search: {
					op: '_ilike',
				},
			},
			{
				Header: 'Actions',
				Cell: ({ row }: { row: any }) => <GuildTag name={row.values.name} />,
				style: { width: '1%' },
			},
		],
		[],
	);

	if (isLoading) {
		return <Loading />;
	}

	const handleRefreshChange = () => {
		void cache.invalidateQueries(['guilds', id as string, 'tags']);
	};

	return (
		<>
			<ButtonGroup mb={4} mr={2} d="flex" justifyContent="flex-end">
				<Button colorScheme="green" onClick={onOpen} isDisabled={isOpen || user.role === GraphQLRole.user}>
					Add Tag
				</Button>
			</ButtonGroup>
			<Table
				// @ts-ignore
				columns={columns}
				data={gqlData?.tags ?? []}
				count={gqlData?.tagCount.aggregate.count ?? 0}
				onRefreshChange={handleRefreshChange}
			/>

			<GuildTagModal isOpen={isOpen} onClose={onClose} />
		</>
	);
};

export default GuildTagsPage;
