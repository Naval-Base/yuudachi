import { APIGuildInteraction, Routes, Snowflake } from 'discord-api-types/v8';
import i18next from 'i18next';
import { container } from 'tsyringe';
import Rest from '@yuudachi/rest';
import readdirp from 'readdirp';
import { resolve } from 'path';

import { send } from '../../../../util';
import { TransformedInteraction } from '@yuudachi/types';

export async function refresh(message: APIGuildInteraction, args: TransformedInteraction['debug'], locale: string) {
	const rest = container.resolve(Rest);

	switch (Object.keys(args.refresh)[0]) {
		case 'commands': {
			const commands: Record<string, any>[] = [];

			const files = readdirp(resolve(__dirname, '..', '..', '..', '..', 'interactions'), {
				fileFilter: '*.js',
			});

			for await (const dir of files) {
				const structure = (await import(dir.fullPath)).default as Record<string, any>;
				commands.push(structure);
			}

			await rest.put(
				Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID as Snowflake, message.guild_id),
				commands,
			);

			void send(message, { content: i18next.t('command.config.debug.refresh.success', { lng: locale }) });
		}

		default:
			break;
	}
}
