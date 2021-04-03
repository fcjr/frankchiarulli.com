<script lang="ts">
	import { posts } from '$lib/posts';

	import PostList from '$components/PostList.svelte';
	import SocialIcons from '$components/SocialIcons.svelte';
</script>

<section>
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
	<p>
		Looking for my <a href="/art">art</a>?
	</p>
	<SocialIcons />
</section>

<PostList {posts} />

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
</style>
