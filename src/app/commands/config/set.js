const { Command, Flag } = require('discord-akairo');

class SetConfigCommand extends Command {
	constructor() {
		super('config-set', {
			description: {
				content: 'Sets a value to the config.',
				usage: '<key> <...arguments>',
				examples: ['']
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD']
		});
	}

	*args() {
		const key = yield {
			type: [
				['set-cases', 'cases'],
				['set-mod', 'modRole', 'mod', 'mod-role'],
				['set-modlog', 'modLog', 'modlog'],
				['set-muted', 'muteRole', 'muted', 'mute-role'],
				['set-memberlog', 'member-log', 'member'],
				['set-restrict', 'restrictRoles', 'restrict', 'restrict-roles'],
				['set-botlog', 'client-log', 'clientLog', 'clientlog', 'botlog']
			],
			otherwise: message => {
				const command = this.handler.modules.get('help');
				return this.handler.handleDirectCommand(message, 'config', command, true);
			}
		};

		return Flag.continue(key);
	}
}

module.exports = SetConfigCommand;
