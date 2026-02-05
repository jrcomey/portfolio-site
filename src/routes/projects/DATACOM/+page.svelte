<script>
    import { base } from '$app/paths';
    import Header from '../../Header.svelte';
    import ProjectSection from '$lib/ProjectSection.svelte';

    const masada = `${base}/assets/masada_test.png`;
</script>

<Header></Header>

<section class="high-level-description centered">
    <ProjectSection>
        <div slot="description">
            <h1>DATACOM</h1>
            <h3>Visual Command and Control Terminal for Air and Space</h3>
            <h4>Ongoing</h4>
            <hr width="100%">
            <p>DATACOM is a multipurpose visual terminal designed to provide an interface for managing large swarms of air and spacecraft. Originally concieved as an RTS-style control interface for drone swarms, the project has expanded in scope to become a more general purpose interface.</p>
            <p>DATACOM works on a networked packet system, and assumes that all craft that it interacts with are on the same network. Each aircraft (real or simulated) contains a basic model, which is transmitted to DATACOM on initial request. Subsequent requests from the terminal interface will pull current navigational data, and transmit new position commands as needed. How the aircraft gets there is determined by the vehicle itself.</p>
            <p>The packet interface allows for much more than it's original purpose, and can serve as a visual interface for any program provided that the correct interface is set up on the server side (here, either a vehicle or a sim like MultiVAC).</p>
        </div>
        <div slot="image">
            <img loading="lazy" src={masada} alt="DATACOM Test">
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
</style>
