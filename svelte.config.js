import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {

    precompress: vitePreprocess(),
    kit: {
        adapter: adapter({
            pages: 'build',
            assets: 'build',
            fallback: '404.html',
            precompress: false,
            strict: true
        }),
        paths: {
            // Important: replace 'your-repo-name' with your actual repository name
            base: process.env.NODE_ENV === 'production' ? '/portfolio-site' : ''
        }
    }
};

export default config;
