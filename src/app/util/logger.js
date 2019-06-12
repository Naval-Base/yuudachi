const chalk = require('chalk');
const moment = require('moment');
const { inspect } = require('util');

class Logger {
	static log(message, { color = 'grey', level = 'Log' } = {}) {
		this.write(message, { color, level });
	}

	static info(message, { color = 'green', level = 'Info' } = {}) {
		this.write(message, { color, level });
	}

	static error(message, { color = 'red', level = 'Error' } = {}) {
		this.write(message, { color, level, error: true });
	}

	static stacktrace(message, { color = 'red', level = 'Error' } = {}) {
		this.write(message, { color, level, error: true });
	}

	static warn(message, { color = 'yellow', level = 'Warn' } = {}) {
		this.write(message, { color, level });
	}

	static write(message, { color = 'grey', level = 'Log', error = false } = {}) {
		const timestamp = chalk.cyan(moment().format('DD-MM-YYYY kk:mm:ss'));
		const content = chalk[color](this.clean(message));
		const stream = error ? process.stderr : process.stdout;
		stream.write(`[${timestamp}] [${chalk.bold(level)}]: ${content}\n`);
	}

	static clean(item) {
		if (typeof item === 'string') return item;
		const cleaned = inspect(item, { depth: Infinity });
		return cleaned;
	}
}

module.exports = Logger;
