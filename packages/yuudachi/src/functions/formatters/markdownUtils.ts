export enum TableAlignment {
	Left,
	Center,
	Right,
}

export function heading(text: string, level: number) {
	return `${'#'.repeat(level)} ${text}`;
}

export function checkbox(text: string, checked = false) {
	return `- [${checked ? 'x' : ' '}] ${text}`;
}

export function list(items: string[], ordered = false) {
	return items.map((text) => `${ordered ? '1.' : '-'} ${text}`).join('\n');
}

export function table(headers: string[], rows: string[][], alignment = TableAlignment.Left) {
	const headerRow = `| ${headers.join(' | ')} |`;
	const bodyRows = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
	return [
		headerRow,
		`|${headers
			.map(
				(str) =>
					`${alignment === TableAlignment.Left || alignment === TableAlignment.Center ? ':' : ''}${'-'.repeat(
						str.length,
					)}${alignment === TableAlignment.Center || alignment === TableAlignment.Right ? ':' : ''}`,
			)
			.join('|')}|`,
		bodyRows,
	].join('\n');
}

export function blockquote(text: string, nested = false) {
	return `${nested ? '>' : ''}> ${text}`;
}

export function horizontalRule() {
	return '---';
}

export function emptyLine(jump = false) {
	return jump ? '\n' : '';
}
