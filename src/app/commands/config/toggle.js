const { Command, Flag } = require('discord-akairo');

class ToggleCommand extends Command {
	constructor() {
		super('toggle', {
			aliases: ['toggle'],
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: [
					'Available Keys',
					' • logs `<webhook>`',
					' • mod',
					' • rolestate',
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
				['toggle-logs', 'logs'],
				['toggle-moderation', 'mod', 'moderation'],
				['toggle-role-state', 'role', 'rolestate', 'role-state']
			],
			otherwise: message => {
				const command = this.handler.modules.get('help');
				return this.handler.handleDirectCommand(message, 'toggle', command, true);
			}
		};

		return Flag.continue(method);
	}
}

module.exports = ToggleCommand;
