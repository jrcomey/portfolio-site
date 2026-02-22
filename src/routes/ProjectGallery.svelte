<script>
    import { base } from '$app/paths';
    import ProjectCard from '$lib/ProjectCard.svelte';
</script>

<section id="misc-projects" class="dark centered">
    <h1>Project Gallery</h1>

    

    <div class="project-grid">

        <!-- <ProjectCard
            href="{base}/projects/algorithm-builder"
            imageSrc="{base}/assets/trifecta/helicopter_subassembly.png"
            title="MultiVAC Algorithm Builder"
            subtitle="Complex Nonlinear Assembly Structure"
            description="A method for creating large flight control algorithms through program declaration"
        /> -->

        <ProjectCard
            href="{base}/projects/tricopter-dynamics"
            imageSrc="{base}/assets/trifecta/render_screenshot.png"
            title="Tricopter Dynamics Model"
            subtitle="Nonlinear Dynamics Model for Experimentation"
            description="Derivation of a nonlinear dynamics model for a folding tricopter."
        />

        <ProjectCard
            href="{base}/projects/subassembly-design"
            imageSrc="{base}/assets/trifecta/helicopter_subassembly.png"
            title="MultiVAC Subassemblies"
            subtitle="Complex Nonlinear Assembly Structure"
            description="A method for creating nonlinear plant models for 6DOF simulations."
        />

        <ProjectCard
            href="{base}/projects/multivac"
            imageSrc="{base}/assets/run_full_plot.png"
            title="MultiVAC"
            subtitle="General Purpose 6DOF Simulation"
            description="Multipurpose simulation environment able to model linear and nonlinear vehicles. Fully scriptable, intended for end-to-end vehicle design."
        />

        <ProjectCard
            href="{base}/projects/DATACOM"
            imageSrc="{base}/assets/masada_test.png"
            title="DATACOM"
            subtitle="Source Agnostic Data Visualization Program"
            description="A collaboration with Charles Comey to develop a general purpose 3D visualization terminal for robotics command and control. Also intended as a user interface for MultiVAC."
        />

        <ProjectCard
            href="{base}/projects/bldc"
            imageSrc="{base}/assets/bldc/motor_pic.png"
            title="Brushless DC Motor Model"
            subtitle="Component Creation for MultiVAC"
            description="A linear state-space model of a brushless DC motor"
        />

        <ProjectCard
            href="{base}/projects/UAVSim"
            imageSrc="{base}/assets/newplot.png"
            title="UAVSim"
            subtitle="Rotorcraft Dynamics Simulation Package"
            description="A Python package intended to reduce testing costs in vehicle development, and to provide a testing environment if one is unavailable."
        />

        <ProjectCard
            href="{base}/projects/blizzard"
            imageSrc="{base}/assets/blizz.png"
            title="Blizzard"
            subtitle="Weather Tolerant Urban Air Mobility Vehicle"
            description="Eight rotor eVTOL aircraft designed to transport passengers around Chicago at cost-competitive rates. Design won the 2020-2021 NASA ARMD University Design Challenge."
        />

        <ProjectCard
            href="{base}/projects/clementine"
            imageSrc="{base}/assets/poster_req_review.png"
            title="Clementine"
            subtitle="Space Systems Engineering"
            description="As part of a team of 5, I was tasked with reverse-engineering the 1993 Clementine lunar flyby probe in order to modify the spacecraft to prevent an ADCS error that caused mission failure."
        />

        <!-- <ProjectCard
            href="{base}/projects/flat-plate-drag"
            imageSrc="{base}/assets/Prob1bResults1.png"
            title="Flat Plate Drag"
            subtitle="CFD & Fluid Flow Analysis"
            description="Two-dimensional analysis of subsonic fluid flow over a flat plate using numerical methods"
        /> -->
    </div>
</section>

<style>
    .project-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-gap: 20px;
    }

    @media (max-width: 1024px) {
        .project-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    @media (max-width: 768px) {
        .project-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 480px) {
        .project-grid {
            grid-template-columns: repeat(1, 1fr);
        }
    }
</style>