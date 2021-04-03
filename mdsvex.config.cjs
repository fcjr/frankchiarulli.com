module.exports = {
	extensions: [".svx", ".md"],
	layout: "./src/md-layouts/blog.svelte",
	smartypants: {
		dashes: "oldschool",
	},
	remarkPlugins: [
		require("remark-abbr"),
	],
	rehypePlugins: [
		require("rehype-slug"),
		[require("rehype-autolink-headings"), {
			behavior: "wrap",
		}],
	],
};
