export function removeCodeBlock(input: string, replace = "") {
	// eslint-disable-next-line prefer-named-capture-group -- Needs to be capturing because of the back-reference
	return input.replaceAll(/(`{1,3})(?<codeblock>.*?)(\1)/gs, replace);
}
