import create, { State } from 'zustand';

interface UserPayload {
	loggedIn: boolean | null;
	id: string | null;
	username: string | null;
	avatar: string | null;
	guilds: { guild_id: string; manage: boolean }[] | null;
}

export interface UserState extends State {
	loggedIn: boolean | null;
	id: string | null;
	username: string | null;
	avatar: string | null;
	guilds: { guild_id: string; manage: boolean }[] | null;
	login: () => void;
	logout: () => void;
	setUser: (payload: UserPayload) => void;
}

export const useUserStore = create<UserState>((set) => ({
	loggedIn: null,
	id: null,
	username: null,
	avatar: null,
	guilds: null,
	login: () => set(() => ({ loggedIn: true })),
	logout: () => set(() => ({ loggedIn: false })),
	setUser: (payload: UserPayload) => set(() => ({ ...payload })),
}));
