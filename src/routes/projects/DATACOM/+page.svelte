<script>
    /** @type {import('./$types').PageData} */
    export let data;
    import { base } from '$app/paths';
    const masada = `${base}/assets/masada_test.png`;
    import Header from '../../Header.svelte';
</script>

<Header></Header>


<section class="high-level-description centered">

    <!-- <h1 class="centered">DATACOM: Visual Command and Control Terminal for Air and Space</h1> -->

    <div class="shaded-background">
        <div class="description">
            <div>
                <h1>DATACOM</h1>
                <h3>Visual Command and Control Terminal for Air and Space</h3>
                <h4>Ongoing</h4>
                <hr width="100%">
            </div>
            <p>DATACOM is a multipurpose visual terminal designed to provide an interface for managing large swarms of air and spacecraft. Originally concieved as an RTS-style control interface for drone swarms, the project has expanded in scope to become a more general purpose interface.</p>
            <p>DATACOM works on a networked packet system, and assumes that all craft that it interacts with are on the same network. Each aircraft (real or simulated) contains a basic model, which is transmitted to DATACOM on initial request. Subsequent requests from the terminal interface will pull current navigational data, and transmit new position commands as needed. How the aircraft gets there is determined by the vehicle itself.</p>

            <p>The packet interface allows for much more than it's original purpose, and can serve as a visual interface for any program provided that the correct interface is set up on the server side (here, either a vehicle or a sim like MultiVAC).</p>
        </div>
        <div class="image-reel">
            <img src={masada} alt="DATACOM Test">
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
        border-radius: 20px;
        display: grid;
        grid-template-columns: 4fr 3fr;
        margin: 5% 0%;
        align-content: left;
    }

    .shaded-background-no-pic {
        background-color: #0f1112CC;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        margin: 5% 0%;
        align-content: left;
    }

    b {
        color: #00FFFF;
    }

    /* .shaded-background-alt {
        background-color: #0f1112CC;
        border-radius: 20px;
        display: grid;
        grid-template-columns: 3fr 4fr;
        margin: 5% 0%;
        align-content: left;
    } */
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

    @media (max-width: 80em){
        .shaded-background {
            display: flex;
            flex-direction: column-reverse;
        }
        /* .shaded-background-alt{
            display: flex;
            flex-direction: column;
        } */
    }

</style>