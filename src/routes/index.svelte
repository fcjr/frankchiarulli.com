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
	<p>Hi, I’m Frank! I write code that keeps you safe and private online.</p>
	<p>
		I am a software engineer who loves privacy, security, embedded systems, and open source. I
		mostly write Go, TypeScript, & Python on personal projects and currently use Go, Java, Kotlin,
		and Swift for work. Though, I am now learning and loving Rust.
	</p>
	<p>
		I am a tech lead at <a href="https://jpmorganchase.com"><b>JPMorgan Chase</b></a>'s Global
		Business Accelerator, running a team focused on privacy and security. Prior to that, I served as
		a founding engineer at <a href="https://svix.com"><b>Svix</b></a> (YC W21), where I helped build
		the company's initial platform and infrastructure. Before covid, I was the lead backend engineer
		at <a href="https://ghostery.com"><b>Ghostery</b></a>/<a href="https://github.com/cliqz"
			><b>Cliqz</b></a
		>, working on anti-tracking software, including Ghostery Midnight (a system-wide & tracker
		blocker).
	</p>
	<p>Probably doing something I shouldn’t with cGo or WinAPI.</p>
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
