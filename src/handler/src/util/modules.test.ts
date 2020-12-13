import { CommandModules } from '../Constants';
import { add, remove, has } from './modules';

describe('add', () => {
	test('config and moderation', () => {
		expect(
			has(add(CommandModules.Config, CommandModules.Moderation), CommandModules.Config | CommandModules.Moderation),
		).toBe(true);
	});
});

describe('remove', () => {
	test('all but moderation', () => {
		expect(has(remove(CommandModules.All, CommandModules.Moderation), CommandModules.Moderation)).toBe(false);
	});
});

describe('has', () => {
	test('has moderation', () => {
		expect(has(CommandModules.All, CommandModules.Moderation)).toBe(true);
	});
});
