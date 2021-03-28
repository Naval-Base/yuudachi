import create, { State } from 'zustand';

import type { SearchQuery } from '~/interfaces/SearchQuery';

interface TableState extends State {
	limit: number;
	page: number;
	search: SearchQuery | null;
	setLimit: (limit: number) => void;
	nextPage: () => void;
	prevPage: () => void;
	setSearch: (search: SearchQuery | null) => void;
	reset: () => void;
}

export const useTableStore = create<TableState>((set) => ({
	limit: 50,
	page: 1,
	search: null,
	setLimit: (limit: number) => set(() => ({ limit })),
	nextPage: () => set(({ page }) => ({ page: page + 1 })),
	prevPage: () => set(({ page }) => ({ page: page - 1 })),
	setSearch: (search: SearchQuery | null) => set(() => ({ search })),
	reset: () => set(() => ({ page: 1, search: null })),
}));
