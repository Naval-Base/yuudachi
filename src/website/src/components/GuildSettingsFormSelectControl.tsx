import { FormControl, FormLabel, Select } from '@chakra-ui/react';
import { UseFormMethods, Controller } from 'react-hook-form';
import { APIRole } from 'discord-api-types/v8';

import { GraphQLGuildSettings } from '~/interfaces/GuildSettings';

const GuildSettingsFormSelectControl = ({
	control,
	options,
	guildData,
	id,
	label,
	name,
	placeholder = '',
}: {
	control: UseFormMethods['control'];
	options: APIRole[];
	guildData: GraphQLGuildSettings['data'];
	id: string;
	label: string;
	name: string;
	placeholder?: string;
}) => (
	<FormControl id={id} pb={4}>
		<FormLabel>{label}</FormLabel>
		<Controller
			as={
				<Select>
					{options.map((option, i) => (
						<option key={i} value={option.id}>
							{option.name}
						</option>
					))}
				</Select>
			}
			name={name}
			placeholder={placeholder}
			control={control}
			defaultValue={(guildData.guild![id] as string | null) ?? undefined}
		/>
	</FormControl>
);

export default GuildSettingsFormSelectControl;
