import { GetterTree, ActionContext, ActionTree, MutationTree } from 'vuex';
import gql from 'graphql-tag';

export const types = {
	SET_AUTH: 'setAuth',
	SET_USER: 'setUser',
	SET_GUILDS: 'setGuilds',
	SELECT_GUILD: 'selectGuild',
	SELECT_TAG: 'selectTag',
	SHOW_TAG_MODAL: 'showTagModal'
};

export interface Guild {
	id: string;
	name: string;
	icon: string | null;
	owner: boolean;
	permissions: number;
}

export interface GuildSettings {
	prefix?: string;
	moderation?: boolean;
	muteRole?: string;
	restrictRoles?: {
		embed?: string;
		reaction?: string;
		emoji?: string;
	};
	modRole?: string;
	modLogChannel?: string;
	caseTotal?: number;
	guildLogs?: string;
	githubRepository?: string;
	defaultDocs?: string;
}

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
	guilds: Guild[];
}

export interface State {
	authenticated: boolean;
	user: User | null;
	guilds: Guild[];
	selectedGuild: {
		id: string | null;
		member: {
			roles: {
				id: string;
				name: string;
			}[]
		} | null;
		settings: GuildSettings | null;
	};
	selectedTag: number | null;
	tagModal: boolean;
}

export const state = (): State => ({
	authenticated: false,
	user: null,
	guilds: [],
	selectedGuild: {
		id: null,
		member: null,
		settings: null
	},
	selectedTag: null,
	tagModal: false
});

export const getters: GetterTree<State, State> = {
	authenticated: state => state.authenticated,
	user: state => state.user,
	guilds: state => state.guilds,
	selectedGuild: state => {
		const g = state.guilds.find(guild => guild.id === state.selectedGuild!.id);
		return g ? g : null;
	},
	selectedTag: state => state.selectedTag,
	tagModal: state => state.tagModal
};

export interface Actions<S, R> extends ActionTree<S, R> {
	nuxtServerInit(context: ActionContext<S, R>, { app }: { app: any }): void;
	login(context: ActionContext<S, R>, user: User): void;
	logout(context: ActionContext<S, R>): void;
	selectGuild(context: ActionContext<S, R>, { id, member, settings }: { id: string; member: any; settings: GuildSettings }): void;
	selectTag(context: ActionContext<S, R>, id: number): void;
	showTagModal(context: ActionContext<S, R>, state: boolean): void;
}

export const actions: Actions<State, State> = {
	async nuxtServerInit({ dispatch }, { app }) {
		// @ts-ignore
		const cookies = this.$cookies.getAll();
		if (!cookies.token) {
			dispatch('logout');
			return;
		}

		try {
			const client = app.apolloProvider.defaultClient;
			const res = await client.query({
				query: gql`{
					me {
						id
						username
						discriminator
						avatar
						bot
						locale
						verified
						email
						flags
						premium_type
						guilds {
							id
							name
							icon
							owner
							permissions
						}
					}
				}`
			});

			await dispatch('login', res.data.me);
		} catch {
			await dispatch('logout');
		}
	},
	login({ commit }, user) {
		const { guilds, ...rest } = user;
		commit(types.SET_USER, { user: rest });
		commit(types.SET_GUILDS, { guilds });
		commit(types.SET_AUTH, true);
	},
	logout({ commit }) {
		commit(types.SET_USER, { user: null });
		commit(types.SET_GUILDS, { guilds: [] });
		commit(types.SET_AUTH, false);
	},
	selectGuild({ commit }, { id, member, settings }) {
		commit(types.SELECT_GUILD, { id, member, settings });
	},
	selectTag({ commit }, id: number) {
		commit(types.SELECT_TAG, id);
	},
	showTagModal({ commit }, state: boolean) {
		commit(types.SHOW_TAG_MODAL, state);
	}
};

export const mutations: MutationTree<State> = {
	[types.SET_AUTH](state, authenticated: boolean) {
		state.authenticated = authenticated;
	},
	[types.SET_USER](state, { user }: { user: User }) {
		state.user = user;
	},
	[types.SET_GUILDS](state, { guilds }: { guilds: Guild[] }) {
		state.guilds = guilds;
	},
	[types.SELECT_GUILD](state, { id, member, settings }: { id: string; member: any; settings: GuildSettings }) {
		state.selectedGuild = { id, member, settings };
	},
	[types.SELECT_TAG](state, id: number) {
		state.selectedTag = id;
	},
	[types.SHOW_TAG_MODAL](state, s: boolean) {
		state.tagModal = s;
	}
};
