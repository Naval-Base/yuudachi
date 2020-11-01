import { Args, joinTokens } from 'lexure';
import { Message } from '@spectacles/types';
import { Sql } from 'postgres';
import i18next from 'i18next';
import Rest from '@yuudachi/rest';

export async function update(message: Message, args: Args, locale: string, sql: Sql<any>, rest: Rest, rename = false) {
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
		[updatedTag] = await sql<{ name: string }>`
			update tags
			set name = ${joinTokens(content)}
			where name = ${name}
				and guild_id = ${message.guild_id!}
			returning name`;
	} else {
		[updatedTag] = await sql<{ name: string }>`
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

	void rest.post(`/channels/${message.channel_id}/messages`, {
		content: i18next.t('command.tag.update.execute.updated', { name: updatedTag.name, lng: locale }),
	});
}
