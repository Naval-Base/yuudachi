import { Listener } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { SETTINGS } from '../../util/constants';

export default class MessageDeleteListener extends Listener {
	public constructor() {
		super('messageDelete', {
			emitter: 'client',
			event: 'messageDelete',
			category: 'client',
		});
	}

	public async exec(message: Message) {
		if (message.author!.bot) return;
		if (!message.guild) return;
		if (!message.content) return;
		const guildLogs = this.client.settings.get<string>(message.guild, SETTINGS.GUILD_LOGS, undefined);
		if (guildLogs) {
			const webhook = this.client.webhooks.get(guildLogs);
			if (!webhook) return;
			const attachment = message.attachments.first();
			const embed = new MessageEmbed()
				.setColor(0x824aee)
				.setAuthor(`${message.author!.tag} (${message.author!.id})`, message.author!.displayAvatarURL())
				.addField('❯ Channel', message.channel)
				.addField('❯ Message', `${message.content.substring(0, 1020)}`);
			if (attachment) embed.addField('❯ Attachment(s)', attachment.url);
			embed.setTimestamp(new Date());
			embed.setFooter('Deleted');

			return webhook.send({
				embeds: [embed],
				username: 'Logs: MESSAGE DELETED',
				avatarURL: 'https://i.imgur.com/EUGvQJJ.png',
			});
		}
	}
}
