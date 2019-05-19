import NuxtConfiguration from '@nuxt/config';

const conf: NuxtConfiguration = {
	head: {
		title: 'It\'s time to ditch other radios.',
		titleTemplate: '%s | LISTEN.moe',
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ hid: 'theme-color', name: 'theme-color', content: '#FF015B' },
			{ hid: 'description', name: 'description', content: 'It\'s time to ditch other radios.' },
			{ hid: 'keywords', name: 'keywords', content: 'anime,radio,music,japanese,stream,anime radio,korea,korean,kpop,krap,k-pop,kpop radio' },

			{ hid: 'apple-mobile-web-app-title', name: 'apple-mobile-web-app-title', content: 'LISTEN.moe' },
			{ hid: 'application-name', name: 'application-name', content: 'LISTEN.moe' },
			{ hid: 'msapplication-config', name: 'msapplication-config', content: '/images/icons/browserconfig.xml' },

			{ hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
			{ hid: 'twitter:site', name: 'twitter:site', content: '@LISTEN_moe' },
			{ hid: 'twitter:creator', name: 'twitter:creator', content: '@LISTEN_moe' },
			{ hid: 'twitter:title', name: 'twitter:title', content: `LISTEN.moe` },
			{ hid: 'twitter:description', name: 'twitter:description', content: 'It\'s time to ditch other radios.' },
			{ hid: 'twitter:image', name: 'twitter:image', content: 'https://beta.listen.moe/images/share.jpg' },

			{ hid: 'og:url', property: 'og:url', content: 'https://beta.listen.moe' },
			{ hid: 'og:type', property: 'og:type', content: 'website' },
			{ hid: 'og:title', property: 'og:title', content: `LISTEN.moe` },
			{ hid: 'og:description', property: 'og:description', content: 'It\'s time to ditch other radios.' },
			{ hid: 'og:image', property: 'og:image', content: 'https://beta.listen.moe/images/share.jpg' },
			{ hid: 'og:image:secure_url', property: 'og:image:secure_url', content: 'https://beta.listen.moe/images/share.jpg' },
			{ hid: 'og:site_name', property: 'og:site_name', content: 'LISTEN.moe' }
		],
		link: [
			{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Nunito|Roboto:400,500&display=swap' },
			{ rel: 'alternate', type: 'application/json+oembed', href: 'https://beta.listen.moe/oembed.json' }
		]
	},
	build: {
		extend(config, { isDev }) {
			if (isDev) config.output!.globalObject = 'this';
		}
	}
};

export default conf;
