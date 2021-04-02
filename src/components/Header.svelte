<script>
	import DarkModeToggle from './DarkModeToggle.svelte';
</script>

<header role="banner">
	<div class="header-container">
		<div class="logo-group">
			<a class="logo-link" href="/">
				<img class="logo" src="/img/logo.svg" height="35" width="35" alt="logo" />
				Frank Chiarulli Jr.
			</a>
			<div class="darkmode-toggle-container">
				<DarkModeToggle />
			</div>
		</div>
		<nav class="header-nav" role="navigation">
			<a class="nav-link" href="/blog">Blog</a>
			<a class="nav-link" href="/art">Art</a>
			<!-- <a class="nav-link" href="/projects">Projects</a> -->
			<!-- <a class="nav-link" href="/search" aria-label="Search">🔍</a> -->
		</nav>
	</div>
</header>

<style>
	.header-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		white-space: nowrap;
		max-width: calc(var(--nav-width) + var(--gap) * 2);
		margin-inline-start: auto;
		margin-inline-end: auto;
		line-height: var(--header-height);
		padding: 0 var(--gap) 0 var(--gap);
	}

	.logo-group {
		display: flex;
		align-items: center;
		font-size: 24px;
		font-weight: 700;
	}

	.logo-link {
		display: flex;
		align-items: center;
	}

	.logo {
		margin-right: 10px;
	}

	.darkmode-toggle-container {
		margin-left: 5px;
	}

	.header-nav {
		display: flex;
		align-items: center;
	}

	.nav-link {
		margin: 5px;
	}

	a {
		text-decoration: none;
	}
</style>
