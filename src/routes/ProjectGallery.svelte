<script>
    let black = "#0f1112";
    let bluegrey = "#181c1f";
    let darkgrey = "#22272b";
    let white = "#FFFFFF";


</script>

<section id="misc-projects" class = "dark centered">
    <h1>Project Gallery</h1>
    
    
    <div class="project-grid">


        <div class="project">
                <a href="/projects/UAVsim"><img src="./src/assets/newplot.png" alt="Project 3"></a>
                <h2>UAVSim</h2>
                <h3>Rotorcraft Dynamics Simulation Package</h3>
                <p>A package intended to reduce testing costs in vehicle development, and to provide a testing environment if one is unavailable.</p>            
        </div>

        <div class="project">
            <img src="./src/assets/poster_req_review.png" alt="Project 3">
            <h2>Clementine</h2>
            <h3>Space Systems Engineering</h3>
            <p>
                As part of a team of 5, I was tasked with reverse-engineering the 1993 Clementine lunar flyby probe in order to modify the spacecraft to prevent an ADCS error that caused mission failure.
            </p>    
        </div>


        <div class="project">
            <img src="./src/assets/mozziepic.png" alt="Project 3">
            <h2>Aerobrick</h2>
            <h3>Fixed-wing Aircraft Design</h3>
            <p>
                I was Team Captain of a heavy-lift aircraft design team that competed in SAE Aero Design West's Regular division. 
            </p>    
        </div>


        <div class="project">
            <img src="./src/assets/Undeformed.png" alt="Project 3">
            <h2>Launch Simulation</h2>
            <h3>Satellite Inertial Loading and Thermal Analysis</h3>
            <p>Analysis of satellite superstructure experiencing inertial loading during launch, and thermal loading during operation</p>
        </div>


        <div class="project">
            <img src="./src/assets/Prob1bResults1.png" alt="Project 4">
            <h2>Flat Plate Drag</h2>
            <h3>CFD | Fluid Flow Analysis</h3>
            <p>Two-dimensional analysis of subsonic fluid flow over a flat plate using numerical methods</p>
        </div>


        <div class="project">
            <img src="./src/assets/Prob1b.png" alt="Project 3">
            <h3>Wave Propagation Analysis</h3>
            <p>A three-dimensional study of wave propagation and subsonic/supersonic airflow</p>
        </div>


        <div class="project">
            <img src="./src/assets/basinsofattraction.png" alt="Project 4">
            <h3>Basins of Attraction</h3>
            <p>Convergence study for system using imaginary numbers</p>
        </div>



        <div class="project">
            <img src="./src/assets/Prob2bResults.png" alt="Project 3">
            <h3>Supersonic Flow</h3>
            <p>Two-dimensional analysis of supersonic flow over a symmetric biconvex airfoil</p>
        </div>

    </div>

    <!-- <div id="image-track" data-mouse-down-at="0">
        <img class="image" src="./src/assets/windy_hill_forest_1.jpg" alt="Project 3">
        <img class="image" src="./src/assets/windy_hill_forest_1.jpg" alt="Project 3">
        <img class="image" src="./src/assets/windy_hill_forest_1.jpg" alt="Project 3">
        <img class="image" src="./src/assets/windy_hill_forest_1.jpg" alt="Project 3">
        <img class="image" src="./src/assets/windy_hill_forest_1.jpg" alt="Project 3">
        <img class="image" src="./src/assets/windy_hill_forest_1.jpg" alt="Project 3">
        <img class="image" src="./src/assets/windy_hill_forest_1.jpg" alt="Project 3">
    </div> -->


        
</section>

<style>
    
.project-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Adjust the number of columns as needed */
  grid-gap: 20px;
}

.project {
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    text-align: center;
    margin-bottom: 30px;
    background-color: #22272b;
    border-radius: 1%;
}

.project img {
  aspect-ratio: 1 / 1;
  border-radius: 5px;
  width: 100%;
  object-fit: cover;
  /* height: 50%; */
}

.project p {
  padding: 5%;
}

.project h3 {
    /* font-family: 'Helvetica', sans-serif; */
    font-style: italic;
}

section {
    background-color: #0f1112;
}

</style>