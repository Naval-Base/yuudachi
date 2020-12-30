import create, { State } from 'zustand';
import { devtools } from 'zustand/middleware';

import { GraphQLRole } from '~/interfaces/Role';

interface UserPayload {
	loggedIn: boolean;
	id: string | null;
	role: GraphQLRole | null;
	username: string | null;
	avatar: string | null;
}

interface UserState extends State {
	loggedIn: boolean;
	id: string | null;
	role: GraphQLRole | null;
	username: string | null;
	avatar: string | null;
	login: () => void;
	logout: () => void;
	setUser: (payload: UserPayload) => void;
}

export const useUserStore = create<UserState>(
	devtools((set) => ({
		loggedIn: false,
		id: null,
		role: null,
		username: null,
		avatar: null,
		login: () => set(() => ({ loggedIn: true })),
		logout: () => set(() => ({ loggedIn: false })),
		setUser: (payload: UserPayload) => set(() => ({ ...payload })),
	})),
);
