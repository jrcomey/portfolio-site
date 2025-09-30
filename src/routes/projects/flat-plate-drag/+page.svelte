<title>Flat Plate Drag</title>

<script>
    import { base } from '$app/paths';
    /** @type {import('./$types').PageData} */
    export let data;
    import Header from '../../Header.svelte';
    const flat_plate = `${base}/assets/Prob1bResults1.png`

</script>

<Header/>
    <section>
        
        <div class="shaded-background-alt">
            <div class="image-reel">
                <img src={flat_plate} alt="ATP-XW Blizzard Render" />
                <p><i>Incompressible Fluid Flow Over a Flat Plate</i></p>
            </div>
            <div class="description">
                <div>
                    <h1>Fluid Flow Analysis</h1>
                    <h2><i>November 2020</i></h2>
                </div>
                
                <p>As part of a larger report, I mapped incompressible fluid flow over a flat plate using numerical schemes for the differential transport equation.</p>
                <p>The domain is first discretized into a larger grid, and a scheme for each node is derived by applying the numerical central difference stencil to the transport equation. Boundary conditions are applied for the incoming fluid velocity, and for the no-slip condition over the plate. Each column of nodes in the grid is solved for simultaneously using the Thomas tri-diagonal algorithm. </p>
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
        /* background-image: url("/assets/photography/cooks_bay.JPG"); */
        /* background-color: #000000FF; */
        flex-direction: column;
    }

    .image-reel {
        /* border: 5%; */
        margin: 5%;
        align-content: center;
    }

    .description {
        margin: 5%;
        display: flex;
        flex-direction: column;
    }

    .image-reel img {
            width: 100%;
            object-fit: contain;
            aspect-ratio: 1;
            border-radius: 5%;
            /* padding: 5%; */
        }

    .shaded-background {
        background-color: #0f1112CC;
        border-radius: 2%;
        display: grid;
        grid-template-columns: 4fr 3fr;
        margin: 5% 0%;
        align-content: left;
    }

    b {
        color: #00FFFF;
    }

    .shaded-background-alt {
        background-color: #0f1112CC;
        border-radius: 2%;
        display: grid;
        grid-template-columns: 3fr 4fr;
        margin: 5% 0%;
        align-content: left;
    }
    .image-reel {
        margin: 5%;
        align-content: center;
    }

    .description {
        margin: 5%;
        display: flex;
        flex-direction: column;
    }

    .image-reel img {
            width: 100%;
            object-fit: contain;
            aspect-ratio: 1;
            border-radius: 5%;
        }

    @media (max-width: 60em){
        .shaded-background {
            display: flex;
            flex-direction: column-reverse;
        }
        .shaded-background-alt{
            display: flex;
            flex-direction: column;
        }
    }

</style>