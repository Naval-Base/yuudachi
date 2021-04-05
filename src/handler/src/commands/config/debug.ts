import { injectable } from 'tsyringe';
import type { APIGuildInteraction } from 'discord-api-types/v8';
import { CommandModules } from '@yuudachi/types';
import { TransformedInteraction } from '@yuudachi/interactions';

import Command from '../../Command';

import { refresh } from './sub/debug/refresh';
import { checkMod } from '../../util';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Config;

	public async execute(message: APIGuildInteraction, args: TransformedInteraction, locale: string) {
		await checkMod(message, locale);

		switch (Object.keys(args.debug)[0]) {
			case 'refresh': {
				return refresh(message, args.debug, locale);
			}
		}
	}
}
