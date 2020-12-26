import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { GraphQLRole } from '~/interfaces/Role';

interface UserState {
	loggedIn: boolean;
	id?: string;
	role?: GraphQLRole;
	username?: string;
	avatar?: string;
}

const initialState: UserState = {
	loggedIn: false,
	id: undefined,
	role: undefined,
	username: undefined,
	avatar: undefined,
};

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		login(state) {
			state.loggedIn = true;
		},
		logout(state) {
			state.loggedIn = false;
		},
		setUser(
			_,
			action: PayloadAction<{ loggedIn: boolean; id: string; role: GraphQLRole; username: string; avatar?: string }>,
		) {
			return { ...action.payload };
		},
	},
});

export const { login, logout, setUser } = userSlice.actions;
export default userSlice.reducer;
