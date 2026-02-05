<!-- src/lib/ProjectSection.svelte -->
<script>
  // 'right' = description left, image right (default)
  // 'left' = image left, description right
  // 'none' = no image, description only (full width)
  export let imagePosition = 'right';
</script>

{#if imagePosition === 'none'}
  <div class="project-section no-image">
    <slot name="description" />
  </div>
{:else}
  <div class="project-section" class:image-left={imagePosition === 'left'}>
    <div class="description">
      <slot name="description" />
    </div>
    <div class="image-reel">
      <slot name="image" />
    </div>
  </div>
{/if}

<style>
  .project-section {
    background-color: #0f1112CC;
    border-radius: 20px;
    display: grid;
    grid-template-columns: 4fr 3fr;
    margin: 5% 0%;
  }

  .project-section.image-left {
    grid-template-columns: 3fr 4fr;
  }

  .project-section.no-image {
    display: flex;
    flex-direction: column;
  }

  .project-section.no-image > :global(*) {
    margin: 5%;
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 80em) {
    .project-section:not(.no-image) {
      display: flex;
      flex-direction: column;
    }
    .project-section.image-left {
      flex-direction: column-reverse;
    }
  }

  .description {
    margin: 5%;
    display: flex;
    flex-direction: column;
  }

  .image-reel {
    margin: 5%;
    align-content: center;
  }

  .image-reel :global(img) {
    width: 100%;
    object-fit: contain;
    aspect-ratio: 1;
    border-radius: 5%;
  }

  .project-section :global(b) {
    color: #00FFFF;
  }
</style>