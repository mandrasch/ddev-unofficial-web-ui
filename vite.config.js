import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const port = 5173;
let strictPort = false;
let origin = 'localhost';
if (process.env?.IS_DDEV_PROJECT) {
	console.log('Detected DDEV environment...');
	origin = `${process.env.DDEV_PRIMARY_URL}:${port}`;
	strictPort = true;
}

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		// respond to all network requests:
		host: '0.0.0.0',
		port: port,
		strictPort: strictPort,
		// Defines the origin of the generated asset URLs during development
		origin: origin
	},

});
