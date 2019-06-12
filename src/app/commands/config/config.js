const { Command, Flag } = require('discord-akairo');

class ConfigCommand extends Command {
	constructor() {
		super('config', {
			aliases: ['config'],
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: [
					'Available Methods',
					' • set `<key> <...arguments>`',
					' • delete `<key>`',
					' • clear',
					'',
					'Available Keys',
					' • cases `<number>`',
					' • mod `<roleId>`',
					' • modLog `<channelId>`',
					' • muted `<roleId>`',
					' • restrict `<embed roleId> <emoji roleId> <reaction roleId>`',
					' • memberLog <channelId>',
					' • clientLog <channelId>',
					'',
					'Required: `<>` | Optional: `[]`'
				],
				usage: '<method> <...arguments>'
			}
		});
	}

	*args() {
		const method = yield {
			type: [
				['config-set', 'set'],
				['config-delete', 'delete', 'del', 'remove'],
				['config-clear', 'clear']
			],
			otherwise: message => {
				const command = this.handler.modules.get('help');
				return this.handler.handleDirectCommand(message, 'config', command, true);
			}
		};

		return Flag.continue(method);
	}
}

module.exports = ConfigCommand;
