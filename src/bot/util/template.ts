import { parse, Interpolate, Template } from "./templateParser";

export function interpolateString(input: string, data: any): string {
    const template = parse(input);
    return interpolateTemplate(template, data);
}

function interpolateTemplate(template: Template, data: any): string {
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

function interpolate(int: Interpolate, data: any): string {
    for (const alt of int.alts) {
        if (Object.prototype.hasOwnProperty.call(data, alt) && data[alt] != null) {
            return alt;
        }
    }

    return int.def ? interpolateTemplate(int.def, data) : '';
}
