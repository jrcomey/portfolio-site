<script>
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from '/vite.svg'
  import Counter from './lib/Counter.svelte'
  import Nested from './lib/Nested.svelte';
  import Header from './lib/Header.svelte';
  import About from './lib/About.svelte';

  let name = 'Svelte';
  let string = "This string contains some <strong>HTML!!!!!</strong>"
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato&family=Roboto:wght@100&display=swap" rel="stylesheet"> 
</svelte:head>

<main>
  <!-- <Header/> -->

    <About/>

  
  <section class="blue">
    <h1>Nice Curves</h1>
    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Pariatur, possimus facere sunt tempora voluptas dignissimos, molestiae voluptatum nobis consequuntur vel eos commodi culpa est neque et. Sunt sit minima magnam!</p>
    <div class="curve"></div>
  </section>



  <section class="dark">
    <h1>Nice Curves</h1>
    <p>This is a multi-wave test</p>
    
  </section>


  <section class="about-me red">
    <h1>About Me</h1>
    <p>Here's some example text. Some showing off will go here. </p>
  <a href="blog/index.html">Visit my Blog</a>
    <div class="wave">
      <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
      </svg>
  </div>
  </section>

  <div class="spacer layer1"></div>


  <section>
    <h1>Nice Curves</h1>
    <p>Iusto, magnam aut est tenetur consequuntur molestiae quasi explicabo mollitia pariatur neque expedita facere amet cum porro labore quaerat saepe veniam omnis ex impedit harum natus suscipit nihil. Voluptate, magnam.</p>
  </section>

  

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
