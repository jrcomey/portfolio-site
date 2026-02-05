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

    const blizz_render_path = `${base}/assets/blizz.png`;
    const carpet_plot = `${base}/assets/blizzard/carpet_plot.png`;
    const impulse_response = `${base}/assets/blizzard/impulse_response.png`;
    const monte_carlo = `${base}/assets/blizzard/monte-carlo.png`;

    let container;
    let scene, camera, renderer, animationFrameId;

    onMount(() => {
        const sceneSetup = createBasicScene(container, {
            fov: 40,
            cameraPosition: new THREE.Vector3(-7, 0, 5),
            cameraTarget: new THREE.Vector3(-1.5, 0, 0)
        });
        scene = sceneSetup.scene;
        camera = sceneSetup.camera;
        renderer = sceneSetup.renderer;

        const bodyMaterials = createBasicMaterials(colors.green);
        const propellers = [];

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

                        const box = new THREE.Box3().setFromObject(aircraftGroup);
                        const center = box.getCenter(new THREE.Vector3());
                        aircraftGroup.position.sub(center);

                        const scale = 1;
                        aircraftGroup.scale.multiplyScalar(scale);

                        propellerConfigs.forEach(config => {
                            const propGroup = createPropellerGroup(config, scale);
                            aircraftGroup.add(propGroup);
                            propellers.push(propGroup);
                        });

                        scene.add(aircraftGroup);
                    }
                );
            }
        );

        let propellerSpeed = 0.8;

        function animate() {
            requestAnimationFrame(animate);
            propellers.forEach(propGroup => {
                const direction = propGroup.userData.clockwise ? 1 : -1;
                propGroup.rotation.z += propellerSpeed * direction;
            });
            renderer.render(scene, camera);
        }

        animate();
    });

    onDestroy(() => {
        disposeScene(scene, renderer, animationFrameId);
    });
</script>

<Header/>

<section class="title-page">
    <div class="gradient-background"></div>
    <div bind:this={container} class="scene-container"></div>
    <h1>THE ATP-XW <i>BLIZZARD</i></h1>
</section>

<section class="high-level-description centered">
    <ProjectSection>
        <div slot="description">
            <h1>Overview</h1>
            <p>As part of a team of 5, my team and I developed a weather tolerant UAM concept vehicle, designed for operation in Chicago's cold-weather environment. This design won the <a href="https://www.nasa.gov/general/the-nasa-aeronautics-university-design-challenge-2020-2021-academic-year/">NASA ARMD 2021 University Design Challenge</a>.</p>
            <p>I designed a fully functional Guidance, Navigation, and Control (GNC) system for the Blizzard, and is capable of both piloted and autonomous control. The control system uses a state-feedback controller with added integrator control to maintain both the position and attitude of the aircraft by varying the rotation speed of the 8 motors which power the aircraft, creating thrust differentials, and therefore a moment about the center. The autonomous capabilities of the aircraft would reduce the operating costs by 35%, lowering ticket price and ultimately allowing the aircraft to carry more passengers.</p>
        </div>
        <div slot="image">
            <img loading="lazy" src={blizz_render_path} alt="ATP-XW Blizzard Render" />
            <h3><i>ATP-XW Blizzard</i></h3>
            <p><i>Render. Image Credit: Muhannad Mazin</i></p>
        </div>
    </ProjectSection>

    <ProjectSection imagePosition="left">
        <div slot="image">
            <img loading="lazy" src={impulse_response} alt="Dynamics Modeling" />
        </div>
        <div slot="description">
            <h1>Dynamics Modeling</h1>
            <p>Using my simulation program <a href="projects/UAVSim">UAVSim</a>, I was able to test the aircraft against a variety of maneuverability tests, as laid out in ADS-33E-PRF, a military standard which contains, among other elements, a list of response tests for rotary-wing aircraft in windy conditions. While not required to certify the Blizzard for its intended use, these standards provide a clear pass/fail test used for other fast-response aircraft in similar conditions. My plan is to repeat these tests once the aerodynamic model is fully completed, for wind conditions, temperatures, and precipitation consistent with Chicago winter weather.</p>
        </div>
    </ProjectSection>

    <ProjectSection>
        <div slot="description">
            <h1>Duct Sizing</h1>
            <p>To determine the size of the support struts which held the coaxial motor set in place in the duct, I constructed a carpet plot, a method commonly used in the aerospace field to size sets of independent and dependent variables. The plot varies both the number of struts, and their size, and determined operating point based on beam deflection under maximum loading conditions, and thrust force lost to drag on the motors. Using this plot I was able to appropriately size the motor support struts around an operating point.</p>
        </div>
        <div slot="image">
            <img loading="lazy" src={carpet_plot} alt="Carpet Plot" />
        </div>
    </ProjectSection>

    <ProjectSection imagePosition="left">
        <div slot="image">
            <img loading="lazy" src={monte_carlo} alt="Monte Carlo Simulation" />
        </div>
        <div slot="description">
            <h1>Monte Carlo Simulation</h1>
            <p>Using my UAVSim flight simulator (which you can read more about here) I developed a flight model for the Blizzard and ran a Monte Carlo simulation by randomizing aircraft position and attitude and allowing the aircraft to return to a neutral position, observing system response.</p>
            <p>Results indicated that the aircraft was stable for perturbations under a given magnitude, and in most cases recovered with only a 6 meter loss of altitude. Results initially identified a control error that caused the aircraft destabilized if inverted, and has been fixed. The aircraft is now able to safely recover from any attitude destabilization.</p>
        </div>
    </ProjectSection>
</section>

<style>
    .centered {
        align-content: center;
    }

    .title-page {
        align-content: left;
        background-image: url("/src/assets/blizz.png");
        background-size: cover;
        justify-content: end;
        margin: 0%;
        overflow: hidden;
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

    section {
        background-size: cover;
        position: relative;
        z-index: -10;
        min-height: 90vh;
        display: flex;
        flex-direction: column;
    }
</style>
