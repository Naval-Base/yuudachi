/* eslint @typescript-eslint/no-use-before-define: 0 */

export interface Raw {
	t: 'raw';
	value: string;
}

export interface Interpolate {
	t: 'interpolate';
	alts: string[];
	def: Template | null;
}

export type Template = (Raw | Interpolate)[];

export class ParseError extends Error {
	public readonly input: string;
	public readonly position: number;

	public constructor(message: string, input: string, position: number) {
		super(message);

		this.input = input;
		this.position = position;
	}

	public formatted() {
		const start = Math.max(this.lineBefore(), this.position - 10);
		const end = Math.min(this.lineAfter(), this.position + 10);
		const line = this.input.slice(start, end);
		const offset = this.position - start;
		return `${line}\n${'-'.repeat(offset)}^\n${this.message}`;
	}

	private lineBefore() {
		const i = this.input.slice(0, this.position).lastIndexOf('\n');
		return i === -1 ? 0 : i;
	}

	private lineAfter() {
		const i = this.input.indexOf('\n', this.position);
		return i === -1 ? this.input.length : i + this.position;
	}
}

export function parse(input: string) {
	return pTemplate({ input, position: 0 }, false);
}

/**
 * EBNF:
 *
 * Template    = { Segment }
 * Segment     = Interpolate | Raw
 * Interpolate = "${" _ Alts [ Def ] "}"
 * Alts        = Ident _ [{ "|" _ Ident _ }]
 * Def         = "=" _'"' Template '"' _
 * Raw         = Escaped | Character
 * Escaped     = "\" any char
 * Character   = any char
 * Ident       = alphanumeric identifier
 * _           = any amount of whitespace
 */

interface State {
	input: string;
	position: number;
}

function pTemplate(s: State, q: boolean) {
	const segments: (string | Raw | Interpolate)[] = [];
	while (s.position < s.input.length && (!q || !testString(s, '"'))) {
		const seg = pSegment(s);
		if (segments.length > 0) {
			const prev = segments[segments.length - 1];
			/**
			 * To make things easier to use, we merge adjacent strings together,
			 * instead of making pRaw return a Raw, since that allocates more objects.
			 * Cases:
			 * [string] + string = [string]
			 * [raw]    + string = [raw]
			 * [interp] + string = [interp, string]
			 * [string] + interp = [raw, interp]
			 * [raw]    + interp = [raw, interp]
			 * [interp] + interp = [interp, interp]
			 */
			if (typeof seg === 'string') {
				if (typeof prev === 'string') {
					segments[segments.length - 1] += seg;
				} else if (prev.t === 'raw') {
					prev.value += seg;
				} else {
					segments.push(seg);
				}
			} else if (typeof prev === 'string') {
				segments[segments.length - 1] = { t: 'raw', value: prev };
				segments.push(seg);
			} else {
				segments.push(seg);
			}
		} else {
			segments.push(seg);
		}
	}

	if (segments.length > 0) {
		const prev = segments[segments.length - 1];
		if (typeof prev === 'string') {
			segments[segments.length - 1] = { t: 'raw', value: prev };
		}
	}

	if (s.position !== s.input.length) {
		throw new ParseError('Not enough input', s.input, s.position);
	}

	return segments as Template;
}

function pSegment(s: State) {
	if (testString(s, '${')) {
		return pInterpolate(s);
	}

	return pRaw(s);
}

function pInterpolate(s: State): Interpolate {
	pString(s, '${');
	p_(s);
	const alts = pAlts(s);
	let def = null;
	if (testString(s, '=')) {
		def = pDef(s);
	}

	pString(s, '}');
	return { t: 'interpolate', alts, def };
}

function pAlts(s: State) {
	const idents = [];
	idents.push(pIdent(s));
	p_(s);
	while (testString(s, '|')) {
		pString(s, '|');
		p_(s);
		idents.push(pIdent(s));
		p_(s);
	}

	return idents;
}

function pDef(s: State) {
	pString(s, '=');
	p_(s);
	pString(s, '"');
	const x = pTemplate(s, true);
	pString(s, '"');
	p_(s);
	return x;
}

function pRaw(s: State) {
	return testString(s, '\\') ? pEscaped(s) : pCharacter(s);
}

function pEscaped(s: State) {
	const match = matchRegex(s, /^\\(.)/);
	if (match === null) {
		throw new ParseError('Expected an escape character', s.input, s.position);
	}

	s.position += match[0].length;
	return match[1];
}

function pCharacter(s: State) {
	if (s.position >= s.input.length) {
		throw new ParseError('Unexpected end of input', s.input, s.position);
	}

	s.position++;
	return s.input[s.position - 1];
}

function pIdent(s: State) {
	const match = matchRegex(s, /^[A-Za-z0-9]+/);
	if (match === null) {
		throw new ParseError('Expected a valid identifier made of alphanumeric characters', s.input, s.position);
	}

	const ident = match[0];
	s.position += ident.length;
	return ident;
}

function p_(s: State) {
	const match = matchRegex(s, /^\s*/);
	s.position += match?.[0].length!;
}

function pString(s: State, x: string) {
	if (testString(s, x)) {
		s.position += x.length;
	} else {
		throw new ParseError(
			`Expected token ${x} but got ${s.input[s.position] || 'unexpected end of input'}`,
			s.input,
			s.position,
		);
	}
}

function testString(s: State, x: string) {
	return s.input.startsWith(x, s.position);
}

function matchRegex(s: State, r: RegExp) {
	return r.exec(s.input.slice(s.position));
}
