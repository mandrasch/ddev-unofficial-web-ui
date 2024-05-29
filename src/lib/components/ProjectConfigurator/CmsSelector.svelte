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
		{ id: 'cakephp', title: 'Cake PHP', src: 'cakephp.jpg' },
		{ id: 'craftcms', title: 'Craft CMS', src: 'craftcms.svg' },
		{ id: 'drupal', title: 'Drupal', src: 'drupal.png' },
		{ id: 'kirby', src: 'kirby.svg' },
		{ id: 'laravel', src: 'laravel.svg' },
		{ id: 'statamic', title: 'Statamic', src: 'statamic.svg' },
		{ id: 'symfony', title: 'Symfony', src: 'symfony.svg' },
		{ id: 'typo3', title: 'TYPO3', src: 'typo3.svg' },
		{ id: 'wordpress', title: 'WordPress', src: 'wordpress.png' }
		// { id: 'backdrop', title: 'Backdrop', src: 'backdrop.png' }
		// Add more cmss as needed
	];

	/**
	 * Selects a CMS based on its ID.
	 *
	 * @param {string | null} id
	 */
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
	<div class="cms-grid">
		{#each cmsTypes as cms (cms.id)}
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
				<div class="img-wrapper">
					<img src={`/logos/${cms.src}`} alt="" />
				</div>
			</label>
		{/each}
	</div>
</div>

<style>
	.form-inner {
		container-type: inline-size;
	}

	.cms-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;

		@container (max-width: 599px) {
			display: grid;
			grid-template-columns: repeat(1, 1fr);
		}
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
	.img-wrapper {
		width: 100%;
		height: 100%;
		padding: 20px; /* Add padding around the image */
		box-sizing: border-box; /* Ensure padding is included in the element's total width and height */
		border: 2px solid #cddbf7;
	}
	.cms-item img {
		width: 100%;
		height: 100%;
		object-fit: contain;

		transition: border-color 0.3s;
	}
	.cms-item input[type='radio']:checked + .img-wrapper {
		border-color: #007bff;
	}
</style>
