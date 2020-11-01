import { Args, joinTokens } from 'lexure';
import { Message } from '@spectacles/types';
import { Sql } from 'postgres';
import i18next from 'i18next';
import Rest from '@yuudachi/rest';

export async function remove(message: Message, args: Args, locale: string, sql: Sql<any>, rest: Rest) {
	const name = args.many();
	const user = args.option('user');

	if (name.length) {
		const [deletedTag] = await sql<{ name: string }>`
			delete from tags
			where name = ${joinTokens(name)}
				and guild_id = ${message.guild_id!}
			returning name`;
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!deletedTag) {
			throw new Error(i18next.t('command.tag.common.execute.not_found', { lng: locale }));
		}

		return rest.post(`/channels/${message.channel_id}/messages`, {
			content: i18next.t('command.tag.delete.execute.deleted', { name: deletedTag.name, lng: locale }),
		});
	} else if (user) {
		const deletedTags = await sql<{ name: string }>`
			delete from tags
			where user_id = ${user}
				and guild_id = ${message.guild_id!}
			returning name`;
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!deletedTags.length) {
			throw new Error(i18next.t('command.tag.common.execute.not_found', { lng: locale }));
		}

		return rest.post(`/channels/${message.channel_id}/messages`, {
			content: i18next.t('command.tag.delete.execute.deleted_user', {
				name: user,
				count: deletedTags.length,
				lng: locale,
			}),
		});
	}

	throw new Error(i18next.t('command.tag.delete.execute.missing_arguments', { lng: locale }));
}
