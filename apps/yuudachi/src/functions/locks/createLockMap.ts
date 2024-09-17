import { container } from "@yuudachi/framework";
import { LOCK_MAP_TOKEN } from "../../Constants.js";

export function createLockMap() {
	container.register(LOCK_MAP_TOKEN, {
		useValue: new Map(),
	});
}
