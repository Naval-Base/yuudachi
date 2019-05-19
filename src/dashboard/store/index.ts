import { GetterTree, ActionContext, ActionTree, MutationTree } from 'vuex';

export const types = {};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface State {}

// eslint-disable-next-line @typescript-eslint/promise-function-async
export const state = (): State => ({});

export const getters: GetterTree<State, State> = {};

export interface Actions<S, R> extends ActionTree<S, R> {
	nuxtServerInit(context: ActionContext<S, R>): void;
}

export const actions: Actions<State, State> = {
	nuxtServerInit() {}
};

export const mutations: MutationTree<State> = {};
