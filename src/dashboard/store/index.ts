import { GetterTree, ActionContext, ActionTree, MutationTree } from 'vuex';

export const types = {
	SET_AUTH: 'setAuth',
	SET_USER: 'setUser',
	SET_GUILDS: 'setGuilds'
};

export interface User {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	bot: boolean | null;
	locale: string | null;
	verified: string | null;
	email: string | null;
	flags: number | null;
	premium_type: number | null;
}

export interface Guild {
	id: string;
	name: string;
	icon: string | null;
	owner: boolean;
	permission: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface State {
	authenticated: boolean;
	user: User | null;
	guilds: Guild[];
}

// eslint-disable-next-line @typescript-eslint/promise-function-async
export const state = (): State => ({
	authenticated: false,
	user: null,
	guilds: []
});

export const getters: GetterTree<State, State> = {
	authenticated: state => state.authenticated,
	user: state => state.user,
	guilds: state => state.guilds
};

export interface Actions<S, R> extends ActionTree<S, R> {
	nuxtServerInit(context: ActionContext<S, R>): void;
}

export const actions: Actions<State, State> = {
	nuxtServerInit() {}
};

export const mutations: MutationTree<State> = {
	[types.SET_AUTH](state, { authenticated }: { authenticated: boolean }) {
		state.authenticated = authenticated;
	},
	[types.SET_USER](state, { user }: { user: User }) {
		state.user = user;
	},
	[types.SET_GUILDS](state, { guilds }: { guilds: Guild[] }) {
		state.guilds = guilds;
	}
};
