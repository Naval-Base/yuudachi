import create, { State } from 'zustand';

import { GraphQLRole } from '~/interfaces/Role';

interface UserPayload {
	loggedIn: boolean | null;
	id: string | null;
	role: GraphQLRole | null;
	username: string | null;
	avatar: string | null;
}

export interface UserState extends State {
	loggedIn: boolean | null;
	id: string | null;
	role: GraphQLRole | null;
	username: string | null;
	avatar: string | null;
	login: () => void;
	logout: () => void;
	setUser: (payload: UserPayload) => void;
}

export const useUserStore = create<UserState>((set) => ({
	loggedIn: null,
	id: null,
	role: null,
	username: null,
	avatar: null,
	login: () => set(() => ({ loggedIn: true })),
	logout: () => set(() => ({ loggedIn: false })),
	setUser: (payload: UserPayload) => set(() => ({ ...payload })),
}));
