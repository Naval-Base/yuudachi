import common from "eslint-config-neon/common";
import edge from "eslint-config-neon/edge";
import jsxa11y from "eslint-config-neon/jsx-a11y";
import next from "eslint-config-neon/next";
import node from "eslint-config-neon/node";
import prettier from "eslint-config-neon/prettier";
import react from "eslint-config-neon/react";
import typescript from "eslint-config-neon/typescript";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import oxlint from "eslint-plugin-oxlint";
import reactCompiler from "eslint-plugin-react-compiler";
import { defineConfig } from "eslint/config";
import merge from "lodash.merge";

const commonFiles = "{js,mjs,cjs,ts,mts,cts,jsx,tsx}";

const commonRuleset = merge(...common, { files: [`**/*${commonFiles}`] });

const nodeRuleset = merge(...node, { files: [`**/*${commonFiles}`] });

const typeScriptRuleset = merge(
	...typescript,
	{
		files: [`**/*${commonFiles}`],
		languageOptions: {
			parserOptions: {
				warnOnUnsupportedTypeScriptVersion: false,
				allowAutomaticSingleRunInference: true,
				project: ["tsconfig.eslint.json", "apps/*/tsconfig.eslint.json", "packages/*/tsconfig.eslint.json"],
			},
		},
		settings: {
			"import-x/resolver-next": [
				createTypeScriptImportResolver({
					noWarnOnMultipleProjects: true,
					project: ["tsconfig.eslint.json", "apps/*/tsconfig.eslint.json", "packages/*/tsconfig.eslint.json"],
				}),
			],
		},
	},
);

const reactRuleset = merge(
	...react,
	{
		files: [`apps/**/*${commonFiles}`],
		plugins: {
			"react-compiler": reactCompiler,
		},
		rules: {
			"react/jsx-handler-names": 0,
			"react-refresh/only-export-components": [0, { allowConstantExport: true }],
			"react-compiler/react-compiler": 2,
			"jsdoc/no-bad-blocks": 0,
			"tsdoc/syntax": 0,
			"@typescript-eslint/unbound-method": 0,
		},
	},
);

const jsxa11yRuleset = merge(...jsxa11y, { files: [`apps/**/*${commonFiles}`] });

const nextRuleset = merge(...next, { files: [`apps/**/*${commonFiles}`] });

const edgeRuleset = merge(...edge, { files: [`apps/**/*${commonFiles}`] });

const prettierRuleset = merge(...prettier, { files: [`**/*${commonFiles}`] });

const oxlintRuleset = merge(oxlint.configs["flat/all"], {
	files: [`**/*${commonFiles}`],
});

export default defineConfig(
	{
		ignores: [
			"**/node_modules/",
			".git/",
			"**/dist/",
			"**/template/",
			"**/coverage/",
			"**/.next/",
			"**/shiki.bundle.ts",
		],
	},
	commonRuleset,
	nodeRuleset,
	typeScriptRuleset,
	{
		files: ["**/*{ts,mts,cts,tsx}"],
		rules: { "jsdoc/no-undefined-types": 0 },
	},
	reactRuleset,
	jsxa11yRuleset,
	nextRuleset,
	edgeRuleset,
	{
		files: ["**/*{js,mjs,cjs,jsx}"],
		rules: { "tsdoc/syntax": 0 },
	},
	prettierRuleset,
	oxlintRuleset,
);
