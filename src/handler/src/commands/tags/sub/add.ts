import { Args, joinTokens } from 'lexure';
import { Message } from '@spectacles/types';
import { Sql } from 'postgres';
import i18next from 'i18next';
import Rest from '@yuudachi/rest';

export async function add(message: Message, args: Args, locale: string, sql: Sql<any>, rest: Rest) {
	const name = args.single();
	if (!name) {
		throw new Error(i18next.t('command.tag.common.execute.name_missing', { lng: locale }));
	}
	const content = args.many();
	if (!content.length) {
		throw new Error(i18next.t('command.tag.common.execute.content_missing', { lng: locale }));
	}

	const [newTag] = await sql<{ name: string }>`
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

	void rest.post(`/channels/${message.channel_id}/messages`, {
		content: i18next.t('command.tag.add.execute.added', { name: newTag.name, lng: locale }),
	});
}
