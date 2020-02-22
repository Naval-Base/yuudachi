import { Command } from 'discord-akairo';
import { Message, MessageEmbed, Permissions } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class CheckConfigCommand extends Command {
	public constructor() {
		super('config-check', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.CHECK.DESCRIPTION,
			},
			category: 'config',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
		});
	}

	public async exec(message: Message) {
		const guild = message.guild!;
		const mod = this.client.settings.get(guild, SETTINGS.MODERATION);
		const mute = this.client.settings.get(guild, SETTINGS.MUTE_ROLE);
		const modlog = this.client.settings.get(guild, SETTINGS.MOD_LOG);
		const guildlog = this.client.settings.get(guild, SETTINGS.GUILD_LOG);
		const memberlog = this.client.settings.get(guild, SETTINGS.MEMBER_LOG, { ID: '', MENTION: false });
		let guildlogChannel;
		if (guildlog) {
			guildlogChannel = this.client.webhooks.get(guildlog)?.channelID;
		}

		return message.util?.send(
			new MessageEmbed()
				.addField('❯ Moderation', mod ? '`✅`' : '`❌`')
				.addField('❯ Mute Role', mute ? `${guild.roles.cache.get(mute)} \`✅\`` : '`❌`', true)
				.addField('❯ Mod Log', modlog ? `${guild.channels.cache.get(modlog)} \`✅\`` : '`❌`', true)
				.addField('❯ Guild Log', guildlogChannel ? `${guild.channels.cache.get(guildlogChannel)} \`✅\`` : '`❌`', true)
				.addField(
					'❯ Member Log',
					memberlog.ID
						? `${guild.channels.cache.get(memberlog.ID)} ${memberlog.MENTION ? '(w/ mention)' : ''} \`✅\``
						: '`❌`',
					true,
				)
				.setThumbnail(guild.iconURL() ?? ''),
		);
	}
}
