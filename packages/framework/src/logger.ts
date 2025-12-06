import { pino } from "pino";

// eslint-disable-next-line no-restricted-globals, n/prefer-global/process
export const logger = pino({ name: process.env.LOGGER_NAME! });
