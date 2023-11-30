import { container } from "tsyringe";
import type { Component } from "../Component.js";
import type { ComponentPayload } from "../types/ArgumentsOf.js";
import { kComponents } from "./tokens.js";

export type ComponentMap = Map<string, Component<ComponentPayload>>;

export function createComponents<C = ComponentMap>() {
	const components = new Map<string, C>();
	container.register(kComponents, { useValue: components });
}
