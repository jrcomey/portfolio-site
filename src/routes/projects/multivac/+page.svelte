<title>MultiVAC</title>

<script>
    import Header from '../../Header.svelte';
    import ProjectSection from '$lib/ProjectSection.svelte';

    import * as THREE from 'three';
    import { onMount, onDestroy } from 'svelte';
    import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
    import { base } from '$app/paths';
    import {
        colors,
        createBasicScene,
        createBasicMaterials,
        createSolidWireframeMesh,
        disposeScene
    } from '$lib/three-utils.js';
    const blizz_render_path = `${base}/assets/basic-sixdof-process.png`;
    const pos_plot = `${base}/assets/Blizzard_0_pos_plot.png`;
    const threeDplot = `${base}/assets/tracking_plot_anim.gif`;

    let container;
    let scene, camera, renderer, animationFrameId;

    onMount(() => {
        // Initialize scene using utility
        const sceneSetup = createBasicScene(container, {
            fov: 40,
            cameraPosition: new THREE.Vector3(-7, 0, 5),
            cameraTarget: new THREE.Vector3(-1.5, 0, 0)
        });
        scene = sceneSetup.scene;
        camera = sceneSetup.camera;
        renderer = sceneSetup.renderer;

        const bodyMaterials = createBasicMaterials(colors.green);

        // Store propeller references for animation
        const propellers = [];

        // Define different propeller configurations
        const propellerConfigs = [
            { position: { x: 4.220, y: 2.982, z: 1.041+0.15 }, color: colors.blue, clockwise: true },
            { position: { x: 4.220, y: 2.982, z: 1.041-0.15 }, color: colors.red, clockwise: false },
            { position: { x: 4.220, y: -2.982, z: 1.041+0.15 }, color: colors.blue, clockwise: true },
            { position: { x: 4.220, y: -2.982, z: 1.041-0.15 }, color: colors.red, clockwise: false },
            { position: { x: -0.720, y: 2.982, z: 1.041+0.15 }, color: colors.blue, clockwise: true },
            { position: { x: -0.720, y: 2.982, z: 1.041-0.15 }, color: colors.red, clockwise: false },
            { position: { x: -0.720, y: -2.982, z: 1.041+0.15 }, color: colors.red, clockwise: false },
            { position: { x: -0.720, y: -2.982, z: 1.041-0.15 }, color: colors.blue, clockwise: true },
        ];

        let propellerGeometry = null;
        const loader = new OBJLoader();

        function createPropellerGroup(config, scale) {
            const propellerGroup = new THREE.Group();
            const materials = createBasicMaterials(config.color);

            propellerGeometry.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const solidWireframeProp = createSolidWireframeMesh(child.geometry, materials);
                    propellerGroup.add(solidWireframeProp);
                }
            });

            propellerGroup.position.set(
                config.position.x * scale,
                config.position.y * scale,
                config.position.z * scale
            );
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
        disposeScene(scene, renderer, animationFrameId);
    });


</script>

<Header/>

<section class="title-page">
    <div class="gradient-background"></div>
    <div bind:this={container} class="scene-container"></div>
    <h1>MULTIVAC</h1>
</section>



<section class="high-level-description centered">
    <ProjectSection>
        <div slot="description">
            <h1>Tired of Simulink?</h1>
            <hr width="100%">
            <p>
                Named after Isaac Asimov's recurring supercomputer, MultiVAC is a <b>general purpose 6DOF simulation</b> that I wrote to serve as a proving ground for new GNC methods.
                MultiVAC is intended as a development tool to aid in any real world applications - from industrial robotics to air and space GNC.
            </p>
            <p>
                MultiVAC is <b>fast and flexible</b> - its scripting interface allows for quick iterations to your design while retaining calculation speed.
            </p>
        </div>
        <div slot="image">
            <img loading="lazy" src={blizz_render_path} alt="ATP-XW Blizzard Render" />
        </div>
    </ProjectSection>

    <ProjectSection imagePosition="left">
        <div slot="image">
            <img loading="lazy" src={threeDplot} alt="ATP-XW Blizzard Render" />
        </div>
        <div slot="description">
            <h1>Instant Prototypes</h1>
            <hr width="100%">
            <p>
                MultiVAC's user interface is built on a simple RHAI layer. Each scenario is composed of a few configurable environment types (such as basic gravity), along with simulated physics objects.
            </p>
            <p>Each object is defined in its own RHAI script, through a combination of state-space matricies (which define equations of motion) and controllable components (which affect the objects position).</p>
            <p>Objects can be supplemented with any combination of controller, sensor processing scripts, and custom guidance scripts to define behavior. Need to make a change to your guidance loop? No worries - MultiVAC doesn't even need to recompile, allowing you to focus your time on what matters most.</p>
        </div>
    </ProjectSection>  

    <!-- <div class="shaded-background">
        <div class="description">
            <h1>Non-Linear Simulation</h1>
            <p>MultiVAC is a <b>non-linear</b> simulation. No shortcuts, no half-measures.</p>
            <p>It achieves t</p>
        </div>
         <div class="image-reel">
            <img loading="lazy" src={blizz_render_path} alt="ATP-XW Blizzard Render" />
            <h3><i>The Basic Process</i></h3> 
            <p><i></i></p>
        </div>
    </div>   -->

    

    <!-- <div class="shaded-background">
        <div class="description">
            <h1>See it live</h1>
        </div>
        <div class="image-reel">
            <img loading="lazy" src={blizz_render_path} alt="ATP-XW Blizzard Render" />
            <h3><i>The Basic Process</i></h3> 
            <p><i></i></p>
        </div>
    </div>   -->

    <ProjectSection>
        <div slot="description">
            <h1>Zero-Click Insights</h1>
            <hr width='100%'>
            <p>
                MuliVAC <b>automatically</b> generates a full teardown at the end of each run. Plots are generated of each vehicle's position, velocity, and rotation, along with a plot of the full scenario. A full LaTeX report is also generated for easy reading.
            </p>
            <p>The full data for each run is saved to a single HDF5 file, allowing you to generate your own plots as well.</p>
        </div>
        <div slot="image">
            <img loading="lazy" src={pos_plot} alt="ATP-XW Blizzard Render" />
        </div>
    </ProjectSection>  

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


    b {
        color: #00FFFF;
    }

</style>