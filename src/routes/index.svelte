<script lang="ts">
	import { posts } from '$lib/posts';

	import SEO from '$components/SEO.svelte';
	import PostList from '$components/PostList.svelte';
	import SocialIcons from '$components/SocialIcons.svelte';
	import Button from '$components/Button.svelte';
</script>

<section>
	<SEO title="Home" desc="Frank Chiarulli Jr." />
	<h1 class="name">Frank Chiarulli Jr.</h1>
	<p>
		Hi, I’m Frank! I write code that keeps you safe and private online.
		<br />
		I’m a Lead Software Engineer at <a href="https://ghostery.com" rel="_blank"><b>Ghostery</b></a>.
		Building <a href="https://ghostery.com/midnight" rel="_blank">system-wide privacy tools</a>.
	</p>
	<p>
		Interested in go, security, embedded systems, & operating systems.
		<br />
		Probably doing something I shouldn’t with cGo or WinAPI.
	</p>
	<SocialIcons />
</section>
{#if posts?.length > 1}
	<section class="postContainer">
		<h2 class="postHeader">Latest Post:</h2>
		<PostList posts={posts.slice(0, 1)} />
		<div class="buttonContainer">
			<Button href="/blog" ariaLabel="blog">All Posts</Button>
		</div>
	</section>
{/if}

<style>
	.name {
		font-size: 34px;
		line-height: 1.3;
		color: var(--paragraph);
	}
	p {
		margin: 2rem auto;
		text-align: left;
		line-height: 1.5;
	}

	b {
		font-weight: 700;
	}
	a {
		font-weight: 600;
		text-decoration: none;
	}

	.postContainer {
		display: flex;
		flex-direction: column;
	}
	.postHeader {
		margin: 15px 0 15px 0;
	}

	.buttonContainer {
		align-self: flex-end;
	}
</style>
