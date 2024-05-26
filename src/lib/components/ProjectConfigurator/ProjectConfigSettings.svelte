<script>
	// This is used as a child component for ProjectConfigurator,
	// but it can be also used standalone.

	import { onDestroy } from 'svelte';
	import { writable, derived } from 'svelte/store';
	import Highlight from 'svelte-highlight';
	import { bash } from 'svelte-highlight/languages';
	import 'svelte-highlight/styles/github-dark.css';

	// outside props
	export let selectedCms = null;
	// Watch for changes in selectedCms prop from outside
	$: {
		console.log('[ProjectConfigSettings.svelte] Selected CMS changed from outside', {
			selectedCms
		});

		// Reset defaults when another CMS is selected, user might have changed a lot of settings
		resetDefaults();

		// Set project type according to new selected CMS, add some recommended defaults
		if (selectedCms) {
			switch (selectedCms) {
				case 'custom':
					projectType.set('php');
					break;

				case 'craftcms':
					projectType.set(selectedCms);
					phpVersion.set('8.2');
					databaseType.set('mysql');
					databaseVersion.set('8.0');
					break;
				case 'kirby':
					projectType.set('php');
					phpVersion.set('8.2');
					databaseType.set('none');
					break;
				case 'laravel':
					projectType.set(selectedCms);
					phpVersion.set('8.2');
					databaseType.set('mysql');
					databaseVersion.set('8.0');
					break;
				case 'typo3':
					projectType.set(selectedCms);
					phpVersion.set('8.2');
					databaseType.set('mysql');
					databaseVersion.set('8.0');
					break;
				default:
					console.error('Selected CMS not mapped yet to project configurator', { selectedCms });
					break;
			}
		}
	}

	// Cleanup logic
	onDestroy(() => {
		projectType.set('php');
		phpVersion.set('8.2');
	});

	// Constants for form options
	import {
		projectTypeMappings,
		projectTypes,
		phpVersions,
		databaseTypeMappings,
		databaseTypes,
		databaseVersions,
		webserverTypes,
		nodejsVersions
	} from '$lib/stores/configOptions';

	// Form state stores with default values
	const projectName = writable('my-awesome-project');
	const addTimestamp = writable(false);
	const projectType = writable('php');
	const docroot = writable('');
	const phpVersion = writable('8.2');
	const databaseType = writable('mysql');
	const databaseVersion = writable('8.0');
	const webserverType = writable('nginx-fpm');
	const nodejsVersion = writable('20.3.1');
	const customNodejsVersion = writable('');
	const enableCorepack = writable(false);
	const disableSettingsManagement = writable(false);

	// Define a function to reset all defaults, needed when user changed a lot
	// and another CMS is selected
	function resetDefaults() {
		projectType.set('php');
		docroot.set('');
		phpVersion.set('8.2');
		databaseType.set('mysql');
		databaseVersion.set('8.0');
		webserverType.set('nginx-fpm');
		nodejsVersion.set('20.3.1');
		customNodejsVersion.set('');
		enableCorepack.set(false);
		disableSettingsManagement.set(false);
	}

	// Reactive statement to update the database version based on the selected type
	$: {
		if ($databaseType === 'mysql' && !databaseVersions.mysql.includes($databaseVersion)) {
			databaseVersion.set('8.0');
		} else if (
			$databaseType === 'postgres' &&
			!databaseVersions.postgres.includes($databaseVersion)
		) {
			databaseVersion.set('16');
		} else if (
			$databaseType === 'mariadb' &&
			!databaseVersions.mariadb.includes($databaseVersion)
		) {
			databaseVersion.set('10.11');
		}
	}

	// Derived store for timestamp
	const timestamp = derived(addTimestamp, ($addTimestamp) => {
		if ($addTimestamp) {
			const now = new Date();
			const year = now.getFullYear();
			const month = String(now.getMonth() + 1).padStart(2, '0');
			const day = String(now.getDate()).padStart(2, '0');
			const hours = String(now.getHours()).padStart(2, '0');
			const minutes = String(now.getMinutes()).padStart(2, '0');
			const seconds = String(now.getSeconds()).padStart(2, '0');
			return `-${year}${month}${day}-${hours}${minutes}${seconds}`;
		} else {
			return '';
		}
	});

	// Derived store for project name with timestamp
	const projectNameWithTimestamp = derived(
		[projectName, timestamp],
		([$projectName, $timestamp]) => {
			return $projectName + $timestamp;
		}
	);

	// Helper function which safely adds another command with line break after it
	function appendCommand(command, line) {
		return `${command}${line.trim()} && \\\n`;
	}

	// Derived store for the generated command
	const generatedBashCommand = derived(
		[
			projectNameWithTimestamp,
			projectType,
			docroot,
			phpVersion,
			databaseType,
			databaseVersion,
			webserverType,
			nodejsVersion,
			customNodejsVersion,
			enableCorepack,
			disableSettingsManagement
		],
		([
			$projectNameWithTimestamp,
			$projectType,
			$docroot,
			$phpVersion,
			$databaseType,
			$databaseVersion,
			$webserverType,
			$nodejsVersion,
			$customNodejsVersion,
			$enableCorepack,
			$disableSettingsManagement
		]) => {
			console.log('[ProjectConfigSettings.svelte] Regenerate bash command triggered');

			// prepare some variables

			const nodejsVersionFinal =
				$nodejsVersion === 'custom' ? $customNodejsVersion : $nodejsVersion;

			let docrootFinal = $docroot;
			if ($projectType !== 'php') {
				if (projectTypeMappings[$projectType]?.docroot == null) {
					console.error('No docroot found for projectType ', { $projectType });
				} else {
					docrootFinal = projectTypeMappings[$projectType].docroot;
				}
			}

			let databaseFinalCmd;
			if ($databaseType === 'none') {
				databaseFinalCmd = '--omit-containers="db"';
			} else {
				databaseFinalCmd = `--database="${$databaseType}:${$databaseVersion}"`;
			}

			// our output command
			let generatedCommand = '';

			// create folder, switch to it
			generatedCommand = appendCommand(generatedCommand, `mkdir ${$projectNameWithTimestamp}`);
			generatedCommand = appendCommand(generatedCommand, `cd ${$projectNameWithTimestamp}/`);

			// ddev config command has some optional arg flags
			// TODO: find a better way to do this with optional flags
			let tmpBaseCommand = `ddev config \\
	--project-type="${$projectType}" \\
	--docroot="${docrootFinal}" \\
	--php-version="${$phpVersion}" \\
	${databaseFinalCmd} \\
	--webserver-type=${$webserverType} \\
	--nodejs-version="${nodejsVersionFinal}"`;

			if ($enableCorepack) {
				tmpBaseCommand += `\\\n\t--corepack-enable `;
			}
			if ($disableSettingsManagement) {
				tmpBaseCommand += `\\\n\t--disable-settings-management`;
			}

			// append ddev config command
			generatedCommand = appendCommand(generatedCommand, tmpBaseCommand);

			// append ddev start
			generatedCommand = appendCommand(generatedCommand, 'ddev start -y');

			if (selectedCms != null && selectedCms !== 'custom') {
				switch (selectedCms) {
					case 'craftcms':
						generatedCommand = appendCommand(
							generatedCommand,
							`ddev composer create -y --no-scripts --no-interaction "craftcms/craft:^5"`
						);
						generatedCommand = appendCommand(
							generatedCommand,
							`ddev craft install/craft \\
	--username=admin \\
	--password=password123 \\
	--email=admin@example.com \\
	--site-name=Testsite \\
	--language=en \\
	--site-url='$DDEV_PRIMARY_URL'`
						);
						break;

					case 'kirby':
						generatedCommand = appendCommand(
							generatedCommand,
							'ddev composer create getkirby/starterkit'
						);
						break;

					case 'laravel':
						generatedCommand = appendCommand(
							generatedCommand,
							'ddev composer create --prefer-dist laravel/laravel:^11'
						);

						// special case: SQlite, --disable-settings-management is preferred
						if ($disableSettingsManagement === true) {
							generatedCommand = appendCommand(generatedCommand, 'ddev cp .env.example .env');
							generatedCommand = appendCommand(generatedCommand, 'ddev artisan key:generate');
							// TODO: has a yes/no confirmation
							generatedCommand = appendCommand(generatedCommand, 'ddev artisan migrate');
						}

						break;

					case 'typo3':
						generatedCommand = appendCommand(
							generatedCommand,
							`ddev composer create "typo3/cms-base-distribution:^12"`
						);
						// TODO: some more args needed
						generatedCommand = appendCommand(
							generatedCommand,
							`ddev exec ./vendor/bin/typo3 setup \\
	--admin-username="admin" \\
	--admin-user-password="password123" \\
	--project-name="test"`
						);
						break;

					default:
						console.error('No install command found for ', { selectedCms });
						break;
				}
			}

			generatedCommand = appendCommand(generatedCommand, 'ddev launch');

			console.log('Raw generated command', { generatedCommand });

			// TODO: find a better solution for this! use .trim()?
			// Remove the last && \\\n
			return generatedCommand.slice(0, -6);
		}
	);
</script>

<div class="form-container">
	<div class="form-inner">
		<div class="form-group" style="margin-top:2rem;">
			<h2 style="text-align:center">Your config command</h2>
			<!-- <div class="help-text">Paste this into your terminal:</div> -->
			<div class="highlight-textarea-wrapper">
				<Highlight language={bash} code={$generatedBashCommand} />
			</div>
			<!-- <div class="code-buttons">
				<button>Copy to clipboard</button>
				<button>Open in Gitpod</button>
			</div> -->
		</div>

		<h3 style="text-align:center;margin-top:2.5rem;">Fine-tune your settings</h3>

		<div class="form-group">
			<label class="group-label" for="project-name">Project (folder) name</label>
			<input type="text" id="project-name" bind:value={$projectName} />
			<label style="margin-top:0.65rem;">
				<small><input type="checkbox" bind:checked={$addTimestamp} />Add Timestamp</small>
			</label>
		</div>

		<div class="form-group">
			<div class="help-text">
				Your project URL: <a href="#">{`https://${$projectNameWithTimestamp}.ddev.site`}</a>.
			</div>
		</div>

		<!-- Don't show project type and docroot for pre-selected CMS, this is for power users -->
		<div class="form-group" class:hide={selectedCms != null && selectedCms != 'custom'}>
			<div class="group-label">Project Type</div>
			<p>
				<small
					>Not every CMS needs its own project type, see <a
						href="https://ddev.readthedocs.io/en/stable/users/quickstart/"
						target="_blank">CMS Quickstarts</a
					>.</small
				>
			</p>
			<div class="radio-group">
				{#each projectTypes as type}
					<label>
						<input type="radio" name="project-type" value={type} bind:group={$projectType} />
						{projectTypeMappings[type].label}
					</label>
				{/each}
			</div>
		</div>

		<!-- Don't show project type and docroot for pre-selected CMS, this is for power users -->
		<div class="form-group" class:hide={selectedCms != null && selectedCms != 'custom'}>
			{#if $projectType === 'php'}
				<label for="docroot" class="group-label">Docroot (optional):</label>
				<input
					type="text"
					id="docroot"
					bind:value={$docroot}
					placeholder="Insert a folder name like 'public', 'web' or leave it empty (default)"
				/>
			{:else}
				<label for="docrootDisabled" class="group-label">Docroot - defined by project type:</label>
				<input
					type="text"
					id="docrootDisabled"
					value={projectTypeMappings[$projectType].docroot}
					disabled
				/>
			{/if}
		</div>

		<div class="form-group">
			<div class="group-label">PHP Version</div>
			<div class="radio-row">
				{#each phpVersions as version}
					<label>
						<input type="radio" name="php-version" value={version} bind:group={$phpVersion} />
						{version}
					</label>
				{/each}
			</div>
		</div>

		<div class="form-group">
			<div class="group-label">Database type</div>

			{#if $projectType === 'craftcms'}
				<div class="help-text help-text--yellow">
					Craft CMS <a href="https://craftcms.com/docs/5.x/requirements.html" target="_blank"
						>recommends</a
					> MySQL 8.0.36+ or PostgreSQL 16+.
				</div>
			{/if}

			{#if $projectType === 'laravel'}
				<div class="help-text help-text--blue">
					If you want to use Laravel with SQLite, choose "None" and disable the settings management
					in additional settings.
				</div>
			{/if}

			<div class="radio-row">
				{#each databaseTypes as dbType}
					<label>
						<input type="radio" name="database-type" value={dbType} bind:group={$databaseType} />
						{databaseTypeMappings[dbType]}
					</label>
				{/each}
			</div>
		</div>

		{#if $databaseType && $databaseType !== 'none'}
			<div class="form-group">
				<div class="group-label">Database version</div>
				<div class="radio-row">
					{#each databaseVersions[$databaseType] as version}
						<label>
							<input
								type="radio"
								name="database-version"
								value={version}
								bind:group={$databaseVersion}
								checked={version === '8.0'}
							/>
							{version}
						</label>
					{/each}
				</div>
			</div>
		{/if}

		<div class="form-group">
			<div class="group-label">Webserver type</div>
			<div class="radio-row">
				{#each webserverTypes as type}
					<label>
						<input type="radio" name="webserverType" value={type} bind:group={$webserverType} />
						{type}
					</label>
				{/each}
			</div>
		</div>

		<div class="form-group">
			<div class="group-label">Node.js Version</div>
			<div class="radio-row">
				{#each nodejsVersions as version}
					<label>
						<input type="radio" name="nodejs-version" value={version} bind:group={$nodejsVersion} />
						{version}
					</label>
				{/each}
				{#if $nodejsVersion === 'custom'}
					<input
						type="text"
						placeholder="Custom Node.js Version, e.g. 22.2.01, 22.2 or 22"
						bind:value={$customNodejsVersion}
					/>
				{/if}
			</div>
		</div>

		<details>
			<summary>Additional settings</summary>
			<!-- <div class="help-text">These are only needed for special cases.</div> -->
			<div class="form-group" style="margin-top:1rem;">
				<div class="checkbox-group">
					<label>
						<input type="checkbox" bind:checked={$enableCorepack} /> Enable corepack for Node.js
					</label>
					<label>
						<input type="checkbox" bind:checked={$disableSettingsManagement} /> Disable settings management
					</label>
				</div>
			</div>
		</details>
	</div>
</div>

<style>
	.hide {
		display: none !important;
	}

	.form-container {
		container-type: inline-size;
	}

	.form-inner {
		@container (max-width: 599px) {
			padding: 1rem;
		}
	}

	.form-inner input,
	.form-inner textarea {
		box-sizing: border-box;
	}

	.help-text {
		font-size: 0.8rem;
		background-color: #fefefe;
		border-color: #fdfdfe;
		border: 1px solid transparent;
		border-radius: 0.25rem;
	}

	.help-text.help-text--blue {
		padding: 0.6rem 0.75rem;
		margin: 0.5rem 0 1rem 0;
		background-color: #cce5ff;
		border-color: #b8daff;
	}

	.help-text.help-text--yellow {
		padding: 0.6rem 0.75rem;
		margin: 0.5rem 0 1rem 0;
		background-color: #fff3cd;
		border-color: #ffeeba;
	}

	.logo-container {
		text-align: center;
		margin-bottom: 2rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
	}

	.form-group input[type='text'],
	.form-group textarea {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.form-group input[type='radio'],
	.form-group input[type='checkbox'],
	.form-group label {
		cursor: pointer;
	}

	.group-label {
		font-weight: bold;
		margin-top: 1.5rem;
		margin-bottom: 1rem;
	}

	.radio-group {
		display: flex;
		flex-direction: column;
	}

	.radio-row {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 1rem;

		/* If the container is larger than 700px */
		@container (max-width: 599px) {
			flex-direction: column;
			gap: 0.25rem;
		}
	}

	button.primary {
		background-color: rgb(2 123 167 / var(--tw-bg-opacity));
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
	}

	button.secondary {
		background-color: white;
		color: rgb(2 123 167 / var(--tw-bg-opacity));
		border: 2px solid rgb(2 123 167 / var(--tw-bg-opacity));
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
	}

	textarea.bash-command {
		margin-top: 0.75rem;
		white-space: pre;
	}

	details {
		margin-top: 1rem;
	}

	details summary {
		font-weight: bold;
		cursor: pointer;
	}

	/*details[open] summary ~ * {
		animation: sweep 0.5s ease-in-out;
	}

	@keyframes sweep {
		0% {
			opacity: 0;
			margin-top: -10px;
		}
		100% {
			opacity: 1;
			margin-top: 0;
		}
	}*/
</style>
