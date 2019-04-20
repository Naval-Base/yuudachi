const { writeFileSync } = require('fs');
const { join } = require('path');

module.exports = (() => {
	const rev = require('child_process')
		.execSync('git rev-parse HEAD')
		.toString()
		.trim();
	const line = `export const VERSION = '${rev}';\n`;
	writeFileSync(join(__dirname, 'src', 'util', 'version.ts'), line);
})();
