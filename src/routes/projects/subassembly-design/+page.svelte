<title>Subsystem Architecture</title>

<script>

    import Header from '../../Header.svelte';
    import MathBlock from '$lib/MathBlock.svelte';
    import ProjectSection from '$lib/ProjectSection.svelte';

    import * as THREE from 'three';
    import { onMount, onDestroy } from 'svelte';
    import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
    import { base } from '$app/paths';

    let container;
    let scene, camera, renderer, animationFrameId;
    const tricopter_subassembly_diagram = `${base}/assets/trifecta/tricopter_subassembly.png`;
    const helicopter_subassembly_diagram = `${base}/assets/trifecta/helicopter_subassembly.png`;
    const component_diagram = `${base}/assets/trifecta/component.png`;

</script>

<Header/>

<section>

    <ProjectSection imagePosition="right">
        <div slot="description">
            <h1>The Problem with Monoliths</h1>
            <hr width=100%>
            <p>PLACEHOLDER</p>
            
            <p>This works fine for anything that can be reduced to a rigid body dynamics problem, like a quadcopter. Each motor/propeller pair has a counterpart, regardless of what kind of input is being sent to the vehicle. To fit anything more complex than that (e.g. a multibody joint with several pivot points) into a linearized model is reductive.But the moment you try to model something more interesting - say, a tricopter with a tilting tail - the whole thing falls apart.</p>
            
            <p>MultiVAC's subsystem architecture breaks a vehicle down into a graph of interconnected components, each responsible for its own dynamics calculations. A motor doesn't know it's on a tricopter or that it has a propeller on it, just that receives a voltage and has a load torque. A propeller doesn't know it's on a motor, just its relative angular and translational velocities with respect to the free stream. They just expose dynamics quantities through a common interface, and the graph takes care of the rest. </p>
            
            <p>The end result is a user-definable interface of interconnected nonlinear systems. Any user (whether a human designer or iterative script) can modify both architecture and parameters on the fly without requiring a complete rework of the equations of motion or even recompilation of the simulation program.</p>
        </div>
        <div slot="image">
            <img loading="lazy" src={helicopter_subassembly_diagram} alt="Trifecta Diagram" />
        </div>
    </ProjectSection>

    <ProjectSection imagePosition="right"> 
        <div slot="description">
                <h1>SubAssemblies</h1>
                <hr width=100%>
                <p>The fundamental organizational unit in MultiVAC is the SubAssembly. It's a directed graph of components - each node is a part (motor, propeller, ESC, servo), and each edge defines a dependency. Components can receive inputs from other components, and they can be positionally parented to other components.</p>
                
                <p>That distinction is important. A dependency link says "I need data from this component”. A propeller needs the motor's dynamics data to calculate its lift and drag. A parent link says "I am physically attached to this component, and when it moves, I move with it." A propeller is parented to a motor. A motor on the tail is parented to a servo. When the servo deflects, the motor and propeller both rotate with it.</p>
                
                <p>When the SubAssembly collects physics outputs from its components, it walks the parent chain. Each component reports its forces, moments, angular momentum, mass, and inertia in its own local frame. The assembly then transforms each of these up through every parent in the chain until they're all in the assembly frame of reference. If a propeller is mounted on a motor that's mounted on a servo, then the dynamics data of the propeller is walked up the parent chain. For example, not only does the propeller's angular momentum vector gets rotated twice - once into the motor frame, and once into the servo frame - before it reaches the vehicle body, but the translational movement of the propeller mass from the moving servo is also accounted for in the angular momentum calculation. </p>
        </div>
        <div slot="image">
            <img loading="lazy" src={helicopter_subassembly_diagram} alt="Trifecta Diagram" />
        </div>
    </ProjectSection>

    <ProjectSection imagePosition="right">
        <div slot="description">
                <h1>The Component Interface</h1>
                <hr width=100%>
                <p>Every component in the graph implements a common set of behaviors, which defines the interface between them. At its core, the interface asks three questions of each component: </p>
                <ul>
                    <li><p>What are your dynamics properties?</p></li>
                    <li>
                        <p>Do you take signals from the flight controller, and if so what do they do?</p>
                    </li>
                    <li>
                        <p>Do you send signals back to the flight controller, and if so, what are they?</p>
                    </li>
                </ul>
                <p>Physics exchange happens through a common interface, consisting of a structured package containing force, moment, linear momentum, angular momentum,  and other dynamics quantities. Every component produces one of these at each intermediate step. For example, a motor's bus carries its rotor angular momentum and reaction torque. A propeller's bus carries thrust, drag torque, and the angular momentum of its spinning disk. An ESC's bus is null - it produces no physical effect, only electrical output. </p>
        </div>
        <div slot="image">
            <img loading="lazy" src={component_diagram} alt="Trifecta Diagram" />
        </div>
    </ProjectSection>

     <ProjectSection imagePosition="right">
        <div slot="description">
                <h1>A Concrete Example</h1>
                <hr width='100%'>
            <p>Let's put this all together with a real configuration. The tricopter's propulsion SubAssembly consists of twelve components: three motors, three propellers, three ESCs, and a servo on the tail. Setting it up in RHAI looks something like this (simplified for readability):</p>
            
            <pre><code>{`let assembly = SubAssembly(
    "propulsion",       // name
    0.0001,             // dt
    4, 0,               // 4 signal inputs, 0 signal outputs
    components,         // [M0, M1, M2, P0, P1, P2, ESC0, ESC1, ESC2, SERVO]
    [
        [6],            // Motor 0  ← depends on ESC 0
        [7],            // Motor 1  ← depends on ESC 1
        [8],            // Motor 2  ← depends on ESC 2
        [0],            // Prop 0   ← depends on Motor 0
        [1],            // Prop 1   ← depends on Motor 1
        [2],            // Prop 2   ← depends on Motor 2
        [],             // ESC 0    ← no dependencies (signal input)
        [],             // ESC 1    ← no dependencies (signal input)
        [],             // ESC 2    ← no dependencies (signal input)
        [],             // Servo    ← no dependencies (signal input)
    ],
    [0, 0, 0],         // assembly position
    [0, 0, 0],         // assembly rotation
    [
        -1,             // Motor 0: no physical parent
        -1,             // Motor 1: no physical parent
        9,              // Motor 2: parented to SERVO
        0,              // Prop 0:  parented to Motor 0
        1,              // Prop 1:  parented to Motor 1
        2,              // Prop 2:  parented to Motor 2
        -1, -1, -1,    // ESCs: no physical parent
        -1,             // Servo: no physical parent
    ]
);`}</code></pre>
            
            <p>Notice that Motor 2 has a parent link to the servo (index 9). The front motors have no parent - they're bolted to the frame and don't move. But when the servo deflects, Motor 2 (and by extension, Propeller 2) rotate with it. The dependency links, on the other hand, describe data flow: each motor depends on its ESC for voltage, and each propeller depends on its motor for shaft torque.</p>
            
            <p>At each timestep, the SubAssembly iterates through the components in order, distributing signals and collecting outputs. When it comes time to report physics to the vehicle, it walks each component's parent chain, transforming forces, moments, and angular momentum vectors through every intermediate frame. The result is a complete picture of every physical effect on the vehicle body - properly rotated, properly positioned, with no approximations.</p>
        </div>
        <div slot="image">
            <img loading="lazy" src={tricopter_subassembly_diagram} alt="Trifecta Diagram" />
        </div>
    </ProjectSection>

    <div class="shaded-background-no-pic">

        <div class="description">
            <div>
                <h1>Why It Matters</h1>
            </div>
            <hr width='100%'>
            <p>The practical payoff here is flexibility. Adding a new component type means implementing the <b>SubComponentPart</b> trait - nothing else changes. The SubAssembly doesn't care what its components are, only that they satisfy the interface. Swapping a first-order motor model for a full three-phase electrical model is a trait implementation. Adding a reaction wheel or a gimbal is a trait implementation. The vehicle, the integrator, the flight controller - none of them know or care.</p>
            
            <p>More importantly, the parent chain transformation means that <b>moving parts are first-class citizens</b>. The tricopter's tail servo isn't a special case handled with trigonometric substitutions. It's just a component with a rotating reference frame. The system computes the correct angular momentum, the correct inertia tensor shift, and the correct force direction automatically. No approximations, no linearizations, no <code>sin(θ) = θ</code>.</p>
            
            <p>This is the foundation that everything else in MultiVAC is built on. The dynamics model, the controller, the scripting interface - they all depend on the subsystem architecture being correct and general. Get this right, and the rest follows.</p>
        </div>
    </div>


</section>

<style>
    section {
        background-size: cover;
        position: relative;
        z-index: -10;
        min-height: 90vh;
        display: flex;
        flex-direction: column;
    }

    .scene-container {
        top: 0;
        left: 0;
        width: 100%;
        aspect-ratio: 1.0;
        z-index: -1;
    }

    pre {
        background-color: #181c1f;
        border: 1px solid #4AF62644;
        /* border-radius: 8px; */
        padding: 1.5em;
        overflow-x: auto;
        font-size: 0.85em;
        line-height: 1.5;
    }

    code {
        color: #4AF626;
        font-family: 'Courier New', Courier, monospace;
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