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
    const helicopter_subassembly_diagram = `${base}/assets/trifecta/helicopter_subassembly.png`;
    const component_diagram = `${base}/assets/trifecta/component.png`;
    const h2_plot = `${base}/assets/diagrams/H2OptimalControl.png`;

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



<section>
    
    <ProjectSection>
        <div slot="description">
            <h1>MultiVAC</h1>
                <h3><i>General Purpose 6DOF Simulation</i></h3>
            <hr width=100%>
            <p>Named after Isaac Asimov's recurring supercomputer, MultiVAC is a <b>general purpose six degree-of-freedom simulation</b>. Written from scratch in Rust, it’s intended as an end-to-end design tool for vehicle dynamics and a proving ground for GNC method; a tool to design and test hardware like it’s software. You can experiment with rapid prototypes, or ensure that your established design still meets performance criteria through a series of unit and integration tests. A place to build a vehicle, throw a controller at it, and see what happens, as fast and as often as you need to.</p>
            <p>MultiVAC is, at its core, a Rust-based simulation with an exposed Python API. Vehicle definition, scenario setup, post-processing, and flight computer algorithms are all defined by the end user in <b>Python</b>. All dynamics calculations, data recording, and flight control is handled by the core Rust code. The boundary between the two is deliberate, and it means you spend your time on GNC design rather than constant rehashing and recompilation.</p>
            <p>MultiVAC is intended as a development companion for real-world applications. Air vehicles, spacecraft, ground robots - if it moves in three dimensions, it deserves to be modeled here.</p>
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
            <div>
                <h1>Python Scripting Interface</h1>
            </div>
            <hr width=100%>
            <p>MultiVAC's scripting layer has now moved to Python. Every scenario, every vehicle definition, every flight control algorithm - it's all Python to you, but still performant Rust underneath. Beyond just an improvement over the old RHAI interface, this fundamentally changes what’s possible for the end user.
</p>
            <p>Python means access to the entire scientific computing ecosystem. Want to optimize your controller gains with SciPy? Go ahead. Want to train a guidance policy in PyTorch and drop it into the sim? Nothing stopping you. Want to write a loop that runs a thousand scenarios with randomized initial conditions and aggregates the results? That's just a for loop now.
</p>
            <p>More importantly, Python enables adaptive and automatic iterative design. The simulation isn't just something you run once and stare at the plots. It's something you can wrap in an optimization loop, a parameter sweep, or a learning algorithm. The boundary between "running a sim" and "designing a vehicle" gets very blurry very fast, and that's the point.
</p>
        </div>
    </ProjectSection>  

    <ProjectSection imagePosition="left">
        <div slot="image">
            <img loading="lazy" src={helicopter_subassembly_diagram} alt="ATP-XW Blizzard Render" />
        </div>
        <div slot="description">
            <div>
                <h1>The Plant Model</h1>
            </div>
            <hr width='100%'>
            <p>Vehicles in MultiVAC are built on the subassembly system - a directed graph of physical components that each compute their own contributions to the vehicle's dynamics. There are no linearized state-space matrices here. Each component - a motor, a propeller, a servo, whatever you need - is a node in the hardware graph, connected to other components by physical dependency links and parent links.
</p>
            <p>Dependency links describe who needs data from whom. A propeller needs the motor's shaft output to calculate thrust. A motor needs the ESC's voltage to calculate torque. Parent links describe physical hierarchy. A propeller is mounted on a motor. A motor on the tail is mounted on a servo. When the servo deflects, everything downstream rotates with it, and all the forces, moments, and angular momentum vectors transform through the parent chain automatically.
</p>
            <p>This means that moving parts are first-class citizens. A tilting rotor isn't a special case handled with trigonometric substitutions, but rather a nonlinear component with a rotating reference frame. The system computes the correct dynamics - inertia tensor shifts, angular momentum coupling, force direction changes - without approximation.
</p>
        </div>
    </ProjectSection>  

    <ProjectSection imagePosition="left">
        <div slot="image">
            <img loading="lazy" src={h2_plot} alt="ATP-XW Blizzard Render" />
        </div>
        <div slot="description">
            <div>
                <h1>The Flight Computer</h1>
            </div>
            <hr width='100%'>
            <p>The flight computer is structured similarly to the subassembly plant model. It's moved to a directed graph architecture, where flight control algorithms aren’t hardcoded end to end, but rather networks of algorithm components connected however the problem demands.
</p>
            <p>A graph-based flight computer lets you wire things together the way the problem actually requires, not the way a textbook diagram suggests. The flexible nature is to allow for a new flight control algorithm, guidance law, or anything else to be tested without recompilation or modification of the core Rust simulation.
</p>
            <p>The system also includes ONNX model support, so trained neural networks can slot directly into the graph as guidance or control nodes. The combination of the graph architecture in both the subassembly and algorithm components allow for  modeling full sensor fusion- multiple sensor models feeding into estimation algorithms, from Kalman filters to unscented variants. The flexibility of the graph structure means these aren't separate features bolted on after the fact. They're just nodes.
</p>
        </div>
    </ProjectSection>  

    <ProjectSection imagePosition="right">
        <div slot="image">
            <img loading="lazy" src={component_diagram} alt="ATP-XW Blizzard Render" />
        </div>
        <div slot="description">
            <div>
                <h1>The Component Library</h1>
            </div>
            <hr width='100%'>
            <p>The component library is expanding rapidly. The current set covers the essentials for multirotor and general rotorcraft simulation, but the architecture is designed to grow. Every component in the system implements a simple set of common behaviors and the rest of the simulation doesn't care what's behind it. A reaction wheel, a control moment gyroscope, an aerodynamic surface, or a thruster valve can all be implemented in relatively short order.
</p>
            <p>The goal is a library broad enough that you can assemble complex vehicle configurations and models from existing parts, and a trait interface simple enough that building a new component takes an hour, not a week.
</p>
        </div>
    </ProjectSection>  

    <!-- <ProjectSection imagePosition="left">
        <div slot="image">
            <img loading="lazy" src={threeDplot} alt="ATP-XW Blizzard Render" />
        </div>
        <div slot="description">
            <div>
                <h1>Integration</h1>
            </div>
            <hr width='100%'>
            <p>The numerical integrator in MultiVAC is <b>swappable</b>. The current default is RK4 - reliable, well-understood, and accurate enough for most rigid body applications. But the integrator interface is abstracted, and the roadmap includes <b>RK45</b> (adaptive step-size Runge-Kutta for automatic error control), <b>implicit methods</b> like BDF and Radau for stiff systems where motor electrical dynamics couple tightly with mechanical dynamics, and <b>symplectic integrators</b> for long-duration orbital mechanics where energy conservation over thousands of orbits matters more than local accuracy.</p>
            <br>
            <p>SubAssemblies can also run at their own internal timestep, independent of the vehicle-level integration. This is important for components with fast internal dynamics - motor electrical transients operate on a very different timescale than vehicle rigid body motion, and forcing both onto the same timestep is either wasteful or inaccurate. The multi-rate capability lets each subsystem run at the frequency it needs.</p>
        </div>
    </ProjectSection>   -->
    
    <ProjectSection imagePosition="left">
        <div slot="image">
            <img loading="lazy" src={pos_plot} alt="ATP-XW Blizzard Render" />
        </div>
        <div slot="description">
            <div>
                <h1>Analysis & Reporting</h1>
            </div>
            <hr width='100%'>
            <p>Every run produces an HDF5 file containing the complete time history of every vehicle: states, state derivatives, command inputs, actuator signals, and state estimates. The data is structured by vehicle and organized into named datasets, so pulling it into Python or any other analysis tool is effortless.
</p>
            <p>On top of the raw data, MultiVAC generates an analysis at the end of each run. The default gives you position, velocity, and attitude plots for every vehicle, a full-scenario trajectory view, and a LaTeX report summarizing conditions and events. But thanks to the new Python interface, post-run analysis is now customizable per project. If you need component-level data, frequency domain analysis, custom comparison plots across batch runs, or a completely different report format - you can define the analysis pipeline. 
</p>
        </div>
    </ProjectSection>  


    <!-- <ProjectSection imagePosition="left">
        <div slot="image">
            <img loading="lazy" src={threeDplot} alt="ATP-XW Blizzard Render" />
        </div>
        <div slot="description">
            <div>
                <h1>Events & Interactions</h1>
            </div>
            <hr width='100%'>
            <p>The simulation has an event system built on message passing. Objects emit events through a shared bus, and the simulation processes them between timesteps. Collision detection, scheduled actions, inter-object communication - it all flows through the event system. The event log is captured in the teardown report, giving you a complete timeline of everything that happened during the run.
</p>
            <p>Objects are aware of each other through a shared snapshot - a read-only view of every object's state at the current timestep. This is what makes vehicle to vehicle interaction possible while maintaining parallel calculations for different vehicles. It's also the foundation for multi-agent scenarios, swarm behaviors, or anything else where vehicles need to react to each other in real time.
</p>
            <p>Between the event system and the snapshot mechanism, MultiVAC can handle scenarios that go well beyond single-vehicle dynamics. Multiple vehicles, interacting in a shared environment, each with their own flight computer and component graph, each aware of the others. </p>
        </div>
    </ProjectSection>   -->
    

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
<!-- 
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
    </ProjectSection>   -->

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