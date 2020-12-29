import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { Box, Button, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const Loading = dynamic(() => import('~/components/Loading'));
const Table = dynamic(() => import('~/components/Table'));
const GuildTag = dynamic(() => import('~/components/GuildTag'));
const GuildTagModal = dynamic(() => import('~/components/modals/GuildTag'));

import { RootState } from '~/store/index';

import { GraphQLRole } from '~/interfaces/Role';

import { useQueryGuildTags } from '~/hooks/useQueryGuildTags';

const GuildTagsPage = () => {
	const user = useSelector((state: RootState) => state.user);
	const router = useRouter();
	const [limit, setLimit] = useState(50);
	const [page, setPage] = useState(1);
	const actionColumWidth = useBreakpointValue({ base: '50%', sm: '45%', md: '30%' });
	const { isOpen, onOpen, onClose } = useDisclosure();

	const { id } = router.query;
	const { data: gqlData, isLoading } = useQueryGuildTags(
		id as string,
		[{ created_at: 'desc' }],
		limit,
		limit * (page - 1),
	);

	const columns = useMemo(
		() => [
			{
				Header: 'Name',
				accessor: 'name',
			},
			{
				Header: 'Actions',
				accessor: '',
				Cell: ({ row }: { row: any }) => <GuildTag name={row.values.name} />,
				style: { width: actionColumWidth },
			},
		],
		[actionColumWidth],
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
		<>
			<Box mb={4} mr={2} textAlign="right">
				<Button colorScheme="green" onClick={onOpen} isDisabled={isOpen || user.role === GraphQLRole.user}>
					Add Tag
				</Button>
			</Box>
			<Table
				columns={columns}
				data={gqlData?.tags ?? []}
				count={gqlData?.tagCount.aggregate.count ?? 0}
				onPageChange={handlePageChange}
				onLimitChange={handleLimitChange}
				invalidateKey={['guilds', id as string, 'tags']}
			/>

			<GuildTagModal isOpen={isOpen} onClose={onClose} />
		</>
	);
};

export default GuildTagsPage;
