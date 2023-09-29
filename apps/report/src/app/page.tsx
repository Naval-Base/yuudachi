import type { SerializeOptions } from "next-mdx-remote/dist/types";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeIgnore from "rehype-ignore";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import rehypeGithubBlockquoteAdmonitions from "~/util/rehype-github-blockquote-admonitions";
import rehypeHighlightANSI from "~/util/rehype-highlight-ansi";
import remarkGithubBlockquoteAdmonitions from "~/util/remark-github-blockquote-admonitions";

const mdxOptions = {
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
} satisfies SerializeOptions;

export default async function Page({ searchParams }: { readonly searchParams: { url: string } }) {
	const res = await fetch(searchParams.url);
	const text = await res.text();

	return (
		<div className="markdown-body">
			<MDXRemote options={mdxOptions} source={text} />
		</div>
	);
}
