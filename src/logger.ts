import pino from 'pino';
// @ts-expect-error
import pinoElastic from 'pino-elasticsearch';
// @ts-expect-error
import ecsFormat from '@elastic/ecs-pino-format';
import pinoMultistream from 'pino-multi-stream';

const streamToElastic = pinoElastic({
	index: process.env.ELASTIC_INDEX,
	consistency: 'one',
	node: process.env.ELASTIC_URL,
	auth: {
		username: process.env.ELASTIC_USERNAME,
		password: process.env.ELASTIC_PASSWORD,
	},
	'es-version': 7,
});

export const logger = pino(
	{ ...ecsFormat(), name: process.env.LOGGER_NAME },
	pinoMultistream.multistream([{ stream: process.stdout }, { stream: streamToElastic }]),
);
