import { CommandModules } from '../Constants';

export function add(root: CommandModules, perm: CommandModules) {
	return root | perm;
}

export function remove(root: CommandModules, perm: CommandModules) {
	return root & ~perm;
}

export function has(root: CommandModules, perm: CommandModules) {
	return Boolean(root & perm);
}
