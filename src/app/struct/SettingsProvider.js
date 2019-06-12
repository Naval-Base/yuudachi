const { Guild } = require('discord.js');
const { SequelizeProvider } = require('discord-akairo');

class Provider extends SequelizeProvider {
	constructor(table) {
		super(table, {
			idColumn: 'guildID',
			dataColumn: 'settings'
		});
	}

	get(guild, key, defaultValue) {
		const id = this.constructor.getGuildID(guild);
		return super.get(id, key, defaultValue);
	}

	set(guild, key, value) {
		const id = this.constructor.getGuildID(guild);
		return super.set(id, key, value);
	}

	delete(guild, key) {
		const id = this.constructor.getGuildID(guild);
		return super.delete(id, key);
	}

	clear(guild) {
		const id = this.constructor.getGuildID(guild);
		return super.clear(id);
	}

	static getGuildID(guild) {
		if (guild instanceof Guild) return guild.id;
		if (guild === 'global' || guild === null) return 'global';
		if (typeof guild === 'string' && /^\d+$/.test(guild)) return guild;
		throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
	}
}

module.exports = Provider;
