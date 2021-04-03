import { ChangeEvent } from 'react';
import Link from 'next/link';
import { Box, Flex, FormControl, FormLabel, Switch, Button, Text } from '@chakra-ui/react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { CommandModules } from '@yuudachi/types';

import type { GraphQLGuildSettings } from '~/interfaces/GuildSettings';

const GuildModule = ({
	guildModule,
	control,
	gqlGuildSettingsData,
	handleOnSubmit,
	isLoading,
	isDisabled,
}: {
	guildModule: { name: string; perm: CommandModules; description: string; settings?: string };
	control: UseFormReturn<any>['control'];
	gqlGuildSettingsData: GraphQLGuildSettings['data'];
	handleOnSubmit: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
	isLoading: boolean;
	isDisabled: boolean;
}) => (
	<Box p={5} minH="145px" maxH="145px" maxW="350px" borderWidth="1px">
		<FormControl id="moderation">
			<Flex justifyContent="space-between">
				<FormLabel d="inline-block">{guildModule.name}</FormLabel>
				<Controller
					control={control}
					name={guildModule.perm.toString()}
					defaultValue={Boolean((gqlGuildSettingsData?.guild?.modules ?? 2) & guildModule.perm)}
					render={({ field }) => (
						<Switch
							id="moderation"
							onChange={(e: any) => {
								field.onChange(e.target.checked);
								void handleOnSubmit(e);
							}}
							defaultChecked={Boolean((gqlGuildSettingsData?.guild?.modules ?? 2) & guildModule.perm)}
							isDisabled={isDisabled || isLoading}
						/>
					)}
				/>
			</Flex>
		</FormControl>

		<Text>{guildModule.description}</Text>

		{guildModule.settings ? (
			<Link href={guildModule.settings}>
				<Button size="sm" mt={4}>
					Settings
				</Button>
			</Link>
		) : null}
	</Box>
);

export default GuildModule;
