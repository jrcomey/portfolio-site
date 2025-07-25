<title>MultiVAC</title>


<script>
    /** @type {import('./$types').PageData} */
    export let data;
    import Header from '../../Header.svelte';

    const blizz_render_path = `${base}/assets/basic-sixdof-process.png`;
    const pos_plot = `${base}/assets/Blizzard_0_pos_plot.png`;
    const script_diagram = `${base}/assets/script-creation-diagram.png`;
    const threeDplot = `${base}/assets/tracking_plot_anim.gif`;

    import * as THREE from 'three';
    import { onMount, onDestroy } from 'svelte';
    import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
    import { base } from '$app/paths';

    let gifIndex = 1;
    let totalGifs = 3; // Total number of GIFs

    let container;
    let scene, camera, renderer, animationFrameId;
    onMount(() => {
    // Initialize scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    
    // Set size and append to container
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.up.set(0,0,1);
    camera.position.setZ(5);
    camera.position.setX(-7);
    camera.position.setY(0);
    const camera_target_pos = new THREE.Vector3(-1.5, 0.0, 0.0);
    camera.lookAt(camera_target_pos);

    renderer.render(scene, camera);

    // const loader = OBJLoader();
    // loader.load("assets/blizzard.obj");

    const blue = 0x3333FF;
    const red = 0xFF3333;
    const green = 0x4AF626   ;
    const black = 0x000000;
    // Create two materials for the solid wireframe effect
    const bodyMaterials = {
        solid: new THREE.MeshBasicMaterial({
            color: black,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1
        }),
        wireframe: new THREE.MeshBasicMaterial({
            color: green,
            wireframe: true,
            wireframeLinewidth: 1
        })
    };

    // Store propeller references for animation
    const propellers = [];

    // Define different propeller configurations
    const propellerConfigs = [
        {   // BRT
            position: { x: 4.220, y: 2.982, z: 1.041+0.15 },
            color: blue,    // Green
            clockwise: true
        },
        {   // BRB
            position: { x: 4.220, y: 2.982, z: 1.041-0.15 },
            color: red,    // Red
            clockwise: false
        },
        {   //BLT
            position: { x: 4.220, y: -2.982, z: 1.041+0.15 },
            color: blue,    // Green
            clockwise: true
        },
        {   //BLB
            position: { x: 4.220, y: -2.982, z: 1.041-0.15 },
            color: red,    // Red
            clockwise: false
        },
        {   //FRT
            position: { x: -0.720, y: 2.982, z: 1.041+0.15 },
            color: blue,    // Red
            clockwise: true
        },
        {   // FRB
            position: { x: -0.720, y: 2.982, z: 1.041-0.15 },
            color: red,    // Red
            clockwise: false
        },
        {   //FLT
            position: { x: -0.720, y: -2.982, z: 1.041+0.15 },
            color: red,    // Red
            clockwise: false
        },
        {   // FLB
            position: { x: -0.720, y: -2.982, z: 1.041-0.15 },
            color: blue,    // Red
            clockwise: true
        },
    ];

    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);



    // Function to create materials for a specific color
    function createPropellerMaterials(color) {
        return {
            solid: new THREE.MeshBasicMaterial({
                color: black,
                polygonOffset: true,
                polygonOffsetFactor: 1,
                polygonOffsetUnits: 1
            }),
            wireframe: new THREE.MeshBasicMaterial({
                color: color,
                wireframe: true,
                wireframeLinewidth: 1
            })
        };
    }

    // Function to create a solid wireframe mesh from a geometry
    function createSolidWireframeMesh(geometry, materials, scale = 1.0001) {
        const group = new THREE.Group();
        
        // Create the solid mesh
        const solidMesh = new THREE.Mesh(geometry, materials.solid);
        group.add(solidMesh);
        
        // Create a slightly larger wireframe mesh
        const wireframeGeometry = geometry.clone();
        wireframeGeometry.scale(scale, scale, scale);
        const wireframeMesh = new THREE.Mesh(wireframeGeometry, materials.wireframe);
        group.add(wireframeMesh);
        
        return group;
    }

    let propellerGeometry = null;
    const loader = new OBJLoader();

    function createPropellerGroup(config, scale) {
        const propellerGroup = new THREE.Group();
        
        // Create materials for this specific propeller
        const materials = createPropellerMaterials(config.color);
        
        // Clone the loaded propeller geometry and create solid wireframe
        propellerGeometry.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const solidWireframeProp = createSolidWireframeMesh(
                    child.geometry, 
                    materials
                );
                propellerGroup.add(solidWireframeProp);
            }
        });
        
        propellerGroup.position.set(
            config.position.x * scale, 
            config.position.y * scale, 
            config.position.z * scale
        );
        
        // Store the rotation direction with the group
        propellerGroup.userData.clockwise = config.clockwise;
        
        return propellerGroup;
    }


    // Modified loading sequence
    loader.load(
        `${base}/assets/prop.obj`,
        function(propObj) {
            propellerGeometry = propObj;
            
            loader.load(
                `${base}/assets/blizzard.obj`,
                function(aircraftBody) {
                    const aircraftGroup = new THREE.Group();
                    
                    aircraftBody.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            const solidWireframeMesh = createSolidWireframeMesh(
                                child.geometry, 
                                bodyMaterials
                            );
                            aircraftGroup.add(solidWireframeMesh);
                        }
                    });
                    
                    // Center and scale the aircraft
                    const box = new THREE.Box3().setFromObject(aircraftGroup);
                    const center = box.getCenter(new THREE.Vector3());
                    aircraftGroup.position.sub(center);
                    
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 1;
                    aircraftGroup.scale.multiplyScalar(scale);

                    // Add propellers with their specific configurations
                    propellerConfigs.forEach(config => {
                        const propGroup = createPropellerGroup(config, scale);
                        aircraftGroup.add(propGroup);
                        propellers.push(propGroup);
                    });

                    scene.add(aircraftGroup);
                },
                function(xhr) {
                    console.log('Aircraft loading:', (xhr.loaded / xhr.total * 100) + '% loaded');
                },
                function(error) {
                    console.log('An error happened loading aircraft:', error);
                }
            );
        },
        function(xhr) {
            console.log('Propeller loading:', (xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(error) {
            console.log('An error happened loading propeller:', error);
        }
    );

    let propellerSpeed = 0.8;  // Adjust for faster/slower rotation

    function animate() {
        requestAnimationFrame( animate);
        // Rotate aircraft (if desired)
        // scene.children.forEach(child => {
        //     if (child instanceof THREE.Group) {
        //         child.rotation.y += 0.005;
        //     }
        // });
        
        // // Rotate propellers
        // Rotate propellers according to their direction
        propellers.forEach(propGroup => {
            const direction = propGroup.userData.clockwise ? 1 : -1;
            propGroup.rotation.z += propellerSpeed * direction;
        });
        renderer.render( scene, camera);
    }

    animate()

  });

  onDestroy(() => {
    // Clean up Three.js resources
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    if (renderer) {
      renderer.dispose();
    }
    if (scene) {
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
  });


</script>

<Header/>

<section class="title-page">
    <div class="gradient-background"></div>
    <div bind:this={container} class="scene-container"></div>
    <h1>MULTIVAC</h1>
</section>

<section class="high-level-description centered">

    <!-- <h1 class='centered'>DROP SIMULINK FOR THIS</h1> -->

    <div class="shaded-background">
        <div class="description">
            <h1>Tired of Simulink?</h1>
             <p>
                Named after Isaac Asimov's recurring supercomputer, MultiVAC is a <b>general purpose 6DOF simulation</b> that I wrote to serve as a proving ground for new GNC methods.
                MultiVAC is intended as a development tool to aid in any real world applications - from industrial robotics to air and space GNC. 
            </p>
            <!-- <br> -->
            <p>
                MultiVAC is <b>fast and flexible</b> - its scripting interface allows for quick iterations to your design while retaining calculation speed.
            </p>
        </div>
        <div class="image-reel">
            <img src={blizz_render_path} alt="ATP-XW Blizzard Render" />
            <!-- <h3>The Basic Process</h3>  -->
            <!-- <p><i></i></p> -->
        </div>
    </div>

    <div class="shaded-background-alt">
        <div class="image-reel">
            <img src={threeDplot} alt="ATP-XW Blizzard Render" />
            <!-- <h3>An example scenario setup structure using <i>Blizzard</i></h3>  -->
            <!-- <p><i></i></p> -->
        </div>
        <div class="description">
            <h1>Instant Prototypes</h1>
            <!-- <p>
                MultiVAC, at its core, is a powerful physics simulation exposed through a simple scripting interface. In as little as a few dozen lines of RHAI, a user can set up accurate vehicle-level tests of an eight-rotor eVTOL aircraft in a variety of conditions. 
            </p> -->
            <p>
                MultiVAC's user interface is built on a simple RHAI layer. Each scenario is composed of a few configurable environment types (such as basic gravity), along with simulated physics objects. 
            </p>
            <p>Each object is defined in its own RHAI script, through a combination of state-space matricies (which define equations of motion) and controllable components (which affect the objects position).</p>
            <p>Objects can be supplemented with any combination of controller, sensor processing scripts, and custom guidance scripts to define behavior. Need to make a change to your guidance loop? No worries - MultiVAC doesn't even need to recompile, allowing you to focus your time on what matters most.</p>
        </div>
        
    </div>  

    <!-- <div class="shaded-background">
        <div class="description">
            <h1>Non-Linear Simulation</h1>
            <p>MultiVAC is a <b>non-linear</b> simulation. No shortcuts, no half-measures.</p>
            <p>It achieves t</p>
        </div>
         <div class="image-reel">
            <img src={blizz_render_path} alt="ATP-XW Blizzard Render" />
            <h3><i>The Basic Process</i></h3> 
            <p><i></i></p>
        </div>
    </div>   -->

    

    <!-- <div class="shaded-background">
        <div class="description">
            <h1>See it live</h1>
        </div>
        <div class="image-reel">
            <img src={blizz_render_path} alt="ATP-XW Blizzard Render" />
            <h3><i>The Basic Process</i></h3> 
            <p><i></i></p>
        </div>
    </div>   -->

    <div class="shaded-background">
        <div class="description">
            <h1>Zero-Click Insights</h1>
            <p>
                MuliVAC <b>automatically</b> generates a full teardown at the end of each run. Plots are generated of each vehicle's position, velocity, and rotation, along with a plot of the full scenario. A full LaTeX report is also generated for easy reading.
            </p>
            <p>The full data for each run is saved to a single HDF5 file, allowing you to generate your own plots as well.</p>
        </div>
        <div class="image-reel">
            <img src={pos_plot} alt="ATP-XW Blizzard Render" />
            <!-- <h3><i>The Basic Process</i></h3>  -->
            <!-- <p><i></i></p> -->
        </div>
        
        
    </div>  

</section>





<style>

    section {
        background-size: cover;
        position: relative;
        z-index: -10;
        min-height: 90vh;
        /* align-content: center; */
        display: flex;
        /* background-image: url("/assets/photography/cooks_bay.JPG"); */
        background-color: #000000FF;
        flex-direction: column;
    }

    .centered {
        align-content: center;
    }

    .title-page {
        align-content: left;
        background-image: url("/src/assets/blizz.png");
        background-size: cover;
        justify-content: end;
        margin-bottom: 0%;
        margin: 0%;
        overflow: hidden;
        /* padding: 0%; */
        /* border: 0%; */
    }
    .gradient-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to top, rgba(15, 17, 18, 0.9), rgba(15, 17, 18, 0.9), 80%, rgba(15, 17, 18, 0));
        z-index: -1;
    }
    .scene-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
    }


    .shaded-background {
        background-color: #0f1112CC;
        /* display: flex; */
        /* flex-direction: row; */
        /* padding: 5%; */
        border-radius: 2%;
        display: grid;
        /* grid-row: 1; */
        grid-template-columns: 4fr 3fr;
        /* padding: 5% 0%;
        border: 5% 0%; */
        margin: 5% 0%;
        align-content: left;
    }

    b {
        color: #00FFFF;
    }

    .shaded-background-alt {
        background-color: #0f1112CC;
        /* display: flex; */
        /* flex-direction: row; */
        /* padding: 5%; */
        border-radius: 2%;
        display: grid;
        /* grid-row: 1; */
        grid-template-columns: 3fr 4fr;
        /* padding: 5% 0%; */
        /* border: 5% 0%; */
        margin: 5% 0%;
        align-content: left;
    }
    .image-reel {
        /* border: 5%; */
        margin: 5%;
        align-content: center;
    }

    .description {
        margin: 5%;
        display: flex;
        flex-direction: column;
    }

    .image-reel img {
            width: 100%;
            object-fit: contain;
            aspect-ratio: 1;
            border-radius: 5%;
            /* padding: 5%; */
        }

    @media (max-width: 60em){
        .shaded-background {
            display: flex;
            flex-direction: column-reverse;
        }
        .shaded-background-alt{
            display: flex;
            flex-direction: column;
        }
    }

</style>