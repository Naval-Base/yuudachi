import { ms } from '@naval-base/ms';
import { ButtonStyle, Collection, GuildMember } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import { createButton } from '../../util/button.js';
import { createMessageActionRow } from '../../util/messageActionRow.js';

export function createAntiRaidActionRow(locale: string) {
	const banKey = nanoid();
	const cancelKey = nanoid();
	const dryRunKey = nanoid();

	const banButton = createButton({
		customId: banKey,
		label: i18next.t('command.mod.anti_raid_nuke.buttons.execute', { lng: locale }),
		style: ButtonStyle.Danger,
	});
	const cancelButton = createButton({
		customId: cancelKey,
		label: i18next.t('command.mod.anti_raid_nuke.buttons.cancel', { lng: locale }),
		style: ButtonStyle.Secondary,
	});
	const dryRunButton = createButton({
		customId: dryRunKey,
		label: i18next.t('command.mod.anti_raid_nuke.buttons.dry_run', { lng: locale }),
		style: ButtonStyle.Primary,
	});

	return {
		actionRow: createMessageActionRow([cancelButton, banButton, dryRunButton]),
		banKey,
		cancelKey,
		dryRunKey,
	};
}

export function formatMemberTimestamps(members: Collection<string, GuildMember>) {
	let creationLower = Number.POSITIVE_INFINITY;
	let creationUpper = Number.NEGATIVE_INFINITY;
	let joinLower = Number.POSITIVE_INFINITY;
	let joinUpper = Number.NEGATIVE_INFINITY;

	for (const member of members.values()) {
		if (member.joinedTimestamp) {
			joinLower = Math.min(member.joinedTimestamp, joinLower);
			joinUpper = Math.max(member.joinedTimestamp, joinUpper);
		}
		creationLower = Math.min(member.user.createdTimestamp, creationLower);
		creationUpper = Math.max(member.user.createdTimestamp, creationUpper);
	}

	const creationrange = ms(creationUpper - creationLower, true);
	const joinrange = ms(joinUpper - joinLower, true);

	return {
		creationrange,
		joinrange,
	};
}
