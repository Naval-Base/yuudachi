const { Command } = require('discord-akairo');

class SetClientLogCommand extends Command {
	constructor() {
		super('set-botlog', {
			category: 'config',
			channel: 'guild',
			clientPermissions: ['MANAGE_WEBHOOKS'],
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Sets client log to capture crashes and rate limits.'
			},
			args: [
				{
					id: 'id',
					match: 'content',
					type: 'string',
					prompt: {
						start: 'what webhook should send the messages?'
					}
				}
			]
		});
	}

	async exec(message, { id }) {
		const fetched = await message.guild.fetchWebhooks();
		const hook = fetched.get(id);
		if (!hook) return message.util.reply('this is not a valid webhook!');
		const webhook = { id: hook.id, token: hook.token };
		this.client.settings.set('global', 'clientLog', webhook);

		return message.util.reply('successfully activated client-log!');
	}
}

module.exports = SetClientLogCommand;
