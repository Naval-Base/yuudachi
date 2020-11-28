export interface Guild {
	id: string;
	name: string;
	icon: string;
	owner: boolean;
	permissions: number;
	permissions_new: string;
	features: string[];
}
