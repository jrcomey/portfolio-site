import * as THREE from 'three';

// Common colors used across scenes
export const colors = {
    blue: 0x3333FF,
    red: 0xFF3333,
    green: 0x4AF626,
    black: 0x000000
};

/**
 * Creates a basic Three.js scene with renderer and camera
 * @param {HTMLElement} container - DOM element to attach renderer to
 * @param {Object} options - Configuration options
 * @param {number} [options.fov=40] - Camera field of view
 * @param {THREE.Vector3} [options.cameraPosition] - Camera position
 * @param {THREE.Vector3} [options.cameraTarget] - Camera look-at target
 * @param {boolean} [options.useContainerSize=false] - Use container size instead of window
 * @returns {{scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, handleResize: Function}}
 */
export function createBasicScene(container, options = {}) {
    const {
        fov = 40,
        cameraPosition = new THREE.Vector3(-7, 0, 5),
        cameraTarget = new THREE.Vector3(0, 0, 0),
        useContainerSize = false
    } = options;

    const getSize = () => {
        if (useContainerSize) {
            const w = container.clientWidth || window.innerWidth;
            const h = container.clientHeight || window.innerHeight;
            return { w, h };
        }
        return { w: window.innerWidth, h: window.innerHeight };
    };

    const { w, h } = getSize();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fov, w / h, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    camera.up.set(0, 0, 1);
    camera.position.copy(cameraPosition);
    camera.lookAt(cameraTarget);

    container.appendChild(renderer.domElement);

    function handleResize() {
        const { w, h } = getSize();
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
    }

    window.addEventListener('resize', handleResize);

    // Initial render to show something even before animation starts
    renderer.render(scene, camera);

    return { scene, camera, renderer, handleResize };
}

/**
 * Creates a fresnel rim shader material with additive blending
 * Good for glowing edge effects
 */
export function MeshFresnelMaterial(fresnelColor, baseColor = 0x000000, opts = {}) {
    const {
        amount = 2.0,
        offset = 0.2,
        intensity = 4,
        alphaMix = 1.0
    } = opts;

    return new THREE.ShaderMaterial({
        uniforms: {
            uFresnelColor: { value: new THREE.Color(fresnelColor) },
            uBaseColor: { value: new THREE.Color(baseColor) },
            uAmount: { value: amount },
            uOffset: { value: offset },
            uIntensity: { value: intensity },
            uAlphaMix: { value: alphaMix }
        },
        vertexShader: /* glsl */`
            varying vec3 vWPos;
            varying vec3 vWNorm;
            void main() {
                vec4 wp = modelMatrix * vec4(position, 1.0);
                vWPos = wp.xyz;
                vWNorm = normalize(mat3(transpose(inverse(modelMatrix))) * normal);
                gl_Position = projectionMatrix * viewMatrix * wp;
            }
        `,
        fragmentShader: /* glsl */`
            uniform vec3 uFresnelColor, uBaseColor;
            uniform float uAmount, uOffset, uIntensity, uAlphaMix;
            varying vec3 vWPos, vWNorm;

            void main() {
                vec3 N = normalize(vWNorm);
                vec3 V = normalize(cameraPosition - vWPos);
                float dotNV = clamp(dot(N, V), 0.0, 1.0);

                float threshold = 0.97;
                float width = 0.06;
                float curve = 2.0;

                float x = 1.0 - dotNV;
                float rim = smoothstep(threshold - width, threshold + width, x);
                rim = pow(rim, curve);

                vec3 col = uFresnelColor * rim * uIntensity;
                gl_FragColor = vec4(col, 1.0);
            }
        `,
        transparent: true,
        depthWrite: true,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide
    });
}

/**
 * Creates an opaque fresnel rim highlight material (black base)
 * Good for subtle rim lighting effects
 */
export function FresnelRimMaterial(color, opts = {}) {
    const {
        bias = 0.4,
        scale = 1.0,
        power = 0.2,
        width = 0.8,
        curve = 1.5,
        intensity = 3.0
    } = opts;

    return new THREE.ShaderMaterial({
        uniforms: {
            uRim: { value: new THREE.Color(color) },
            uBias: { value: bias },
            uScale: { value: scale },
            uPower: { value: power },
            uWidth: { value: width },
            uCurve: { value: curve },
            uInt: { value: intensity }
        },
        vertexShader: /* glsl */`
            varying vec3 vWPos, vWNorm;
            void main() {
                vec4 wp = modelMatrix * vec4(position, 1.0);
                vWPos = wp.xyz;
                vWNorm = normalize(mat3(transpose(inverse(modelMatrix))) * normal);
                gl_Position = projectionMatrix * viewMatrix * wp;
            }
        `,
        fragmentShader: /* glsl */`
            uniform vec3 uRim;
            uniform float uBias, uScale, uPower, uWidth, uCurve, uInt;
            varying vec3 vWPos, vWNorm;
            void main() {
                vec3 N = normalize(vWNorm);
                vec3 V = normalize(cameraPosition - vWPos);
                float dotNV = clamp(dot(N, V), 0.0, 1.0);

                float fres = uBias + uScale * pow(1.0 - dotNV, uPower);

                float x = 1.0 - dotNV;
                float rim = smoothstep(1.0 - uWidth, 1.0, x);
                rim = pow(rim * fres, uCurve);

                vec3 col = uRim * rim * uInt;
                gl_FragColor = vec4(col, 1.0);
            }
        `,
        transparent: true,
        depthWrite: true,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    });
}

/**
 * Creates basic solid + wireframe material pair
 * @param {number} wireframeColor - Color for the wireframe
 * @param {number} [solidColor=0x000000] - Color for the solid mesh
 */
export function createBasicMaterials(wireframeColor, solidColor = colors.black) {
    return {
        solid: new THREE.MeshBasicMaterial({
            color: solidColor,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1
        }),
        wireframe: new THREE.MeshBasicMaterial({
            color: wireframeColor,
            wireframe: true,
            wireframeLinewidth: 1
        })
    };
}

/**
 * Creates materials with fresnel rim effect
 * @param {number} color - Color for wireframe and fresnel
 */
export function createFresnelMaterials(color) {
    const fresnel = new MeshFresnelMaterial(color, 0x000000);
    fresnel.toneMapped = false;

    return {
        solid: new THREE.MeshBasicMaterial({
            color: colors.black,
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

/**
 * Creates a solid wireframe mesh group (solid + wireframe overlay)
 * @param {THREE.BufferGeometry} geometry - The geometry to use
 * @param {Object} materials - Object with solid and wireframe materials
 * @param {number} [meshScale=1.0001] - Scale factor for wireframe to prevent z-fighting
 */
export function createSolidWireframeMesh(geometry, materials, meshScale = 1.0001) {
    const group = new THREE.Group();

    // Create the solid mesh
    const solidMesh = new THREE.Mesh(geometry, materials.solid);
    group.add(solidMesh);

    // Create a slightly larger wireframe mesh
    const wireframeGeometry = geometry.clone();
    wireframeGeometry.scale(meshScale, meshScale, meshScale);
    const wireframeMesh = new THREE.Mesh(wireframeGeometry, materials.wireframe);
    group.add(wireframeMesh);

    return group;
}

/**
 * Creates a wireframe + fresnel mesh group (no solid, for transparent look)
 * @param {THREE.BufferGeometry} geometry - The geometry to use
 * @param {Object} materials - Object with wireframe and fresnel materials
 * @param {number} [meshScale=1.0001] - Scale factor to prevent z-fighting
 */
export function createWireframeFresnelMesh(geometry, materials, meshScale = 1.0001) {
    const group = new THREE.Group();

    // Create wireframe mesh
    const wireframeGeometry = geometry.clone();
    wireframeGeometry.scale(meshScale, meshScale, meshScale);
    const wireframeMesh = new THREE.Mesh(wireframeGeometry, materials.wireframe);
    group.add(wireframeMesh);

    // Create fresnel mesh
    const fresnelGeometry = geometry.clone();
    fresnelGeometry.scale(meshScale, meshScale, meshScale);
    const fresnelMesh = new THREE.Mesh(fresnelGeometry, materials.fresnel);
    group.add(fresnelMesh);

    return group;
}

/**
 * Normalizes geometry to fit within [-1, 1] bounds, centered at origin
 * @param {THREE.BufferGeometry} geom - The geometry to normalize (mutates in place)
 */
export function normalizeGeometry(geom) {
    geom.computeBoundingBox();

    // Center vertices at origin
    const c = geom.boundingBox.getCenter(new THREE.Vector3()).negate();
    geom.translate(c.x, c.y, c.z);

    // Uniform scale so largest edge spans 2 units (-1 to +1)
    const size = geom.boundingBox.getSize(new THREE.Vector3());
    const k = 2 / Math.max(size.x, size.y, size.z);
    geom.scale(k, k, k);

    geom.computeBoundingBox();
}

/**
 * Disposes of all Three.js resources in a scene
 * @param {THREE.Scene} scene
 * @param {THREE.WebGLRenderer} renderer
 * @param {number} [animationFrameId] - Optional animation frame to cancel
 */
export function disposeScene(scene, renderer, animationFrameId) {
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
}
