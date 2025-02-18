<script>
	import Highlight from 'svelte-highlight';
	import { yaml, javascript } from 'svelte-highlight/languages';
	import 'svelte-highlight/styles/github-dark.css';

	const viteConfigYaml = `# .ddev/config.yaml
web_extra_exposed_ports:
- name: node-vite
	container_port: 5173
	http_port: 5172
	https_port: 5173`;

	const viteConfigJs = `import { defineConfig } from 'vite'

const port = 5173;
const origin = \`\${process.env.DDEV_PRIMARY_URL}:\${port}\`;

export default defineConfig({

  // Your settings
  // ...

  // Adjust Vites dev server for DDEV
  // https://vitejs.dev/config/server-options.html
  server: {
    // respond to all network requests:
    host: '0.0.0.0',
    port: port,
    strictPort: true,
    // Defines the origin of the generated asset URLs during development
    origin: origin
  },

})
`;
</script>

<div class="faq">
	<h3>FAQ</h3>
	<details>
		<summary>More config settings needed?</summary>
		<p>
			There are many more config options, see <a
				href="https://ddev.readthedocs.io/en/stable/users/configuration/config/"
				target="_blank">Config Options</a
			> as well as "ddev help config".
		</p>
		<p>
			You can also change your configuration later via the generated ".ddev/config.yaml". Use "ddev
			restart" to apply changes.
		</p>
	</details>
	<!-- TODO: Use highlight syntax highlight-->
	<details>
		<summary>Vite support?</summary>
		<p>Add this to your ".ddev/config.yaml":</p>
		<div class="highlight-textarea-wrapper">
			<Highlight language={yaml} code={viteConfigYaml} />
		</div>
		<p>Run "ddev restart" afterwards to apply these changes.</p>
		<p>Modify your "vite.config.js" like this, the ".server" part is important:</p>
		<div class="highlight-textarea-wrapper">
			<Highlight language={javascript} code={viteConfigJs} />
		</div>
		<p>
			See <a href="https://ddev.com/blog/working-with-vite-in-ddev/">Working with Vite in DDEV</a> for
			more information.
		</p>
	</details>

	<details>
		<summary>How do I install DDEV?</summary>
		<p>
			It's pretty easy, just get started here: <a href="https://ddev.com/get-started/"
				>Install and start using DDEV</a
			>.
		</p>
	</details>

	<details>
		<summary>Gitpod support?</summary>
		<p>
			See <a href="https://github.com/mandrasch/ddev-laravel-vite">mandrasch/ddev-laravel-vite</a>,
			<a href="https://github.com/shaal/DrupalPod">DrupalPod</a>
			or <a href="https://github.com/ddev/ddev-gitpod-launcher">ddev/ddev-gitpod-launcher</a> as example.
		</p>
	</details>
</div>

<style>
	summary {
		cursor: pointer;
	}
</style>
