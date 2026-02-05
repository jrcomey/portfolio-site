<script>
    import Header from '../../Header.svelte';
    import ProjectSection from '$lib/ProjectSection.svelte';
    import { base } from '$app/paths';

    const poster_path = `${base}/assets/poster_req_review.png`;
</script>

<Header/>

<section class="title-page">
    <div class="gradient-background"></div>
    <h1>REVERSE ENGINEERING CLEMENTINE</h1>
</section>

<section class="high-level-description centered">
    <ProjectSection imagePosition="left">
        <div slot="image">
            <a href="{base}/assets/poster_req_review.png">
                <img loading="lazy" src={poster_path} alt="Clementine Poster" />
            </a>
        </div>
        <div slot="description">
            <h1>Reverse-Engineering Clementine</h1>
            <hr width="100%">
            <p>As part of a team of 5, I was tasked with reverse-engineering the 1993 Clementine lunar flyby probe in order to modify the spacecraft to prevent an ADCS error that caused mission failure.</p>
            <p>The project itself was the focus of an 11 week course on Space Vehicle Design, taught by former astronaut Dr. Steven Robinson. The structure of the class followed a typical spacecraft development cycle (V model), beginning with an initial project proposal, followed by a significantly more detailed Preliminary Design Review (PDR), followed by a final Critical Design Review (CDR).</p>
            <p>After completing research on the history of the spacecraft, my team created a proposal for an addition to the spacecraft to prevent a similar failure in the event of a repeat mission. I identified stakeholders in the mission, created a mission Concept of operations (CONOPS), and worked with my team to identify existing operational requirements for subsystems.</p>
            <p>Our team proposed a plenum addition to the ADCS system, an intermediate buffer tank designed to prevent a complete loss of fuel in the same failure event. We wrote new, additional requirements that needed to be filled by the new system, and performed trade studies to determine ideal configuration and sizing of the new system.</p>
            <p>As part of a sub-team, I was responsible for the high level testing procedure to ensure that the spacecraft was ready for flight, while remaining inside Clementine's short design cycle. This testing procedure included mass flow and thrust tests (to ensure the new system addition did not affect thruster performance), multiple failure tests on the plenums themselves, as well as standard tests on the overall spacecraft (thermal-vacuum testing, center of mass/inertial testing, vibrational tests).</p>
        </div>
    </ProjectSection>
</section>

<style>
    section {
        background-size: cover;
        position: relative;
        z-index: -10;
        min-height: 90vh;
        display: flex;
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
        margin: 0%;
        overflow: hidden;
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
</style>