<title>Tricopter Dynamics Model</title>

<script>
    import Header from '../../Header.svelte';
    import MathBlock from '$lib/MathBlock.svelte';
    import ProjectSection from '$lib/ProjectSection.svelte';

    import * as THREE from 'three';
    import { onMount, onDestroy } from 'svelte';
    import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
    import { base } from '$app/paths';
    import {
        colors,
        createBasicScene,
        createFresnelMaterials,
        createWireframeFresnelMesh,
        normalizeGeometry,
        disposeScene
    } from '$lib/three-utils.js';

    const cadplot = `${base}/assets/trifecta/trifecta_cad.png`;
    const pos_plot = `${base}/assets/trifecta/Trifecta_0_pos_plot.png`;
    const att_plot = `${base}/assets/trifecta/Trifecta_0_att_plot.png`;

    let container;
    let scene, camera, renderer, animationFrameId;

    onMount(() => {
        // Initialize scene using utility
        const sceneSetup = createBasicScene(container, {
            fov: 30,
            cameraPosition: new THREE.Vector3(4, 4, 4),
            cameraTarget: new THREE.Vector3(0, 0, 0),
            useContainerSize: true
        });
        scene = sceneSetup.scene;
        camera = sceneSetup.camera;
        renderer = sceneSetup.renderer;
        const camera_target_pos = new THREE.Vector3(0, 0, 0);

        // Store propeller references for animation
        const propellers = [];
        const tail_anim = [];

        const loader = new OBJLoader();

        function animate() {
            requestAnimationFrame(animate);

            // Rotate propellers according to their direction
            let prop_ticker = 0;
            propellers.forEach(propGroup => {
                const check = prop_ticker % 2 == 1;
                // const direction = check ? 1 : -1;
                const direction = 1;
                prop_ticker+=1;
                if (prop_ticker > 3) {
                    prop_ticker = 0;
                }
                propGroup.rotation.z += propellerSpeed * direction;
            });

            // Swing tail back and forth
            if (ticker % 360 < 180) {
                tail_anim.forEach(item => {
                        item.rotation.x = Math.sin((ticker/180)*2*3.1415);
                    }
                )
            }

            camera.position.set(
                35*Math.sin(ticker/360 - 3.5*Math.PI/4),
                35*Math.cos(ticker/360 - 3.5*Math.PI/4),
                25,
            );
            camera.lookAt(camera_target_pos);

            // tail_group.rotation.z = 0;
            // controls.update();
            renderer.render( scene, camera);
            ticker += 1;
            if (ticker >= ticker_max) {
                ticker = 0
            }
        }

        function load_motor_and_prop() {
            const motor_group = new THREE.Group();

            // Stator
            loader.load(
                `${base}/assets/trifecta/stator.obj`,
                function(prop_geom) {
                    const stator_group = new THREE.Group();
                    prop_geom.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            normalizeGeometry(child.geometry);
                            const solidWireframeMesh = createWireframeFresnelMesh(
                                        child.geometry,
                                        createFresnelMaterials(colors.green)
                                    );
                        stator_group.add(solidWireframeMesh);
                        stator_group.scale.setScalar(0.75);
                        // propellers.push(stator_group);
                        motor_group.add(stator_group);
                        }
                    });
                }
            );

            // Rotor + Prop
            loader.load(
                `${base}/assets/trifecta/rotor.obj`,
                function(prop_geom) {
                    const rotor_group = new THREE.Group();
                    prop_geom.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            normalizeGeometry(child.geometry);
                            const solidWireframeMesh = createWireframeFresnelMesh(
                                        child.geometry,
                                        createFresnelMaterials(colors.green)
                                    );
                        rotor_group.add(solidWireframeMesh);
                        rotor_group.scale.setScalar(1.0);
                        rotor_group.position.set(0, 0, 1.0);

                        // Load prop object
                        // Front L Prop
                        loader.load(
                            `${base}/assets/prop.obj`,
                            function(prop_geom) {
                                const prop_group = new THREE.Group();
                                prop_geom.traverse((child) => {
                                    if (child instanceof THREE.Mesh) {
                                        // normalizeGeometry(child.geometry);
                                        const solidWireframeMesh = createWireframeFresnelMesh(
                                                    child.geometry,
                                                    createFresnelMaterials(colors.green)
                                                );
                                    prop_group.add(solidWireframeMesh);
                                    prop_group.scale.setScalar(3.0);
                                    rotor_group.add(prop_group);
                                    }
                                });
                            }
                        );

                        propellers.push(rotor_group);
                        motor_group.add(rotor_group);
                        }
                    });
                }
            );
            return motor_group;
        }

        loader.load(
            `${base}/assets/trifecta/TopShell.obj`,
            function(top_shell_geom) {
                // propellerGeometry = tail_geom;
                const trifecta_group = new THREE.Group();
                const top_shell_group = new THREE.Group();

                // Top Shell
                top_shell_geom.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        normalizeGeometry(child.geometry);
                        const solidWireframeMesh = createWireframeFresnelMesh(
                                    child.geometry,
                                    createFresnelMaterials(colors.green)
                                );
                    top_shell_group.add(solidWireframeMesh);
                    }
                });
                
                top_shell_group.scale.setScalar(4.5);
                trifecta_group.add(top_shell_group);
                // Bottom Shell
                loader.load(
                    `${base}/assets/trifecta/BotShell.obj`,
                    function(bot_shell_geom) {
                        const bot_shell_group = new THREE.Group()
                        bot_shell_geom.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                normalizeGeometry(child.geometry);
                                const solidWireframeMesh = createWireframeFresnelMesh(
                                            child.geometry,
                                            createFresnelMaterials(colors.green)
                                        );
                            bot_shell_group.add(solidWireframeMesh);
                            bot_shell_group.scale.setScalar(4.18);

                            bot_shell_group.position.set(-0.3, 0.0, -0.25-0.375);


                            trifecta_group.add(bot_shell_group);
                            }
                        });
                    }
                );

                // Front L Arm
                loader.load(
                    `${base}/assets/trifecta/FrontArmL.obj`,
                    function(front_arm_l_geom) {
                        const front_arm_l_group = new THREE.Group();
                        front_arm_l_geom.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                normalizeGeometry(child.geometry);
                                const solidWireframeMesh = createWireframeFresnelMesh(
                                            child.geometry,
                                            createFresnelMaterials(colors.green)
                                        );
                            front_arm_l_group.add(solidWireframeMesh);
                            front_arm_l_group.scale.setScalar(3.8);
                            front_arm_l_group.position.set(-3.96, -5.47, -0.05);

                            trifecta_group.add(front_arm_l_group);
                            }
                        });
                    }
                );

                // Front R Arm
                loader.load(
                    `${base}/assets/trifecta/FrontArmR.obj`,
                    function(front_arm_l_geom) {
                        const front_arm_l_group = new THREE.Group();
                        front_arm_l_geom.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                normalizeGeometry(child.geometry);
                                const solidWireframeMesh = createWireframeFresnelMesh(
                                            child.geometry,
                                            createFresnelMaterials(colors.green)
                                        );
                            front_arm_l_group.add(solidWireframeMesh);
                            front_arm_l_group.scale.setScalar(3.8);
                            front_arm_l_group.position.set(-3.96, 5.47, -0.05);

                            trifecta_group.add(front_arm_l_group);
                            }
                        });
                    }
                );

                // Back Slide Arm
                loader.load(
                    `${base}/assets/trifecta/BackSlide.obj`,
                    function(back_slide_geom) {
                        const back_slide_group = new THREE.Group();
                        back_slide_geom.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                normalizeGeometry(child.geometry);
                                const solidWireframeMesh = createWireframeFresnelMesh(
                                            child.geometry,
                                            createFresnelMaterials(colors.green)
                                        );
                            back_slide_group.add(solidWireframeMesh);
                            back_slide_group.scale.setScalar(3.0);
                            back_slide_group.position.set(4, -0.35, -0.5);

                            trifecta_group.add(back_slide_group);
                            }
                        });
                    }
                );



                const tail_group = new THREE.Group();
                // Tail Gear
                loader.load(
                    `${base}/assets/trifecta/TailGear.obj`,
                    function(tail_gear_geom) {
                        const tail_gear_group = new THREE.Group();
                        tail_gear_geom.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                normalizeGeometry(child.geometry);
                                const solidWireframeMesh = createWireframeFresnelMesh(
                                            child.geometry,
                                            createFresnelMaterials(colors.green)
                                        );
                            tail_gear_group.add(solidWireframeMesh);
                            tail_gear_group.scale.setScalar(0.54);
                            // tail_gear_group.position.set(7.25, -0.0, -0.45);

                            tail_group.add(tail_gear_group);
                            // tail_anim.push(tail_gear_group);
                            }
                        });
                    }
                );

                // Tail Rotor Mount
                loader.load(
                    `${base}/assets/trifecta/Tail.obj`,
                    function(tail_geom) {
                        const tail_piece_geom = new THREE.Group();
                        tail_geom.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                normalizeGeometry(child.geometry);
                                const solidWireframeMesh = createWireframeFresnelMesh(
                                            child.geometry,
                                            createFresnelMaterials(colors.green)
                                        );
                            tail_piece_geom.add(solidWireframeMesh);
                            tail_piece_geom.scale.setScalar(1.25);
                            tail_piece_geom.position.set(1.76, 0, 0)
                            // tail_piece_geom.position.set(7.25, -0.0, -0.45);

                            tail_group.add(tail_piece_geom);
                            }
                        });
                    }
                );

                // Front L Motor
                const front_l_group = load_motor_and_prop();
                front_l_group.position.set(-5.65, -8.45, 0.5)
                trifecta_group.add(front_l_group);

                // Front R Motor
                const front_r_group = load_motor_and_prop();
                front_r_group.position.set(-5.65, 8.45, 0.5);
                trifecta_group.add(front_r_group);

                // Tail Motor
                const tail_motor = load_motor_and_prop();
                tail_motor.position.set(2.1, 0.0, 0.8);
                // tail_anim.push(tail_motor);
                tail_group.add(tail_motor);
                tail_group.position.set(7.25, 0.0, -0.45);
                tail_anim.push(tail_group);
                trifecta_group.add(tail_group);


                
                const box = new THREE.Box3().setFromObject(trifecta_group);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                // const scale = 11.67/maxDim;
                // aircraftGroup.scale.setScalar(scale);

                trifecta_group.position.set(0.0, 0.0, 0.0)
                scene.add(trifecta_group)

                // scene.add(trifecta_group)
            },
        );        

        let propellerSpeed = 0.08;  // Adjust for faster/slower rotation
        let ticker = 0;
        const ticker_max = 3_600;

        animate()

  });

    onDestroy(() => {
        disposeScene(scene, renderer, animationFrameId);
    });

</script>

<Header/>

<section>
    <ProjectSection>
        <div slot="description">
            <h1>What's in a drone?</h1>
            <hr width=100%>
            <!-- <h3><i>NOTE: THIS PAGE IS UNDER CONSTRUCTION</i></h3> -->
            <p>At the time of writing, I have been developing MultiVAC for about a year and a half now, and 6DOFs more generally for much longer than that. Up until now, I have been using my undergraduate capstone project - the ATP XW Blizzard - to demonstrate the accuracy of the simulation. It's a good model - its dynamics model is relatively mature for the state, with a significant body of analysis backing that up. It is, however, only a <b><i>paper aircraft</i></b>. No prototype has been made and there will never be one. Perhaps I'll make a smaller scale prototype one day, but I'm starting to find the static multicopter family to be a little dry from a dynamics standpoint. Too often will I read a paper on quadcopter dynamics only to find the dreaded `sin(θ) = θ` approximation that simplifies the problem beyond any practical interest.</p>
            <br>
            <p>I will be using a small tricopter for the next few rounds of demonstrations. I built one when I was 16, and was as fascinated with it then as I am now. The frame in question is the Quanum <i>Trifecta</i>, a collapsable design that folds up into something pocket sized, but with enough power available to outspeed most other aircraft its size. </p>
            <br>
            <p>Unlike a quadcopter, it is <b>not</b> a symmetric aircraft. For the unfamiliar, the tricopter is laid out like a Y. It has two fixed motors in the front, and a third motor on a swivel in the back. The aircraft's yaw (think spinning it like a disk) is primarily controlled by swiveling the tail motor in the back. This gives it a clear front, and it is better operating in some directions than others. A quadcopter generally has no preference. A tricopter behaves more like a fixed-wing aircraft in flight than a traditional quadcopter, and tends to have more 'swoopy' flight characteristics. From an academic standpoint, it's much more non-linear than its quadcopter counterpart. That tail rotor rotates between +/- 45 degrees, which is not easily linearizable. The tail rotor has its own angular momentum, which is in a constantly changing plane, and the movement of the mass of the tail relative to the parent body is itself a non-linear angular momentum vector.</p>
            <br>
        </div>
        <div slot="image">
            <div bind:this={container} class="scene-container"></div>
        </div>
    </ProjectSection>

    <ProjectSection imagePosition="left">
        <div slot="image">
            <img loading="lazy" src={cadplot} alt="ATP-XW Blizzard Render" />
        </div>
        <div slot="description">
            <h1>Building the model</h1>
            <hr width=100%>
            <p>Well, in order to get started, we'll need mass and inertial properties to get started. We could weigh each component and get its position, and create a rough inertial model by finding the center of grav- </p>
            <p>Oh, or we could just CAD it. That wasn't that hard, actually.</p>
            <p>A quick 3D print verifies the model is appropriately dimensioned compared to the real aircraft. There's a few differences but that'll do.</p>
            <p>Not all inertial properties of the aircraft are static. That tail moves, and as it moves the moment of inertia will change with it. A good time to show off the dynamic mass and inertia calculation capabilities in MultiVAC for nonlinear models.</p>
        </div>
    </ProjectSection>

    <!-- <div class="shaded-background-no-pic">
        <div class="description">
            <div>
                <h1>The Nonlinear Dynamics Model</h1>
            </div>
        </div>
    </div> -->

    <ProjectSection imagePosition="none">
        <div slot="description">
            <h1>A Quick Controller</h1>
            <hr width='100%'>
            <p>It's a nonlinear model, yes, but to create a controller for it and get some nice visuals, we will have to linearize it to some degree. Just for the controller, I promise. The simulations itself still runs the full nonlinear quaternion-based dynamics.</p>

            <p>We'll be using a relatively straightforward state space model in six degrees of freedom. The A matrix is uninteresting and left as an exercise to the reader. The tricopter in question has four pinouts - PWM speed control outputs to each of the three motors, and a fourth PWM output to the tail servo. In vector form it is as follows:</p>
            <MathBlock>
                {@html `$$\\vec{u} = \\begin{bmatrix} \\omega_1 \\\\ \\omega_2 \\\\ \\omega_3 \\\\ \\theta_{s} \\end{bmatrix} \\propto \\begin{bmatrix} T_1 \\\\ T_2 \\\\ T_3 \\\\ \\theta_{s} \\end{bmatrix}$$`}
            </MathBlock>
            <br>
            <hr width="100%">

            A quick note that the front left motor and the front right motor both spin counterclockwise, while the front right motor spins clockwise to offset the front left. The servo on the tail will be the primary source of yaw authority. 

            <br>
            <hr width="100%">

            <h2>Hover Operating Point</h2>

            <p>Before linearizing, we need a point to linearize about. For a quad this is trivial — every motor sits at the same throttle. The tricopter is geometrically asymmetric, and the operating point isn't.</p>

            <p>Pinning the airframe in hover gives three constraints. Vertical lift must equal weight:</p>

            <MathBlock>
                {@html `$$2 T_{front} + T_{tail} = m g$$`}
            </MathBlock>

            <p>Pitch moment about the body x-axis must vanish — front motors at <code>-x</code>, tail at <code>+x</code>:</p>

            <MathBlock>
                {@html `$$2 \\, r_{x,front} \\, T_{front} + r_{x,tail} \\, T_{tail} = 0$$`}
            </MathBlock>

            <p>And the yaw torque must vanish. The two front motors spin in opposite directions, so their reaction torques cancel by symmetry. The tail motor leaves a residual reaction torque that the servo cancels by tilting the tail thrust laterally and letting the moment arm do the rest:</p>

            <MathBlock>
                {@html `$$\\delta_{trim} = \\frac{Q_{tail}}{r_{x,tail} \\, T_{tail}}$$`}
            </MathBlock>

            <p>Solving the lift and pitch constraints jointly gives a closed-form thrust split. Going from thrust to ESC throttle requires sweeping through the steady-state motor model — back-EMF, winding resistance, propeller <code>C_T</code>/<code>C_Q</code>, viscous damping, the lot — and that part is a numerical root-find rather than anything pretty. The result is a hover bias vector:</p>

            <MathBlock>
                {@html `$$\\vec{u}_{hover} = \\begin{bmatrix} u_{FL,h} & u_{FR,h} & u_{tail,h} & u_{servo,h} \\end{bmatrix}^T$$`}
            </MathBlock>

            <p>which the controller will feed forward at runtime so the LQR feedback only has to handle perturbations.</p>

            <br>
            <hr width="100%">

            <h2>Linearization</h2>

            <p>Quaternions are great for the simulation but awkward for LQR — four components describing three rotational degrees of freedom, on a manifold rather than a vector space. The standard move is to linearize against a small-angle Euler perturbation, design the controller in 12-state error space, and lift the resulting gain back to quaternion form for deployment.</p>

            <p>Define the reduced error state:</p>

            <MathBlock>
                {@html `$$\\delta \\vec{x} = \\begin{bmatrix} \\delta p_x & \\delta p_y & \\delta p_z & \\delta v_x & \\delta v_y & \\delta v_z & \\delta \\phi & \\delta \\theta & \\delta \\psi & \\delta \\omega_x & \\delta \\omega_y & \\delta \\omega_z \\end{bmatrix}^T$$`}
            </MathBlock>

            <p>Then the linearized dynamics are the usual:</p>

            <MathBlock>
                {@html `$$\\dot{\\delta x} = A \\, \\delta \\vec{x} + B \\, \\delta \\vec{u}$$`}
            </MathBlock>

            <p>The A matrix carries the position/velocity and attitude/rate kinematics, plus a gravity coupling block from the tilted body — pitch nose-up accelerates forward, roll right accelerates left:</p>

            <MathBlock>
                {@html `$$A = \\begin{bmatrix}
                0_{3\\times 3} & I_{3} & 0_{3\\times 3} & 0_{3\\times 3} \\\\
                0_{3\\times 3} & 0_{3\\times 3} & G & 0_{3\\times 3} \\\\
                0_{3\\times 3} & 0_{3\\times 3} & 0_{3\\times 3} & I_{3} \\\\
                0_{3\\times 3} & 0_{3\\times 3} & 0_{3\\times 3} & 0_{3\\times 3} \\\\
                \\end{bmatrix}, \\qquad G = \\begin{bmatrix} 0 & g & 0 \\\\ -g & 0 & 0 \\\\ 0 & 0 & 0 \\end{bmatrix}$$`}
            </MathBlock>

            <p>The B matrix maps ESC perturbations to body forces and torques. Computing it analytically would mean differentiating the entire motor-prop chain by hand and ends up grim, so I just numerically perturb the steady-state model around the hover throttle for each motor and pull off finite-difference sensitivities:</p>

            <MathBlock>
                {@html `$$\\frac{\\partial T}{\\partial u}\\bigg|_{u_h}, \\quad \\frac{\\partial Q}{\\partial u}\\bigg|_{u_h}, \\quad \\frac{\\partial F_y}{\\partial u_{servo}}\\bigg|_{u_h}$$`}
            </MathBlock>

            <p>From those, build the control effectiveness matrix. Each motor contributes a vertical thrust derivative, roll/pitch moments via its arm position, and a yaw moment from its prop reaction torque. The servo contributes a lateral force, and therefore a yaw moment via the tail moment arm:</p>

            <MathBlock>
                {@html `$$B_{eff} = \\begin{bmatrix}
                0 & 0 & 0 & 0 \\\\
                0 & 0 & 0 & \\partial F_y \\\\
                \\partial T_{FL} & \\partial T_{FR} & \\partial T_{tail} & 0 \\\\
                r_{y,FL} \\, \\partial T_{FL} & r_{y,FR} \\, \\partial T_{FR} & 0 & -r_{z,tail} \\, \\partial F_y \\\\
                -r_{x,FL} \\, \\partial T_{FL} & -r_{x,FR} \\, \\partial T_{FR} & -r_{x,tail} \\, \\partial T_{tail} & 0 \\\\
                -s_{FL} \\, \\partial Q_{FL} & -s_{FR} \\, \\partial Q_{FR} & -s_{tail} \\, \\partial Q_{tail} & r_{x,tail} \\, \\partial F_y
                \\end{bmatrix}$$`}
            </MathBlock>

            <p>where <code>s_i &isin; &plusmn;1</code> is the spin direction of motor <code>i</code>. Promote that 6×4 to the full 12×4 B by dividing the force rows by mass and the moment rows by the inertia matrix:</p>

            <MathBlock>
                {@html `$$B = \\begin{bmatrix} 0_{3\\times 4} \\\\ \\frac{1}{m} B_{eff}^{F} \\\\ 0_{3\\times 4} \\\\ J^{-1} B_{eff}^{\\tau} \\end{bmatrix}$$`}
            </MathBlock>

            <p>A quick rank check on the controllability matrix <code>[B, AB, A²B, …]</code> confirms it's full rank — twelve, as expected. All of the underlying motor electrical dynamics, propeller torque, and tail-rotor angular momentum bookkeeping that the linear model abstracts away are still tracked in MultiVAC's SubAssembly system. Again, the only purpose of this model is to derive a controller.</p>

            <br>
            <hr width="100%">

            <h2>LQR Controller Design</h2>

            <p>With (A, B) in hand, the controller drops out of the continuous-time algebraic Riccati equation, the derivation of which is left as an exercise to the reader:</p>

            <MathBlock>
                {@html `$$A^T P + P A - P B R^{-1} B^T P + Q = 0$$`}
            </MathBlock>

            <MathBlock>
                {@html `$$K = R^{-1} B^T P$$`}
            </MathBlock>

            <p>Picking <code>Q</code> and <code>R</code> is the entire game. Bryson's rule — set diagonal entries to <code>1/x_max²</code> for each state — gets close on the first pass, and from there it's tuning. Position weights dominate over velocity, attitude dominates over rate, yaw gets a slight bump because the servo is a comparatively slow channel and I want a tighter loop on it. <code>R</code> is small relative to <code>Q</code> because the throttles have a wide range to play with.</p>

            <p>Solving gives a 4×12 gain matrix mapping the Euler error state to ESC perturbations. Closed-loop eigenvalues all sit in the left half plane, which is the bare minimum bar to clear before flying anything.</p>

            <h3>Mapping back to quaternions</h3>

            <p>The simulation doesn't speak Euler angles, so the gain has to be lifted back into the 13-state quaternion world. Near hover, a small rotation linearizes against small Euler angles via:</p>

            <MathBlock>
                {@html `$$q \\approx \\begin{bmatrix} 1 & \\tfrac{1}{2}\\delta\\phi & \\tfrac{1}{2}\\delta\\theta & \\tfrac{1}{2}\\delta\\psi \\end{bmatrix}^T \\quad \\implies \\quad \\delta\\phi \\approx 2 q_x, \\;\\; \\delta\\theta \\approx 2 q_y, \\;\\; \\delta\\psi \\approx 2 q_z$$`}
            </MathBlock>

            <p>which makes the embedding simple. The position and velocity columns pass through directly, the <code>q_w</code> column is zeroed (no useful error signal there at hover), the <code>q_x</code>/<code>q_y</code>/<code>q_z</code> columns are the original attitude columns scaled by 2, and the angular rate columns pass through. Negate the whole thing so the regulator drives the state to zero rather than away from it, and the deployable feedback law becomes:</p>

            <MathBlock>
                {@html `$$\\vec{u} = \\vec{u}_{hover} - K_{13} \\, \\vec{x}$$`}
            </MathBlock>

            <p>The whole controller lives inside the BuildAnAlgo graph as three components in series — a <code>mat_mul</code> for the LQR feedback, a <code>bias_and_scale</code> for the hover trim, and a <code>limiter</code> to keep the ESC commands inside [0, 1000]. <code>K_13</code> is the mat_mul's matrix, the hover bias vector is the bias_and_scale's offset, and the saturation limits are the limiter's clamps. No special-case controller code, just the same primitives that build every other algorithm in MultiVAC.</p>

            <p>This is a regulator about hover, not a tracker — sufficient for stability and station-keeping, and the foundation for whatever guidance loop sits on top. Trajectory tracking, gain scheduling for off-hover regimes, and eventually a swap-in MPC for aggressive maneuvers are all on the roadmap. The results of the current full-state LQR are presented below.</p>
        </div>
    </ProjectSection>


    <!-- <ProjectSection imagePosition="none">
        <div slot="description">
            <h1>A Quick Controller</h1>
            <hr width='100%'>
            <p>It's a nonlinear model, yes, but to create a controller for it and get some nice visuals, we will have to linearize it to some degree. Just for the controller, I promise. The simulations itself still runs the full nonlinear quaternion-based dynamics.</p>

            <p>We'll be using a relatively straightforward state space model in six degrees of freedom. The A matrix is uninteresting and left as an exercise to the reader. The tricopter in question has four pinouts - PWM speed control outputs to each of the three motors, and a fourth PWM output to the tail servo. In vector form it is as follows:</p>
            <MathBlock>
                {@html `$$\\vec{u} = \\begin{bmatrix} \\omega_1 \\\\ \\omega_2 \\\\ \\omega_3 \\\\ \\theta_{s} \\end{bmatrix} \\propto \\begin{bmatrix} T_1 \\\\ T_2 \\\\ T_3 \\\\ \\theta_{s} \\end{bmatrix}$$`}
            </MathBlock>
            <br>
            <hr width="100%">

            A quick note that the front left motor and the front right motor both spin counterclockwise, while the front right motor spins clockwise to offset the front left. The servo on the tail will be the primary source of yaw authority. 

            <h2>Linearization</h2>

            <p>We'll be linearizing around a small-angle perturbation for the tricopter and design the controller around a 12 item vector state-space, and modify the final gain to fit the true thirteen vector state estimate used by the </p>
            <p>A quick summation of forces and moments in the body frame demonstrates the nonlinearity of the tricopter:</p>
            <MathBlock>
                {@html `$$F_x = 0$$`}
            </MathBlock>
            <MathBlock>
                {@html `$$F_y = T_3\\sin{\\theta}$$`}
            </MathBlock>
            <MathBlock>
                {@html `$$F_z = T_1 + T_2 + T_3\\cos{\\theta}$$`}
            </MathBlock>
            <MathBlock>
                {@html `$$\\tau_{\\phi} = -r_1T_1 + r_2T_2 + d_3\\sin{\\theta}T_3\\cos{\\theta}$$`}
            </MathBlock>
            <MathBlock>
                {@html `$$\\tau_{\\theta} = r_1T_1 + r_2T_2 - T_3\\cos{\\theta} + a_3T_3\\sin{\\theta}$$`}
            </MathBlock>
            <MathBlock>
                {@html `$$\\tau_{\\psi} = a_1T_1 + a_2T_2 + a_3T_3\\cos{\\theta}+ r_3T_3sin{\\theta}$$`}
            </MathBlock>

            <p>Where those <i>a</i> coefficients are an approximation of motor torque to propeller thrust. We'll get into that later. Be assured that motor torque, motor electrical dynamics, and motor/propeller angular momentum are all modeled in MultiVAC.</p>

            <p>But just look at all that trig! Gross. For those who are counting, that's three cos terms, two sin terms, and one sin*cos term. Very nonlinear.</p>
            <p>All we really need to end up with is three throttle values and and angle. Notice how the tail rotor thrust never shows up on it's own? We can simply adjust our last two elements of the input vector to use the cos and sin components respentively.</p>
            <p>If we ignore the sin*cos term, we have a "linear" system:</p>

            <MathBlock>
                {@html `$$ \\begin{bmatrix} F_x \\\\ F_y \\\\ F_z \\\\ \\tau_{\\phi} \\\\ \\tau_{\\theta} \\\\ \\tau_{\\psi} \\end{bmatrix} = \\begin{bmatrix}
                    0   & 0     & 0     & 0\\\\
                    0   & 0     & 0     & 1\\\\
                    1   & 1     & 1     & 0\\\\
                    -r_1&r_2    &0      &0\\\\
                    r_1 &r_2    &1      &a_3\\\\
                    a_1&a_2     &a_3    & r_3
                    \\end{bmatrix} \\begin{bmatrix}
                    T_1\\\\
                    T_2\\\\
                    T_3\\cos{\\theta}\\\\
                    T_3\\sin{\\theta}
                    \\end{bmatrix}
                $$`}
            </MathBlock>

            <p>That's really as close as you're going to get with a linear model here. There's a lot more to take into account, and the real problem to model is conservation of angular momentum. That tail motor is effectively a rotating disk that changes position relative to the parent body as it moves, which imparts not only a change in angular momentum on the system, but also alters the center of mass of the vehicle. Later in the nonlinear system, we'll add a post-processing to the controller outputs that will map the combination of u3 and u4 using an inverse tangent to obtain the target motor speed and tail deflection. For now though, this will do.</p>
            <p>All of this is already tracked in MultiVAC as part of the subassembly system. Again, the only purpose of this model is to derive a controller.</p>
            <br>
            <hr width="100%">

            <h2>LQR Controller Design</h2>
            <p>Setting up a basic state space model in the body frame of reference:</p>
            <MathBlock>
                {@html `$$ \\dot{x} = A\\vec{x} + B\\vec{u} $$`}
            </MathBlock>

            <MathBlock>
                {@html `$$ \\dot{x}_x = \\begin{bmatrix}
                0 & 0 & 0 & 1 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 \\\\
                0 & 0 & 0 & 0 & 1 & 0 & 0 & 0 & 0 & 0 & 0 & 0 \\\\
                0 & 0 & 0 & 0 & 0 & 1 & 0 & 0 & 0 & 0 & 0 & 0 \\\\
                0 & 0 & 0 & 0 & 0 & 0 & 0 & g & 0 & 0 & 0 & 0 \\\\
                0 & 0 & 0 & 0 & 0 & 0 & -g & 0 & 0 & 0 & 0 & 0 \\\\
                0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 \\\\
                0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 1 & 0 & 0 \\\\
                0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 1 & 0 \\\\
                0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 1 \\\\
                0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 \\\\
                0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 \\\\
                0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 \\\\
                \\end{bmatrix} \\begin{bmatrix}
                x \\\\
                y \\\\
                z \\\\
                \\dot{x} \\\\
                \\dot{y} \\\\
                \\dot{z} \\\\
                \\phi \\\\
                \\theta \\\\
                \\psi \\\\
                \\dot{\\phi} \\\\
                \\dot{\\theta}\\\\
                \\dot{\\psi}\\\\
                \\end{bmatrix}$$`}
            </MathBlock>

            <MathBlock>
                {@html `$$ \\dot{x}_u =

                \\begin{bmatrix} \\frac{1}{m} \\begin{bmatrix}I\\end{bmatrix} & \\begin{bmatrix}0\\end{bmatrix}\\\\ \\begin{bmatrix}0\\end{bmatrix} & \\begin{bmatrix}J\\end{bmatrix}^{-1}  \\end{bmatrix} \\begin{bmatrix}
                    0   & 0     & 0     & 0\\\\
                    0   & 0     & 0     & 1\\\\
                    1   & 1     & 1     & 0\\\\
                    -r_1&r_2    &0      &0\\\\
                    r_1 &r_2    &-r_3      &a_3\\\\
                    a_1&a_2     &a_3    & r_3
                    \\end{bmatrix} \\begin{bmatrix}
                    T_1\\\\
                    T_2\\\\
                    T_3\\cos{\\theta}\\\\
                    T_3\\sin{\\theta}
                    \\end{bmatrix}$$`}
            </MathBlock>

            <p>Looks good. That just leaves calculating the controller, which is fairly straightforward and left as an exercise for the reader. I used Bryson's rule and a brief tuning session to achieve a full-state LQR controller, the results of which are presented down below.</p>\
        </div>
    </ProjectSection> -->

    <ProjectSection imagePosition="left">
        <div slot="image">
            <img loading="lazy" src={pos_plot} alt="Position Plot" />
        </div>
        <div slot="description">
            <h1>Linear Controller Results</h1>
            <hr width='100%'>
            <p>This should be pretty straightforward, with a couple of explanations presented alongside each result. </p>
            <p><b>A brief note on the dynamics model:</b> The dynamics model used to design the controller is a simplified non-linear model. It includes the following:</p>
            <ol>
                <li>Forces and moments calculated on the vehcile in the <b>body</b> frame of reference, and moved in the <b>translational</b> frame of reference (i.e. a tricopter at 90 degrees of pitch and full throttle will move in the +x inertial direction, not the +z direction)</li>
                <li>Tricopter motors have been modeled as a first order system (i.e. there is a delay from controller input command to the motor to the motor outputting that force).</li>
            </ol>
            <p>As you'd expect, tuning is primarily a trade-off between minimization of attitude error and position error. This controller is linearized around a level flight hover, and does not hold for larger disturbances (e.g. a translational error of 10m would induce a greater tilt to the aircraft than it can sustain altitude with). </p>
            <p>This is, however, easily rectified with some nonlinear limiters. Simply restrict the maximum error bounds, which are locked to the rotating body frame, and the issue is resolved.</p>
        </div>
    </ProjectSection>

    <ProjectSection imagePosition="left">
        <div slot="image">
            <img loading="lazy" src={att_plot} alt="Attitude Plot" />
        </div>
        <div slot="description">
            <p>The attitude results take a little bit of explanation. At first, it seems like the positive roll would destabilize the aircraft, but is in fact expected steady state behavior. The thrust from the propellers to maintain altitude creates a yaw moment on the vehicle. To counteract the yaw moment, the tail rotor tilts. This, however, creates a force on the vehicle in the y-direction, which must be counteracted with a vehicle roll. The result is a slightly tilted vehicle with a slight tail deflection. In this, another <i>disadvantage</i> of the tricopter becomes clear - the vehicle is not <i>level</i> when stable!</p>
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
        /* background-color: #000000FF; */
        flex-direction: column;
    }

    .scene-container {
        /* position: relative; */
        top: 0;
        left: 0;
        width: 100%;
        aspect-ratio: 1.0;
        z-index: -1;
    }
</style>