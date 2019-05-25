import NuxtConfiguration from '@nuxt/config';

const conf: NuxtConfiguration = {
	loading: false,
	loadingIndicator: false,
	globalName: 'yukikaze',
	head: {
		title: 'Yukikaze Dashboard',
		titleTemplate: '%s | NAVAL-BASE',
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ hid: 'theme-color', name: 'theme-color', content: '#6FC6E2' },
			{ hid: 'description', name: 'description', content: 'It\'s time to ditch other radios.' },
			{ hid: 'keywords', name: 'keywords', content: 'anime,radio,music,japanese,stream,anime radio,korea,korean,kpop,krap,k-pop,kpop radio' },

			{ hid: 'apple-mobile-web-app-title', name: 'apple-mobile-web-app-title', content: 'NAVAL-BASE.moe' },
			{ hid: 'application-name', name: 'application-name', content: 'NAVAL-BASE.moe' },
			{ hid: 'msapplication-config', name: 'msapplication-config', content: '/images/icons/browserconfig.xml' },

			{ hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
			{ hid: 'twitter:site', name: 'twitter:site', content: '@LISTEN_moe' },
			{ hid: 'twitter:creator', name: 'twitter:creator', content: '@LISTEN_moe' },
			{ hid: 'twitter:title', name: 'twitter:title', content: `NAVAL-BASE.moe` },
			{ hid: 'twitter:description', name: 'twitter:description', content: 'It\'s time to ditch other radios.' },
			{ hid: 'twitter:image', name: 'twitter:image', content: 'https://beta.listen.moe/images/share.jpg' },

			{ hid: 'og:url', property: 'og:url', content: 'https://beta.listen.moe' },
			{ hid: 'og:type', property: 'og:type', content: 'website' },
			{ hid: 'og:title', property: 'og:title', content: 'NAVAL-BASE.moe' },
			{ hid: 'og:description', property: 'og:description', content: 'It\'s time to ditch other radios.' },
			{ hid: 'og:image', property: 'og:image', content: 'https://beta.listen.moe/images/share.jpg' },
			{ hid: 'og:image:secure_url', property: 'og:image:secure_url', content: 'https://beta.listen.moe/images/share.jpg' },
			{ hid: 'og:site_name', property: 'og:site_name', content: 'NAVAL-BASE.moe' }
		],
		link: [
			{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Nunito|Roboto:400,500&display=swap' },
			{ rel: 'alternate', type: 'application/json+oembed', href: 'https://beta.listen.moe/oembed.json' }
		]
	},
	modules: [
		'cookie-universal-nuxt'
	],
	build: {
		extend(config, { isDev }) {
			if (isDev) {
				config.output!.globalObject = 'this';
				config.devtool = 'inline-source-map';
			}
		}
	}
};

export default conf;
