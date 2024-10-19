import './app.css'

import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
})


renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.up.set(0,0,1);
camera.position.setZ(1);
camera.position.setX(-7);
camera.position.setY(-5);
const camera_target_pos = new THREE.Vector3(-1.5, 0.0, 0.0);
camera.lookAt(camera_target_pos);

renderer.render(scene, camera);

// const loader = OBJLoader();
// loader.load("assets/blizzard.obj");


// Create wireframe material
const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xFF6347,
    wireframe: true,
    wireframeLinewidth: 1
});

const bodyMaterial = new THREE.MeshBasicMaterial({
    color: 0x4AF626,  // Phosphor green for body
    wireframe: true,
    wireframeLinewidth: 1
});

const propellerMaterial = new THREE.MeshBasicMaterial({
    color: 0xFF0000,  // Slightly different green for propellers
    wireframe: true,
    wireframeLinewidth: 1
});

// Store propeller references for animation
const propellers = [];

// Define propeller positions relative to aircraft center
// You'll need to adjust these coordinates based on your model
const propellerPositions = [
    { x: 4.220, y: 2.982, z: 1.041+0.15 },      // BRT
    { x: 4.220, y: 2.982, z: 1.041-0.15 },      // BRB
    { x: 4.220, y: -2.982, z: 1.041+0.15 },     // BLT
    { x: 4.220, y: -2.982, z: 1.041-0.15 },     // BLB
    { x: -0.720, y: 2.982, z: 1.041+0.15 },      // BRT
    { x: -0.720, y: 2.982, z: 1.041-0.15 },      // BRB
    { x: -0.720, y: -2.982, z: 1.041+0.15 },      // BRT
    { x: -0.720, y: -2.982, z: 1.041-0.15 },      // BRB

    // Add more positions as needed
];

// Load the propeller model first and store it for reuse
let propellerGeometry = null;
const loader = new OBJLoader();

// Function to create a propeller group using the loaded geometry
function createPropellerGroup(position, scale) {
    const propellerGroup = new THREE.Group();
    
    // Clone the loaded propeller geometry
    const propellerMesh = propellerGeometry.clone();
    propellerMesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.material = propellerMaterial;
        }
    });
    
    propellerGroup.add(propellerMesh);
    propellerGroup.position.set(
        position.x * scale, 
        position.y * scale, 
        position.z * scale
    );
    
    return propellerGroup;
}

// First load the propeller geometry
loader.load(
    'src/assets/prop.obj',
    function(propObj) {
        // Store the loaded geometry for reuse
        propellerGeometry = propObj;
        
        // Now load the aircraft body
        loader.load(
            'src/assets/blizzard.obj',
            function(aircraftBody) {
                // Apply material to aircraft body
                aircraftBody.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = bodyMaterial;
                    }
                });
                
                // Center and scale the aircraft
                const box = new THREE.Box3().setFromObject(aircraftBody);
                const center = box.getCenter(new THREE.Vector3());
                aircraftBody.position.sub(center);
                
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                // const scale = 20 / maxDim;
                const scale = 1;
                aircraftBody.scale.multiplyScalar(scale);

                // Add propellers at each position
                propellerPositions.forEach(pos => {
                    const propGroup = createPropellerGroup(pos, scale);
                    aircraftBody.add(propGroup);
                    propellers.push(propGroup);
                });

                scene.add(aircraftBody);
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

// Load the OBJ model
// const loader = new OBJLoader();
// loader.load( 
//     'src/assets/blizzard.obj', 
//     function (aircraftBody) {
//         // Apply material to aircraft body
//         aircraftBody.traverse((child) => {
//             if (child instanceof THREE.Mesh) {
//                 child.material = bodyMaterial;
//             }
//         });
        
//         // Center and scale the aircraft
//         const box = new THREE.Box3().setFromObject(aircraftBody);
//         const center = box.getCenter(new THREE.Vector3());
//         aircraftBody.position.sub(center);
        
//         const size = box.getSize(new THREE.Vector3());
//         const maxDim = Math.max(size.x, size.y, size.z);
//         // const scale = 20 / maxDim;
//         const scale = 1;
//         aircraftBody.scale.multiplyScalar(scale);

//         // Create propeller groups at each position
//         propellerPositions.forEach(pos => {
//             // Create a group to hold each propeller
//             const propellerGroup = new THREE.Group();
            
//             // Create propeller geometry (simplified for example)
//             const propGeometry = new THREE.BoxGeometry(2, 0.2, 0.1);
//             const propeller = new THREE.Mesh(propGeometry, propellerMaterial);
            
//             // Create the mounting point (optional, for visibility)
//             const mountGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8);
//             const mount = new THREE.Mesh(mountGeometry, propellerMaterial);
            
//             // Add propeller to its group
//             propellerGroup.add(propeller);
//             propellerGroup.add(mount);
            
//             // Position the group relative to aircraft body
//             propellerGroup.position.set(pos.x * scale, pos.y * scale, pos.z * scale);
            
//             // Add the propeller group to the aircraft body
//             aircraftBody.add(propellerGroup);
            
//             // Store reference for animation
//             propellers.push(propellerGroup);
//         });

//         scene.add(aircraftBody);
//     },
//     function(xhr) {
//         console.log((xhr.loaded / xhr.total * 100) + '% loaded');
//     },
//     function(error) {
//         console.log('An error happened:', error);
//     }
// );

const geometry = new THREE.TorusGeometry(10, 3, 16, 100)
const material = new THREE.MeshBasicMaterial({color: 0xFF6347, wireframe: true});
const torus = new THREE.Mesh(geometry, material);

// scene.add(torus);

const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
scene.add( ambientLight );

const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
scene.add( pointLight );

let propellerSpeed = 0.2;  // Adjust for faster/slower rotation

function animate() {
    requestAnimationFrame( animate);
    // Rotate aircraft (if desired)
    // scene.children.forEach(child => {
    //     if (child instanceof THREE.Group) {
    //         child.rotation.y += 0.005;
    //     }
    // });
    
    // // Rotate propellers
    propellers.forEach(propGroup => {
        propGroup.children[0].rotation.z += propellerSpeed;
    });
    renderer.render( scene, camera);
}

animate()

// import App from './App.svelte'

// const app = new App({
//   target: document.getElementById('app'),
// })

// export default app
