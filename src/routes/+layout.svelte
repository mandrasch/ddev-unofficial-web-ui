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

<style>
</style>
