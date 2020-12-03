import { CommandModules } from '../Constants';
import { add, remove, has } from './modules';

describe('add', () => {
	test('tags and moderation', () => {
		expect(
			has(add(CommandModules.Tags, CommandModules.Moderation), CommandModules.Tags | CommandModules.Moderation),
		).toBe(true);
	});
});

describe('remove', () => {
	test('all but moderation', () => {
		expect(has(remove(CommandModules.All, CommandModules.Moderation), CommandModules.Moderation)).toBe(false);
	});
});

describe('has', () => {
	test('has tags', () => {
		expect(has(CommandModules.All, CommandModules.Tags)).toBe(true);
	});
});
