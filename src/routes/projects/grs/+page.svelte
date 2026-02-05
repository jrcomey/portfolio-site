<script>
    import { base } from '$app/paths';
    import Header from '../../Header.svelte';
    import ProjectSection from '$lib/ProjectSection.svelte';

    const grs = `${base}/assets/BlockDiagTransparent4.png`;
    const yaw = `${base}/assets/grs/grs_yaw_input.png`;
    const adf = `${base}/assets/grs/grs_roll_response.png`;
</script>

<Header/>

<section>
    <ProjectSection>
        <div slot="description">
            <h1>Gust Reduction System</h1>
            <h3>Weather Tolerant Controls Scheme for High Wind Environments</h3>
            <h4><i>November 2020</i></h4>
            <hr width="100%">
            <p>As part of my undergraduate design project, I worked with my team to develop a system for the Blizzard eVTOL UAM aircraft to withstand both significant gusts and other wind fields common to the Chicago area. I developed a fully fledged Guidance, Navigation, and Control system (GNC), using multiple controllers, to operate the aircraft during flight. I developed optimal controllers using a Linear Quadratic Regulator (LQR) from a linearized model, and demonstrated the controller using my UAV simulation. I have currently performed dozens of tests to verify flight performance under windy conditions.</p>
            <p>The GNC system uses two controllers for flight operations, one primary feedback, and an an auxiliary feed-forward controller for use in gust avoidance.</p>
            <p>The primary controller is an LQR controller, developed using a linearized state space model of the Blizzard vehicle. The controller was developed using MATLAB, and then implemented in the UAVSim simulation program, which you can bread more about here.</p>
            <p>The main vulnerability of the Blizzard aircraft is the relatively slow motor response time. This could be avoided be implementing a variable pitch mechanism, but that would leave the aircraft vulnerable to icing conditions due to increased mechanical complexity. Our team has decided to bypass this by implementing a secondary controller, which preemptively begins aircraft maneuvers at the instant the aircraft is affected by a gust, instead of waiting for the aircraft to tilt before correction. The feedback controller is still under development.</p>
        </div>
        <div slot="image">
            <img loading="lazy" src={grs} alt="Gust Reduction System">
        </div>
    </ProjectSection>

    <ProjectSection imagePosition="left">
        <div slot="image">
            <img loading="lazy" src={yaw} alt="Gust Reduction System Yaw Response">
        </div>
        <div slot="description">
            <h1>Simulated Flight Testing</h1>
            <hr width="100%">
            <p>The flight controller was verified using my UAVSim simulation program. Dozens of tests were performed under several different wind conditions, and dozens more are planned. On the left is an image of an aircraft yaw test, under chaotic wind conditions. As you can see, the aircraft is able to maintain attitude (and position, not shown), and can even execute maneuvers under windy conditions.</p>
        </div>
    </ProjectSection>

    <ProjectSection>
        <div slot="description">
            <h1>ADS-33E-PRF Testing Standards</h1>
            <hr width="100%">
            <p>Performance tests and standards were taken from ADS-33E-PRF, a set of standards for military rotary-wing aircraft, which include a number of tests for maneuvers under windy conditions with clear pass/fail criteria. On the left is a demonstration of a roll impulse response test, one of the tests listed in the standard. The acceptable recovery zone is marked within the black dashed lines. This test shows an older controller under calm winds, and will be repeated under strong winds with the improved controller upon completion of the design.</p>
        </div>
        <div slot="image">
            <img loading="lazy" src={adf} alt="Gust Reduction System Roll Response">
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
