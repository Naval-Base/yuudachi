import { APIGuildInteraction, Routes, Snowflake } from 'discord-api-types/v8';
import i18next from 'i18next';
import { container } from 'tsyringe';
import Rest from '@yuudachi/rest';
import { TransformedInteraction, Commands } from '@yuudachi/interactions';

import { send } from '../../../../util';

export async function refresh(message: APIGuildInteraction, args: TransformedInteraction['debug'], locale: string) {
	const rest = container.resolve(Rest);

	switch (Object.keys(args.refresh)[0]) {
		case 'commands': {
			await rest.put(
				Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID as Snowflake, message.guild_id),
				Object.values(Commands),
			);

			void send(message, { content: i18next.t('command.config.debug.refresh.success', { lng: locale }) });
		}
	}
}
