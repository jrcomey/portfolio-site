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
    'src/assets/prop.obj',
    function(propObj) {
        propellerGeometry = propObj;
        
        loader.load(
            'src/assets/blizzard.obj',
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

// import App from './App.svelte'

// const app = new App({
//   target: document.getElementById('app'),
// })

// export default app
