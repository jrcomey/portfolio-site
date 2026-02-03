<script>
    /** @type {import('./$types').PageData} */
    export let data;
    import Header from '../../Header.svelte';
    import { base } from '$app/paths';
    const poster_path = `${base}/assets/poster_req_review.png`;
    const clem_path = `${base}/assets/clementine_model_air_and_space_museum.jpg`;

</script>

<Header/>

<section class="title-page">

    <div class="gradient-background"></div>
    
    <h1>REVERSE ENGINEERING CLEMENTINE</h1>


</section>


<section class="high-level-description centered">
<div class="shaded-background-vertical">
    <div class="image-reel">
        <a href="{base}/assets/poster_req_review.png"><img loading="lazy" src={poster_path} href="{base}/assets/poster_req_review.png" alt="Clementine Poster" /></a>
        <!-- <a href="{base}/assets/poster_req_review.png"><h3><i>Clementine Model</i></h3></a> -->
        <!-- <p><i>Image Credit: Air and Space Museum</i></p> -->
    </div>

    <div class="description">
        <h1>Reverse-Engineering Clementine</h1>
        
        <p>As part of a team of 5, I was tasked with reverse-engineering the 1993 Clementine lunar flyby probe in order to modify the spacecraft to prevent an ADCS error that caused mission failure.</p>

        <p>The project itself was the focus of an 11 week course on Space Vehicle Design, taught by former astronaut Dr. Steven Robinson.  The structure of the class followed a typical spacecraft development cycle (V model), beginning with an initial project proposal, followed by a significantly more detailed Preliminary Design Review (PDR), followed by a final Critical Design Review (CDR).</p>

        <p>After completing research on the history of the spacecraft, my team created a proposal for an addition to the spacecraft to prevent a similar failure in the event of a repeat mission. I identified stakeholders in the mission, created a mission Concept of operations (CONOPS), and worked with my team to identify existing operational requirements for subsystems. </p>

        <p>Our team proposed a plenum addition to the ADCS system, an intermediate buffer tank designed to prevent a complete loss of fuel in the same failure event. We wrote new, additional requirements that needed to be filled by the new system, and performed trade studies to determine ideal configuration and sizing of the new system.</p>

        <p>As part of a sub-team, I was responsible for the high level testing procedure to ensure that the spacecraft was ready for flight, while remaining inside Clementine's short design cycle. This testing procedure included mass flow and thrust tests (to ensure the new system addition did not affect thruster performance), multiple failure tests on the plenums themselves, as well as standard tests on the overall spacecraft (thermal-vacuum testing, center of mass/inertial testing, vibrational tests). </p>

        
    </div>

</div>

<br>
<!-- 
<div class="shaded-background">
    <div class="description">
        <div><h1>Report Available</h1></div>

        <p>The full CDR report is available on the right of the page, should you be interested.</p>

    </div>
    <div class="image-reel">
        <iframe title="clementine pdf" src="https://drive.google.com/file/d/1SeawRXB8xHjDCIufguNFvUpUdwF00irE/preview" width="640" height="480" allow="autoplay"></iframe>
    </div>
</div> -->

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
        flex-direction: column;
    }

    .centered {
        align-content: center;
    }
    
    .title-page {
        align-content: left;
        background-image: url("/assets/clementine_model_air_and_space_museum.jpg");
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


    .shaded-background-vertical {
        background-color: #0f1112CC;
        /* display: flex; */
        /* flex-direction: row; */
        padding: 5%;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        /* grid-row: 1; */
        /* grid-template-columns: 4fr 3fr; */
        /* padding: 5%; */
        align-content: left;
    }

    .shaded-background {
        background-color: #0f1112CC;
        /* display: flex; */
        /* flex-direction: row; */
        padding: 5%;
        border-radius: 20px;
        display: flex;
        flex-direction: row;
        /* grid-row: 1; */
        /* grid-template-columns: 4fr 3fr; */
        /* padding: 5%; */
        align-content: left;
    }

    .image-reel {
        /* border: 5%; */
        /* margin: 5%; */
        align-content: center;
    }

    .description {
        margin: 5%;
    }

    .image-reel img {
            width: 100%;
            /* height: 719px; */
            object-fit: cover;
            aspect-ratio: auto;
            /* border-radius: 5%; */
            /* padding: 5%; */
        }

</style>