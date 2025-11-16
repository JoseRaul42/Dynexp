<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app">
	<header>
		<nav>
			<div class="nav-container">
				<a href="/" class="logo">DynExp_Detailer</a>
				<ul class="nav-links">
					<li><a href="/">Grid</a></li>
					<li><a href="/db-config">DB Config</a></li>
				</ul>
			</div>
		</nav>
	</header>

	<main>
		{@render children()}
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	header {
		background: #000000;
		background-image: 
			linear-gradient(180deg, rgba(255, 69, 0, 0.05) 0%, transparent 100%);
		color: #ff6347;
		box-shadow: 0 4px 12px rgba(255, 69, 0, 0.2);
		border-bottom: 2px solid rgba(255, 69, 0, 0.3);
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		font-size: 1.5rem;
		font-weight: bold;
		color: #ff6347;
		text-decoration: none;
		text-shadow: 0 0 10px rgba(255, 69, 0, 0.5);
		transition: all 0.3s;
	}

	.logo:hover {
		color: #ff4500;
		text-shadow: 0 0 20px rgba(255, 69, 0, 0.8);
	}

	.nav-links {
		display: flex;
		gap: 2rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav-links a {
		color: #ff6347;
		text-decoration: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		transition: all 0.3s;
		border: 1px solid transparent;
	}

	.nav-links a:hover {
		background-color: rgba(255, 69, 0, 0.15);
		border-color: rgba(255, 69, 0, 0.4);
		box-shadow: 0 0 10px rgba(255, 69, 0, 0.3);
	}

	main {
		flex: 1;
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		width: 100%;
	}
</style>
