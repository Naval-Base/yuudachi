import { useMemo, useContext } from 'react';
import create, { State, UseStore } from 'zustand';

import { StoreContext } from '~/components/ZustandProvider';

import { GraphQLRole } from '~/interfaces/Role';

let store: UseStore<UserState> | undefined;

interface UserPayload {
	loggedIn: boolean;
	id: string | null;
	role: GraphQLRole | null;
	username: string | null;
	avatar: string | null;
}

export interface UserState extends State {
	loggedIn: boolean;
	id: string | null;
	role: GraphQLRole | null;
	username: string | null;
	avatar: string | null;
	login: () => void;
	logout: () => void;
	setUser: (payload: UserPayload) => void;
}

export const createUserStore = (initialState = {}) => {
	return create<UserState>((set) => ({
		loggedIn: false,
		id: null,
		role: null,
		username: null,
		avatar: null,
		...initialState,
		login: () => set(() => ({ loggedIn: true })),
		logout: () => set(() => ({ loggedIn: false })),
		setUser: (payload: UserPayload) => set(() => ({ ...payload })),
	}));
};

export const initializeUserStore = (preloadedState?: any) => {
	let _store = store ?? createUserStore(preloadedState);

	if (preloadedState && store) {
		_store = createUserStore({ ...store.getState(), ...preloadedState });
		store = undefined;
	}

	if (typeof window === 'undefined') {
		return _store;
	}
	if (!store) {
		store = _store;
	}

	return _store;
};

export const useHydrateUserStore = (initialState: any) => {
	const state = typeof initialState === 'string' ? JSON.parse(initialState) : initialState;
	return useMemo(() => initializeUserStore(state), [state]);
};

export const useUserStore = () => {
	const store = useContext(StoreContext)!;
	return store();
};
