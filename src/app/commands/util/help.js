const { Command } = require('discord-akairo');

class HelpCommand extends Command {
	constructor() {
		super('help', {
			aliases: ['help'],
			category: 'util',
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'command',
					type: 'commandAlias'
				}
			],
			description: {
				content: 'Displays a list of commands or information about a command.',
				usage: '[command]',
				examples: ['', 'stats', 'tag']
			}
		});
	}

	exec(message, { command }) {
		if (!command) return this.execCommandList(message);

		const prefix = this.handler.prefix(message);
		const description = Object.assign({
			content: 'No description available.',
			usage: '',
			examples: [],
			fields: []
		}, command.description);

		const embed = this.client.util.embed()
			.setColor(5861569)
			.setTitle(`\`${prefix}${command.aliases[0]} ${description.usage}\``)
			.addField('Description', description.content);

		for (const field of description.fields) embed.addField(field.name, field.value);

		if (description.examples.length) {
			const text = `${prefix}${command.aliases[0]}`;
			embed.addField('Examples', `\`${text} ${description.examples.join(`\`\n\`${text} `)}\``, true);
		}

		if (command.aliases.length > 1) {
			embed.addField('Aliases', `\`${command.aliases.join('` `')}\``, true);
		}

		if (command.userPermissions) {
			embed.addField('User Permissions',
				`\`${command.userPermissions.join('` `').replace(/_/g, ' ').toLowerCase()
					.replace(/\b(\w)/g, char => char.toUpperCase())}\`` || null, true);
		}

		if (command.clientPermissions) {
			embed.addField('Client Permissions',
				`\`${command.clientPermissions.join('` `').replace(/_/g, ' ').toLowerCase()
					.replace(/\b(\w)/g, char => char.toUpperCase())}\`` || null, true);
		}

		return message.util.send({ embed });
	}

	async execCommandList(message) {
		const embed = this.client.util.embed()
			.setColor(5861569)
			.addField('Command List', [
				'To view details for a command, do `?help <command>`'
			]);

		for (const category of this.handler.categories.values()) {
			const title = {
				util: '\u2000Util',
				docs: '\u2000Docs',
				info: '\u2000Info',
				tags: '\u200bTags',
				music: '\u200bMusic',
				mod: '\u200bMod',
				config: '\u200bConfig',
				fun: '\u200bFun',
				reminders: '\u200bReminders',
				github: '\u200bGitHub'
			}[category.id];

			if (title) embed.addField(title, `${category.filter(cmd => cmd.aliases.length > 0).map(cmd => `\`${cmd.aliases[0]}\``).join(' ')}`);
		}

		return message.util.send({ embed });
	}
}

module.exports = HelpCommand;
