import { FormControl, FormLabel, Input } from '@chakra-ui/react';
import { UseFormMethods } from 'react-hook-form';

import { GraphQLGuildSettings } from '~/interfaces/GuildSettings';

const GuildSettingsFormControl = ({
	register,
	guildData,
	id,
	label,
	name,
	placeholder = '',
}: {
	register: UseFormMethods['register'];
	guildData: GraphQLGuildSettings['data'];
	id: string;
	label: string;
	name: string;
	placeholder?: string;
}) => (
	<FormControl id={id} pb={4}>
		<FormLabel>{label}</FormLabel>
		<Input
			name={name}
			placeholder={placeholder}
			ref={register}
			defaultValue={(guildData.guild![id] as string | null) ?? undefined}
		/>
	</FormControl>
);

export default GuildSettingsFormControl;
