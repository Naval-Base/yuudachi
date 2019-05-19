import { Argument, Command } from 'discord-akairo';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { stripIndents } from 'common-tags';
import Util from '../../util';
import { Case } from '../../models/Cases';
import { MoreThan } from 'typeorm';
const ms = require('@naval-base/ms'); // eslint-disable-line

interface Actions {
	[key: number]: string;
}

const ACTIONS: Actions = {
	1: 'Ban',
	2: 'Unban',
	3: 'Softban',
	4: 'Kick',
	5: 'Mute',
	6: 'Embed restriction',
	7: 'Emoji restriction',
	8: 'Reaction restriction',
	9: 'Warn'
};

export default class CaseDeleteCommand extends Command {
	public constructor() {
		super('case-delete', {
			category: 'mod',
			description: {
				content: 'Delete a case from the database.',
				usage: '<case>',
				examples: ['1234']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'caseNum',
					type: Argument.union('number', 'string'),
					prompt: {
						start: (message: Message): string => `${message.author}, what case do you want to delete?`,
						retry: (message: Message): string => `${message.author}, please enter a case number.`
					}
				}
			]
		});
	}

	// @ts-ignore
	public userPermissions(message: Message): string | null {
		const staffRole = this.client.settings.get(message.guild!, 'modRole', undefined);
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(message: Message, { caseNum }: { caseNum: number | string }): Promise<Message | Message[] | void> {
		let totalCases = this.client.settings.get(message.guild!, 'caseTotal', 0);
		const caseToFind = caseNum === 'latest' || caseNum === 'l' ? totalCases : caseNum;
		if (isNaN(caseToFind)) return message.reply('at least provide me with a correct number.');
		const casesRepo = this.client.db.getRepository(Case);
		const dbCase = await casesRepo.findOne({ case_id: caseToFind });
		if (!dbCase) {
			return message.reply('I looked where I could, but I couldn\'t find a case with that Id, maybe look for something that actually exists next time!');
		}

		const moderator = await message.guild!.members.fetch(dbCase.mod_id);
		const color = Object.keys(Util.CONSTANTS.ACTIONS).find((key): boolean => Util.CONSTANTS.ACTIONS[key] === dbCase.action)!.split(' ')[0].toUpperCase();
		const embed = new MessageEmbed()
			.setAuthor(`${dbCase.mod_tag} (${dbCase.mod_id})`, moderator ? moderator.user.displayAvatarURL() : '')
			.setColor(Util.CONSTANTS.COLORS[color])
			.setDescription(stripIndents`
				**Member:** ${dbCase.target_tag} (${dbCase.target_id})
				**Action:** ${ACTIONS[dbCase.action]}${dbCase.action === 5 ? `\n**Length:** ${ms(dbCase.action_duration.getTime() - dbCase.createdAt.getTime(), { 'long': true })}` : ''}
				**Reason:** ${dbCase.reason}${dbCase.ref_id ? `\n**Ref case:** ${dbCase.ref_id}` : ''}
			`)
			.setFooter(`Case ${dbCase.case_id}`)
			.setTimestamp(new Date(dbCase.createdAt));

		await message.channel.send('You sure you want me to delete this case?', { embed });
		const responses = await message.channel.awaitMessages((msg): boolean => msg.author.id === message.author!.id, {
			max: 1,
			time: 1000
		});

		if (!responses || responses.size !== 1) return message.reply('timed out. Cancelled delete.');
		const response = responses.first();

		let sentMessage;
		if (/^y(?:e(?:a|s)?)?$/i.test(response!.content)) {
			sentMessage = await message.channel.send(`Deleting **${dbCase.case_id}**...`) as Message;
		} else {
			return message.reply('cancelled delete.');
		}

		totalCases = this.client.settings.get(message.guild!, 'caseTotal', 0) as number - 1;
		this.client.settings.set(message.guild!, 'caseTotal', totalCases);

		const modLogChannel = this.client.settings.get(message.guild!, 'modLogChannel', undefined);
		if (modLogChannel) {
			const chan = await this.client.channels.get(modLogChannel) as TextChannel;
			try {
				const msgToDelete = await chan.messages.fetch(dbCase.message);
				await msgToDelete.delete();
			} catch {}
			this._fixCases(totalCases, modLogChannel);
		}

		const restrictRoles = this.client.settings.get(message.guild!, 'restrictRoles', undefined);
		if (restrictRoles) {
			switch (dbCase.action) {
				case 5:
					// eslint-disable-next-line no-case-declarations
					let member;
					try {
						member = await message.guild!.members.fetch(dbCase.target_id);
					} catch {
						break;
					}
					if (!member) break;
					// eslint-disable-next-line no-case-declarations
					const key = `${message.guild!.id}:${member.id}:MUTE`;
					try {
						this.client.cachedCases.add(key);
						await member.roles.remove(restrictRoles.embed, `Mute removed by ${message.author!.tag} | Removed Case #${dbCase.case_id}`);
					} catch (error) {
						this.client.cachedCases.delete(key);
						message.reply(`there was an error removing the mute on this member: \`${error}\``);
					}
					break;
				case 6:
					try {
						// eslint-disable-next-line no-shadow
						let member;
						try {
							member = await message.guild!.members.fetch(dbCase.target_id);
						} catch {
							break;
						}
						if (!member) break;
						await member.roles.remove(restrictRoles.embed, `Embed restriction removed by ${message.author!.tag} | Removed Case #${dbCase.case_id}`);
					} catch (error) {
						message.reply(`there was an error removing the embed restriction on this member: \`${error}\``);
					}
					break;
				case 7:
					try {
						// eslint-disable-next-line no-shadow
						let member;
						try {
							member = await message.guild!.members.fetch(dbCase.target_id);
						} catch {
							break;
						}
						if (!member) break;
						await member.roles.remove(restrictRoles.emoji, `Emoji restriction removed by ${message.author!.tag} | Removed Case #${dbCase.case_id}`);
					} catch (error) {
						message.reply(`there was an error removing the emoji restriction on this member: \`${error}\``);
					}
					break;
				case 8:
					try {
						// eslint-disable-next-line no-shadow
						let member;
						try {
							member = await message.guild!.members.fetch(dbCase.target_id);
						} catch {
							break;
						}
						if (!member) break;
						await member.roles.remove(restrictRoles.reaction, `Reaction restriction removed by ${message.author!.tag} | Removed Case #${dbCase.case_id}`);
					} catch (error) {
						message.reply(`there was an error removing the reaction restriction on this member: \`${error}\``);
					}
					break;
				default:
					break;
			}
		}

		await casesRepo.remove(dbCase);

		return sentMessage.edit(`Successfully deleted case **${dbCase.case_id}**`);
	}

	private async _fixCases(caseNum: number, modLogChannel: string): Promise<void> {
		const casesRepo = this.client.db.getRepository(Case);
		const cases = await casesRepo.find({ case_id: MoreThan(caseNum) });
		let newCaseNum = caseNum;

		for (const c of cases) {
			const chan = this.client.channels.get(modLogChannel) as TextChannel;
			try {
				newCaseNum++;
				const msg = await chan.messages.fetch(c.message);
				await msg.edit({ embed: msg.embeds[0].setFooter(`Case ${newCaseNum}`) });
			} catch {}
			c.case_id = newCaseNum;
			await casesRepo.save(c);
		}
	}
}
