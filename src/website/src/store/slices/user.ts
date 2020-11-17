import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
	loggedIn: boolean;
	id?: string;
	username?: string;
	avatar?: string;
}

const initialState: UserState = {
	loggedIn: false,
	id: undefined,
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
		setUser(_, action: PayloadAction<{ loggedIn: boolean; id: string; username: string; avatar?: string }>) {
			return { ...action.payload };
		},
	},
});

export const { login, logout, setUser } = userSlice.actions;
export default userSlice.reducer;
