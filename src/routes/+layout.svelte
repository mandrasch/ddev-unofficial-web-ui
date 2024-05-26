<script>
	// TODO: fix it, loading does not work currently
	import '@fontsource/fira-code';

	import Header from '$lib/components/Header.svelte';
	import '../styles/global.css';
	import GithubCorner from '$lib/components/GithubCorner.svelte';
</script>

<Header />

<main>
	<slot />
</main>

<GithubCorner />

<footer>
	<p>This is not an official DDEV-project, just a private demo.</p>
	<p>
		<a href="https://github.com/mandrasch/ddev-unofficial-web-ui">GitHub</a> |
		<a href="https://matthias-andrasch.eu/impressum-datenschutz/">Imprint & Privacy</a>
	</p>
</footer>

<style>
	footer {
		max-width: 900px;
		font-size: 0.8rem;
		margin: 5rem auto 0 auto;
		text-align: center;
	}
</style>
