<script lang="ts">
	import type { Post } from '$lib/posts';
	import { formatDate } from '$lib/utils';

	export let posts: Post[];
</script>

{#each posts as post}
	<a
		class="post-link"
		aria-label={`link to post: ${post.attributes.title}`}
		href={`/blog/${post.permalink}`}
	>
		<article class="post">
			<h2 class="post-header">{post.attributes.title}</h2>
			<section class="post-content">
				<p>{post.attributes.description}</p>
			</section>
			<footer class="post-footer">
				{formatDate(post.date)} · {post.attributes.author}
			</footer>
		</article>
	</a>
{/each}

<style>
	a,
	a:active,
	a:visited {
		color: inherit;
		text-decoration: none;
	}
	.post {
		position: relative;
		margin-bottom: var(--gap);
		padding: var(--gap);
		background: var(--entry);
		border-radius: var(--radius);
		transition: transform 0.1s;
		background-color: var(--secondary);
		color: var(--secondary-paragraph);
	}

	.post:hover,
	a:focus .post {
		background-color: var(--highlight);
		transform: scale(0.98);
	}
	.post-header {
		font-size: 24px;
	}

	.post-content {
		margin: 8px 0;
		font-size: 14px;
		line-height: 1.5;
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}

	.post-footer {
		font-size: 12px;
		font-family: var(--code-font);
	}
</style>
