<title>Build-An-Algorithm</title>

<script>
    import Header from '../../Header.svelte';
    import MathBlock from '$lib/MathBlock.svelte';
    import { base } from '$app/paths';
    import ProjectSection from '$lib/ProjectSection.svelte';

    const h2_plot = `${base}/assets/diagrams/H2OptimalControl.png`;
    const algo_comp = `${base}/assets/diagrams/AlgorithmComponent.png`;
</script>

<Header/>

<section>

    <ProjectSection>

        <div slot="description">
            <div>
                <h1>Build-An-Algorithm</h1>
                <h3><i>Composable Flight Computer Algorithms in MultiVAC</i></h3>
            </div>
            <hr width="100%">
            
            <p>If you've read the <a href="{base}/projects/hardware-subsystems">hardware subsystems</a> page, you'll be familiar with how MultiVAC's <code>SubAssembly</code> system works. Components — motors, propellers, ESCs, servos — are wired together in a directed graph, passing signals and physics between each other to form an accurate model of the plant. It's a powerful pattern. Powerful enough, in fact, that I started to wonder why I was only using it for plant models.</p>
            <br>
            <p>The flight computer has always been the odd one out in MultiVAC's architecture, and has previous required a rigid implementation of guidance, navigation, and control modules, which cannot be expanded. That's fine for a textbook state-feedback controller on a linear plant, but is so inflexible as to be obstructive. It is not usable when you want to, say, cascade a position controller into an attitude controller, pull in a GPS signal from a modeled constellation, or integrate vehicle to vehicle communications modules. The old architecture forced you into a single GNC pipeline with no room for the kind of algorithmic composition that real flight software demands.</p>
        </div>

        <div slot="image">
            <img loading="lazy" src={h2_plot} alt="Attitude Plot" />
        </div>
    </ProjectSection>

        
    <ProjectSection>

        <div slot="description">
            <div>
                <h1>Algorithm Buildout and Pattern</h1>
            </div>
                <hr width="100%">
                <p>The <code>SubAssembly</code> pattern, at its core, is straightforward. You have a list of components. Each component has a defined interface — it can accept inputs, produce outputs, and has some internal state that it updates each time step. The components are connected by a dependency graph: each component knows which other components feed into it, and the assembly iterates through them in order, passing outputs downstream.</p>
                <br>
                <p>The key data structures that make it work are the bus systems. In the plant model, components communicate through buses that map kinematic quantities from related components and a seperate <code>SignalBus</code> for command signals flowing in from the flight computer. Each component implements the <code>SubComponentPart</code> trait, which defines how it interacts with these buses.</p>
                <br>
                <p>The new algorithm system applies the same structural pattern, and passes around information from individual algorithm components as an unstructured vector of signals. Algorithm components communicate entirely through <code>SignalBus</code> — vectors of floating point values. An algorithm component takes in signals, does some math, and produces signals. Those signals can be logged as telemetry, routed to other signals, or output to control or influence hardware.</p>
        </div>

        <div slot="image">
            <img loading="lazy" src={algo_comp} alt="Attitude Plot" />
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

    .description {
        margin: 5%;
        display: flex;
        flex-direction: column;
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

    .shaded-background-alt {
        background-color: #0f1112CC;
        border-radius: 20px;
        display: grid;
        grid-template-columns: 3fr 4fr;
        margin: 5% 0%;
        align-content: left;
    }

    .image-reel {
        margin: 5%;
        align-content: center;
    }

    .image-reel img {
        width: 100%;
        object-fit: contain;
        aspect-ratio: 1;
        border-radius: 5%;
    }

    pre {
        background-color: #1a1d1f;
        border: 1px solid #4AF626;
        border-radius: 8px;
        padding: 1.5em;
        overflow-x: auto;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 0.9em;
        line-height: 1.6;
    }

    code {
        color: #4AF626;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
    }

    pre code {
        color: #e0e0e0;
    }

    a {
        color: #4AF626;
    }

    @media (max-width: 80em){
        .shaded-background {
            display: flex;
            flex-direction: column;
        }
        .shaded-background-alt{
            display: flex;
            flex-direction: column;
        }
    }

</style>