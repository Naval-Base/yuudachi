import { container } from "tsyringe";
import type { Component } from "../Component.js";
import type { ComponentPayload } from "../types/ArgumentsOf.js";
import { kComponents } from "./tokens.js";

export function createComponents<C extends Component = Component<ComponentPayload>>() {
	const components = new Map<string, C>();
	container.register(kComponents, { useValue: components });
}
