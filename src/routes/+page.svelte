<script>
	import Faq from '$lib/components/FAQ.svelte';
	import CmsSelector from '$lib/components/ProjectConfigurator/CmsSelector.svelte';
	import ProjectConfigSettings from '$lib/components/ProjectConfigurator/ProjectConfigSettings.svelte'; // Assuming this is the correct path

	let selectedCms;
	function handleCmsChange(event) {
		console.log('received change', { selectedCms: event.detail.value });
		selectedCms = event.detail.value;
	}
</script>

<div class="container">
	<CmsSelector on:selectedCmsChange={handleCmsChange} />

	<!-- {JSON.stringify(selectedCms)} -->

	{#if selectedCms != null}
		<ProjectConfigSettings {selectedCms} />
	{/if}
</div>

<div class="container">
	<Faq />
</div>
