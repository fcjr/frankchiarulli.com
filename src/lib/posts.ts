const modules = import.meta.globEager('../posts/*.md');

export type Post = {
	permalink: string;
	date: Date;
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

export const posts = Object.keys(modules)
	.map(
		(key) =>
			({
				permalink: key.split('/').pop().slice(0, -3),
				date: new Date(modules[key].attributes.date),
				...modules[key]
			} as Post)
	)
	.sort((a: Post, b: Post) => b.date.getTime() - a.date.getTime());

export const findPost = (permalink: string): Post =>
	posts.find((post) => post.permalink === permalink);

export const findPostsByTag = (tag: string): Array<Post> =>
	posts.filter((post) => post.attributes.tags.includes(tag));
