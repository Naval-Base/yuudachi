export default interface Config {
	secretKey: string;
	discordClientId: string;
	publicApiDomain: string;
	publicFrontendDomain: string;
	discordScopes: string[];
	discordClientSecret: string;
}
