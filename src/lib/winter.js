import * as THREE from 'three';

const MAX_ROTORS = 4;

// Rotor flow field, shared by the fog shader (GLSL) and the snow (JS); keep the two in step.
// Each rotor is a disk at `center` of radius R with its axis on world z, blowing down at induced
// speed vi: above the disk air is drawn in like a sink; below, a column narrows to ~0.71 R while
// speeding up to 2 vi (momentum theory's far wake), slows as it nears the ground at `ground`, and
// turns outward into a wall jet along the surface. `kick` is how much of that wall jet is here
// (0-1), used to stir up extra fog where the downwash hits the ground.
const ROTOR_FLOW_GLSL = /* glsl */`
    uniform vec4 uRotors[${MAX_ROTORS}];  // xyz center, w radius
    uniform int uRotorCount;
    uniform float uInducedSpeed, uGround;

    vec3 rotorFlow(vec3 p, out float kick) {
        vec3 v = vec3(0.0);
        kick = 0.0;
        for (int i = 0; i < ${MAX_ROTORS}; i++) {
            if (i >= uRotorCount) break;
            vec3 d = p - uRotors[i].xyz;
            float R = uRotors[i].w;
            float r = length(d.xy);
            vec2 radial = r > 1e-4 ? d.xy / r : vec2(0.0);
            if (d.z > 0.0) {
                float s = R * R / (R * R + dot(d, d));
                v -= uInducedSpeed * s * normalize(d);
            } else {
                float k = smoothstep(0.0, R, -d.z);
                float rw = R * (1.0 - 0.29 * k);
                float core = 1.0 - smoothstep(0.7 * rw, rw, r);
                float hg = max(p.z - uGround, 0.0);
                v.z -= uInducedSpeed * (1.0 + k) * core * smoothstep(0.0, 0.6 * R, hg);
                float wall = exp(-hg / (0.4 * R)) * smoothstep(0.0, R, r) * exp(-max(r - R, 0.0) / (3.0 * R));
                v.xy += radial * 1.5 * uInducedSpeed * wall;
                kick += wall;
            }
        }
        return v;
    }
`;

function rotorFlow(p, rotors, inducedSpeed, ground, out) {
    out.set(0, 0, 0);
    for (const { center, radius: R } of rotors) {
        const dx = p.x - center.x, dy = p.y - center.y, dz = p.z - center.z;
        const r = Math.hypot(dx, dy);
        const rx = r > 1e-4 ? dx / r : 0, ry = r > 1e-4 ? dy / r : 0;
        if (dz > 0) {
            const dd = dx * dx + dy * dy + dz * dz;
            if (dd < 1e-8) continue;
            const s = inducedSpeed * R * R / (R * R + dd) / Math.sqrt(dd);
            out.x -= s * dx; out.y -= s * dy; out.z -= s * dz;
        } else {
            const k = smoothstep(0, R, -dz);
            const rw = R * (1 - 0.29 * k);
            const core = 1 - smoothstep(0.7 * rw, rw, r);
            const hg = Math.max(p.z - ground, 0);
            out.z -= inducedSpeed * (1 + k) * core * smoothstep(0, 0.6 * R, hg);
            const wall = Math.exp(-hg / (0.4 * R)) * smoothstep(0, R, r) * Math.exp(-Math.max(r - R, 0) / (3 * R));
            out.x += rx * 1.5 * inducedSpeed * wall;
            out.y += ry * 1.5 * inducedSpeed * wall;
        }
    }
    return out;
}

function smoothstep(e0, e1, x) {
    const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
    return t * t * (3 - 2 * t);
}

/**
 * Tileable 3D fog noise, baked once so the raymarch does one filtered texture fetch per sample
 * instead of hashing 8 lattice corners: two octaves of smoothstep value noise (0.6 at 8 cells
 * across the tile, 0.4 at 16), in [0, 1]. Sample with uvw = q / 8 for 1 cell per unit of q.
 * @param {number} [size=64] - Texels per side
 */
function createNoiseTexture(size = 64) {
    const hash = (x, y, z, period) => {
        x = ((x % period) + period) % period; y = ((y % period) + period) % period; z = ((z % period) + period) % period;
        let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177) ^ Math.imul(period, 2654435761);
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
    };
    const valueNoise = (x, y, z, period) => {
        const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
        const fx = smoothstep(0, 1, x - ix), fy = smoothstep(0, 1, y - iy), fz = smoothstep(0, 1, z - iz);
        const lerp = (a, b, t) => a + (b - a) * t;
        const c = (dx, dy, dz) => hash(ix + dx, iy + dy, iz + dz, period);
        return lerp(
            lerp(lerp(c(0, 0, 0), c(1, 0, 0), fx), lerp(c(0, 1, 0), c(1, 1, 0), fx), fy),
            lerp(lerp(c(0, 0, 1), c(1, 0, 1), fx), lerp(c(0, 1, 1), c(1, 1, 1), fx), fy), fz);
    };
    const data = new Uint8Array(size * size * size);
    for (let z = 0, i = 0; z < size; z++) {
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++, i++) {
                const k = 8 / size;
                const n = 0.6 * valueNoise(x * k, y * k, z * k, 8) + 0.4 * valueNoise(x * k * 2, y * k * 2, z * k * 2, 16);
                data[i] = Math.round(n * 255);
            }
        }
    }
    const texture = new THREE.Data3DTexture(data, size, size, size);
    texture.format = THREE.RedFormat;
    texture.minFilter = texture.magFilter = THREE.LinearFilter;
    texture.wrapS = texture.wrapT = texture.wrapR = THREE.RepeatWrapping;
    texture.unpackAlignment = 1;
    texture.needsUpdate = true;
    return texture;
}

/**
 * Winter weather for a vector-display scene: raymarched volumetric fog plus wind-blown snow streaks
 * The scene's depth is captured in a cheap offscreen pass (no MSAA, snow hidden); a fullscreen pass then marches
 * each view ray from the camera to the first surface (or maxDistance for open sky) through drifting
 * 3D noise that thickens toward `floor`, fading lines into the fog colour by how much fog is in front
 * of them. The march runs at reduced resolution (fog is smooth) on each block's nearest depth, and a
 * full-resolution composite upsamples it, weighting the low-res samples by how close their depth is
 * to the pixel's, so lines keep their own fog amount instead of the background's, and alpha-blends the
 * fog over the scene drawn normally to the screen (scene * T + fog * (1 - T)). Snow is drawn as short line streaks along each flake's velocity, so it reads as vectors.
 * With rotors set (setRotors), fog and snow are pulled through them: the fog noise is advected along
 * the rotor flow with a two-phase flowmap, and each flake is integrated through it on the CPU.
 * Replaces renderer.render(); not combined with phosphor persistence.
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene} scene - Snow is added to this scene and removed on dispose()
 * @param {THREE.Camera} camera
 * @param {Object} [opts]
 * @param {number} [opts.fogColor=0x5a6b80] - Fog colour
 * @param {number} [opts.density=0.06] - Fog extinction per world unit at the floor, before noise
 * @param {number} [opts.floor=-3] - World z where the fog is thickest
 * @param {number} [opts.height=4] - Fog falls off by 1/e every this many units above the floor
 * @param {number} [opts.noiseScale=0.15] - Spatial frequency of the fog patches (1/world units)
 * @param {number} [opts.maxDistance=40] - How far rays march when they hit nothing
 * @param {number} [opts.steps=12] - Raymarch samples per pixel (jittered, so few are needed)
 * @param {number} [opts.resolution=0.5] - Fog march resolution per axis (1, 1/2, 1/3, ...)
 * @param {THREE.Vector3} [opts.wind] - Wind velocity in world units/s, moves fog and snow
 * @param {number} [opts.inducedSpeed=5] - Rotor induced velocity at the disk, world units/s
 * @param {number} [opts.ground=-3] - World z of the surface the rotor wake spreads along
 * @param {number} [opts.kick=3] - Extra fog density stirred up where the wake hits the ground
 * @param {number} [opts.flowPeriod=1.5] - Seconds per flowmap phase; longer streaks, more smearing
 * @param {number} [opts.snowCount=2500] - Number of flakes
 * @param {number} [opts.snowColor=0xdde8ff] - Flake colour
 * @param {number} [opts.snowOpacity=0.6] - Flake opacity
 * @param {number} [opts.fall=1.2] - Flake fall speed in world units/s
 * @param {number} [opts.streak=0.06] - Streak length in seconds of travel
 * @param {THREE.Box3} [opts.snowBox] - World box the flakes fill (they wrap around inside it)
 * @returns {{render: Function, setRotors: Function, dispose: Function}}
 */
export function createWinter(renderer, scene, camera, opts = {}) {
    const {
        fogColor = 0x5a6b80,
        density = 0.06,
        floor = -3,
        height = 4,
        noiseScale = 0.15,
        maxDistance = 40,
        steps = 12,
        resolution = 0.5,
        wind = new THREE.Vector3(1.6, -1.4, 0),
        inducedSpeed = 5,
        ground = -3,
        kick = 3,
        flowPeriod = 1.5,
        snowCount = 2500,
        snowColor = 0xdde8ff,
        snowOpacity = 0.6,
        fall = 1.2,
        streak = 0.06,
        snowBox = new THREE.Box3(new THREE.Vector3(-14, -14, -4), new THREE.Vector3(10, 14, 10))
    } = opts;

    let rotors = [];
    const rotorUniforms = {
        uRotors: { value: Array.from({ length: MAX_ROTORS }, () => new THREE.Vector4()) },
        uRotorCount: { value: 0 },
        uInducedSpeed: { value: inducedSpeed },
        uGround: { value: ground }
    };

    // Depth of the scene for the fog. The scene itself still draws straight to the (antialiased) canvas:
    // a multisampled half-float colour target at full Retina size cost ~8 ms a frame on an M4.
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    const target = new THREE.WebGLRenderTarget(size.x, size.y, {
        depthTexture: new THREE.DepthTexture(size.x, size.y)
    });

    // Low-res fog: R = transmittance along the ray, G = the view distance it was marched to
    const factor = Math.max(1, Math.round(1 / resolution));
    const fogSize = new THREE.Vector2(Math.ceil(size.x / factor), Math.ceil(size.y / factor));
    const fogTarget = new THREE.WebGLRenderTarget(fogSize.x, fogSize.y, {
        type: THREE.HalfFloatType,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        depthBuffer: false
    });
    const noiseTexture = createNoiseTexture();

    // Shared by both passes: the view distance to a depth-buffer value, capped at uMaxDist (open sky)
    const viewDistanceGLSL = /* glsl */`
        float viewDistance(vec2 uv, float depth) {
            if (depth >= 1.0) return uMaxDist;
            vec4 hit = uProjInv * vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
            return min(length(hit.xyz / hit.w), uMaxDist);
        }
    `;
    const fullscreenVertex = /* glsl */`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
        }
    `;
    const shared = {
        tDepth: { value: target.depthTexture },
        uProjInv: { value: new THREE.Matrix4() },
        uMaxDist: { value: maxDistance },
        uFullSize: { value: size }
    };

    const marchMaterial = new THREE.ShaderMaterial({
        uniforms: {
            ...rotorUniforms,
            ...shared,
            tNoise: { value: noiseTexture },
            uCamWorld: { value: new THREE.Matrix4() },
            uCamPos: { value: new THREE.Vector3() },
            uTime: { value: 0 },
            uDensity: { value: density },
            uFloor: { value: floor },
            uHeight: { value: height },
            uScale: { value: noiseScale },
            uWind: { value: wind },
            uKick: { value: kick },
            uFlowPeriod: { value: flowPeriod }
        },
        defines: { STEPS: steps, FACTOR: factor },
        vertexShader: fullscreenVertex,
        fragmentShader: /* glsl */`
            precision highp sampler3D;
            uniform sampler2D tDepth;
            uniform sampler3D tNoise;
            uniform mat4 uProjInv, uCamWorld;
            uniform vec3 uCamPos, uWind;
            uniform vec2 uFullSize;
            uniform float uTime, uDensity, uFloor, uHeight, uScale, uMaxDist, uKick, uFlowPeriod;
            ${ROTOR_FLOW_GLSL}
            ${viewDistanceGLSL}

            float fogNoise(vec3 q) {
                return texture(tNoise, q * 0.125).r;
            }

            // Extinction per world unit: height falloff from the floor, times drifting patches over a thin base haze.
            // The patches are carried by the wind, and by the rotor flow through a two-phase flowmap: two copies of
            // the noise, each pushed back along the local flow for up to one period then reset, crossfaded so
            // neither reset shows. Plus fog stirred up where a rotor wake spreads along the ground.
            float density(vec3 p) {
                float h = exp(-max(p.z - uFloor, 0.0) / uHeight);
                vec3 q = p * uScale - uWind * uScale * uTime;
                float kick;
                vec3 flow = rotorFlow(p, kick) * uScale * uFlowPeriod;
                float t1 = fract(uTime / uFlowPeriod);
                float t2 = fract(t1 + 0.5);
                float w1 = 1.0 - abs(2.0 * t1 - 1.0);
                float n = w1 * fogNoise(q - flow * t1) + (1.0 - w1) * fogNoise(q - flow * t2 + vec3(31.4));
                return uDensity * (h * (0.25 + smoothstep(0.3, 0.9, n)) + uKick * kick * n);
            }

            void main() {
                // This texel covers a FACTOR x FACTOR block of the full-res depth; march to its nearest surface,
                // so thin lines in the block get their own fog (the composite sorts out the background beside them)
                ivec2 base = ivec2(gl_FragCoord.xy) * FACTOR;
                ivec2 last = ivec2(uFullSize) - 1;
                float depth = 1.0;
                for (int y = 0; y < FACTOR; y++) {
                    for (int x = 0; x < FACTOR; x++) {
                        depth = min(depth, texelFetch(tDepth, min(base + ivec2(x, y), last), 0).x);
                    }
                }
                vec2 uv = (vec2(base) + 0.5 * float(FACTOR)) / uFullSize;
                float dist = viewDistance(uv, depth);
                vec4 far = uProjInv * vec4(uv * 2.0 - 1.0, 1.0, 1.0);
                vec3 dir = normalize((uCamWorld * vec4(far.xyz / far.w, 0.0)).xyz);

                // Jittered march (interleaved gradient noise) so few steps don't band
                float stepLen = dist / float(STEPS);
                float jitter = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
                float optical = 0.0;
                for (int i = 0; i < STEPS; i++) {
                    optical += density(uCamPos + dir * (float(i) + jitter) * stepLen) * stepLen;
                }
                gl_FragColor = vec4(exp(-optical), dist, 0.0, 1.0);
            }
        `,
        depthTest: false,
        depthWrite: false
    });

    const compositeMaterial = new THREE.ShaderMaterial({
        uniforms: {
            ...shared,
            tFog: { value: fogTarget.texture },
            uFogSize: { value: fogSize },
            uFogColor: { value: new THREE.Color(fogColor) }
        },
        vertexShader: fullscreenVertex,
        fragmentShader: /* glsl */`
            uniform sampler2D tDepth, tFog;
            uniform mat4 uProjInv;
            uniform vec2 uFullSize, uFogSize;
            uniform vec3 uFogColor;
            uniform float uMaxDist;
            varying vec2 vUv;
            ${viewDistanceGLSL}

            void main() {
                float dist = viewDistance(vUv, texture2D(tDepth, vUv).x);

                // Depth-aware upsample: bilinear weights over the 4 nearest fog texels, each scaled down by how far
                // its marched distance is from this pixel's, so a line doesn't take the sky's fog or vice versa
                vec2 f = vUv * uFogSize - 0.5;
                ivec2 b = ivec2(floor(f));
                vec2 fr = f - floor(f);
                ivec2 last = ivec2(uFogSize) - 1;
                float T = 0.0, wsum = 0.0;
                for (int j = 0; j < 2; j++) {
                    for (int i = 0; i < 2; i++) {
                        vec2 s = texelFetch(tFog, clamp(b + ivec2(i, j), ivec2(0), last), 0).xy;
                        float bilinear = (i == 0 ? 1.0 - fr.x : fr.x) * (j == 0 ? 1.0 - fr.y : fr.y);
                        float w = bilinear * (exp(-abs(s.y - dist) / (0.05 * dist + 0.05)) + 1e-4);
                        T += w * s.x;
                        wsum += w;
                    }
                }
                T /= wsum;

                gl_FragColor = vec4(uFogColor, 1.0 - T);
                #include <colorspace_fragment>
            }
        `,
        transparent: true,
        depthTest: false,
        depthWrite: false
    });

    const fogCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.PlaneGeometry(2, 2);
    const marchScene = new THREE.Scene();
    marchScene.add(new THREE.Mesh(quad, marchMaterial));
    const compositeScene = new THREE.Scene();
    compositeScene.add(new THREE.Mesh(quad, compositeMaterial));

    // Snow: flakes integrated on the CPU through wind, gravity, sway and the rotor flow.
    // Two vertices per flake: the head, and a tail one streak-length back along its velocity.
    const boxMin = snowBox.min.clone();
    const boxSize = snowBox.getSize(new THREE.Vector3());
    const flakes = Array.from({ length: snowCount }, () => ({
        p: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiply(boxSize).add(boxMin),
        v: new THREE.Vector3(),
        speed: 0.7 + 0.6 * Math.random(),
        phase: Math.random() * Math.PI * 2
    }));
    const snowPositions = new Float32Array(snowCount * 2 * 3);
    const snowGeometry = new THREE.BufferGeometry();
    snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3).setUsage(THREE.DynamicDrawUsage));

    const snowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: new THREE.Color(snowColor) },
            uOpacity: { value: snowOpacity },
            uBoxMin: { value: boxMin },
            uBoxSize: { value: boxSize }
        },
        vertexShader: /* glsl */`
            uniform vec3 uBoxMin, uBoxSize;
            varying float vAlpha;
            void main() {
                // Fade out near the box faces so wrapping flakes don't pop
                vec3 f = clamp((position - uBoxMin) / uBoxSize, 0.0, 1.0);
                vec3 edge = min(f, 1.0 - f);
                vAlpha = smoothstep(0.0, 0.08, min(edge.x, min(edge.y, edge.z)));
                gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: /* glsl */`
            uniform vec3 uColor;
            uniform float uOpacity;
            varying float vAlpha;
            void main() {
                gl_FragColor = vec4(uColor, uOpacity * vAlpha);
                #include <colorspace_fragment>
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const snow = new THREE.LineSegments(snowGeometry, snowMaterial);
    snow.frustumCulled = false;
    scene.add(snow);

    const flow = new THREE.Vector3();
    function updateSnow(t, dt) {
        for (let i = 0; i < snowCount; i++) {
            const { p, v, speed, phase } = flakes[i];
            rotorFlow(p, rotors, inducedSpeed, ground, flow);
            v.set(
                wind.x * speed + 0.3 * Math.cos(t * 1.3 + phase),
                wind.y * speed - 0.3 * Math.sin(t * 1.1 + phase * 1.7),
                wind.z * speed - fall * speed
            ).add(flow);
            p.addScaledVector(v, dt);

            // Wrap sideways; anything that falls out the bottom (or is blown out the top) starts again at the top
            p.x = boxMin.x + THREE.MathUtils.euclideanModulo(p.x - boxMin.x, boxSize.x);
            p.y = boxMin.y + THREE.MathUtils.euclideanModulo(p.y - boxMin.y, boxSize.y);
            if (p.z < boxMin.z || p.z > boxMin.z + boxSize.z) {
                p.set(Math.random(), Math.random(), 0.999).multiply(boxSize).add(boxMin);
            }

            snowPositions[i * 6] = p.x;
            snowPositions[i * 6 + 1] = p.y;
            snowPositions[i * 6 + 2] = p.z;
            snowPositions[i * 6 + 3] = p.x - v.x * streak;
            snowPositions[i * 6 + 4] = p.y - v.y * streak;
            snowPositions[i * 6 + 5] = p.z - v.z * streak;
        }
        snowGeometry.attributes.position.needsUpdate = true;
    }

    const start = performance.now();
    let last = start;

    return {
        render() {
            renderer.getDrawingBufferSize(size);
            if (size.x !== target.width || size.y !== target.height) {
                target.setSize(size.x, size.y);
                fogSize.set(Math.ceil(size.x / factor), Math.ceil(size.y / factor));
                fogTarget.setSize(fogSize.x, fogSize.y);
            }

            const now = performance.now();
            const t = ((now - start) / 1000) % 3600;
            updateSnow(t, Math.min((now - last) / 1000, 1 / 30));
            last = now;
            marchMaterial.uniforms.uTime.value = t;

            snow.visible = false;
            renderer.setRenderTarget(target);
            renderer.render(scene, camera);
            snow.visible = true;

            shared.uProjInv.value.copy(camera.projectionMatrixInverse);
            marchMaterial.uniforms.uCamWorld.value.copy(camera.matrixWorld);
            marchMaterial.uniforms.uCamPos.value.setFromMatrixPosition(camera.matrixWorld);
            renderer.setRenderTarget(fogTarget);
            renderer.render(marchScene, fogCamera);

            renderer.setRenderTarget(null);
            renderer.render(scene, camera);
            const autoClear = renderer.autoClear;
            renderer.autoClear = false;
            renderer.render(compositeScene, fogCamera);
            renderer.autoClear = autoClear;
        },
        /**
         * Sets the rotors that pull fog and snow through them (at most 4)
         * @param {{center: THREE.Vector3, radius: number}[]} list - Disk centres (world) and radii; axis is world z, blowing down
         */
        setRotors(list) {
            rotors = list.slice(0, MAX_ROTORS);
            rotors.forEach(({ center, radius }, i) => rotorUniforms.uRotors.value[i].set(center.x, center.y, center.z, radius));
            rotorUniforms.uRotorCount.value = rotors.length;
        },
        dispose() {
            scene.remove(snow);
            snowGeometry.dispose();
            snowMaterial.dispose();
            quad.dispose();
            marchMaterial.dispose();
            compositeMaterial.dispose();
            noiseTexture.dispose();
            fogTarget.dispose();
            target.depthTexture.dispose();
            target.dispose();
        }
    };
}
