import "i18next";

declare module "i18next" {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface CustomTypeOptions {
		returnNull: false;
	}
}
