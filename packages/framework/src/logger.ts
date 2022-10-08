import process from "node:process";
import { pino } from "pino";

export const logger = pino({ name: process.env.LOGGER_NAME });
