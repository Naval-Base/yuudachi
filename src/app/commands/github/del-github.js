const { Command } = require('discord-akairo');
const Github = require('../../models/github');

class GithubUnlinkCommand extends Command {
	constructor() {
		super('del-github', {
			aliases: ['gh-del', 'del-github', 'del-gh', 'gh-unlink'],
			category: 'github',
			channel: 'guild',
			description: {
				content: 'Deletes GitHub ID from your Discord account.',
				usage: '<member>',
				examples: ['@Suvajit']
			},
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: 'what member do you want to delete?',
						retry: 'please provide a valid member...'
					}
				}
			]
		});
	}

	async exec(message, { member }) {
		const github = await Github.destroy({ where: { user: member.user.id } });
		if (github) return message.util.send('Successfully deleted from database.');
	}
}

module.exports = GithubUnlinkCommand;
