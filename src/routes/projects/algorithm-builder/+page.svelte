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
            
            <p>If you've read the hardware subsystems page, you'll be familiar with how MultiVAC's subassembly system works. Components are wired together in a directed graph, passing signals and physics between each other to form an accurate nonlinear model of the plant. It allows for complex models to be set up with a simple scripting interface. A similar structure now exists for flight control and sensor processing algorithms. </p>
            <br>
            <p>Like the subassemblies, they consist of a series of independently verified blocks that can be put together for rapid prototyping of a new flight control architecture. The Python integration allows for any upstream changes (whether to the plant, the flight computer, etc) to be re-verified quickly through a series of increasingly complex unit and integration tests of your own design. This allows the end user to test hardware like software. A potential HIL pipeline could run a series of tests and simulations before compiling a build to be tested on real hardware stored in a test facility of some kind. </p>
            <br>
            <p>Addition of new components is a simple process, and requires only that the new components use the existing IO interface and have constructors enabled in the Python interface. The component library is currently somewhat barebones but is expanding rapidly. </p>
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