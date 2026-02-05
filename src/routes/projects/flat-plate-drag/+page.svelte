<title>Flat Plate Drag</title>

<script>
    import { base } from '$app/paths';
    import Header from '../../Header.svelte';
    import ProjectSection from '$lib/ProjectSection.svelte';

    const flat_plate = `${base}/assets/Prob1bResults1.png`;
</script>

<Header/>

<section>
    <ProjectSection imagePosition="left">
        <div slot="image">
            <img loading="lazy" src={flat_plate} alt="Incompressible Fluid Flow Over a Flat Plate" />
        </div>
        <div slot="description">
            <h1>Fluid Flow Analysis</h1>
            <h2><i>November 2020</i></h2>
            <hr width="100%">
            <p>As part of a larger report, I mapped incompressible fluid flow over a flat plate using numerical schemes for the differential transport equation.</p>
            <p>The domain is first discretized into a larger grid, and a scheme for each node is derived by applying the numerical central difference stencil to the transport equation. Boundary conditions are applied for the incoming fluid velocity, and for the no-slip condition over the plate. Each column of nodes in the grid is solved for simultaneously using the Thomas tri-diagonal algorithm.</p>
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
</style>
