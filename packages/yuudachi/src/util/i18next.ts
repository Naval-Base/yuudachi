import { URL } from "node:url";
import { Backend } from "@skyra/i18next-backend";
import i18next, { type InitOptions } from "i18next";

export async function createI18next(options: InitOptions = {}) {
	await i18next.use(Backend).init({
		backend: {
			paths: [new URL("../locales/{{lng}}/{{ns}}.json", import.meta.url)],
		},
		cleanCode: true,
		preload: ["en-US", "en-GB", "de", "es-ES", "ja", "ko", "pl", "zh-CH", "zh-TW"],
		supportedLngs: ["en-US", "en-GB", "de", "es-ES", "ja", "ko", "pl", "zh-CH", "zh-TW"],
		fallbackLng: ["en-US"],
		ns: ["commands", "translation"],
		returnNull: false,
		returnEmptyString: false,
		...options,
	});
}
