/* eslint-disable n/prefer-global/process */
/* eslint-disable no-restricted-globals */

import "reflect-metadata";
import { setTimeout } from "node:timers";
import { createREST, createAPI } from "@yuudachi/framework";
import HttpHandler from "@yuudachi/http";

const rest = createREST({ version: "10" });
const api = createAPI(rest);

const httpHandler = new HttpHandler({
	api,
	interactionsCallback({ interaction, api }) {
		setTimeout(async () => {
			await api.interactions.editReply(process.env.DISCORD_CLIENT_ID!, interaction.token, {
				content: `Test 1.\n> Test 2.`,
			});
		}, 2_000);

		return { type: 4, data: { content: "Test 1.", flags: 1 << 6 } };
	},
	fastifyOptions: { trustProxy: true, logger: true },
});

try {
	await httpHandler.listen(Number(process.env.PORT!));
} catch (error) {
	httpHandler.log.error(error);
	process.exit(1);
}
