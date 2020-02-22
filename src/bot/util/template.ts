/* eslint @typescript-eslint/no-use-before-define: 0 */

import { Interpolate, parse, Template } from './templateParser';

interface InterpolateData {
	[k: string]: string | null;
}

export function interpolateString(input: string, data: InterpolateData) {
	const template = parse(input);
	return interpolateTemplate(template, data);
}

function interpolateTemplate(template: Template, data: InterpolateData) {
	let output = '';
	for (const segment of template) {
		if (segment.t === 'raw') {
			output += segment.value;
		} else {
			output += interpolate(segment, data);
		}
	}

	return output;
}

function interpolate(int: Interpolate, data: InterpolateData) {
	for (const alt of int.alts) {
		if (Object.prototype.hasOwnProperty.call(data, alt) && data[alt] !== null && data[alt] !== undefined) {
			return data[alt];
		}
	}

	return int.def ? interpolateTemplate(int.def, data) : '';
}
