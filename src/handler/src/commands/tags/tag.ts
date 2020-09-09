import { injectable, inject } from 'tsyringe';
import { Message } from '@spectacles/types';
import { Args, joinTokens } from 'lexure';
import Rest from '@yuudachi/rest';
import { Sql } from 'postgres';
import i18next from 'i18next';

import Command from '../../Command';
import { kSQL } from '../../tokens';

@injectable()
export default class implements Command {
	public constructor(private readonly rest: Rest, @inject(kSQL) private readonly sql: Sql<any>) {}

	public async execute(message: Message, args: Args, locale: string) {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.tag.common.execute.no_guild', { lng: locale }));
		}

		const sub = args.single();
		switch (sub) {
			case 'add': {
				return this.add(message, args, locale);
			}

			case 'update': {
				return this.update(message, args, false, locale);
			}

			case 'rename': {
				return this.update(message, args, true, locale);
			}

			case 'rm':
			case 'remove':
			case 'delete': {
				return this.delete(message, args, locale);
			}

			case 'alias': {
				return this.alias(message, args, locale);
			}

			default: {
				const name = args.many();
				if (!name.length) {
					throw new Error(i18next.t('command.tag.common.execute.name_missing', { lng: locale }));
				}

				const [tag] = await this.sql<{ content: string }>`
					select content
					from tags
					where name = ${joinTokens(name)}
						and guild_id = ${message.guild_id};`;
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (!tag) {
					throw new Error(i18next.t('command.tag.common.execute.not_found', { lng: locale }));
				}
				void this.rest.post(`/channels/${message.channel_id}/messages`, { content: tag.content });
				break;
			}
		}
	}

	private async add(message: Message, args: Args, locale: string) {
		const name = args.single();
		if (!name) {
			throw new Error(i18next.t('command.tag.common.execute.name_missing', { lng: locale }));
		}
		const content = args.many();
		if (!content.length) {
			throw new Error(i18next.t('command.tag.common.execute.content_missing', { lng: locale }));
		}

		const [newTag] = await this.sql<{ name: string }>`
			insert into tags (
				guild_id,
				user_id,
				name,
				content
			) values (
				${message.guild_id!},
				${message.author.id},
				${name},
				${joinTokens(content)}
			)
			returning name`;
		void this.rest.post(`/channels/${message.channel_id}/messages`, {
			content: i18next.t('command.tag.add.execute.added', { name: newTag.name, lng: locale }),
		});
	}

	private async update(message: Message, args: Args, rename = false, locale: string) {
		const name = args.single();
		if (!name) {
			throw new Error(i18next.t('command.tag.common.execute.name_missing', { lng: locale }));
		}
		const content = args.many();
		if (!content.length) {
			throw new Error(i18next.t('command.tag.common.execute.content_missing', { lng: locale }));
		}

		let updatedTag;
		if (rename) {
			[updatedTag] = await this.sql<{ name: string }>`
			update tags
			set name = ${joinTokens(content)}
			where name = ${name}
				and guild_id = ${message.guild_id!}
			returning name`;
		} else {
			[updatedTag] = await this.sql<{ name: string }>`
			update tags
			set content = ${joinTokens(content)}
			where name = ${name}
				and guild_id = ${message.guild_id!}
			returning name`;
		}
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!updatedTag) {
			throw new Error(i18next.t('command.tag.common.execute.not_found', { lng: locale }));
		}
		void this.rest.post(`/channels/${message.channel_id}/messages`, {
			content: i18next.t('command.tag.update.execute.updated', { name: updatedTag.name, lng: locale }),
		});
	}

	private async delete(message: Message, args: Args, locale: string) {
		const name = args.many();
		const user = args.option('user');

		if (name.length) {
			const [deletedTag] = await this.sql<{ name: string }>`
				delete from tags
				where name = ${joinTokens(name)}
					and guild_id = ${message.guild_id!}
				returning name`;
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!deletedTag) {
				throw new Error(i18next.t('command.tag.common.execute.not_found', { lng: locale }));
			}
			return this.rest.post(`/channels/${message.channel_id}/messages`, {
				content: i18next.t('command.tag.delete.execute.deleted', { name: deletedTag.name, lng: locale }),
			});
		} else if (user) {
			const deletedTags = await this.sql<{ name: string }>`
				delete from tags
				where user_id = ${user}
					and guild_id = ${message.guild_id!}
				returning name`;
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!deletedTags.length) {
				throw new Error(i18next.t('command.tag.common.execute.not_found', { lng: locale }));
			}
			return this.rest.post(`/channels/${message.channel_id}/messages`, {
				content: i18next.t('command.tag.delete.execute.deleted_user', {
					name: user,
					count: deletedTags.length,
					lng: locale,
				}),
			});
		}

		throw new Error(i18next.t('command.tag.delete.execute.missing_arguments', { lng: locale }));
	}

	private async alias(message: Message, args: Args, locale: string) {
		const sub = args.single();

		const checkAliases = async (name: string) => {
			const [aliasedTags] = await this.sql<{ name: string }>`
				select name
				from tags
				where (
					name = ${name}
					or
					aliases @> ${this.sql.array([name])}
				)
					and guild_id = ${message.guild_id!}`;
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (aliasedTags) {
				throw new Error(i18next.t('command.tag.alias.execute.exists', { name: aliasedTags.name, lng: locale }));
			}
		};

		switch (sub) {
			case 'add': {
				const name = args.single();
				if (!name) {
					throw new Error(i18next.t('command.tag.common.execute.name_missing', { lng: locale }));
				}
				const alias = joinTokens(args.many(), ' ', false);
				if (!alias) {
					throw new Error(i18next.t('command.tag.alias.execute.alias_missing', { lng: locale }));
				}

				await checkAliases(alias);

				const [updatedTag] = await this.sql<{ name: string; aliases: string[] }>`
					update tags
					set aliases = array_cat(aliases, ${this.sql.array([alias])})
					where name = ${name}
						and guild_id = ${message.guild_id!}
					returning name, aliases`;
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (!updatedTag) {
					throw new Error(i18next.t('command.tag.common.execute.not_found', { lng: locale }));
				}
				void this.rest.post(`/channels/${message.channel_id}/messages`, {
					content: i18next.t('command.tag.alias.execute.aliased', {
						name: updatedTag.name,
						aliases: updatedTag.aliases,
						lng: locale,
					}),
				});
				break;
			}

			case 'rm':
			case 'remove':
			case 'delete': {
				const name = args.single();
				if (!name) {
					throw new Error(i18next.t('command.tag.common.execute.name_missing', { lng: locale }));
				}
				const alias = joinTokens(args.many(), ' ', false);
				if (!alias) {
					throw new Error(i18next.t('command.tag.alias.execute.alias_missing', { lng: locale }));
				}

				const [updatedTag] = await this.sql<{ name: string; aliases: string[] }>`
					update tags
					set aliases = array_remove(aliases, ${alias})
					where name = ${name}
						and guild_id = ${message.guild_id!}
					returning name, aliases`;
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (!updatedTag) {
					throw new Error(i18next.t('command.tag.common.execute.not_found', { lng: locale }));
				}
				void this.rest.post(`/channels/${message.channel_id}/messages`, {
					content: i18next.t('command.tag.alias.execute.unaliased', {
						name: updatedTag.name,
						aliases: alias,
						lng: locale,
						joinArrays: ', ',
					}),
				});
				break;
			}

			default:
				throw new Error(i18next.t('command.tag.alias.execute.invalid_subcommand', { lng: locale }));
		}
	}
}
