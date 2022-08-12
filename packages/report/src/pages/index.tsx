import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next/types';
import rehypeHighlight from 'rehype-highlight';
import rehypeIgnore from 'rehype-ignore';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { request as fetch } from 'undici';
import rehypeGithubBlockquoteAdmonitions from './util/rehype-github-blockquote-admonitions';
import rehypeHighlightANSI from './util/rehype-highlight-ansi';
import remarkGithubBlockquoteAdmonitions from './util/remark-github-blockquote-admonitions';

export const getServerSideProps = async (context: Parameters<GetServerSideProps>[0]) => {
	const url = context.query.url as string;
	const res = await fetch(url);
	const text = await res.body.text();
	const mdxSource = await serialize(text, {
		mdxOptions: {
			remarkPlugins: [remarkGfm, remarkGithubBlockquoteAdmonitions],
			remarkRehypeOptions: { allowDangerousHtml: true },
			rehypePlugins: [
				rehypeRaw,
				rehypeIgnore,
				rehypeSlug,
				rehypeGithubBlockquoteAdmonitions,
				rehypeHighlightANSI,
				[rehypeHighlight, { ignoreMissing: true }],
			],
			format: 'md',
		},
	});

	return { props: { source: mdxSource } };
};

export default function ReportRoute({ source }: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<>
			<div className="markdown-body">
				<MDXRemote {...source} />
			</div>
		</>
	);
}
