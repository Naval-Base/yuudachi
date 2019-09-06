import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class SetConfigCasesCommand extends Command {
	public constructor() {
		super('config-set-cases', {
			description: {
				content: 'Sets the case number of the guild.',
				usage: '<cases>',
				examples: ['5']
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
			args: [
				{
					id: 'cases',
					match: 'content',
					type: 'integer'
				}
			]
		});
	}

	public async exec(message: Message, { cases }: { cases: number }) {
		this.client.settings.set(message.guild!, 'caseTotal', cases);
		return message.util!.reply(`set cases to **${cases}**`);
	}
}
