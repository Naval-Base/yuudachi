export enum TableAlignment {
	Left,
	Center,
	Right,
}

export function heading(text: string, level: number) {
	return `${'#'.repeat(level)} ${text}`;
}

export function checkbox(text: string, checked = false, indent = 0) {
	return `- [${checked ? 'x' : ' '}] ${text}`.padStart(indent * 2, ' ');
}

export function list(items: [text: string, indent?: number][], ordered = false) {
	return items.map(([text, indent = 0]) => `${ordered ? '1.' : '-'} ${text}`.padStart(indent * 2, ' ')).join('\n');
}

export function table(headers: string[], rows: string[][], alignment = TableAlignment.Left) {
	const headerRow = `| ${headers.join(' | ')} |`;
	const bodyRows = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
	return [
		headerRow,
		`|${headers
			.map(
				(s) =>
					`${alignment === TableAlignment.Left || alignment === TableAlignment.Center ? ':' : ''}${'-'.repeat(
						s.length,
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
