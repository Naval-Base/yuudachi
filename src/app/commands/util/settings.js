const { Command } = require('discord-akairo');

class SettingsCommand extends Command {
	constructor() {
		super('settings', {
			aliases: ['settings'],
			category: 'util',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			userPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Displays the guild\'s current settings.'
			}
		});
	}

	async exec(message) {
		const prefix = this.handler.prefix(message);
		const guildlog = this.client.settings.get(message.guild, 'guildLog', undefined);
		const webhook = this.client.webhooks.get(guildlog);
		const modlog = this.client.settings.get(message.guild, 'modLog', undefined);
		const memberlog = this.client.settings.get(message.guild, 'memberLog', undefined);
		const modrole = this.client.settings.get(message.guild, 'modRole', undefined);
		const blacklist = this.client.settings.get(message.guild, 'blacklist', []);

		const embed = this.client.util.embed()
			.setColor(5861569)
			.setTitle('Settings')
			.addField('Prefix', prefix, true)
			.addField('ModRole', message.guild.roles.get(modrole) || 'None', true)
			.addField('ModLog', message.guild.channels.get(modlog) || 'None', true)
			.addField('MemberLog', message.guild.channels.get(memberlog) || 'None', true)
			.addField('GuildLog', webhook ? `<#${webhook.channelID}>` : 'None', true)
			.addField('Moderation', this.client.settings.get(message.guild, 'moderation', false) ? 'Enabled' : 'Disabled', true)
			.addField('Rolestate', this.client.settings.get(message.guild, 'roleState', false) ? 'Enabled' : 'Disabled', true)
			.addField('Blacklist', blacklist.join(', ') || 'None', true);

		return message.util.send({ embed });
	}
}

module.exports = SettingsCommand;
