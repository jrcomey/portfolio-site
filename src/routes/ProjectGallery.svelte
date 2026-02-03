<script>
    let black = "#0f1112";
    let bluegrey = "#181c1f";
    let darkgrey = "#22272b";
    let white = "#FFFFFF";

    import { base } from '$app/paths';


</script>

<section id="misc-projects" class = "dark centered">
    <h1>Project Gallery</h1>
    
    
    <div class="project-grid">

        <div class="project">
            <a href="{base}/projects/tricopter-dynamics"><img loading="lazy" src="{base}/assets/trifecta/render_screenshot.png" alt="MultiVAC Demo"></a>
            <a href="{base}/projects/tricopter-dynamics"><h2>Tricopter Dynamics Model</h2></a>
            <a href="{base}/projects/tricopter-dynamics"><h3>Nonlinear Dynamics Model for Experimentation</h3></a>
            <a href="{base}/projects/tricopter-dynamics"><p>Derivation of a nonlinear dynamics model for a folding tricopter. </p></a>
        </div>

        <div class="project">
            <a href="{base}/projects/multivac"><img loading="lazy" src="{base}/assets/run_full_plot.png" alt="MultiVAC Demo"></a>
            <a href="{base}/projects/multivac"><h2>MultiVAC</h2></a>
            <a href="{base}/projects/multivac"><h3>General Purpose 6DOF Simulation</h3></a>
            <a href="{base}/projects/multivac"><p>Multipurpose simulation environment able to model linear and nonlinear vehicles. Fully scriptable, intended for end-to-end vehicle design.</p></a>
        </div>

        <div class="project">
            <a href="{base}/projects/DATACOM"><img loading="lazy" src="{base}/assets/masada_test.png" alt="MultiVAC Demo"></a>
            <a href="{base}/projects/DATACOM"><h2>DATACOM</h2></a>
            <a href="{base}/projects/DATACOM"><h3>Source Agnostic Data Visualization Program</h3></a>
            <a href="{base}/projects/DATACOM"><p>A collaboration with Charles Comey to develop a general purpose 3D visualization terminal for robotics command and control. Also intended as a user interface for MultiVAC.</p></a>
        </div>

        <div class="project">
            <a href="{base}/projects/bldc"><img loading="lazy" src="{base}/assets/bldc/motor_pic.png" alt="Brushless Motor Model"></a>
            <a href="{base}/projects/bldc"><h2>Brushless DC Motor Model</h2></a>
            <a href="{base}/projects/bldc"><h3>Component Creation for MultiVAC</h3></a>
            <a href="{base}/projects/bldc"><p>A linear state-space model of a brushless DC motor</p></a>
        </div>
<!-- 
        <div class="project">
            <a href="{base}/projects/tricopter-dynamics"><img loading="lazy" src="{base}/assets/trifecta/render_screenshot.png" alt="MultiVAC Demo"></a>
            <a href="{base}/projects/tricopter-dynamics"><h2>MultiVAC Scripting Engine</h2></a>
            <a href="{base}/projects/tricopter-dynamics"><h3>RHAI Scripting Engine for Scenario Setup</h3></a>
            <a href="{base}/projects/tricopter-dynamics"><p>Simple scripting language to setup simulation runs for both batch modes</p></a>
        </div> -->

        <div class="project">
            <a href="{base}/projects/UAVSim"><img loading="lazy" src="{base}/assets/newplot.png" alt="UAVSim Plot"></a>
            <a href="{base}/projects/UAVSim"><h2>UAVSim</h2></a>
            <a href="{base}/projects/UAVSim"><h3>Rotorcraft Dynamics Simulation Package</h3></a>
            <a href="{base}/projects/UAVSim"><p>A Pythjon package intended to reduce testing costs in vehicle development, and to provide a testing environment if one is unavailable.</p></a>
        </div>

        <div class="project">
            <a href="{base}/projects/blizzard"><img loading="lazy" src="{base}/assets/blizz.png" alt="MultiVAC Demo"></a>
            <a href="{base}/projects/blizzard"><h2>Blizzard</h2></a>
            <a href="{base}/projects/blizzard"><h3>Weather Tolerant Urban Air Mobility Vehicle</h3></a>
            <a href="{base}/projects/blizzard"><p>Eight rotor eVTOL aircraft designed to transport passengers around Chicago at cost-competitive rates. Design won the 2020-2021 NASA ARMD University Design Challenge. </p></a>
        </div>

        <div class="project">
            <a href="{base}/projects/clementine"><img loading="lazy" src="{base}/assets/poster_req_review.png" alt="Clementine"></a>
            <a href="{base}/projects/clementine"><h2>Clementine</h2></a>
            <a href="{base}/projects/clementine"><h3>Space Systems Engineering</h3></a>
            <a href="{base}/projects/clementine"><p>As part of a team of 5, I was tasked with reverse-engineering the 1993 Clementine lunar flyby probe in order to modify the spacecraft to prevent an ADCS error that caused mission failure.</p></a>    
        </div>


        <!-- <div class="project">
            <a href="{base}/projects/aerobrick"><img loading="lazy" src="{base}/assets/mozziepic.png" alt="Aerobrick"></a>
            <a href="{base}/projects/aerobrick"><h2>Aerobrick</h2></a>
            <a href="{base}/projects/aerobrick"><h3>Fixed-wing Aircraft Design</h3></a>
            <a href="{base}/projects/aerobrick"><p>I was Team Captain of a heavy-lift aircraft design team that competed in SAE Aero Design West's Regular division. </p></a>
        </div> -->


        <!-- <div class="project">
            <a href="{base}/projects/launchsim"><img loading="lazy" src="{base}/assets/Undeformed.png" alt="Deformed Satellite"></a>
            <a href="{base}/projects/launchsim"><h2>Launch Simulation</h2></a>
            <a href="{base}/projects/launchsim"><h3>Satellite Inertial Loading and Thermal Analysis</h3></a>
            <a href="{base}/projects/launchsim"><p>Analysis of satellite superstructure experiencing inertial loading during launch, and thermal loading during operation</p></a>
        </div> -->

        <!-- <div class="project">
            <a href="https://sites.google.com/view/jackcomey/home/project-gallery/satellte-inertial-loading-and-thermal-analysis?authuser=0"><img loading="lazy" src="{base}/assets/Undeformed.png" alt="Deformed Satellite"></a>
            <a href="https://sites.google.com/view/jackcomey/home/project-gallery/satellte-inertial-loading-and-thermal-analysis?authuser=0"><h2>Launch Simulation</h2></a>
            <a href="https://sites.google.com/view/jackcomey/home/project-gallery/satellte-inertial-loading-and-thermal-analysis?authuser=0"><h3>Satellite Inertial Loading and Thermal Analysis</h3></a>
            <a href="https://sites.google.com/view/jackcomey/home/project-gallery/satellte-inertial-loading-and-thermal-analysis?authuser=0"><p>Analysis of satellite superstructure experiencing inertial loading during launch, and thermal loading during operation</p></a>
        </div> -->


        <div class="project">
            <a href="{base}/projects/flat-plate-drag"><img loading="lazy" src="{base}/assets/Prob1bResults1.png" alt="Reynolds Flow Pic"></a>
            <a href="{base}/projects/flat-plate-drag"><h2>Flat Plate Drag</h2></a>
            <a href="{base}/projects/flat-plate-drag"><h3>CFD & Fluid Flow Analysis</h3></a>
            <a href="{base}/projects/flat-plate-drag"><p>Two-dimensional analysis of subsonic fluid flow over a flat plate using numerical methods</p></a>
        </div>


        <!-- <div class="project">
            <a href="https://sites.google.com/view/jackcomey/home/project-gallery/satellte-inertial-loading-and-thermal-analysis?authuser=0"><img loading="lazy" src="{base}/assets/Prob1b.png" alt=""></a>
            <a href="https://sites.google.com/view/jackcomey/home/project-gallery/satellte-inertial-loading-and-thermal-analysis?authuser=0"><h2>Wave Propagation Analysis</h2></a>
            <a href="https://sites.google.com/view/jackcomey/home/project-gallery/satellte-inertial-loading-and-thermal-analysis?authuser=0"><h3>2D Discrete Differential Equation Solutions</h3></a>
            <a href="https://sites.google.com/view/jackcomey/home/project-gallery/satellte-inertial-loading-and-thermal-analysis?authuser=0"><p>A three-dimensional study of wave propagation and subsonic/supersonic airflow</p></a>
        </div> -->

        <!-- <div class="project">
            <a href="{base}/projects/waveprop"><img loading="lazy" src="{base}/assets/Prob1b.png" alt=""></a>
            <a href="{base}/projects/waveprop"><h2>Wave Propagation Analysis</h2></a>
            <a href="{base}/projects/waveprop"><h3>2D Discrete Differential Equation Solutions</h3></a>
            <a href="{base}/projects/waveprop"><p>A three-dimensional study of wave propagation and subsonic/supersonic airflow</p></a>
        </div> -->


        <!-- <div class="project">
            <a href="{base}/projects/basins"><img loading="lazy" src="{base}/assets/basinsofattraction.png" alt="Project 4"></a>
            <a href="{base}/projects/basins"><h2>Basins of Attraction</h2></a>
            <a href="{base}/projects/basins"><h3>Iterative Convergence Study</h3></a>
            <a href="{base}/projects/basins"><p>Fractal convergence study for system using imaginary numbers</p></a>
        </div> -->

        <!-- <div class="project">
            <a href="{base}/projects/supersonic"><img loading="lazy" src="{base}/assets/Prob2bResults.png" alt="Project 3"></a>
            <a href="{base}/projects/supersonic"><h3>Supersonic Flow</h3></a>
            <a href="{base}/projects/supersonic"><p>Two-dimensional analysis of supersonic flow over a symmetric biconvex airfoil</p></a>
        </div> -->

    </div>

    <!-- <div id="image-track" data-mouse-down-at="0">
        <img class="image" src="{base}/assets/windy_hill_forest_1.jpg" alt="Project 3">
        <img class="image" src="{base}/assets/windy_hill_forest_1.jpg" alt="Project 3">
        <img class="image" src="{base}/assets/windy_hill_forest_1.jpg" alt="Project 3">
        <img class="image" src="{base}/assets/windy_hill_forest_1.jpg" alt="Project 3">
        <img class="image" src="{base}/assets/windy_hill_forest_1.jpg" alt="Project 3">
        <img class="image" src="{base}/assets/windy_hill_forest_1.jpg" alt="Project 3">
        <img class="image" src="{base}/assets/windy_hill_forest_1.jpg" alt="Project 3">
    </div> -->


        
</section>

<style>
    
.project-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Adjust the number of columns as needed */
  grid-gap: 20px;
}
/* 
@media (max-width: 1240px){
    .project-grid {
        grid-template-columns: repeat(4, 1fr);
    }
} */

@media (max-width: 1024px){
    .project-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 768px){
    .project-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}


@media (max-width: 480px){
    .project-grid {
        grid-template-columns: repeat(1, 1fr);
    }
}

.project:hover {
    scale: 1.02;
}

.project:hover img {
    opacity: 100%;
}

.project {
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    text-align: center;
    /* margin-bottom: 30px; */
    background-color: #22272b;
    /* border-radius: 25px; */
}

.project img {
  aspect-ratio: 1 / 1;
  /* border-radius: 5px; */
  width: 100%;
  opacity: 80%;
  object-fit: cover;
  /* height: 50%; */
}

.project a {
    color: #FFFFFF;
    text-decoration: none;
}

.project a:hover {
    /* text-decoration: underline; */
}

.project p {
  padding: 5%;
}

.project h3 {
    /* font-family: 'Helvetica', sans-serif; */
    font-style: italic;
}

/* section {
    background-color: #0f1112;
} */

</style>