export interface Event {
	name: string;
	event: string;
	execute(...args: any): unknown | Promise<unknown>;
}
