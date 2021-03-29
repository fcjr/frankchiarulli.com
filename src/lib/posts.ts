const modules = import.meta.globEager('../posts/*.md');

export type Post = {
	permalink: string;
	attributes: PostAttributes;
	html: string;
};

export type PostAttributes = {
	title: string;
	author: string;
	date: string;
	description: string;
	tags: Array<string>;

	categories: Array<string>;
	series: Array<string>;
};

export const posts = Object.keys(modules).map(
	(key) => ({ permalink: key.split('/').pop().slice(0, -3), ...modules[key] } as Post)
);

export const findPost = (permalink: string): Post =>
	posts.find((post) => post.permalink === permalink);
