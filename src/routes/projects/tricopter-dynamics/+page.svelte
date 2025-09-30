<title>Tricopter Dynamics Model</title>

<script>

    export let data;
    import Header from '../../Header.svelte';
    import MathBlock from '$lib/MathBlock.svelte';
    import { base } from '$app/paths';
    const cadplot = `${base}/assets/trifecta/trifecta_cad.png`;


    import * as THREE from 'three';
    import { onMount, onDestroy } from 'svelte';
    import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

    let container;
    let scene, camera, renderer, animationFrameId;

    function fit() {
            let w = container.clientWidth;
            let h = container.clientHeight;
            renderer.setSize(w, h, false);
            renderer.setPixelRatio(window.devicePixelRatio);
            camera.aspect= w / h;
            camera.updateProjectionMatrix();
        }

    onMount(() => {
        // Initialize scene
        let w = container.clientWidth;
        let h = container.clientHeight;
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(30, w/h, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true, ogarithmicDepthBuffer:true });
        
        

        // const gridHelper = new THREE.GridHelper(100, 10);
        // gridHelper.rotation.x=Math.PI/2; 
        // gridHelper.position.x -=2.0;
        // scene.add( gridHelper );

        fit();
        // ro = new ResizeObserver(fit);
        // ro.observe(container);
        // Set size and append to container
        // renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);
        const controls = new OrbitControls( camera, renderer.domElement );

        // renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(w, h);
        camera.up.set(0,0,1);
        let in2mm = 25.4;

        camera.position.setZ(4);
        camera.position.setX(4);
        camera.position.setY(4);
        const camera_target_pos = new THREE.Vector3(0, 0, 0.0);
        camera.lookAt(camera_target_pos);
        // let in2mm = 1;

        // renderer.render(scene, camera);
        // const axesHelper = new THREE.AxesHelper( 15.0 );
        // scene.add( axesHelper );

        // const loader = OBJLoader();
        // loader.load("assets/blizzard.obj");

        const blue = 0x3333FF;
        const red = 0xFF3333;
        const green = 0x4AF626;
        const black = 0x000000;

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

        
        // Store propeller references for animation
        const propellers = [];
        const tail_anim = [];

        function handleResize() {
            fit()
        }

        window.addEventListener('resize', fit);



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
            // const solidMesh = new THREE.Mesh(geometry, materials.solid);
            // group.add(solidMesh);
            
            // Create a slightly larger wireframe mesh
            const wireframeGeometry = geometry.clone();
            wireframeGeometry.scale(mesh_scale, mesh_scale, mesh_scale);
            const wireframeMesh = new THREE.Mesh(wireframeGeometry, materials.wireframe);
            group.add(wireframeMesh);

            const fresnel_geometry = geometry.clone();
            fresnel_geometry.scale(mesh_scale, mesh_scale, mesh_scale);
            const fresnelMesh = new THREE.Mesh(fresnel_geometry, materials.fresnel);
            group.add(fresnelMesh);
            
            return group;
        }

        let propellerGeometry = null;
        const loader = new OBJLoader();

        function createPropellerGroup(config, scale) {
            const propellerGroup = new THREE.Group();
            const box = new THREE.Box3().setFromObject(propellerGroup);
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
                config.position.x , 
                config.position.y, 
                config.position.z
            );
            
            // Store the rotation direction with the group
            propellerGroup.userData.clockwise = config.clockwise;
            
            return propellerGroup;
        }

        loader.load(
            `${base}/assets/trifecta/TopShell.obj`,
            function(top_shell_geom) {
                // propellerGeometry = tail_geom;
                const trifecta_group = new THREE.Group();
                const top_shell_group = new THREE.Group();
                top_shell_geom.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        normaliseGeometry(child.geometry);
                        const solidWireframeMesh = createSolidWireframeMesh(
                                    child.geometry, 
                                    createObjectMaterials(green)
                                );
                    top_shell_group.add(solidWireframeMesh);
                    }
                });
                top_shell_group.scale.setScalar(4.5);
                trifecta_group.add(top_shell_group);

                // LOAD BOTTOM SHELL
                loader.load(
                    `${base}/assets/trifecta/BotShell.obj`,
                    function(bot_shell_geom) {
                        const bot_shell_group = new THREE.Group
                        bot_shell_geom.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                normaliseGeometry(child.geometry);
                                const solidWireframeMesh = createSolidWireframeMesh(
                                            child.geometry, 
                                            createObjectMaterials(green)
                                        );
                            bot_shell_group.add(solidWireframeMesh);
                            bot_shell_group.scale.setScalar(4.18);

                            bot_shell_group.position.set(-0.3, 0.0, -0.25-0.375);


                            trifecta_group.add(bot_shell_group);
                            }
                        });
                    }
                );

                loader.load(
                    `${base}/assets/trifecta/FrontArmL.obj`,
                    function(front_arm_l_geom) {
                        const front_arm_l_group = new THREE.Group();
                        front_arm_l_geom.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                normaliseGeometry(child.geometry);
                                const solidWireframeMesh = createSolidWireframeMesh(
                                            child.geometry, 
                                            createObjectMaterials(green)
                                        );
                            front_arm_l_group.add(solidWireframeMesh);
                            front_arm_l_group.scale.setScalar(3.8);
                            front_arm_l_group.position.set(-3.96, -5.47, -0.05);

                            trifecta_group.add(front_arm_l_group);
                            }
                        });
                    }
                );


                loader.load(
                    `${base}/assets/trifecta/FrontArmR.obj`,
                    function(front_arm_l_geom) {
                        const front_arm_l_group = new THREE.Group();
                        front_arm_l_geom.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                normaliseGeometry(child.geometry);
                                const solidWireframeMesh = createSolidWireframeMesh(
                                            child.geometry, 
                                            createObjectMaterials(green)
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
                                normaliseGeometry(child.geometry);
                                const solidWireframeMesh = createSolidWireframeMesh(
                                            child.geometry, 
                                            createObjectMaterials(green)
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
                loader.load(
                    `${base}/assets/trifecta/TailGear.obj`,
                    function(tail_gear_geom) {
                        const tail_gear_group = new THREE.Group();
                        tail_gear_geom.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                normaliseGeometry(child.geometry);
                                const solidWireframeMesh = createSolidWireframeMesh(
                                            child.geometry, 
                                            createObjectMaterials(green)
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


                loader.load(
                    `${base}/assets/trifecta/Tail.obj`,
                    function(tail_geom) {
                        const tail_piece_geom = new THREE.Group();
                        tail_geom.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                normaliseGeometry(child.geometry);
                                const solidWireframeMesh = createSolidWireframeMesh(
                                            child.geometry, 
                                            createObjectMaterials(green)
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

                // Back Slide Arm
                loader.load(
                    `${base}/assets/prop.obj`,
                    function(prop_geom) {
                        const prop_group = new THREE.Group();
                        prop_geom.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // normaliseGeometry(child.geometry);
                                const solidWireframeMesh = createSolidWireframeMesh(
                                            child.geometry, 
                                            createObjectMaterials(green)
                                        );
                            prop_group.add(solidWireframeMesh);
                            prop_group.scale.setScalar(3.0);
                            prop_group.position.set(-6, -8.7, 0.5);
                            propellers.push(prop_group);
                            trifecta_group.add(prop_group);
                            }
                        });
                    }
                );

                loader.load(
                    `${base}/assets/prop.obj`,
                    function(prop_geom) {
                        const prop_group = new THREE.Group();
                        prop_geom.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // normaliseGeometry(child.geometry);
                                const solidWireframeMesh = createSolidWireframeMesh(
                                            child.geometry, 
                                            createObjectMaterials(green)
                                        );
                            prop_group.add(solidWireframeMesh);
                            prop_group.scale.setScalar(3.0);
                            prop_group.position.set(-6, 8.7, 0.5);
                            propellers.push(prop_group);
                            trifecta_group.add(prop_group);
                            }
                        });
                    }
                );

                loader.load(
                    `${base}/assets/prop.obj`,
                    function(prop_geom) {
                        const prop_group = new THREE.Group();
                        prop_geom.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // normaliseGeometry(child.geometry);
                                const solidWireframeMesh = createSolidWireframeMesh(
                                            child.geometry, 
                                            createObjectMaterials(green)
                                        );
                            prop_group.add(solidWireframeMesh);
                            prop_group.scale.setScalar(3.0);
                            prop_group.position.set(2.2, 0, 1);
                            propellers.push(prop_group);
                            tail_group.add(prop_group);
                            }
                        });
                    }
                );


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

        let propellerSpeed = 0.1;  // Adjust for faster/slower rotation
        let ticker = 0;
        const ticker_max = 3_600;

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
            let prop_ticker = 0;
            propellers.forEach(propGroup => {
                const check = prop_ticker % 2 == 1;
                const direction = check ? 1 : -1;
                prop_ticker+=1;
                if (prop_ticker > 3) {
                    prop_ticker = 0;
                }
                propGroup.rotation.z += propellerSpeed * direction;
            });

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
            )

            // tail_anim.forEach(item => {
            //     item.rotation.x += 0.01;
            // });

            // tail_group.rotation.z = 0;
            controls.update();
            renderer.render( scene, camera);
            ticker += 1;
            if (ticker >= ticker_max) {
                ticker = 0
            }
        }

        animate()

  });

  onDestroy(() => {
    // Clean up Three.js resources
    ro?.disconnect();
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

<!-- <div bind:this={container} class="scene-container"></div> -->

<section>

    <div class="shaded-background">

        <div class="description">
            <h1>What's in a drone?</h1>
            <h3><i>NOTE: THIS PAGE IS UNDER CONSTRUCTION</i></h3>
            <p>At the time of writing, I have been developing MultiVAC for about a year and a half now, and 6DOFs more generally for much longer than that. Up until now, I have been using my undergraduate capstone project - the ATP XW Blizzard - to demonstrate the accuracy of the simulation. It’s a good model - its dynamics model is relatively mature for the state, with a significant body of analysis backing that up. It is, however, only a <b><i>paper aircraft</i></b>. No prototype has been made and there will never be one. Perhaps I’ll make a smaller scale prototype one day, but I’m starting to find the static multicopter family to be a little dry from a dynamics standpoint. Too often will I read a paper on quadcopter dynamics only to find the dreaded `sin(theta) = theta` approximation that simplifies the problem beyond any practical interest.</p>
            <br>
            <p>I will be using a small tricopter for the next few rounds of demonstrations. I built one when I was 16, and was as fascinated with it then as I am now. The frame in question is the Quanum <i>Trifecta</i>, a collapsable design that folds up into something pocket sized, but with enough power available to outspeed most other aircraft its size. </p>
            <br>
            <p>Unlike a quadcopter, it is <b>not</b> a symmetric aircraft. For the unfamiliar, the tricopter is laid out like a Y. It has two fixed motors in the front, and a third motor on a swivel in the back. The aircraft’s yaw (think spinning it like a disk) is primarily controlled by swiveling the tail motor in the back. This gives it a clear front, and it is better operating in some directions than others. A quadcopter generally has no preference. A tricopter behaves more like a fixed-wing aircraft in flight than a traditional quadcopter, and tends to have more ‘swoopy’ flight characteristics. From an academic standpoint, it’s much more non-linear than its quadcopter counterpart. That tail rotor rotates between +/- 45 degrees, which is not easily linearizable. The tail rotor has its own angular momentum, which is in a constantly changing plane, and the movement of the mass of the tail relative to the parent body is itself a non-linear angular momentum vector.</p>
            <br>

        </div>

        <div class='image-reel'>
            <div bind:this={container} class="scene-container"></div>
        </div>
        
    </div>

    <div class="shaded-background-alt">

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
                {@html `$F_x = 0$`}
            </MathBlock>
            <MathBlock>
                {@html `$F_y = T_3\\sin{\\theta}$`}
            </MathBlock>
            <MathBlock>
                {@html `$F_z = T_1 + T_2 + T_3\\cos{\\theta}$`}
            </MathBlock>
            <MathBlock>
                {@html `$\\tau_{\\phi} = -r_1T_1 + r_2T_2 + d_3\\sin{\\theta}T_3\\cos{\\theta}$`}
            </MathBlock>
            <MathBlock>
                {@html `$\\tau_{\\theta} = r_1T_1 + r_2T_2 - T_3\\cos{\\theta} + a_3T_3\\sin{\\theta}$`}
            </MathBlock>
            <MathBlock>
                {@html `$\\tau_{\\psi} = a_1T_1 + a_2T_2 + a_3T_3\\cos{\\theta}+ r_3T_3sin{\\theta}$`}
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

            <p>Looks good. That just leaves calculating the controller, which is fairly straightforward and left as an exercise for the reader. </p>
            <p><i>IF YOU'RE READING THIS, THIS PROJECT IS STILL BEING WORKED ON. PLEASE CHECK BACK LATER OR CONTACT <a href="mailto:jack.rhys.comey@gmail.com">JACK.RHYS.COMEY@GMAIL.COM</a>, OR <a href="mailto:jrcomey@ucla.edu">JRCOMEY@UCLA.EDU</a>. THANK YOU!</i></p>
            
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
            flex-direction: column;
        }
        .shaded-background-alt{
            display: flex;
            flex-direction: column;
        }
    }

</style>