export interface Event {
	name: string;
	execute(...args: any): unknown | Promise<unknown>;
}
