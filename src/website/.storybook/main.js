module.exports = {
	stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
	addons: [
		'storybook-addon-performance/register',
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@storybook/addon-a11y',
		'@storybook/addon-toolbars',
	],
};
