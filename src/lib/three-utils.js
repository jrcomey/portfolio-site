import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';

// Common colors used across scenes
export const colors = {
    blue: 0x3333FF,
    red: 0xFF3333,
    green: 0x4AF626,
    black: 0x000000
};

/**
 * Default retro vector-display look, shared by every page.
 * Set any feature to null to turn it off.
 */
export const vectorStyleDefaults = {
    // Silhouette outline (inverted hull)
    outline: { width: 4 },
    // Feature-edge wireframe; null falls back to the full triangle wireframe
    edges: { thresholdAngle: 2, opacity: 0.8, width: 0.5, glow: { width: 4, opacity: 0.25 } },
    // Fading trails on moving lines
    phosphor: { decay: 0.9 }
};

/**
 * Builds a style from the defaults with per-page tweaks.
 * Each feature's settings are merged over the default; pass null to disable a feature.
 * @example vectorStyle({ phosphor: null, edges: { thresholdAngle: 20 } })
 * @param {Object} [overrides]
 */
export function vectorStyle(overrides = {}) {
    const style = {};
    for (const key of Object.keys(vectorStyleDefaults)) {
        const base = vectorStyleDefaults[key];
        const override = overrides[key];
        if (override === null) {
            style[key] = null;
        } else if (override === undefined) {
            style[key] = base;
        } else {
            style[key] = { ...base, ...override };
        }
    }
    return style;
}

// Per-renderer cleanup registered by createBasicScene(), run by disposeScene()
const rendererCleanup = new WeakMap();

/**
 * Creates a basic Three.js scene with renderer and camera
 * @param {HTMLElement} container - DOM element to attach renderer to
 * @param {Object} options - Configuration options
 * @param {number} [options.fov=40] - Camera field of view
 * @param {THREE.Vector3} [options.cameraPosition] - Camera position
 * @param {THREE.Vector3} [options.cameraTarget] - Camera look-at target
 * @param {boolean} [options.useContainerSize=false] - Use container size instead of window
 * @param {Object} [options.style] - Style from vectorStyle(); enables phosphor trails if set
 * @returns {{scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, handleResize: Function, render: Function}}
 */
export function createBasicScene(container, options = {}) {
    const {
        fov = 40,
        cameraPosition = new THREE.Vector3(-7, 0, 5),
        cameraTarget = new THREE.Vector3(0, 0, 0),
        useContainerSize = false,
        style = vectorStyle()
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
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        stencil: true,                              // for edge glow
        preserveDrawingBuffer: !!style.phosphor     // trails draw over the previous frame
    });

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

    const phosphor = style.phosphor && createPhosphorPersistence(renderer, style.phosphor);
    const render = phosphor
        ? () => phosphor.render(scene, camera)
        : () => renderer.render(scene, camera);

    rendererCleanup.set(renderer, () => {
        window.removeEventListener('resize', handleResize);
        if (phosphor) phosphor.dispose();
    });

    return { scene, camera, renderer, handleResize, render };
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
 * Creates an inverted hull outline material (constant pixel-width silhouette line)
 * Renders back faces pushed outward in screen space, so only a thin band shows around
 * the object's edge. Needs something opaque in front (e.g. the solid underlayer) to
 * hide the hull's interior.
 * @param {number} color - Outline color
 * @param {Object} [opts]
 * @param {number} [opts.width=2] - Outline width in CSS pixels (thickness also accepted)
 * @param {number} [opts.opacity=1] - Outline opacity
 */
export function OutlineMaterial(color, opts = {}) {
    const {
        width = opts.thickness ?? 2,
        opacity = 1
    } = opts;
    const thickness = width;

    return new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: new THREE.Color(color) },
            uOpacity: { value: opacity },
            uThickness: { value: thickness },
            uResolution: { value: new THREE.Vector2(1, 1) }
        },
        vertexShader: /* glsl */`
            uniform float uThickness;
            uniform vec2 uResolution;
            void main() {
                vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

                // Push vertex outward along its screen-space normal direction
                vec3 vn = normalize(normalMatrix * normal);
                vec2 dir = (projectionMatrix * vec4(vn, 0.0)).xy;
                float len = length(dir);
                if (len > 1e-5) {
                    clip.xy += (dir / len) * uThickness * clip.w * 2.0 / uResolution;
                }

                gl_Position = clip;
            }
        `,
        fragmentShader: /* glsl */`
            uniform vec3 uColor;
            uniform float uOpacity;
            void main() {
                gl_FragColor = vec4(uColor, uOpacity);
                #include <colorspace_fragment>
            }
        `,
        side: THREE.BackSide,
        transparent: opacity < 1
    });
}

/**
 * Creates an outline (inverted hull) mesh for a geometry
 * Vertices are welded and normals averaged so the hull doesn't split at hard edges.
 * @param {THREE.BufferGeometry} geometry - Source geometry (not modified)
 * @param {THREE.ShaderMaterial} material - Material from OutlineMaterial()
 */
export function createOutlineMesh(geometry, material) {
    const hull = geometry.clone();
    for (const name of Object.keys(hull.attributes)) {
        if (name !== 'position') hull.deleteAttribute(name);
    }
    const welded = mergeVertices(hull, 1e-4);
    hull.dispose();
    welded.computeVertexNormals();

    const mesh = new THREE.Mesh(welded, material);

    // Keep thickness in CSS pixels across resizes and pixel ratios
    const size = new THREE.Vector2();
    mesh.onBeforeRender = (renderer) => {
        renderer.getSize(size);
        material.uniforms.uResolution.value.copy(size);
    };

    return mesh;
}

/**
 * Creates a line material for feature-edge wireframes
 * Only edges where adjacent faces meet at more than thresholdAngle are drawn,
 * dropping the diagonals across flat surfaces for a cleaner vector-display look.
 * @param {number} color - Line color
 * @param {Object} [opts]
 * @param {number} [opts.thresholdAngle=20] - Minimum crease angle in degrees to draw an edge
 * @param {number} [opts.opacity=1] - Line opacity
 * @param {number} [opts.width] - Line width in CSS pixels; omit or null for native 1px lines
 * @param {Object} [opts.glow] - Phosphor glow: a wide, faint line drawn under the core line.
 *   Requires a renderer created with { stencil: true } so overlapping glow doesn't stack up.
 * @param {number} [opts.glow.width=6] - Glow width in CSS pixels
 * @param {number} [opts.glow.opacity=0.25] - Glow opacity
 */
export function EdgesMaterial(color, opts = {}) {
    const {
        thresholdAngle = 20,
        opacity = 1,
        width,
        glow
    } = opts;

    const material = width != null
        ? new LineMaterial({
            color,
            linewidth: width,
            transparent: opacity < 1,
            opacity
        })
        : new THREE.LineBasicMaterial({
            color,
            transparent: opacity < 1,
            opacity
        });
    material.userData.thresholdAngle = thresholdAngle;

    if (glow) {
        material.userData.glowMaterial = new LineMaterial({
            color,
            linewidth: glow.width ?? 6,
            transparent: true,
            opacity: glow.opacity ?? 0.25,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            // Draw each pixel's glow only once per frame, so it doesn't pile up where lines meet
            stencilWrite: true,
            stencilRef: 1,
            stencilFunc: THREE.NotEqualStencilFunc,
            stencilZPass: THREE.ReplaceStencilOp
        });
    }

    return material;
}

// Fat lines size themselves from a resolution uniform, so keep it in sync with the canvas
const _lineResolution = new THREE.Vector2();
function trackLineResolution(line) {
    line.onBeforeRender = (renderer) => {
        renderer.getSize(_lineResolution);
        line.material.resolution.copy(_lineResolution);
    };
    return line;
}

/**
 * Creates a feature-edge line mesh for a geometry
 * Returns plain LineSegments for native lines, or a group of fat lines (glow + core)
 * @param {THREE.BufferGeometry} geometry - Source geometry (not modified)
 * @param {THREE.Material} material - Material from EdgesMaterial()
 * @param {number} [meshScale=1.0001] - Scale factor to prevent z-fighting
 */
export function createEdgesMesh(geometry, material, meshScale = 1.0001) {
    const scaled = geometry.clone();
    scaled.scale(meshScale, meshScale, meshScale);
    const edges = new THREE.EdgesGeometry(scaled, material.userData.thresholdAngle ?? 20);
    scaled.dispose();

    const glowMaterial = material.userData.glowMaterial;
    if (!material.isLineMaterial && !glowMaterial) {
        return new THREE.LineSegments(edges, material);
    }

    const group = new THREE.Group();
    const fatEdges = new LineSegmentsGeometry().fromEdgesGeometry(edges);

    if (glowMaterial) {
        group.add(trackLineResolution(new LineSegments2(fatEdges, glowMaterial)));
    }

    if (material.isLineMaterial) {
        group.add(trackLineResolution(new LineSegments2(fatEdges, material)));
        edges.dispose();
    } else {
        group.add(new THREE.LineSegments(edges, material));
    }

    return group;
}

/**
 * Phosphor persistence: moving lines leave fading trails, like a vector CRT
 * Instead of clearing each frame, the previous frame is darkened and the scene drawn on top.
 * Much cheaper than a post-processing pass: one fullscreen blend per frame.
 * Requires a renderer created with { preserveDrawingBuffer: true } and no scene.background.
 * @param {THREE.WebGLRenderer} renderer
 * @param {Object} [opts]
 * @param {number} [opts.decay=0.85] - Brightness kept per 60 Hz frame (0 = no trail, closer to 1 = longer)
 * @returns {{render: Function, dispose: Function}}
 */
export function createPhosphorPersistence(renderer, opts = {}) {
    const { decay = 0.85 } = opts;

    const fadeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const fadeScene = new THREE.Scene();
    const quad = new THREE.PlaneGeometry(2, 2);

    // Multiplicative fade toward black
    const fadeMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        depthTest: false,
        depthWrite: false
    });

    // 8-bit buffers can't fade the last few levels multiplicatively (values round back up),
    // which leaves permanent faint ghosts, so also subtract a small constant each frame
    const subtractMaterial = new THREE.MeshBasicMaterial({
        color: 0x030303,
        blending: THREE.CustomBlending,
        blendEquation: THREE.ReverseSubtractEquation,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        depthTest: false,
        depthWrite: false
    });

    fadeScene.add(new THREE.Mesh(quad, fadeMaterial));
    fadeScene.add(new THREE.Mesh(quad, subtractMaterial));

    const prevAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.clear();

    let last = performance.now();

    return {
        render(scene, camera) {
            // Frame-rate independent: same trail length on 60 Hz and 120 Hz displays
            const now = performance.now();
            const frames = Math.min((now - last) / (1000 / 60), 10);
            last = now;
            fadeMaterial.opacity = 1 - Math.pow(decay, frames);

            renderer.render(fadeScene, fadeCamera);
            renderer.clear(false, true, true); // fresh depth + stencil, keep color
            renderer.render(scene, camera);
        },
        dispose() {
            renderer.autoClear = prevAutoClear;
            quad.dispose();
            fadeMaterial.dispose();
            subtractMaterial.dispose();
        }
    };
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
 * Creates the retro vector-display material set for one color
 * Use with createSolidWireframeMesh().
 * @param {number} color - Line color
 * @param {Object} [style] - Style from vectorStyle()
 */
export function createVectorMaterials(color, style = vectorStyle()) {
    return {
        ...createBasicMaterials(color),
        outline: style.outline && OutlineMaterial(color, style.outline),
        edges: style.edges && EdgesMaterial(color, style.edges)
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
 * @param {Object} materials - Object with solid and wireframe materials, plus optional
 *   edges (replaces wireframe) and outline materials
 * @param {number} [meshScale=1.0001] - Scale factor for wireframe to prevent z-fighting
 */
export function createSolidWireframeMesh(geometry, materials, meshScale = 1.0001) {
    const group = new THREE.Group();

    // Create the solid mesh
    const solidMesh = new THREE.Mesh(geometry, materials.solid);
    group.add(solidMesh);

    if (materials.edges) {
        // Feature edges only, replacing the full triangle wireframe
        group.add(createEdgesMesh(geometry, materials.edges, meshScale));
    } else {
        // Create a slightly larger wireframe mesh
        const wireframeGeometry = geometry.clone();
        wireframeGeometry.scale(meshScale, meshScale, meshScale);
        const wireframeMesh = new THREE.Mesh(wireframeGeometry, materials.wireframe);
        group.add(wireframeMesh);
    }

    // Optional silhouette outline
    if (materials.outline) {
        group.add(createOutlineMesh(geometry, materials.outline));
    }

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
        rendererCleanup.get(renderer)?.();
        rendererCleanup.delete(renderer);
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
