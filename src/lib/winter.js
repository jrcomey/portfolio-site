import * as THREE from 'three';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';

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

const MAX_SPOTS = 4;

// Spotlights (e.g. landing lights under the aircraft), shared by the fog march, the composite and the snow.
// No shadows: light falls off with the inverse square of distance and fades across the cone's edge.
const SPOTS_GLSL = /* glsl */`
    uniform vec3 uSpotPos[${MAX_SPOTS}], uSpotDir[${MAX_SPOTS}];
    uniform int uSpotCount;
    uniform vec2 uSpotCone;  // cos of the outer and inner half-angles
    uniform float uSpotIntensity;

    // Light reaching p from spot i, and the unit direction from p toward it. Faded in over the first unit from
    // the lamp: the cone's tip is too thin and too bright for a dozen jittered fog samples (or the surfaces right
    // beside the lamp) to resolve, so it sparkled.
    float spot(int i, vec3 p, out vec3 toLight) {
        vec3 v = uSpotPos[i] - p;
        float d2 = dot(v, v);
        toLight = v * inversesqrt(max(d2, 1e-6));
        float cone = smoothstep(uSpotCone.x, uSpotCone.y, dot(-toLight, uSpotDir[i]));
        return uSpotIntensity * cone * smoothstep(0.0, 1.0, d2) / (1.0 + d2);
    }

    // All spots at a point in the air
    float spotsAt(vec3 p) {
        float sum = 0.0;
        vec3 l;
        for (int i = 0; i < ${MAX_SPOTS}; i++) {
            if (i >= uSpotCount) break;
            sum += spot(i, p, l);
        }
        return sum;
    }

    // All spots on a surface with normal n (Lambert)
    float spotsOn(vec3 p, vec3 n) {
        float sum = 0.0;
        vec3 l;
        for (int i = 0; i < ${MAX_SPOTS}; i++) {
            if (i >= uSpotCount) break;
            float e = spot(i, p, l);
            sum += e * max(dot(n, l), 0.0);
        }
        return sum;
    }
`;

// A jagged lightning bolt as line segments, by midpoint displacement from top to bottom, with a branch or two
function boltPositions(top, bottom) {
    const points = [top.clone(), bottom.clone()];
    let roughness = top.distanceTo(bottom) * 0.12;
    for (let level = 0; level < 6; level++, roughness *= 0.55) {
        for (let i = points.length - 1; i > 0; i--) {
            const mid = points[i - 1].clone().lerp(points[i], 0.5);
            mid.x += (Math.random() - 0.5) * 2 * roughness;
            mid.y += (Math.random() - 0.5) * 2 * roughness;
            mid.z += (Math.random() - 0.5) * roughness * 0.5;
            points.splice(i, 0, mid);
        }
    }
    const out = [];
    const addPath = (path) => {
        for (let i = 1; i < path.length; i++) out.push(...path[i - 1].toArray(), ...path[i].toArray());
    };
    addPath(points);
    for (let b = 0; b < 2; b++) {
        let p = points[Math.floor(points.length * (0.2 + 0.4 * Math.random()))].clone();
        const branch = [p.clone()];
        const step = new THREE.Vector3((Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2, -0.8).multiplyScalar(0.6);
        for (let i = 0; i < 12; i++) {
            p = p.clone().add(step).add(new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.3));
            branch.push(p);
        }
        addPath(branch);
    }
    return new Float32Array(out);
}

// Flash brightness tau seconds into a strike: a main flash and two restrikes, each decaying fast
function flashAt(tau) {
    const pulse = (t0, peak, decay) => (tau >= t0 ? peak * Math.exp(-(tau - t0) / decay) : 0);
    return Math.max(pulse(0, 1, 0.06), pulse(0.11, 0.7, 0.05), pulse(0.26, 0.9, 0.09));
}

/**
 * Colour of a blackbody light at a colour temperature, as an sRGB hex (Tanner Helland's fit, 1000-40000 K)
 * For reference, displays' white is 6500 K: lower is warmer, higher is cooler.
 * @param {number} kelvin
 * @returns {number}
 */
export function kelvinToColor(kelvin) {
    const t = THREE.MathUtils.clamp(kelvin, 1000, 40000) / 100;
    const r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
    const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
    const c = (v) => Math.round(THREE.MathUtils.clamp(v, 0, 255));
    return (c(r) << 16) | (c(g) << 8) | c(b);
}

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
 * Lighting: spotlights (opts.spots) scatter in the fog along the march and catch the snow, and light the
 * models themselves: every MeshBasicMaterial / LineBasicMaterial in the scene is patched (once, as it
 * appears) so fills shade by Lambert and lines brighten toward white in the light. Lightning strikes at
 * random intervals, drawing a jagged bolt in the distance and lighting the fog and surfaces facing it.
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
 * @param {{position: THREE.Vector3, direction: THREE.Vector3}[]} [opts.spots] - Up to 4 spotlights (world)
 * @param {number} [opts.spotColor=0xfff0d8] - Spotlight colour
 * @param {number} [opts.spotIntensity=8] - Spotlight strength (light at 1 unit is about intensity / 2)
 * @param {number} [opts.spotAngle=28] - Spotlight cone half-angle in degrees (soft over its outer third)
 * @param {number} [opts.spotFog=1] - Strength of the beams in the fog, relative to the light on the models
 * @param {number} [opts.albedo=0.35] - How much light the fills reflect
 * @param {number} [opts.lineGain=1.5] - How much brighter lines get in the light
 * @param {number} [opts.lineWhite=0.3] - How far lit lines shift toward the light's colour
 * @param {number} [opts.snowGlow=1.5] - How much brighter flakes get in the light
 * @param {number[]|null} [opts.lightning=[15, 45]] - Seconds between strikes [min, max]; null for none
 * @param {number} [opts.flashColor=0xb8c8ff] - Lightning colour
 * @param {number} [opts.flashFog=0.3] - How much a flash brightens the fog
 * @param {number} [opts.flashSurface=0.3] - How much a flash lights the surfaces facing it
 * @param {number} [opts.boltGlow=1.2] - Seconds the bolt takes to fade, like phosphor on a vector CRT
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
        snowBox = new THREE.Box3(new THREE.Vector3(-14, -14, -4), new THREE.Vector3(10, 14, 10)),
        spots = [],
        spotColor = 0xfff0d8,
        spotIntensity = 8,
        spotAngle = 28,
        spotFog = 1,
        albedo = 0.35,
        lineGain = 1.5,
        lineWhite = 0.3,
        snowGlow = 1.5,
        lightning = [15, 45],
        flashColor = 0xb8c8ff,
        flashFog = 0.3,
        flashSurface = 0.3,
        boltGlow = 1.2
    } = opts;

    const spotList = spots.slice(0, MAX_SPOTS);
    const spotUniforms = {
        uSpotPos: { value: Array.from({ length: MAX_SPOTS }, (_, i) => spotList[i]?.position.clone() ?? new THREE.Vector3()) },
        uSpotDir: { value: Array.from({ length: MAX_SPOTS }, (_, i) => spotList[i]?.direction.clone().normalize() ?? new THREE.Vector3(0, 0, -1)) },
        uSpotCount: { value: spotList.length },
        uSpotCone: { value: new THREE.Vector2(Math.cos(THREE.MathUtils.degToRad(spotAngle)), Math.cos(THREE.MathUtils.degToRad(spotAngle * 2 / 3))) },
        uSpotIntensity: { value: spotIntensity },
        uFlash: { value: 0 }
    };
    const litUniforms = {
        uSpotColor: { value: new THREE.Color(spotColor) },
        uFlashColor: { value: new THREE.Color(flashColor) },
        uFlashDir: { value: new THREE.Vector3(0, 0, 1) },
        uFlashSurface: { value: flashSurface },
        uLitAlbedo: { value: albedo },
        uLineGain: { value: lineGain },
        uLineWhite: { value: lineWhite }
    };

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

    // Low-res fog: R = transmittance along the ray, G = the view distance it was marched to,
    // B = spotlight scattered toward the camera along the way
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
        uFullSize: { value: size },
        uCamWorld: { value: new THREE.Matrix4() },
        uCamPos: { value: new THREE.Vector3() }
    };

    const marchMaterial = new THREE.ShaderMaterial({
        uniforms: {
            ...rotorUniforms,
            ...spotUniforms,
            ...shared,
            tNoise: { value: noiseTexture },
            uTime: { value: 0 },
            uFrame: { value: 0 },
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
            uniform float uTime, uFrame, uDensity, uFloor, uHeight, uScale, uMaxDist, uKick, uFlowPeriod;
            ${ROTOR_FLOW_GLSL}
            ${SPOTS_GLSL}
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

                // Jittered march (interleaved gradient noise) so few steps don't band; the pattern shifts every frame
                // (golden-ratio step) so it reads as fine grain rather than a fixed stipple in bright light
                float stepLen = dist / float(STEPS);
                float jitter = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))) + uFrame * 0.618034);
                // Light scattered at each step, dimmed by the fog between it and the camera
                float optical = 0.0, light = 0.0;
                for (int i = 0; i < STEPS; i++) {
                    vec3 p = uCamPos + dir * (float(i) + jitter) * stepLen;
                    float s = density(p) * stepLen;
                    if (uSpotCount > 0) light += exp(-optical - 0.5 * s) * s * spotsAt(p);
                    optical += s;
                }
                gl_FragColor = vec4(exp(-optical), dist, light, 1.0);
            }
        `,
        depthTest: false,
        depthWrite: false
    });

    const compositeMaterial = new THREE.ShaderMaterial({
        uniforms: {
            ...spotUniforms,
            ...litUniforms,
            ...shared,
            tFog: { value: fogTarget.texture },
            uFogSize: { value: fogSize },
            uFogColor: { value: new THREE.Color(fogColor) },
            uFlashFog: { value: flashFog },
            uSpotFog: { value: spotFog }
        },
        vertexShader: fullscreenVertex,
        fragmentShader: /* glsl */`
            uniform sampler2D tDepth, tFog;
            uniform mat4 uProjInv;
            uniform vec2 uFullSize, uFogSize;
            uniform vec3 uFogColor, uSpotColor, uFlashColor;
            uniform float uMaxDist, uFlash, uFlashFog, uSpotFog;
            varying vec2 vUv;
            ${viewDistanceGLSL}

            void main() {
                float depth = texture2D(tDepth, vUv).x;
                float dist = viewDistance(vUv, depth);

                // Depth-aware upsample: a 4x4 tent over the nearest fog texels (wide enough to average out the march's
                // per-texel jitter, which bright light otherwise shows as a checker pattern), each weight scaled down
                // by how far its marched distance is from this pixel's, so a line doesn't take the sky's fog or vice versa
                vec2 f = vUv * uFogSize - 0.5;
                ivec2 b = ivec2(floor(f));
                vec2 fr = f - floor(f);
                ivec2 last = ivec2(uFogSize) - 1;
                float T = 0.0, light = 0.0, wsum = 0.0;
                for (int j = -1; j < 3; j++) {
                    for (int i = -1; i < 3; i++) {
                        vec3 s = texelFetch(tFog, clamp(b + ivec2(i, j), ivec2(0), last), 0).xyz;
                        vec2 tent = max(1.0 - abs(vec2(i, j) - fr) * 0.5, 0.0);
                        float w = tent.x * tent.y * (exp(-abs(s.y - dist) / (0.05 * dist + 0.05)) + 1e-4);
                        T += w * s.x;
                        light += w * s.z;
                        wsum += w;
                    }
                }
                T /= wsum;
                light /= wsum;

                // Premultiplied over the scene: scene * T + fog * (1 - T) + light scattered in the fog
                vec3 fog = uFogColor + uFlashColor * uFlash * uFlashFog * 0.1;
                gl_FragColor = vec4(fog * (1.0 - T) + uSpotColor * light * uSpotFog, 1.0 - T);
                #include <colorspace_fragment>
            }
        `,
        transparent: true,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
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
            ...spotUniforms,
            uColor: { value: new THREE.Color(snowColor) },
            uOpacity: { value: snowOpacity },
            uBoxMin: { value: boxMin },
            uBoxSize: { value: boxSize },
            uGlow: { value: snowGlow }
        },
        vertexShader: /* glsl */`
            uniform vec3 uBoxMin, uBoxSize;
            uniform float uGlow, uFlash;
            varying float vAlpha;
            ${SPOTS_GLSL}
            void main() {
                // Fade out near the box faces so wrapping flakes don't pop; brighter in the light
                vec3 f = clamp((position - uBoxMin) / uBoxSize, 0.0, 1.0);
                vec3 edge = min(f, 1.0 - f);
                vAlpha = smoothstep(0.0, 0.08, min(edge.x, min(edge.y, edge.z)));
                vAlpha *= 1.0 + uGlow * (spotsAt(position) + uFlash);
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

    // Lightning: a bolt drawn after the fog (it's in the distant sky, so the fog would hide it), depth-tested
    // against the scene so the aircraft stays in front
    // Fat lines: a bright 2px core over a faint 10px glow
    const boltGeometry = new LineSegmentsGeometry();
    const boltMaterials = [[10, 0.25, flashColor], [2, 1, 0xffffff]].map(([linewidth, peak, color]) => {
        const material = new LineMaterial({
            color,
            linewidth,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        material.userData.peak = peak;
        return material;
    });
    const boltScene = new THREE.Scene();
    for (const material of boltMaterials) {
        const line = new LineSegments2(boltGeometry, material);
        line.frustumCulled = false;
        boltScene.add(line);
    }
    const randomBetween = ([a, b]) => a + (b - a) * Math.random();
    let nextStrike = lightning ? randomBetween([1.5, 4]) : Infinity;
    let strikeTime = -Infinity;

    function strike(t) {
        const forward = camera.getWorldDirection(new THREE.Vector3()).setZ(0).normalize();
        const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
        const camPos = camera.getWorldPosition(new THREE.Vector3());
        const base = camPos.addScaledVector(forward, 30 + 15 * Math.random()).addScaledVector(right, (Math.random() - 0.5) * 40);
        const top = base.clone().setZ(22);
        const bottom = base.clone().add(new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, 0)).setZ(-4);
        boltGeometry.setPositions(boltPositions(top, bottom));
        litUniforms.uFlashDir.value.copy(top.lerp(bottom, 0.5)).normalize();
        strikeTime = t;
        nextStrike = t + randomBetween(lightning);
    }

    // Lights the scene's own materials: fills (MeshBasicMaterial) get Lambert shading from the spots and the
    // flash; lines (LineBasicMaterial, no normals) get brighter and whiter wherever the light reaches them
    const litHeader = /* glsl */`
        varying vec3 vLitPos;
        varying vec3 vLitNormal;
    `;
    const litFragment = /* glsl */`
        uniform vec3 uSpotColor, uFlashColor, uFlashDir;
        uniform float uFlash, uFlashSurface, uLitAlbedo, uLineGain, uLineWhite;
        ${SPOTS_GLSL}
    `;
    function lightMaterial(material) {
        const surface = material.isMeshBasicMaterial;
        material.onBeforeCompile = (shader) => {
            Object.assign(shader.uniforms, spotUniforms, litUniforms);
            shader.vertexShader = shader.vertexShader
                .replace('#include <common>', `#include <common>\n${litHeader}`)
                .replace('#include <project_vertex>', `#include <project_vertex>
                    vLitPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
                    ${surface ? 'vLitNormal = normalize(mat3(modelMatrix) * normal);' : ''}`);
            shader.fragmentShader = shader.fragmentShader
                .replace('#include <common>', `#include <common>\n${litHeader}\n${litFragment}`)
                .replace('#include <opaque_fragment>', (surface ? `
                    vec3 litN = normalize(vLitNormal) * (gl_FrontFacing ? 1.0 : -1.0);
                    outgoingLight += uLitAlbedo * (uSpotColor * spotsOn(vLitPos, litN)
                        + uFlashColor * uFlash * uFlashSurface * max(dot(litN, uFlashDir), 0.0));
                ` : `
                    float lit = spotsAt(vLitPos) + uFlash * uFlashSurface;
                    outgoingLight = outgoingLight * (1.0 + uLineGain * lit) + uSpotColor * uLineWhite * lit;
                `) + '\n#include <opaque_fragment>');
        };
        material.customProgramCacheKey = () => (surface ? 'winter-lit-fill' : 'winter-lit-line');
        material.userData.winterLit = true;
        material.needsUpdate = true;
    }
    // Models load asynchronously, so new materials are picked up each frame (a cheap walk of the scene graph)
    function lightScene() {
        scene.traverse((object) => {
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            for (const material of materials) {
                if ((material?.isMeshBasicMaterial || material?.isLineBasicMaterial) && !material.userData.winterLit) {
                    lightMaterial(material);
                }
            }
        });
    }

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
            marchMaterial.uniforms.uFrame.value = (marchMaterial.uniforms.uFrame.value + 1) % 1000;

            if (spotList.length || lightning) lightScene();
            if (t >= nextStrike || t < strikeTime) strike(t);
            const tau = t - strikeTime;
            const flash = flashAt(tau);
            spotUniforms.uFlash.value = flash;
            // The bolt flickers with the flash, then lingers as a fading afterimage
            const boltLevel = Math.max(Math.min(1, flash * 1.5), 0.45 * Math.exp(-tau / boltGlow));
            for (const material of boltMaterials) {
                material.opacity = boltLevel * material.userData.peak;
                material.resolution.copy(size).divideScalar(renderer.getPixelRatio());
            }

            snow.visible = false;
            renderer.setRenderTarget(target);
            renderer.render(scene, camera);
            snow.visible = true;

            shared.uProjInv.value.copy(camera.projectionMatrixInverse);
            shared.uCamWorld.value.copy(camera.matrixWorld);
            shared.uCamPos.value.setFromMatrixPosition(camera.matrixWorld);
            renderer.setRenderTarget(fogTarget);
            renderer.render(marchScene, fogCamera);

            renderer.setRenderTarget(null);
            renderer.render(scene, camera);
            const autoClear = renderer.autoClear;
            renderer.autoClear = false;
            renderer.render(compositeScene, fogCamera);
            if (boltLevel > 0.01) renderer.render(boltScene, camera);
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
            boltGeometry.dispose();
            boltMaterials.forEach((m) => m.dispose());
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
