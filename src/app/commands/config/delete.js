const { Command, Flag } = require('discord-akairo');

class DeleteConfigCommand extends Command {
	constructor() {
		super('config-delete', {
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Deletes a value to the config.',
				usage: '<key>'
			}
		});
	}

	*args() {
		const key = yield {
			type: [
				['del-cases', 'cases'],
				['del-mod', 'modRole', 'mod', 'mod-role'],
				['del-modlog', 'modLogChannel', 'modlog', 'modchan', 'mod-channel'],
				['del-muted', 'muteRole', 'muted', 'mute-role'],
				['del-memberlog', 'memberLog', 'member', 'member-log'],
				['del-restrict', 'restrictRoles', 'restrict', 'restrict-roles'],
				['del-botlog', 'client-log', 'clientLog', 'clientlog', 'botlog']
			],
			otherwise: message => {
				const command = this.handler.modules.get('help');
				return this.handler.handleDirectCommand(message, 'config', command, true);
			}
		};

		return Flag.continue(key);
	}
}

module.exports = DeleteConfigCommand;
