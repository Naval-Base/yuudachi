export function heading(text: string, level: number) {
	return `${'#'.repeat(level)} ${text}`;
}

export function checkbox(text: string, checked = false) {
	return `- [${checked ? 'x' : ' '}] ${text}`;
}

export function list(items: string[], ordered = false) {
	return items.map((item, i) => `${ordered ? `${i + 1}.` : '-'} ${item}`).join('\n');
}

export function table(headers: string[], rows: string[][]) {
	const headerRow = `| ${headers.join(' | ')} |`;
	const bodyRows = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
	return [headerRow, `|${headers.map((s) => `:${'-'.repeat(s.length)}:`).join('|')}|`, bodyRows].join('\n');
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
