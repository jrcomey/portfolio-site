<title>Tricopter Dynamics Model</title>

<script>

    import Header from '../../Header.svelte';
    import MathBlock from '$lib/MathBlock.svelte';
    const pos_plot = `${base}/assets/trifecta/Trifecta_0_pos_plot.png`
    // const att_plot = `${base}/assets/trifecta/Trifecta_0_att_plot.png`


    import * as THREE from 'three';
    import { onMount, onDestroy } from 'svelte';
    import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
    import { base } from '$app/paths';

    const diag = `${base}/assets/bldc/motordiag2.png`;


    let container;
    let scene, camera, renderer, animationFrameId;


    onMount(() => {
        // Initialize scene
        let destroyed = false;
        let w = container.clientWidth;
        let h = container.clientHeight;
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(20, w/h, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true});

        function fit() {
            if (!renderer || !camera || !container) return;
            let w = container.clientWidth;
            let h = container.clientHeight;
            renderer.setSize(w, h, false);
            renderer.setPixelRatio(window.devicePixelRatio);
            camera.aspect= w / h;
            camera.updateProjectionMatrix();
        }
        container.appendChild(renderer.domElement);
        // const controls = new OrbitControls( camera, renderer.domElement );

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(w, h);
        camera.up.set(0,0,1);
        let in2mm = 25.4;

        camera.position.setZ(4);
        camera.position.setX(4);
        camera.position.setY(4);
        const camera_target_pos = new THREE.Vector3(0, 0, 0.0);
        camera.lookAt(camera_target_pos);

        // Color breakdown
        const blue = 0x3333FF;
        const red = 0xFF3333;
        const green = 0x4AF626;
        const black = 0x000000;

        // Store propeller references for animation
        const propellers = [];
        // const tail_anim = [];

        window.addEventListener('resize', fit);
        let propellerGeometry = null;
        const loader = new OBJLoader();

        function MeshFresnelMaterial(fresnelColor, baseColor, opts = {}) {
            const {
                amount = 2.0,
                offset = 0.2,
                intensity = 4,
                alphaMix = 1.0 // 0 = pure base, 1 = full rim mix
            } = opts;

            return new THREE.ShaderMaterial({
                uniforms: {
                uFresnelColor: { value: new THREE.Color(fresnelColor) },
                uBaseColor:    { value: new THREE.Color(0x000000) },
                uAmount:       { value: amount },
                uOffset:       { value: offset },
                uIntensity:    { value: intensity },
                uAlphaMix:     { value: alphaMix }
                },
                vertexShader: /* glsl */`
                varying vec3 vWPos;
                varying vec3 vWNorm;
                void main() {
                    vec4 wp   = modelMatrix * vec4(position, 1.0);
                    vWPos     = wp.xyz;
                    vWNorm    = normalize(mat3(transpose(inverse(modelMatrix))) * normal);
                    gl_Position = projectionMatrix * viewMatrix * wp;
                }
                `,
                fragmentShader: /* glsl */`
                uniform vec3  uFresnelColor, uBaseColor;
                uniform float uAmount, uOffset, uIntensity, uAlphaMix;
                varying vec3  vWPos, vWNorm;

                void main() {
                    //vec3  N = normalize(vWNorm);
                    //vec3  V = normalize(cameraPosition - vWPos);
                    //float fres = uOffset + (1.0 - uOffset) * pow(1.0 - max(dot(N, V), 0.0), uAmount);

                    //vec3 rim  = uFresnelColor * fres * uIntensity;
                    //vec3 col  = mix(uBaseColor, rim, clamp(fres * uAlphaMix, 0.0, 1.0));

                    //gl_FragColor = vec4(col, 1.0); // opaque

                    vec3 N = normalize(vWNorm);
                    vec3 V = normalize(cameraPosition - vWPos);
                    float dotNV = clamp(dot(N, V), 0.0, 1.0);

                    // Params
                    float threshold = 0.97;  // where rim starts
                    float width     = 0.06;  // softness of transition
                    float curve     = 2.0;   // >1 harder center, <1 softer

                    // Smooth rim mask
                    float x = 1.0 - dotNV;
                    float rim = smoothstep(threshold - width, threshold + width, x);
                    rim = pow(rim, curve);   // optional shaping

                    vec3 col = uFresnelColor * rim * uIntensity;  // base stays black
                    gl_FragColor = vec4(col, 1.0);
                }
                `,
                transparent: true,
                depthWrite: true,
                blending: THREE.AdditiveBlending,
                side: THREE.FrontSide,
                // polygonOffset: true,
                // polygonOffsetFactor: 5,
                // polygonOffsetUnits: 5.0,
            });
        }

        // Opaque rim highlight (black base)
        function FresnelRimMaterial(color, {bias=0.4, scale=1.0, power=0.2, width=0.8, curve=1.5, intensity=3.0} = {}) {
        return new THREE.ShaderMaterial({
            uniforms: {
            uRim:   { value: new THREE.Color(color) },
            uBias:  { value: bias },   // shifts start of rim
            uScale: { value: scale },  // strength before shaping
            uPower: { value: power },  // falloff exponent
            uWidth: { value: width },  // smooth edge width
            uCurve: { value: curve },  // gamma on mask
            uInt:   { value: intensity }
            },
            vertexShader: /*glsl*/`
            varying vec3 vWPos, vWNorm;
            void main(){
                vec4 wp = modelMatrix * vec4(position,1.0);
                vWPos = wp.xyz;
                vWNorm = normalize(mat3(transpose(inverse(modelMatrix))) * normal);
                gl_Position = projectionMatrix * viewMatrix * wp;
            }
            `,
            fragmentShader: /*glsl*/`
            uniform vec3 uRim;
            uniform float uBias, uScale, uPower, uWidth, uCurve, uInt;
            varying vec3 vWPos, vWNorm;
            void main(){
                vec3  N = normalize(vWNorm);
                vec3  V = normalize(cameraPosition - vWPos);
                float dotNV = clamp(dot(N, V), 0.0, 1.0);

                // Fresnel core
                float fres = uBias + uScale * pow(1.0 - dotNV, uPower);

                // Soft rim band around the edge
                float x = 1.0 - dotNV; // 0=center, 1=edge
                float rim = smoothstep(1.0 - uWidth, 1.0, x); // softness
                rim = pow(rim * fres, uCurve);                // shape

                vec3 col = uRim * rim * uInt; // base is black
                gl_FragColor = vec4(col, 1.0);
            }
            `,
            // side: THREE.DoubleSide,
            transparent: true,
            depthWrite: true,
            // blending: THREE.NoBlending,
            // toneMapped: false
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1,
        });
        }

        // Function to create materials for a specific color
        function createObjectMaterials(color) {
            let fresnel = new MeshFresnelMaterial(color, 0x000000);
            fresnel.toneMapped=false;

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
                }),
                fresnel: new FresnelRimMaterial(color)
            };
        }

        function normaliseGeometry(geom) {
            // make sure bounds are up to date
            geom.computeBoundingBox();

            // 1. centre vertices at origin
            const c = geom.boundingBox.getCenter(new THREE.Vector3()).negate();
            geom.translate(c.x, c.y, c.z);      // mutates position attribute

            // 2. uniform scale so largest edge spans 2 units  (-1 → +1)
            const size = geom.boundingBox.getSize(new THREE.Vector3());
            const k    = 2 / Math.max(size.x, size.y, size.z);
            geom.scale(k, k, k);

            // 3. done – geometry now lives inside [-1,1]
            geom.computeBoundingBox();          // optional: refresh meta
        }

        // Function to create a solid wireframe mesh from a geometry
        function createSolidWireframeMesh(geometry, materials, mesh_scale = 1.0001) {
            const group = new THREE.Group();
            
            // Create the solid mesh
            const solidMesh = new THREE.Mesh(geometry, materials.solid);
            group.add(solidMesh);
            
            // Create a slightly larger wireframe mesh
            const wireframeGeometry = geometry.clone();
            wireframeGeometry.scale(mesh_scale, mesh_scale, mesh_scale);
            const wireframeMesh = new THREE.Mesh(wireframeGeometry, materials.wireframe);
            group.add(wireframeMesh);

            // const fresnel_geometry = geometry.clone();
            // fresnel_geometry.scale(mesh_scale, mesh_scale, mesh_scale);
            // const fresnelMesh = new THREE.Mesh(fresnel_geometry, materials.fresnel);
            // group.add(fresnelMesh);
            
            return group;
        }

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
                propGroup.rotation.z += propellerSpeed * Math.sin(ticker / 72) * direction;
            });

            // // Swing tail back and forth
            // if (ticker % 360 < 180) {
            //     tail_anim.forEach(item => {
            //             item.rotation.x = Math.sin((ticker/180)*2*3.1415);
            //         }
            //     )
            // }

            camera.position.set(
                35, 0, 25
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
                            normaliseGeometry(child.geometry);
                            const solidWireframeMesh = createSolidWireframeMesh(
                                        child.geometry, 
                                        createObjectMaterials(green)
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
                            normaliseGeometry(child.geometry);
                            const solidWireframeMesh = createSolidWireframeMesh(
                                        child.geometry, 
                                        createObjectMaterials(green)
                                    );
                        rotor_group.add(solidWireframeMesh);
                        rotor_group.scale.setScalar(1.0);
                        rotor_group.position.set(0, 0, 1.0);

                        propellers.push(rotor_group);
                        motor_group.add(rotor_group);
                        }
                    });
                }
            );
            return motor_group;
        }

        const motor = load_motor_and_prop();
        motor.rotateY(0.5*3.14159);
        motor.rotateX(0.25*3.14159)
        motor.scale.setScalar(5.0);
        motor.position.set(-1.0, 2, 0.0)
        scene.add(motor);

        // loader.load(
        //     `${base}/assets/trifecta/TopShell.obj`,
        //     function(top_shell_geom) {
        //         // propellerGeometry = tail_geom;
        //         const trifecta_group = new THREE.Group();
        //         const top_shell_group = new THREE.Group();

        //         // Top Shell
        //         top_shell_geom.traverse((child) => {
        //             if (child instanceof THREE.Mesh) {
        //                 normaliseGeometry(child.geometry);
        //                 const solidWireframeMesh = createSolidWireframeMesh(
        //                             child.geometry, 
        //                             createObjectMaterials(green)
        //                         );
        //             top_shell_group.add(solidWireframeMesh);
        //             }
        //         });
                
        //         top_shell_group.scale.setScalar(4.5);
        //         trifecta_group.add(top_shell_group);
        //         // Bottom Shell
        //         loader.load(
        //             `${base}/assets/trifecta/BotShell.obj`,
        //             function(bot_shell_geom) {
        //                 const bot_shell_group = new THREE.Group
        //                 bot_shell_geom.traverse((child) => {
        //                     if (child instanceof THREE.Mesh) {
        //                         normaliseGeometry(child.geometry);
        //                         const solidWireframeMesh = createSolidWireframeMesh(
        //                                     child.geometry, 
        //                                     createObjectMaterials(green)
        //                                 );
        //                     bot_shell_group.add(solidWireframeMesh);
        //                     bot_shell_group.scale.setScalar(4.18);

        //                     bot_shell_group.position.set(-0.3, 0.0, -0.25-0.375);


        //                     trifecta_group.add(bot_shell_group);
        //                     }
        //                 });
        //             }
        //         );

        //         // Front L Arm
        //         loader.load(
        //             `${base}/assets/trifecta/FrontArmL.obj`,
        //             function(front_arm_l_geom) {
        //                 const front_arm_l_group = new THREE.Group();
        //                 front_arm_l_geom.traverse((child) => {
        //                     if (child instanceof THREE.Mesh) {
        //                         normaliseGeometry(child.geometry);
        //                         const solidWireframeMesh = createSolidWireframeMesh(
        //                                     child.geometry, 
        //                                     createObjectMaterials(green)
        //                                 );
        //                     front_arm_l_group.add(solidWireframeMesh);
        //                     front_arm_l_group.scale.setScalar(3.8);
        //                     front_arm_l_group.position.set(-3.96, -5.47, -0.05);

        //                     trifecta_group.add(front_arm_l_group);
        //                     }
        //                 });
        //             }
        //         );

        //         // Front R Arm
        //         loader.load(
        //             `${base}/assets/trifecta/FrontArmR.obj`,
        //             function(front_arm_l_geom) {
        //                 const front_arm_l_group = new THREE.Group();
        //                 front_arm_l_geom.traverse((child) => {
        //                     if (child instanceof THREE.Mesh) {
        //                         normaliseGeometry(child.geometry);
        //                         const solidWireframeMesh = createSolidWireframeMesh(
        //                                     child.geometry, 
        //                                     createObjectMaterials(green)
        //                                 );
        //                     front_arm_l_group.add(solidWireframeMesh);
        //                     front_arm_l_group.scale.setScalar(3.8);
        //                     front_arm_l_group.position.set(-3.96, 5.47, -0.05);

        //                     trifecta_group.add(front_arm_l_group);
        //                     }
        //                 });
        //             }
        //         );

        //         // Back Slide Arm
        //         loader.load(
        //             `${base}/assets/trifecta/BackSlide.obj`,
        //             function(back_slide_geom) {
        //                 const back_slide_group = new THREE.Group();
        //                 back_slide_geom.traverse((child) => {
        //                     if (child instanceof THREE.Mesh) {
        //                         normaliseGeometry(child.geometry);
        //                         const solidWireframeMesh = createSolidWireframeMesh(
        //                                     child.geometry, 
        //                                     createObjectMaterials(green)
        //                                 );
        //                     back_slide_group.add(solidWireframeMesh);
        //                     back_slide_group.scale.setScalar(3.0);
        //                     back_slide_group.position.set(4, -0.35, -0.5);

        //                     trifecta_group.add(back_slide_group);
        //                     }
        //                 });
        //             }
        //         );



        //         const tail_group = new THREE.Group();
        //         // Tail Gear
        //         loader.load(
        //             `${base}/assets/trifecta/TailGear.obj`,
        //             function(tail_gear_geom) {
        //                 const tail_gear_group = new THREE.Group();
        //                 tail_gear_geom.traverse((child) => {
        //                     if (child instanceof THREE.Mesh) {
        //                         normaliseGeometry(child.geometry);
        //                         const solidWireframeMesh = createSolidWireframeMesh(
        //                                     child.geometry, 
        //                                     createObjectMaterials(green)
        //                                 );
        //                     tail_gear_group.add(solidWireframeMesh);
        //                     tail_gear_group.scale.setScalar(0.54);
        //                     // tail_gear_group.position.set(7.25, -0.0, -0.45);

        //                     tail_group.add(tail_gear_group);
        //                     // tail_anim.push(tail_gear_group);
        //                     }
        //                 });
        //             }
        //         );

        //         // Tail Rotor Mount
        //         loader.load(
        //             `${base}/assets/trifecta/Tail.obj`,
        //             function(tail_geom) {
        //                 const tail_piece_geom = new THREE.Group();
        //                 tail_geom.traverse((child) => {
        //                     if (child instanceof THREE.Mesh) {
        //                         normaliseGeometry(child.geometry);
        //                         const solidWireframeMesh = createSolidWireframeMesh(
        //                                     child.geometry, 
        //                                     createObjectMaterials(green)
        //                                 );
        //                     tail_piece_geom.add(solidWireframeMesh);
        //                     tail_piece_geom.scale.setScalar(1.25);
        //                     tail_piece_geom.position.set(1.76, 0, 0)
        //                     // tail_piece_geom.position.set(7.25, -0.0, -0.45);

        //                     tail_group.add(tail_piece_geom);
        //                     }
        //                 });
        //             }
        //         );

        //         // Front L Motor
        //         const front_l_group = load_motor_and_prop();
        //         front_l_group.position.set(-5.65, -8.45, 0.5)
        //         trifecta_group.add(front_l_group);

        //         // Front R Motor
        //         const front_r_group = load_motor_and_prop();
        //         front_r_group.position.set(-5.65, 8.45, 0.5);
        //         trifecta_group.add(front_r_group);

        //         // Tail Motor
        //         const tail_motor = load_motor_and_prop();
        //         tail_motor.position.set(2.1, 0.0, 0.8);
        //         // tail_anim.push(tail_motor);
        //         tail_group.add(tail_motor);
        //         tail_group.position.set(7.25, 0.0, -0.45);
        //         tail_anim.push(tail_group);
        //         trifecta_group.add(tail_group);


                
        //         const box = new THREE.Box3().setFromObject(trifecta_group);
        //         const center = box.getCenter(new THREE.Vector3());
        //         const size = box.getSize(new THREE.Vector3());
        //         const maxDim = Math.max(size.x, size.y, size.z);
        //         // const scale = 11.67/maxDim;
        //         // aircraftGroup.scale.setScalar(scale);

        //         trifecta_group.position.set(0.0, 0.0, 0.0)
        //         scene.add(trifecta_group)

        //         // scene.add(trifecta_group)
        //     },
        // );        

        let propellerSpeed = 0.08;  // Adjust for faster/slower rotation
        let ticker = 0;
        const ticker_max = 3_600;

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

<section>

    <div class="shaded-background">

        <div class="description">
            <h1>Motoring Along</h1>
            <!-- <h3><i>NOTE: THIS PAGE IS UNDER CONSTRUCTION</i></h3> -->
            <p>There are perhaps as many different kinds of electric motor as there are uses for them. A few basic principles remain constant though: each motor uses a difference in two magnetic fields (at least one of which is supplied by an electric current) to create a torque on the rotor. A brushed DC motor, for example, takes an input DC current, applies the voltage through physical 'brushes' (typically graphite or similar) to create an oscillating electric current that rotates a set of permanent magnets. There are AC motors, which use an alternating current input rather than DC, which doesn't require brushes. Speakers are technically motors too, except instead of rotating, they move linearly.</p>
            <br>
            <p>In my opinion, the most useful of these are the brushless DC motor, or BLDC. Deceptively named, the brushless DC motor <i>actually</i> uses AC current. It typically uses a DC power supply (e.g. a battery) and generates the current waveform needed through a seperate circuit (either an ESC or a servo controller). Brushless DC motors are mechanically simple, robust, and used for everything from drone propulsion to servo controls.</p>
        </div>

        <div class='image-reel'>
            <div bind:this={container} class="scene-container"></div>
        </div>
    </div>

    <div class="shaded-background-alt">
        <div class="image-reel">
            <img src={diag} alt="MotorDiagram" />
        </div>

        <div class="description">
            <h1>Model Derivation</h1>
            <p>Mathworks has a neat little derivation of a three-phase model <a href="https://www.mathworks.com/help/sps/ref/bldc.html">here</a>, but in this article we'll be modeling a single-phase motor. Most BLDC motors are three-phase, but for the sake of computational simplicity, we'll use one.</p>
            <br>
            <p>A BLDC motor takes in terminal voltages and outputs a torque. The terminal voltage induces a current, and the torque causes an acceleration on the motor, changing its position. The motor will also have some kind of load torque from whatever it is driving. The states and inputs of the motor are therefore given as:</p>
            <MathBlock>{@html `$$ \\vec{x} = \\begin{bmatrix} i \\\\ \\theta \\\\ \\dot{\\theta} \\end{bmatrix} = \\begin{bmatrix} i \\\\ \\theta \\\\ \\omega \\end{bmatrix}, \\qquad \\vec{u} = \\begin{bmatrix} V_{in} \\\\ \\tau_{load} \\end{bmatrix} $$`}</MathBlock>
            <p>The diagram on the left (or above, on mobile) is a block diagram of a single phase motor. The input voltage is applied to the windings, which has a resistance and an inductance. This produces a current, <i>i</i>, which can be converted to a torque value using the motor torque constant K_t. The load torque is subtracted from the motor torque, as well as viscous friction, and the remaining torque is applied to the motor rotational inertia, yielding the motor rate. When a motor spins at a given speed, the rotation of the permanent magnets around the windings produces an opposing voltage, called back electromotive force (BEMF), which is subtracted from the initial input voltage. In state space form, this is fairly simple:</p>
            <MathBlock>
                {@html `$$ \\dot{\\vec{x}} = \\begin{bmatrix} \\frac{di}{dt} \\\\ \\omega \\\\ \\alpha \\end{bmatrix} =  \\begin{bmatrix} -\\frac{R}{L} & 0 & -\\frac{K_v}{L} \\\\ 0 & 0 & 1 \\\\ \\frac{K_t}{J} & 0 & -\\frac{B}{J} \\end{bmatrix} \\begin{bmatrix} i \\\\ \\theta \\\\ \\omega \\end{bmatrix} + \\begin{bmatrix} \\frac{1}{L} & 0 & 0 \\\\ 0 & 0 & \\frac{1}{J} \\end{bmatrix} \\begin{bmatrix} V_{in} \\\\ \\tau_{load} \\end{bmatrix}   $$`}
            </MathBlock>
        </div>
    </div>

    <!-- <div class="shaded-background-alt">

        <div class='image-reel'>
            <img src={cadplot} alt="ATP-XW Blizzard Render" />
        </div>

        <div class="description">
            <h1>Building the model </h1>
            <p>Well, in order to get started, we’ll need mass and inertial properties to get started. We could weigh each component and get its position, and create a rough inertial model by finding the center of grav- </p>
            <p>Oh, or we could just CAD it. That wasn’t that hard, actually.</p>
            <p>A quick 3D print verifies the model is appropriately dimensioned compared to the real aircraft. There’s a few differences but that’ll do.</p>
            <p>Not all inertial properties of the aircraft are static. That tail moves, and as it moves the moment of inertia will change with it. A good time to show off the dynamic mass and inertia calculation capabilities in MultiVAC for nonlinear models.</p>
        </div>
    </div>


    <div class="shaded-background-no-pic">

        <div class="description">
            <h1>A Quick Controller</h1>
            <p>It’s a nonlinear model, yes, but to create a controller for it and get some nice visuals, we will have to linearize it to some degree. Just for the controller, I promise.</p>
            <p>We’ll be using a relatively straightforward state space model in six degrees of freedom. The A matrix is uninteresting and left as an exercise to the reader. The tricopter in question has four pinouts - PWM speed control outputs to each of the three motors, and a fourth PWM output to the tail servo. In vector form it is as follows:</p>
            <MathBlock>
                {@html `$$\\vec{u} = \\begin{bmatrix} \\omega_1 \\\\ \\omega_2 \\\\ \\omega_3 \\\\ \\theta_{s} \\end{bmatrix} \\propto \\begin{bmatrix} T_1 \\\\ T_2 \\\\ T_3 \\\\ \\theta_{s} \\end{bmatrix}$$`}
            </MathBlock>
            <br>
            <hr width="100%">
        </div>

        <div class="description">
            <h2>Linearization</h2>
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
        </div>

        <div class="description">
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

            <p>Looks good. That just leaves calculating the controller, which is fairly straightforward and left as an exercise for the reader. I used Bryson's rule and a brief tuning session to achieve a full-state LQR controller, the results of which are presented down below.</p>
        </div>
    </div> -->


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

    .shaded-background {
        background-color: #0f1112CC;
        border-radius: 20px;
        display: grid;
        grid-template-columns: 4fr 3fr;
        margin: 5% 0%;
        align-content: left;
    }

    .shaded-background-no-pic {
        background-color: #0f1112CC;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        margin: 5% 0%;
        align-content: left;
    }

    b {
        color: #00FFFF;
    }

    .shaded-background-alt {
        background-color: #0f1112CC;
        border-radius: 20px;
        display: grid;
        grid-template-columns: 3fr 4fr;
        margin: 5% 0%;
        align-content: left;
    }
    .image-reel {
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
        }

    @media (max-width: 80em){
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