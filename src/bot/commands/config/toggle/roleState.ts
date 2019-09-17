import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { RoleState } from '../../../models/RoleStates';
import { MESSAGES, SETTINGS } from '../../../util/constants';

export default class ToggleRoleStateCommand extends Command {
	public constructor() {
		super('toggle-role-state', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.TOGGLE.ROLE_STATE.DESCRIPTION,
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
		});
	}

	public async exec(message: Message) {
		const roleState = this.client.settings.get(message.guild!, SETTINGS.ROLE_STATE, undefined);
		if (roleState) {
			this.client.settings.set(message.guild!, SETTINGS.ROLE_STATE, false);
			const userRepo = this.client.db.getRepository(RoleState);
			const users = await userRepo.find({ guild: message.guild!.id });
			for (const user of users) userRepo.remove(user);

			return message.util!.reply(MESSAGES.COMMANDS.CONFIG.TOGGLE.ROLE_STATE.REPLY_DEACTIVATED);
		}
		this.client.settings.set(message.guild!, SETTINGS.ROLE_STATE, true);
		const members = await message.guild!.members.fetch();
		const records: RoleState[] = [];
		for (const member of members.values()) {
			const roles = member.roles.filter(role => role.id !== message.guild!.id).map(role => role.id);
			if (!roles) continue;
			const rs = new RoleState();
			rs.guild = message.guild!.id;
			rs.user = member.id;
			rs.roles = roles;
			records.push(rs);
		}
		const userRepo = this.client.db.getRepository(RoleState);
		await userRepo.save(records);

		return message.util!.reply(MESSAGES.COMMANDS.CONFIG.TOGGLE.ROLE_STATE.REPLY_ACTIVATED);
	}
}
