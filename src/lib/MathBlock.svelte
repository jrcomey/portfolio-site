<!-- <script>
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
</script> -->

<!-- <div bind:this={root}>
	<slot />
</div> -->

<script>
  import { onMount, onDestroy } from 'svelte';

  let root;
  let observer;

  function ensureMathJax() {
    return new Promise((resolve, reject) => {
      if (window.MathJax && window.MathJax.typesetPromise) return resolve();

      // config must be set before the script loads
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true
        },
        options: {
          // don't try to typeset code blocks, etc.
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
        }
      };

      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  }

  async function typeset(target = root) {
    if (window.MathJax && window.MathJax.typesetPromise) {
      await window.MathJax.typesetPromise([target]);
    }
  }

  onMount(async () => {
    await ensureMathJax();
    await typeset();

    // re-typeset on content changes (useful for client-side nav)
    observer = new MutationObserver(() => typeset());
    observer.observe(root, { childList: true, subtree: true });
  });

  onDestroy(() => observer && observer.disconnect());
</script>

<div bind:this={root}>
  <slot />
</div>
