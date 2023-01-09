/* eslint-disable n/prefer-global/process */
/* eslint-disable no-restricted-globals */
import PocketBase from "pocketbase";

export const pocketbase = process.env.NEXT_PUBLIC_POCKETBASE_URL
	? new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
	: null;

if (typeof document !== "undefined") {
	pocketbase?.authStore.loadFromCookie(document.cookie);

	pocketbase?.authStore.onChange(() => {
		// eslint-disable-next-line unicorn/no-document-cookie
		document.cookie = pocketbase.authStore.exportToCookie({ httpOnly: false });
	});
}
