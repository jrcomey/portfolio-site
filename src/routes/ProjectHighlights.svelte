<script>
    import { base } from '$app/paths';
    const blizz_render_path = `${base}/assets/blizz.png`;
    const blizz_path_2 = `${base}/assets/IsoTransparentWebsite.png`;
    const GRS = `${base}/assets/BlockDiagStylized.svg`;

    const multivac = `${base}/assets/run_full_plot.png`;
    const datacom = `${base}/assets/masada_test.png`;
    const GRS2 = `${base}/assets/BlockDiagTransparent4.png`;
</script>

<section class="centered gallery">
    <h1 class='dark'>Project Highlights</h1>

    <div class="big-project-title-page-alt">

        
        <div class="big-project-description">
            <div>
                <h1>MultiVAC</h1>
                <h3>High Fidelity General Purpose 6DOF Simulation</h3>
                <hr width="100%">
            </div>
            <br>
            <div>
                <p>
                    Named after Isaac Asimov's recurring supercomputer, MultiVAC is a general purpose 6DOF simulation that I wrote to serve as a proving ground for new GNC methods.
                    MultiVAC is intended as a development tool to aid in any real world applications - from industrial robotics to air and space GNC. 
                </p>
                <p>
                    MultiVAC is fast and flexible - its scripting interface allows for quick iterations to your design while retaining calculation speed.
                </p>
            </div>
            
            <p>
                To read more about it, <a href="projects/multivac">click here</a>.
            </p>
        </div>
        <div class="project-image-backdrop-black">
            <img src={multivac} class="big-project-image-title-page" alt="MultiVac">
        </div>
    </div>

    <div class="big-project-title-page-alt">

        
        <div class="big-project-description">
            <div>
                <h1>DATACOM</h1>
                <h3>Source-Agnostic Data Visualization Program</h3>
                <hr width="100%">
            </div>
            <br>
            <div>
                <p>
                    I wrote a general-purpose 3D visualization engine using OpenGL and Rust to serve as a visual terminal interface for a multitude of projects I have been developing. 
                    DATACOM is a source-agnostic program (meaning it can take data from any source, provided correct formatting) and can recieve and display multiple incoming datastreams.
                </p>
                <p>
                    Originally intended to serve as a command-and-control interface for UAV swarm behavior, DATACOM has evolved into a more general-purpose interface.
                </p>
            </div>
            
            <!-- <p>
                To read more about it, <a href="projects/DATACOM">click here</a>.
            </p> -->
        </div>
        <div class="project-image-backdrop-black">
            <img src={datacom} class="big-project-image-title-page" alt="DATACOM">
        </div>
    </div>
    
    <div class="big-project-title-page-alt">

        
        <div class="big-project-description">
            <div>
                <h1>GRS</h1>
                <h3>Weather Tolerant Controls Scheme for High Wind Environments</h3>
                <hr width="100%">
            </div>
            <br>
            <div>
                <p>
                    As part of my undergraduate design project, I worked with my team to develop a system for the Blizzard eVTOL UAM aircraft to withstand both significant gusts and other wind fields common to the Chicago area. I developed a fully fledged Guidance, Navigation, and Control system (GNC), using multiple controllers, to operate the aircraft during flight. I developed optimal controllers using a Linear Quadratic Regulator (LQR) from a linearized model, and demonstrated the controller using my UAV simulation. I performed dozens of simulation tests to verify flight performance under windy conditions.
                </p>
                <!-- <p>
                    To read more about it, <a href="projects/grs">click here</a>.
                </p> -->
            </div>
            
            
        </div>
        <div class="project-image-backdrop-white">
            <img src={GRS2} class="big-project-image-title-page" alt="MULTIROTOR GUST REDUCTION SYSTEM">
        </div>
    </div>

    <div class="big-project-title-page-alt">
        
        
        <div class="big-project-description">
            <div>
                <h1>Blizzard</h1>
                <h3>Weather Tolerant Urban Air Mobility Concept</h3>
                <hr width="100%">
            </div>
            <br>
            <p>
                As part of a team of 5, my team and I developed a weather tolerant, hydrogen powered Urban Air Mobility (UAM) vehicle, designed for operation in Chicago's cold-weather environment. I developed a fully functional Guidance, Navigation, and Control (GNC) system to enable autonomous flight for the aircraft. I also developed significant parts of the propulsion train for the aircraft, developing propellers using Blade Element Momentum (BEM) theory. I also created a flight model for the aircraft and proved the viability of the control method using a Monte Carlo simulation.
            </p>
            <!-- <p>
                To read more about it, <a href="projects/blizzard">click here</a>.
            </p> -->
        </div>

        <div class="project-image-backdrop-white">
            <img src={blizz_render_path} class="big-project-image-title-page" alt="ATP-XW BLIZZARD: WEATHER TOLERANT URBAN AIR MOBILITY CONCEPT">
        </div>
    </div>


</section>

<style>

    .big-project-description h1 {
        line-height: 0.0;
    }
    
    .big-project-title-page {
        display: grid;
        grid-template-columns: 1fr 2fr;
        /* background-color: #22272b; */
        background-color: #0f1112CC;
        border-radius: 25px;
        margin-top: 1%;
        margin-bottom: 1%;
        padding: 5% 5%;
        align-items: center;
    }

    .big-project-title-page-alt {
        display: grid;
        grid-template-columns: 2fr 1fr;
        /* background-color: #22272b; */
        background-color: #0f1112E6;
        border-radius: 25px;
        margin-top: 1%;
        margin-bottom: 1%;
        padding: 5% 5%;
        align-items: center;
    }

    .big-project-image-title-page {
        flex: 1;
        width: 100%;
        aspect-ratio: 16/9;
        object-fit: scale-down;
    }

    .big-project-description {
        display: flex;
        flex-direction: column;
        padding: 0% 10%; /* Adjust the padding as needed */
        align-content: flex-start;
    }

    @media (max-width: 60em){
        .big-project-title-page {
            display: flex;
            flex-direction: column;
        }
        .big-project-title-page-alt{
            display: flex;
            flex-direction: column-reverse;
        }
    }

    .big-project-description h3 {
        font-style: italic;
        /* font-variant: small-caps; */
    }

    .project-image-backdrop-white {
        /* background-color: #FFFFFFCC; */
        /* background-color: #000000FF; */
        background-color: #f5f5f500;
        display: flex;
        padding: 0%;
        border-radius: 5%;
        height: 100%;
        width: 100%;
    }

    .project-image-backdrop-black {
        /* background-color: #FFFFFFCC; */
        /* background-color: #000000FF; */
        background-color: #0f111200;
        display: flex;
        padding: 0%;
        border-radius: 5%;
        height: 100%;
        width: 100%;
    }

    .gallery {
        background-image: url("/assets/photography/cooks_bay_2.JPG");
        align-content: center;
        background-size: cover;
        position: relative;
    }

    .dark {
        color: #0f1112FF;
    }

    
</style>