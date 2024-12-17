<script>
    /** @type {import('./$types').PageData} */
    export let data;
    import Header from '../../Header.svelte';
</script>

<Header/>

<section class="high-level-description-centered">
    <h1>Multivac</h1>
    <div class="shaded-background">
        <div class="description">
            <h1>Project Outline</h1>
            <p>MultiVAC is a 6 degree-of-freedom simulation, named after Isaac Asimov's recurring computer. It was originally designed as a simulation tool for UAV swarms, but was expanded as a development environment for the interaction between air- and spacecraft, and for extraterrestrial UAV design (the <i>Ingenuity</i> helicopter, for example).</p>
            <p>MultiVAC is DATACOM compatible, and currently supports both visual and headless modes of operation. The simulation uses an object dependent integrator, and can swap between them as needed.</p>
            <p></p>
            <p></p>
        </div>
    </div>
</section>



<style>

    section {
        background-size: cover;
        position: relative;
        z-index: -10;
        min-height: 90vh;
        /* align-content: center; */
        display: flex;
        background-image: url("/assets/photography/cooks_bay.JPG");
        flex-direction: column;
    }

    .centered {
        align-content: center;
    }

    .title-page {
        align-content: left;
        background-image: url("/src/assets/blizz.png");
        background-size: cover;
        justify-content: end;
        margin-bottom: 0%;
        margin: 0%;
        overflow: hidden;
        /* padding: 0%; */
        /* border: 0%; */
    }
    .gradient-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to top, rgba(15, 17, 18, 0.9), rgba(15, 17, 18, 0.9), 80%, rgba(15, 17, 18, 0));
        z-index: -1;
    }
    .high-level-description {

    }
    .scene-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
    }


    .shaded-background {
        background-color: #0f1112CC;
        /* display: flex; */
        /* flex-direction: row; */
        padding: 5%;
        border-radius: 2%;
        display: grid;
        /* grid-row: 1; */
        grid-template-columns: 4fr 3fr;
        /* padding: 5%; */
        align-content: left;
    }

    .image-reel {
        /* border: 5%; */
        margin: 5%;
        align-content: center;
    }

    .description {
        margin: 5%;
    }

    .image-reel img {
            width: 100%;
            object-fit: contain;
            aspect-ratio: 1;
            border-radius: 5%;
            /* padding: 5%; */
        }

</style>