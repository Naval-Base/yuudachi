import { Provider } from 'discord-akairo';
import { Guild } from 'discord.js';
import { Repository, InsertResult, DeleteResult } from 'typeorm';
import { Setting } from '../models/Settings';

export default class TypeORMProvider extends Provider {
	public repo: Repository<any>;

	public constructor(repository: Repository<any>) {
		super();

		this.repo = repository;
	}

	public async init(): Promise<void> {
		const settings = await this.repo.find();
		for (const setting of settings) {
			this.items.set(setting.guild, setting.settings);
		}
	}

	// eslint-disable-next-line
	public get(guild: string | Guild, key: string, defaultValue: any): any {
		const id = (this.constructor as typeof TypeORMProvider).getGuildId(guild);
		if (this.items.has(id)) {
			const value = this.items.get(id)[key];
			return value == null ? defaultValue : value; // eslint-disable-line
		}

		return defaultValue;
	}

	public async set(guild: string | Guild, key: string, value: any): Promise<InsertResult> {
		const id = (this.constructor as typeof TypeORMProvider).getGuildId(guild);
		const data = this.items.get(id) || {};
		data[key] = value;
		this.items.set(id, data);

		return this.repo.createQueryBuilder()
			.insert()
			.into(Setting)
			.values({ guild: id, settings: data })
			.onConflict('("guild") DO UPDATE SET "settings" = :settings')
			.setParameter('settings', data)
			.execute();
	}

	public async delete(guild: string | Guild, key: string): Promise<InsertResult> {
		const id = (this.constructor as typeof TypeORMProvider).getGuildId(guild);
		const data = this.items.get(id) || {};
		delete data[key];

		return this.repo.createQueryBuilder()
			.insert()
			.into(Setting)
			.values({ guild: id, settings: data })
			.onConflict('("guild") DO UPDATE SET "settings" = :settings')
			.setParameter('settings', null)
			.execute();
	}

	public async clear(guild: string | Guild): Promise<DeleteResult> {
		const id = (this.constructor as typeof TypeORMProvider).getGuildId(guild);
		this.items.delete(id);

		return this.repo.delete(id);
	}

	private static getGuildId(guild: string | Guild): string {
		if (guild instanceof Guild) return guild.id;
		if (guild === 'global' || guild === null) return '0';
		if (typeof guild === 'string' && /^\d+$/.test(guild)) return guild;
		throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
	}
}
