import type { Component } from "../Component.js";
import type { ComponentPayload } from "../types/ArgumentsOf.js";
import { container } from "./container.js";
import { kComponents } from "./tokens.js";

export function createComponents<C extends Component = Component<ComponentPayload>>() {
	const components = new Map<string, C>();
	container.bind({ provide: kComponents, useValue: components });
}
