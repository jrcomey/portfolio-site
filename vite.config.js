import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Dev only: serve .obj models as text/plain so a Cloudflare tunnel gzips them
// (it passes model/obj through uncompressed: blizzard.obj is 2.1 MB raw, 0.4 MB gzipped)
const objAsText = {
	name: 'obj-as-text',
	configureServer(server) {
		server.middlewares.use((req, res, next) => {
			if (req.url?.split('?')[0].endsWith('.obj')) {
				const setHeader = res.setHeader.bind(res);
				res.setHeader = (name, value) =>
					setHeader(name, name.toLowerCase() === 'content-type' ? 'text/plain; charset=utf-8' : value);
			}
			next();
		});
	}
};

export default defineConfig({
	plugins: [objAsText, sveltekit()]
});
