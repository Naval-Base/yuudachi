import { Listener, PrefixSupplier } from 'discord-akairo';
import { Message, Guild, User, TextChannel } from 'discord.js';
import Util, { ACTIONS, COLORS } from '../../util';
import { Case } from '../../models/Cases';

export default class GuildBanAddListener extends Listener {
	public constructor() {
		super('guildBanAdd', {
			emitter: 'client',
			event: 'guildBanAdd',
			category: 'client'
		});
	}

	public async exec(guild: Guild, user: User) {
		if (!this.client.settings.get<boolean>(guild, 'moderation', undefined)) return;
		if (this.client.cachedCases.delete(`${guild.id}:${user.id}:BAN`)) return;
		const totalCases = this.client.settings.get<number>(guild, 'caseTotal', 0) + 1;
		this.client.settings.set(guild, 'caseTotal', totalCases);
		const modLogChannel = this.client.settings.get<string>(guild, 'modLogChannel', undefined);
		let modMessage;
		if (modLogChannel) {
			const prefix = (this.client.commandHandler.prefix as PrefixSupplier)({ guild } as Message);
			const reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
			const embed = (await Util.logEmbed({ member: user, action: 'Ban', caseNum: totalCases, reason })).setColor(COLORS.BAN);
			modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(embed);
		}
		const casesRepo = this.client.db.getRepository(Case);
		const dbCase = new Case();
		dbCase.guild = guild.id;
		if (modMessage) dbCase.message = modMessage.id;
		dbCase.case_id = totalCases;
		dbCase.target_id = user.id;
		dbCase.target_tag = user.tag;
		dbCase.action = ACTIONS.BAN;
		await casesRepo.save(dbCase);
	}
}
