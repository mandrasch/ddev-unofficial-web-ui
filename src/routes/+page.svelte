<script>
	import Faq from '$lib/components/FAQ.svelte';
	import CmsSelector from '$lib/components/ProjectConfigurator/CmsSelector.svelte';
	import ProjectConfigSettings from '$lib/components/ProjectConfigurator/ProjectConfigSettings.svelte'; // Assuming this is the correct path

	/**
	 * @type {string|null}
	 */
	let selectedCms;

	function handleCmsChange(event) {
		console.log('[index] Received change event from CmsSelector.svelte', {
			event,
			selectedCms: event.detail.value
		});
		selectedCms = event.detail.value;
	}
</script>

<div class="container">
	<h1 style="text-align:center;margin-bottom:2rem;">Project configurator</h1>

	<CmsSelector on:selectedCmsChange={handleCmsChange} />

	<!-- {JSON.stringify(selectedCms)} -->

	{#if selectedCms != null}
		<ProjectConfigSettings {selectedCms} />
	{/if}
</div>

<div class="container">
	<Faq />
</div>
