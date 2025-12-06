import type { Root } from "hast";
import { hasProperty } from "hast-util-has-property";
import { isElement } from "hast-util-is-element";
import { select } from "hast-util-select";
import { toString } from "hast-util-to-string";
import { h, s } from "hastscript";
import { CONTINUE, SKIP, visit } from "unist-util-visit";

export default function rehypeGithubBlockquoteAdmonitions() {
	return (tree: Root) => {
		visit(tree, "element", (node) => {
			if (!isElement(node, "blockquote") && !hasProperty(node, "className")) {
				return CONTINUE;
			}

			const classes = node.properties.className;
			if (!Array.isArray(classes)) {
				return SKIP;
			}

			const admonition = classes.find((class_) => typeof class_ === "string" && class_ === "admonition");
			if (!admonition) {
				return SKIP;
			}

			const paragraph = select("p", node);
			if (!isElement(paragraph, "p")) {
				return SKIP;
			}

			const strong = select("strong", paragraph);
			if (!isElement(strong, "strong") || !hasProperty(strong, "className")) {
				return SKIP;
			}

			const iconClasses = strong.properties.className;
			if (!Array.isArray(iconClasses)) {
				return SKIP;
			}

			const isNote = iconClasses.includes("accent");

			paragraph.children.splice(
				0,
				1,
				h(
					"span",
					{
						class: `${isNote ? "color-fg-accent" : "color-fg-attention"}`,
					},
					[
						isNote
							? s(
									"svg",
									{
										class: "octicon mr-2",
										xmlns: "http://www.w3.org/2000/svg",
										viewbox: "0 0 16 16",
										width: "16",
										height: "16",
									},
									s("path", {
										// eslint-disable-next-line id-length
										d: "M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z",
									}),
								)
							: s(
									"svg",
									{
										class: "octicon mr-2",
										xmlns: "http://www.w3.org/2000/svg",
										viewbox: "0 0 16 16",
										width: "16",
										height: "16",
									},
									s("path", {
										// eslint-disable-next-line id-length
										d: "M8.22 1.754a.25.25 0 00-.44 0L1.698 13.132a.25.25 0 00.22.368h12.164a.25.25 0 00.22-.368L8.22 1.754zm-1.763-.707c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM9 11a1 1 0 11-2 0 1 1 0 012 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z",
									}),
								),
						toString(strong),
					],
				),
				h("br"),
			);
			return SKIP;
		});
	};
}
