<script>
	// We just separated CMS selection from Project Config Settings UI

	import { createEventDispatcher } from 'svelte';
	import { writable, derived } from 'svelte/store';

	// outside usage
	export let selectedValue = null;
	const dispatch = createEventDispatcher();

	// internal store
	const selectedCms = writable(selectedValue);

	const cmsTypes = [
		{ id: 'custom', title: 'Custom config', src: 'custom.svg' },
		{ id: 'craftcms', title: 'Craft CMS', src: 'craftcms.svg' },
		{ id: 'typo3', title: 'TYPO3', src: 'typo3.svg' },
		{ id: 'kirby', src: 'kirby.svg' },
		{ id: 'laravel', src: 'laravel.svg' }
		// Add more cmss as needed
	];

	function selectCMS(id) {
		// update internal store
		selectedCms.set(id);

		// update outside props
		dispatch('selectedCmsChange', {
			value: id
		});
	}
</script>

<div class="form-inner">
	<h2 style="text-align:center;margin-bottom:2rem;">Project configurator</h2>
	<div class="cms-grid">
		{#each cmsTypes as cms}
			<label class="cms-item">
				<input
					type="radio"
					name="cms"
					value={cms.id}
					on:change={() => selectCMS(cms.id)}
					checked={$selectedCms === cms.id}
					aria-checked={$selectedCms === cms.id}
					aria-label={cms.title}
				/>

				<img src={`/logos/${cms.src}`} alt="" />
			</label>
		{/each}
	</div>
</div>

<style>
	.logo-container {
		text-align: center;
		margin-bottom: 2rem;
	}
	.cms-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}
	.cms-item {
		position: relative;
		cursor: pointer;
		height: 100px;
	}
	.cms-item input[type='radio'] {
		opacity: 0;
		position: absolute;
		width: 100%;
		height: 100%;
		cursor: pointer;
	}

	.cms-item img {
		width: 100%;
		height: 100%;

		object-fit: contain;
		border: 2px solid #cddbf7;
		transition: border-color 0.3s;
	}
	.cms-item input[type='radio']:checked + img {
		border-color: #007bff;
	}
</style>
