import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Text, Button, Tabs, Tab, TabList, TabPanels, TabPanel } from '@chakra-ui/react';

const Loading = dynamic(() => import('~/components/Loading'));
const GuildDisplay = dynamic(() => import('~/components/GuildDisplay'));
const GuildSettings = dynamic(() => import('~/components/GuildSettings'));
const GuildCases = dynamic(() => import('~/components/GuildCases'));
const GuildTags = dynamic(() => import('~/components/GuildTags'));

import { useQueryOAuthGuilds } from '~/hooks/useQueryOAuthGuilds';
import { useQueryGuild } from '~/hooks/useQueryGuild';

enum TabsEnum {
	settings,
	cases,
	tags,
}

const GuildPage = () => {
	const router = useRouter();

	const { id, tab } = router.query;
	const { data: gqlGuildData, isLoading: isLoadingGuild } = useQueryGuild(id as string);
	const { data: gqlFallbackGuildData, isLoading: isLoadingFallbackGuild } = useQueryOAuthGuilds();

	if (isLoadingGuild || isLoadingFallbackGuild) {
		return <Loading />;
	}

	if (gqlGuildData && !gqlGuildData.guild) {
		return (
			<>
				<GuildDisplay id={id as string} guild={gqlGuildData} fallbackGuild={gqlFallbackGuildData} />
				<Box textAlign="center">
					<Text mb={6}>Yuudachi is not in this guild yet.</Text>
					<Link href={''}>
						<Button>Invite</Button>
					</Link>
				</Box>
			</>
		);
	}

	const handleTabsChange = (idx: number) => {
		void router.push({ pathname: `/guilds/${id as string}`, query: { tab: TabsEnum[idx] } }, undefined, {
			shallow: true,
		});
	};

	return (
		<>
			<GuildDisplay id={id as string} guild={gqlGuildData} fallbackGuild={gqlFallbackGuildData} />
			<Box px={{ base: 0, lg: 50, xl: 100 }}>
				<Box px={{ base: 4, md: 16 }} pb={{ base: 16 }}>
					<Tabs isFitted isLazy onChange={handleTabsChange} index={TabsEnum[tab as keyof typeof TabsEnum]}>
						<TabList>
							<Tab>Guild settings</Tab>
							<Tab>Cases</Tab>
							<Tab>Tags</Tab>
						</TabList>
						<TabPanels>
							<TabPanel px={{ md: 16, lg: 32, xl: 64 }}>
								<GuildSettings />
							</TabPanel>
							<TabPanel>
								<GuildCases />
							</TabPanel>
							<TabPanel>
								<GuildTags />
							</TabPanel>
						</TabPanels>
					</Tabs>
				</Box>
			</Box>
		</>
	);
};

export default GuildPage;
