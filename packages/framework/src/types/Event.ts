export type Event = {
	disabled?: boolean | undefined;
	event: string;
	execute(...args: any): Promise<void> | void;
	name: string;
};
