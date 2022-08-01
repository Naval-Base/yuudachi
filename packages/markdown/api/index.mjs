import rehypeDocument from 'rehype-document';
import rehypeHighlight from 'rehype-highlight';
import rehypeIgnore from 'rehype-ignore';
import rehypePresetMinify from 'rehype-preset-minify';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { request as fetch } from 'undici';
import { unified } from 'unified';
import rehypeGithubBlockquoteAdmonitions from './_rehype-github-blockquote-admonitions.mjs';
import rehypeHighlightANSI from './_rehype-highlight-ansi.mjs';
import rehypeModifyHTML from './_rehype-modify-html.mjs';
import rehypeWrapBody from './_rehype-wrap-body.mjs';
import remarkGithubBlockquoteAdmonitions from './_remark-github-blockquote-admonitions.mjs';

/**
 * @typedef {import('@vercel/node').VercelRequest} VercelRequest
 * @typedef {import('@vercel/node').VercelResponse} VercelResponse
 * @typedef {(request: VercelRequest, response: VercelResponse) => Promise<void>} handler
 */

/**
 * @type {handler}
 */
export default async function handler(request, response) {
	const url = /** @type {string} */ (request.query.url);
	try {
		const res = await fetch(url);
		const text = await res.body.text();

		const html = await unified()
			.use(remarkParse)
			.use(remarkGfm)
			.use(remarkGithubBlockquoteAdmonitions)
			.use(remarkRehype, { allowDangerousHtml: true })
			.use(rehypeRaw)
			.use(rehypeIgnore)
			.use(rehypeSlug)
			.use(rehypeGithubBlockquoteAdmonitions)
			.use(rehypeHighlightANSI)
			.use(rehypeHighlight, { ignoreMissing: true })
			.use(rehypeDocument, {
				title: '',
				link: [
					{
						rel: 'stylesheet',
						href: 'https://cdnjs.cloudflare.com/ajax/libs/Primer/20.4.1/base.min.css',
						integrity:
							'sha512-Y3BvSXIyScMEFBi2QYvDc12tw0MpND6sYYKqdObiNlE432O1fv0/jeCbuuVeSNjd2ZuAM3EJbeVBFe/b0rKoYg==',
						crossorigin: 'anonymous',
						referrerpolicy: 'no-referrer',
					},
					{
						rel: 'stylesheet',
						href: 'https://cdnjs.cloudflare.com/ajax/libs/Primer/20.4.1/color-modes.min.css',
						integrity:
							'sha512-XTbUut8Rc/r06Iif/K7xDOub5F4TO2vTCV4InexCz5RvpGMaSfUf2tMRxYX6ha0zzFy+UfKdb94ehR+dOKYPhg==',
						crossorigin: 'anonymous',
						referrerpolicy: 'no-referrer',
					},
					{
						rel: 'stylesheet',
						href: 'https://cdnjs.cloudflare.com/ajax/libs/Primer/20.4.1/utilities.min.css',
						integrity:
							'sha512-OS48DOZqdQdDDxUfXtTx/xv8SjfIwc/k8gf75MaFh6uNb7xA50neIEvAi68wzvGJrW646ZVZH0AQXHSsvwMvpw==',
						crossorigin: 'anonymous',
						referrerpolicy: 'no-referrer',
					},
					{
						rel: 'stylesheet',
						href: 'https://cdnjs.cloudflare.com/ajax/libs/Primer/20.4.1/markdown.min.css',
						integrity:
							'sha512-z9fESt0h0bJJwWXYjGCV8v/SLbIkxgEIRBvt9d4xw+xSNUT+D1RpA/BUu8FBu6RqRWetBNaKeCC9Tr16/hPBhw==',
						crossorigin: 'anonymous',
						referrerpolicy: 'no-referrer',
					},
					{
						rel: 'stylesheet',
						href: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/styles/github-dark.min.css',
						integrity:
							'sha512-rO+olRTkcf304DQBxSWxln8JXCzTHlKnIdnMUwYvQa9/Jd4cQaNkItIUj6Z4nvW1dqK0SKXLbn9h4KwZTNtAyw==',
						crossorigin: 'anonymous',
						referrerpolicy: 'no-referrer',
					},
				],
				style:
					'body{box-sizing:border-box;min-width:200px;max-width:980px;margin:0 auto;padding:45px;background-color:#0d1117}pre code.hljs{padding:0!important}@media (max-width:767px){body{padding:15px}}',
			})
			.use(rehypeModifyHTML)
			.use(rehypeWrapBody)
			.use(rehypePresetMinify)
			.use(rehypeStringify)
			.process(text);

		response
			.setHeader('Content-Type', 'text/html; charset=UTF-8')
			.setHeader('Cache-Control', 'max-age=604800, s-maxage=31536000')
			.send(html.toString());
	} catch (e) {
		console.log(e);
		response.status(404).end();
	}
}
