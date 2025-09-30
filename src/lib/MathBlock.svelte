<script>
	import { onMount } from 'svelte';
	import 'katex/dist/katex.min.css';

	let root;

	onMount(async () => {
		const { default: renderMathInElement } = await import('katex/contrib/auto-render');
		renderMathInElement(root, {
			delimiters: [
				{ left: '$$', right: '$$', display: true },
				{ left: '$',  right: '$',  display: false }
			],
			throwOnError: false
		});
	});
</script>

<div bind:this={root}>
	<slot />
</div>