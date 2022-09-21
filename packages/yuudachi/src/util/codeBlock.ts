export function removeCodeBlocks(input: string, replace = "") {
	return input.replaceAll(/(?<q>`{1,3}).*?\1/gs, replace);
}
