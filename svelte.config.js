import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
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
            base: process.env.NODE_ENV === 'production' ? '/your-repo-name' : ''
        }
    }
};

export default config;
