import { CommandModules } from '../Constants';
import { add, remove, has } from './modules';

test('tags and moderation', () => {
	expect(
		has(add(CommandModules.Tags, CommandModules.Moderation), CommandModules.Tags | CommandModules.Moderation),
	).toBe(true);
});

test('all but moderation', () => {
	expect(has(remove(CommandModules.All, CommandModules.Moderation), CommandModules.Moderation)).toBe(false);
});

test('has tags', () => {
	expect(has(CommandModules.All, CommandModules.Tags)).toBe(true);
});
