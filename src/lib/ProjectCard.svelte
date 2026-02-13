<!-- src/lib/ProjectCard.svelte -->
<script>
  export let href = '';
  export let imageSrc = '';
  export let title = '';
  export let subtitle = '';
  export let description = '';
</script>

<div class="project">
  <a {href}>
    <img src={imageSrc} alt={title} />
  </a>
  <a {href}>
    <h2>{title}</h2>
  </a>
  <a {href}>
    <h3>{subtitle}</h3>
  </a>
  <a {href}>
    <p>{description}</p>
  </a>
</div>

<style>
    /* DEV */
  .project {
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    text-align: center;
    background-color: #22272b;
  }

  img {
    aspect-ratio: 1 / 1;
    width: 100%;
    opacity: 80%;
    object-fit: cover;
    background-color: #000000;

  }

  /* TEST */
  /* .project {
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    text-align: center;
    background-color: #22272b00;
    outline: 5px solid #4AF626;
  }

  img {
    aspect-ratio: 1 / 1;
    width: 100%;
    opacity: 80%;
    object-fit: cover;
    outline: 5px solid #4AF626;
  } */
  
  .project:hover {
    scale: 1.02;
  }

  .project:hover img {
    opacity: 100%;
  }



  a {
    color: #FFFFFF;
    text-decoration: none;
  }

  a:hover {
    text-decoration: none;
  }

  p {
    padding: 5%;
  }

  h3 {
    font-style: italic;
  }
</style>