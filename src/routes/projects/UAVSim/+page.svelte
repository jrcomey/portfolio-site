<script>
    import Header from '../../Header.svelte';
    import ProjectSection from '$lib/ProjectSection.svelte';
    import { base } from '$app/paths';

    const pic = `${base}/assets/newplot.png`;
</script>

<Header/>

<section>
    <ProjectSection imagePosition="left">
        <div slot="image">
            <img loading="lazy" src={pic} alt="UAVSim Demo" />
            <p><i>Demonstration of octocopter issued different position commands</i></p>
        </div>
        <div slot="description">
            <h1>UAVSIM</h1>
            <h2><i>June 2020</i></h2>
            <p>I developed a multicopter dynamics package to aid in the development of Unmanned Aerial Vehicles (UAV/UAS). It allows for rapid prototyping of UAVs of any size, shape, or configuration, through easily configured settings, and returns predictions of vehicle dynamics under a variety of conditions.</p>
            <p>I began developing this Python package after I encountered difficulties gaining access to aircraft testing facilities on campus while captain of my aircraft design team. While initially intended to serve as a replacement for flight testing, the scope of the project increased to serve as a rapid prototyping environment for Unmanned Aerial Vehicles (UAVs).</p>
            <p>The package itself is easy to use, and well-optimized. Any arbitrary multicopter UAV, of any number of motors, configuration, layout, or orientation, can be simulated. The user need only define directional effects of each motor on the local body of the aircraft.</p>
            <p>The simulation uses a custom 6 degree of freedom (DOF) state space physics and control model. At each time step, the current attitude and position are fed into the simulated flight controller, along with a waypoint position. The difference between the two states is rotated into local body coordinates, and the flight computer determines raw signal output to the motor signals.</p>
            <p>Each motor can be customized, with unique time response parameters and thrust curves. Using this data, local body forces on the aircraft are calculated, and the new state vector is used to update the position and attitude of the aircraft in the physics model.</p>
            <p>The end result is a highly optimized flight simulator, which enables the user to rapidly test UAV multicopter aircraft, or optimize onboard controls, reducing cost and improving designs.</p>
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
