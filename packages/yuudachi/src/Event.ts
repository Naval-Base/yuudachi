export interface Event {
	name: string;
	event: string;
	disabled?: boolean;
	execute: (...args: any) => void | Promise<void>;
}
