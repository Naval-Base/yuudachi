export interface Event {
	name: string;
	event: string;
	disabled?: boolean | undefined;
	execute: (...args: any) => void | Promise<void>;
}
