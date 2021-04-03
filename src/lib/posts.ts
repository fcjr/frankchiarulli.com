const modules = import.meta.globEager('../routes/blog/*.md');

export type Post = {
	permalink: string;
	date: Date;
	metadata: PostMetadata;
};

export type PostMetadata = {
	title: string;
	author: string;
	date: string;
	description: string;
	tags: string[];

	categories: string[];
	series: string[];
};

export const posts = Object.keys(modules)
	.map(
		(key) =>
			({
				permalink: key.split('/').pop().slice(0, -3),
				date: new Date(modules[key].metadata.date),
				...modules[key]
			} as Post)
	)
	.sort((a: Post, b: Post) => b.date.getTime() - a.date.getTime());

export const findPost = (permalink: string): Post =>
	posts.find((post) => post.permalink === permalink);

export const findPostsByTag = (tag: string): Post[] =>
	posts.filter((post) => post.metadata.tags.includes(tag));

export const tags = posts
	.reduce((acc, curPost) => [...acc, ...curPost.metadata.tags], [])
	.filter((val, i, arr) => arr.indexOf(val) === i);
