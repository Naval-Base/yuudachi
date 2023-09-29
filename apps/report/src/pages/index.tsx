import type { GetServerSideProps, InferGetServerSidePropsType } from "next/types";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import rehypeHighlight from "rehype-highlight";
import rehypeIgnore from "rehype-ignore";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { request as fetch } from "undici";
import rehypeGithubBlockquoteAdmonitions from "./util/rehype-github-blockquote-admonitions";
import rehypeHighlightANSI from "./util/rehype-highlight-ansi";
import remarkGithubBlockquoteAdmonitions from "./util/remark-github-blockquote-admonitions";

export const getServerSideProps = async (context: Parameters<GetServerSideProps>[0]) => {
	const url = context.query.url as string;
	const res = await fetch(url);
	const text = await res.body.text();
	const mdxSource = await serialize(text, {
		mdxOptions: {
			remarkPlugins: [remarkGfm, remarkGithubBlockquoteAdmonitions],
			remarkRehypeOptions: { allowDangerousHtml: true },
			rehypePlugins: [
				rehypeRaw as any,
				rehypeIgnore as any,
				rehypeSlug,
				rehypeGithubBlockquoteAdmonitions,
				rehypeHighlightANSI,
				[rehypeHighlight as any, { ignoreMissing: true, detect: true }],
			],
			format: "md",
		},
	});

	context.res.setHeader("Cache-Control", "public, max-age=604800, s-maxage=31536000");

	return { props: { source: mdxSource } };
};

export default function ReportRoute({ source }: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<div className="markdown-body">
			<MDXRemote {...source} />
		</div>
	);
}
