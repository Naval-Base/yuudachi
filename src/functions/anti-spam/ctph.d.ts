declare module 'ctph.js' {
	export function digest(content: string): string;
	export function similarity(content1: string, content2: string): number;
}