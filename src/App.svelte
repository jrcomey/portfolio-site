<script>
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from '/vite.svg'
  import Counter from './lib/Counter.svelte'
  import Nested from './lib/Nested.svelte';
  import Header from './lib/Header.svelte';
  import Landing from './lib/Landing.svelte';
  import Blizzard from './lib/Blizzard.svelte';
  import About from './lib/About.svelte';
  import Education from './lib/Education.svelte';
    import ProjectHighlights from './lib/ProjectHighlights.svelte';
  import ProjectGallery from './lib/ProjectGallery.svelte';


  const track = document.getElementById("image-track");

window.onmousedown = e => {
    track.dataset.mouseDownAt = e.clientX;
}

window.onmousemove = e => {
    if(track.dataset.mouseDownAt === "0") return;

    const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX;
    const maxDelta = window.innerWidth / 2;

    const percentage = (mouseDelta / maxDelta) * 100;

    track.style.transform = `translate(${percentage}%, -50%)`;
}

window.onmouseup = () => {
    track.dataset.mouseDownAt = "0";
}


</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato&family=Roboto:wght@100&display=swap" rel="stylesheet"> 
</svelte:head>

<main>
  <Header/>

  <Landing/>
  
  <!-- <Blizzard/> -->
  
  <About/>

  <Education/>

  <ProjectHighlights/>

  <ProjectGallery/>


  

  <div class="spacer layer2 flip"></div>
  <section class="pink">
    <h1>Nice Curves</h1>
    <p>Sit officia non odit? Provident, necessitatibus. Aspernatur, corporis suscipit cupiditate praesentium iusto est consequuntur eligendi, aliquam necessitatibus, facilis debitis reprehenderit. Rerum commodi necessitatibus officiis at dolorem laudantium, facere earum alias!</p>
  </section>
  <div class="spacer layer2"></div>

  <section>
    <h1>Nice Curves</h1>
    <p>Deleniti, vero quod! Laboriosam dicta aperiam officiis error doloremque totam ratione distinctio? Fugit laboriosam qui ut quam quia omnis, similique fuga, eligendi, accusamus voluptatibus magnam quae labore quasi ab quisquam.</p>
  </section>
  <section>
    <h1>Nice Curves</h1>
    <p>Provident qui doloribus commodi, numquam iure officiis iste possimus exercitationem necessitatibus amet, aliquam facilis sequi! Beatae nesciunt possimus a exercitationem maiores dolore eos! Incidunt atque quasi commodi enim aut cum.</p>
  </section>
  <section>
    <h1>Nice Curves</h1>
    <p>Ipsa quam perferendis beatae ratione expedita repellat commodi maxime aliquid, labore reiciendis recusandae laboriosam obcaecati repellendus sed provident explicabo ab dolorem quibusdam. Sapiente cumque repellendus quasi reprehenderit, accusamus tempore libero.</p>
  </section>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
  /* p {
    color: goldenrod;
    /* font-family: Arial, Helvetica, sans-serif;
    font-size: 2em;
  } */
</style>
