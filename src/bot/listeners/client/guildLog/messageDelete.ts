import { Listener } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { COLORS, SETTINGS } from '../../../util/constants';

export default class MessageDeleteGuildLogListener extends Listener {
	public constructor() {
		super('messageDeleteGuildLog', {
			emitter: 'client',
			event: 'messageDelete',
			category: 'client',
		});
	}

	public async exec(message: Message) {
		if (message.author.bot) return;
		if (!message.guild) return;
		const guildLogs = this.client.settings.get(message.guild, SETTINGS.GUILD_LOG);
		if (guildLogs) {
			const webhook = this.client.webhooks.get(guildLogs);
			if (!webhook) return;
			const embed = new MessageEmbed()
				.setColor(COLORS.MESSAGE_DELETE)
				.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
				.addField('❯ Channel', message.channel)
				.setTimestamp(new Date())
				.setFooter('Deleted');

			if (message.content) {
				embed.addField('❯ Content', `${message.content.substring(0, 1020)}`);
			}

			if (message.attachments.size) {
				embed.addField(
					'❯ Attachment(s)',
					`• ${message.attachments.map((attachment) => attachment.proxyURL).join('\n• ')}`,
				);
			}

			if (!message.content && message.embeds.length) {
				embed.addField('❯ Embeds', `${message.embeds.length}`);
			}

			embed.addField('❯ Context Link', `[Jump To](${message.url})`, true);

			return webhook.send({
				embeds: [embed],
				username: 'Logs: MESSAGE DELETED',
				avatarURL: 'https://i.imgur.com/EUGvQJJ.png',
			});
		}
	}
}
