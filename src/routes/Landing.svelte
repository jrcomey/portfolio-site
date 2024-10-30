<script>
    import Typewriter from 'svelte-typewriter';
    import {concurrent, cascade, scramble} from 'svelte-typewriter';
    import * as THREE from 'three';
    import { onMount, onDestroy } from 'svelte';
    import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
    import { base } from '$app/paths';

    // import gear_pic from '$lib/assets/gear2.svg';
    // import blizzard_file from '$lib/assets/blizzard.obj';


    // let gear_pic = "/assets/gear2.svg";
    let gear_alt = "Gear pic";
    // let rocket_pic = "/assets/rocket.svg";
    let rocket_alt = "Rocket Pic";


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
    camera.position.setZ(0);
    camera.position.setX(-7);
    camera.position.setY(-5);
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

    let propellerSpeed = 0.1;  // Adjust for faster/slower rotation

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



<section class="landing-page" id="landing">

    <!-- <img class="landing-background-animation" src={background_animation}/> -->
    <!-- <canvas id="bg"></canvas> -->

    <div bind:this={container} class="scene-container"></div>
    <div class="landing-background-gradient-overlay"></div>
    <div class="landing-background-gradient-overlay-bottom"></div>
    <div>
            <!-- <h1>JACK RHYS COMEY</h1> -->
            <h1>Jack Comey</h1>
            <hr>
            <h4>Guidance, Navigation, and Control Engineer</h4>
            <h4>Currently at: Lockheed Martin Space</h4>
            <hr>
    </div>

    
    <div>
        <hr width="100%">
        <h2 class="underline">EDUCATION</h2>
        <p>2021 NASA ARMD University Design Challenge Winner</p>
        <p>B.S. UC Davis: Aerospace Science and Engineering</p>
        <p>B.S. UC Davis: Mechanical Engineering</p>
        <p>3 years of Industry Experience</p>
        <hr>
    </div>

    <div>
        <hr>
        <h2 class="underline">KEY SKILLS</h2>
        <p>Rust | C | C++ | Python | MATLAB | Simulink </p>
        <p>Precision Servo Control | Discrete Controller Design</p>
        <!-- <p>Modern Controller/Navigation Design</p> -->
        <hr>
    </div>
        
    <div class="landing-page-icon-grid">
        <!-- <img width=40% src={gear_pic} alt={gear_alt}/>
        <img width=40% src={rocket_pic} alt={rocket_alt}/> -->
        <div class="empty"></div>
        <p>Stat 1</p>
        <p>Stat 2</p>
        <div class="empty"></div>
        
    </div>

    <div class="empty"></div>


</section>

<style>

    .scene-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
    }

    div {
        min-width: 35%;
        /* max-width: 40%; */
    }

    .landing-background-animation {
        position: absolute;
        top: 0;
        left: 30%;
        width: 100%;
        height: 100%;
        z-index: -2;
        
    }

    hr {
        align: left;
    }
    
    .landing-background-gradient-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(110deg, rgba(15, 17, 18, 0.8) 40%, rgba(15, 17, 18, 0.0) 80%, rgba(15, 17, 18, 0.0));
        z-index: -1;
    }

    .landing-background-gradient-overlay-bottom {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(-5deg, rgba(15, 17, 18, 1), rgba(15, 17, 18, 0.2), 20%, rgba(15, 17, 18, 0) 25%, rgba(15, 17, 18, 0));
        z-index: -1;
    }

    .landing-page {
        display: flex;
        align-items: flex-start;
        min-height: 90vh;
        text-align: left;
        justify-content: space-between;
        /* background: linear-gradient(to left, rgba(32,39,49,0) 80%,
              rgba(32,39,49,1)), url(http://foo.com/image.jpg); */
        color: #ffffff;      
        overflow: hidden;        
        /* font-variant: small-caps; */
        z-index: 0;
        position: relative;
        top: 0;
        left: 0;
    }
    

    .landing-page-icon-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 5fr;
        /* grid-template-rows: fr 1fr; */
        width: 100%;
        text-align: center;
        align-content: left;
        place-items: center;
    }

    .landing-page h1 {
        line-height: 1.5;
        font-family: 'JetBrains Mono', sans-serif;
        font-weight: 700;
        /* font-variant: small-caps; */
        color: #FFFFFF;
    }

    .landing-page h4 {
        line-height: 0%;
        font-family: 'JetBrains Mono', monospace;
        color: #FFFFFF;
    }

    .landing-page p {
        font-family: 'JetBrains Mono', monospace;
        color: #FFFFFF;
    }

    @font-face {
        font-family: 'JetBrains Mono';
        src: url('https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono/web/woff2/JetBrainsMono-Bold.woff2') format('woff2'),
            url('https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono/web/woff/JetBrainsMono-Bold.woff') format('woff');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
    }
   
</style>