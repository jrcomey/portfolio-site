<script>
    /** @type {import('./$types').PageData} */
    export let data;
</script>

<section class="high-level-description centered">

    <h1 class="centered">DATACOM: Visual Command and Control Terminal for Air and Space</h1>

    <div class="shaded-background">
        <div class="description">
            <p>DATACOM is a multipurpose visual terminal designed to provide an interface for managing large swarms of air and spacecraft. Originally concieved as an RTS-style control interface for drone swarms, the project has expanded in scope to become a more general purpose interface.</p>

            <p>DATACOM works on a networked packet system, and assumes that all craft that it interacts with are on the same network. Each aircraft (real or simulated) contains a basic model, which is transmitted to DATACOM on initial request. Subsequent requests from the terminal interface will pull current navigational data, and transmit new position commands as needed. How the aircraft gets there is determined by the vehicle itself.</p>
            
            <p>The packet interface allows for much more than it's original purpose, and can serve as a visual interface for any program provided that the correct interface is set up on the server side (here, either a vehicle or a sim like MultiVAC).</p>
        
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