import type { Attachment, CommandInteraction, TextChannel } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import fetch from 'node-fetch';

interface AntiRaidFileArgs {
	file: Attachment;
	member_only?: boolean | undefined;
	reason?: string | undefined;
	days?: number | undefined;
	hide?: boolean | undefined;
}

async function parseFile(file: Attachment): Promise<string[]> {
	const content = await fetch(file.url).then(res => res.text());

	const ids = content.match(/\d{17,20}/g);

	if (!ids) {
		return [] as string[];
	}

	return ids as string[];
}

export async function file(
	interaction: CommandInteraction<'cached'>,
	data: AntiRaidFileArgs,
	logChannel: TextChannel,
	locale: string,
	redis: Redis,
): Promise<void> {
	const reply = await interaction.deferReply({ ephemeral: data.hide ?? true })

	const file = data.file;

	if (!file.name?.endsWith('.txt') || !file.name.endsWith('.json')) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.errors.invalid_file_type', { lng: locale }));
	}

	const ids = await parseFile(file);

	if (!ids.length) {
		throw new Error(i18next.t('command.mod.anti_raid_nuke.errors.no_ids', { lng: locale }));
	}

	const { memberOnly, reason, days } = {
		memberOnly: data.member_only,
		reason: data.reason ?? null,
		days: data.days ?? 1,
	};

	const fetchedMembers = await interaction.guild.members.fetch();
}
