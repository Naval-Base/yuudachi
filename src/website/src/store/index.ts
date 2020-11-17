import { configureStore } from '@reduxjs/toolkit';

import user from './slices/user';

const store = configureStore({
	reducer: {
		user,
	},
	devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
