import { Listener } from 'discord-akairo';
import { Collection, Message, MessageEmbed } from 'discord.js';
import * as moment from 'moment';
import 'moment-duration-format';
import { COLORS, SETTINGS } from '../../../util/constants';

export default class MessageDeleteBulkGuildLogListener extends Listener {
	public constructor() {
		super('messageDeleteBulkGuildLog', {
			emitter: 'client',
			event: 'messageDeleteBulk',
			category: 'client',
		});
	}

	public async exec(messages: Collection<string, Message>) {
		if (messages.first()?.author.bot) return;
		const guildLogs = this.client.settings.get(messages.first()?.guild!, SETTINGS.GUILD_LOG);
		if (guildLogs) {
			const webhook = this.client.webhooks.get(guildLogs);
			if (!webhook) return;
			const output = messages.reduce((out, msg) => {
				const attachments = msg.attachments;
				out += `[${moment.utc(msg.createdTimestamp).format('YYYY/MM/DD hh:mm:ss')}] ${msg.author.tag} (${
					msg.author.id
				}): ${msg.cleanContent ? msg.cleanContent.replace(/\n/g, '\r\n') : ''}${
					attachments.size
						? `\r\n${attachments.map((attachment) => `❯ Attachment: ${attachment.proxyURL}`).join('\r\n')}`
						: ''
				}\r\n`;
				return out;
			}, '');
			const embed = new MessageEmbed()
				.setColor(COLORS.MESSAGE_DELETE)
				.setAuthor(
					`${messages.first()?.author.tag} (${messages.first()?.author.id})`,
					messages.first()?.author.displayAvatarURL(),
				)
				.addField('❯ Channel', messages.first()?.channel)
				.addField('❯ Logs', 'See attachment file for full logs (possibly above this embed)')
				.setTimestamp(new Date())
				.setFooter('Bulk Deleted');

			return webhook
				.send({
					embeds: [embed],
					files: [{ attachment: Buffer.from(output, 'utf8'), name: 'logs.txt' }],
					username: 'Logs: MESSAGE DELETED BULK',
					avatarURL: 'https://i.imgur.com/EUGvQJJ.png',
				})
				.catch((error) => {
					this.client.logger.error(error);
					const embed = new MessageEmbed()
						.setColor(COLORS.ERROR)
						.setAuthor(
							`${messages.first()?.author.tag} (${messages.first()?.author.id})`,
							messages.first()?.author.displayAvatarURL(),
						)
						.addField('❯ Channel', messages.first()?.channel)
						.addField('❯ Error', 'Bulk deletion log failed to send\nCheck console for more information')
						.setTimestamp(new Date())
						.setFooter('Bulk Delete Error');
					return webhook.send({
						embeds: [embed],
						files: [{ attachment: Buffer.from(output, 'utf8'), name: 'logs.txt' }],
						username: 'Logs: MESSAGE DELETED BULK',
						avatarURL: 'https://i.imgur.com/EUGvQJJ.png',
					});
				});
		}
	}
}
