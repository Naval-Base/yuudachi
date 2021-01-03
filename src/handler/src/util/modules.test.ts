import { CommandModules } from '@yuudachi/types';
import { add, remove, has } from './modules';

test('tags and moderation', () => {
	expect(
		has(add(CommandModules.Tags, CommandModules.Moderation), CommandModules.Tags | CommandModules.Moderation),
	).toBe(true);
});

test('all but moderation', () => {
	expect(
		has(
			remove(
				CommandModules.Config | CommandModules.Moderation | CommandModules.Tags | CommandModules.Utility,
				CommandModules.Moderation,
			),
			CommandModules.Moderation,
		),
	).toBe(false);
});

test('has tags', () => {
	expect(
		has(
			CommandModules.Config | CommandModules.Moderation | CommandModules.Tags | CommandModules.Utility,
			CommandModules.Tags,
		),
	).toBe(true);
});
