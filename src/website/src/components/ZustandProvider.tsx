import { createContext } from 'react';
import { UseStore } from 'zustand';

import { UserState } from '~/store/user';

export const StoreContext = createContext<UseStore<UserState> | null>(null);

export const ZustandProvider = ({ children, store }: { children: React.ReactNode; store: UseStore<UserState> }) => (
	<StoreContext.Provider value={store}>{children}</StoreContext.Provider>
);
