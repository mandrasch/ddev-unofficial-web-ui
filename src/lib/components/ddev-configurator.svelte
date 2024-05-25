<script>
	import { writable, derived } from 'svelte/store';

	// Constants for form options
	const projectTypeMappings = {
		php: { label: 'php', docroot: '' },
		backdrop: { label: 'Backdrop', docroot: '' },
		cakephp: { label: 'CakePHP', docroot: 'webroot' },
		craftcms: { label: 'Craft CMS', docroot: 'web' },
		drupal: { label: 'Drupal', docroot: 'web' },
		laravel: { label: 'Laravel', docroot: 'public' },
		magento2: { label: 'Magento 2', docroot: 'pub' },
		shopware6: { label: 'Shopware 6', docroot: 'public' },
		silverstripe: { label: 'SilverStripe', docroot: 'public' },
		typo3: { label: 'TYPO3', docroot: 'public' },
		wordpress: { label: 'WordPress', docroot: '' }
	};
	const projectTypes = Object.keys(projectTypeMappings);

	const phpVersions = ['8.3', '8.2', '8.1', '8.0', '7.4', '7.2', '7.1', '7.0', '5.6'];

	const databaseTypeMappings = {
		mysql: 'MySQL',
		postgres: 'PostgreSQL',
		mariadb: 'MariaDB',
		none: 'None'
	};
	const databaseTypes = Object.keys(databaseTypeMappings);
	const databaseVersions = {
		mysql: ['8.0', '5.7', '5.5'],
		postgres: ['16', '15', '14', '13', '12', '11', '9'],
		mariadb: [
			'10.11',
			'10.10',
			'10.9',
			'10.8',
			'10.7',
			'10.6',
			'10.5',
			'10.4',
			'10.3',
			'10.2',
			'10.1',
			'10.0',
			'5.5'
		]
	};

	const nodejsVersions = ['20.3.1', '20.3', '20', '18', 'custom'];

	// Form state stores with default values
	const projectName = writable('my-awesome-project');
	const addTimestamp = writable(false);
	const projectType = writable('php');
	const docroot = writable('');
	const phpVersion = writable('8.2');
	const databaseType = writable('mysql');
	const databaseVersion = writable('8.0');
	const nodejsVersion = writable('20.3.1');
	const customNodejsVersion = writable('');
	const enableCorepack = writable(false);
	const disableSettingsManagement = writable(false);

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
			return `-${now.getTime()}`;
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

	// Derived store for bash command
	const bashCommand = derived(
		[
			projectNameWithTimestamp,
			projectType,
			docroot,
			phpVersion,
			databaseType,
			databaseVersion,
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
			$nodejsVersion,
			$customNodejsVersion,
			$enableCorepack,
			$disableSettingsManagement
		]) => {
			const nodejsVersionFinal =
				$nodejsVersion === 'custom' ? $customNodejsVersion : $nodejsVersion;

			// define docroot
			let docrootFinal = $docroot;
			if ($projectType !== 'php') {
				docrootFinal = projectTypeMappings[$projectType].docroot;
			}

			let databaseFinalCmd;
			if ($databaseType === 'none') {
				databaseFinalCmd = '--omit-containers="db"';
			} else {
				databaseFinalCmd = `--database="${$databaseType}:${$databaseVersion}"`;
			}

			let generatedCommand = `mkdir ${$projectNameWithTimestamp} && \\
cd ${$projectNameWithTimestamp}/ && \\
ddev config \\
--project-type="${$projectType}" \\ 
--docroot="${docrootFinal}" \\
--php-version="${$phpVersion}" \\
${databaseFinalCmd} \\
--nodejs-version="${nodejsVersionFinal}" \\\n`;

			if ($enableCorepack) {
				generatedCommand += '--corepack-enable \\\n';
			}
			if ($disableSettingsManagement) {
				generatedCommand += `--disable-settings-management \\\n`;
			}

			generatedCommand += `&& ddev start`;

			return generatedCommand;
		}
	);
</script>

<div class="form-container">
	<div class="form-inner">
		<div class="logo-container">
			<img src="/ddev.svg" alt="" />
		</div>

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

		<div class="form-group">
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

		<div class="form-group">
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
			<div class="group-label">Node.js Version</div>
			<div class="radio-group">
				{#each nodejsVersions as version}
					<label>
						<input type="radio" name="nodejs-version" value={version} bind:group={$nodejsVersion} />
						{version}
					</label>
				{/each}
				{#if $nodejsVersion === 'custom'}
					<input
						type="text"
						placeholder="Custom Node.js Version, e.g. 22.2.01, 22.2, 22"
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
						<input type="checkbox" bind:checked={$enableCorepack} /> Enable corepack for Node.JS
					</label>
					<label>
						<input type="checkbox" bind:checked={$disableSettingsManagement} /> Disable settings management
					</label>
				</div>
			</div>
		</details>

		<div class="form-group" style="margin-top:2rem;">
			<h2 style="text-align:center">Your config command</h2>
			<textarea readonly class="bash-command" rows="10">{$bashCommand}</textarea>
		</div>

		<div class="help-text help-text--blue">
			There are many more config options, see <a
				href="https://ddev.readthedocs.io/en/stable/users/configuration/config/"
				target="_blank">Config Options</a
			> as well as "ddev help config". You can also change your configuration in the file ".ddev/config.yaml".
		</div>

		<div class="faq" style="margin-top:3rem;">
			<details>
				<summary>Vite support?</summary>
			</details>

			<details>
				<summary>Gitpod support?</summary>
			</details>
		</div>
	</div>
</div>

<style>
	.form-container {
		font-family:
			ui-sans-serif,
			system-ui,
			sans-serif,
			'Apple Color Emoji',
			'Segoe UI Emoji',
			Segoe UI Symbol,
			'Noto Color Emoji';
		max-width: 600px;
		margin: 0 auto;

		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

		container-type: inline-size;
	}

	.form-inner {
		padding: 3rem;

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
		padding: 0.6rem 0.75rem;
		margin: 1rem 0;
		background-color: #fefefe;
		border-color: #fdfdfe;
		border: 1px solid transparent;
		border-radius: 0.25rem;
	}

	.help-text.help-text--blue {
		background-color: #cce5ff;
		border-color: #b8daff;
	}

	.help-text.help-text--yellow {
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
