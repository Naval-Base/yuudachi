declare module 'postgres' {
	export interface Options {
		host?: string;
		port?: number;
		path?: string;
		database?: string;
		username?: string;
		password?: string;
		ssl?: boolean;
		max?: number;
		timeout?: number;
		types?: any[];
		onnotice?: (...args: any[]) => void;
		onparameter?: (...args: any[]) => void;
		debug?: (...args: any[]) => void;
		transform?: {
			column?: (...args: any[]) => void;
			value?: (...args: any[]) => void;
			row?: (...args: any[]) => void;
		};
		connection?: {
			application_name?: string;
		};
	}

	export interface QueryResponse extends Promise<Record<string, unknown>[]> {
		stream(fn: (row: unknown) => void): Promise<unknown>;
		cursor(fn: (row: unknown) => void): Promise<unknown>;
		cursor(rows: number, fn: (row: unknown) => void): Promise<unknown>;
	}

	export type Query = (query: TemplateStringsArray, ...params: any[]) => QueryResponse;

	export interface SQL extends Query {
		listen(name: string, fn: (payload: unknown) => void): void;
		notify(name: string, data: string): void;
		json(value: any): void;
	}

	export = function (options?: Options): SQL {}
}
