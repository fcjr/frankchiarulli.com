"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const INK = "#1b1d1c";
const RED = "#c8302a";
const BG = "#a9b7b4";
const UP = new THREE.Vector3(0, 1, 0);

// radius along a unit direction for each target shape
const SHAPES: ((x: number, y: number, z: number) => number)[] = [
  () => 1,
  (x, y, z) => 0.74 / Math.max(Math.abs(x), Math.abs(y), Math.abs(z)),
  (x, y, z) => 1.15 / (Math.abs(x) + Math.abs(y) + Math.abs(z)),
  (x, y, z) => 0.88 / Math.max(Math.hypot(x, z), Math.abs(y)),
];
const HOLD = 2.4;
const MORPH = 1.6;
const SPREAD = 0.8;
const ANTENNA_LENGTH = 2.6;

// click to pump it up; the fifth quick click bursts it into line
// fragments that get sucked back together
const PUMPS = 5;
const PUMP_STEP = 0.11;
const PUMP_TIMEOUT = 1.3;
const POP_INFLATE = 0.08;
const POP_BURST = 3.2;
const POP_SETTLE = 0.5;

const easeOut = (k: number) => 1 - (1 - k) * (1 - k);
const easeInOut = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

// small deterministic value in -1..1
function hash(a: number, b: number) {
  const h = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return (h - Math.floor(h)) * 2 - 1;
}

const smooth = (k: number) => k * k * (3 - 2 * k);

// morph progress for a point at height u (0..1) at phase p (0..1);
// the change sweeps from one pole to the other
function progress(p: number, u: number) {
  const k = p * (1 + SPREAD) - u * SPREAD;
  return smooth(Math.min(1, Math.max(0, k)));
}

function phaseAt(t: number) {
  const period = HOLD + MORPH;
  const cycle = Math.floor(t / period);
  const idx = cycle % SHAPES.length;
  const next = (idx + 1) % SHAPES.length;
  const local = t % period;
  const p = local < HOLD ? 0 : (local - HOLD) / MORPH;
  const flip = cycle % 2 === 1;
  return { idx, next, p, flip };
}

// latitude/longitude lines on the unit sphere, as segment endpoints
const graticuleDirs = (() => {
  const out: number[] = [];
  const N = 72;
  const at = (lat: number, lon: number) =>
    out.push(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon));
  for (let m = 0; m < 12; m++) {
    const lon = (m * Math.PI) / 6;
    for (let i = 0; i < N; i++) {
      at(-Math.PI / 2 + (Math.PI * i) / N, lon);
      at(-Math.PI / 2 + (Math.PI * (i + 1)) / N, lon);
    }
  }
  for (let q = -2; q <= 2; q++) {
    const lat = (q * Math.PI) / 6;
    for (let i = 0; i < N; i++) {
      at(lat, (2 * Math.PI * i) / N);
      at(lat, (2 * Math.PI * (i + 1)) / N);
    }
  }
  return Float32Array.from(out);
})();

function radiusTable(dirs: Float32Array) {
  return SHAPES.map((f) => {
    const r = new Float32Array(dirs.length / 3);
    for (let i = 0; i < r.length; i++) {
      r[i] = f(dirs[i * 3], dirs[i * 3 + 1], dirs[i * 3 + 2]);
    }
    return r;
  });
}

function morph(
  dirs: Float32Array,
  out: Float32Array,
  a: Float32Array,
  b: Float32Array,
  p: number,
  flip: boolean,
) {
  for (let i = 0; i < a.length; i++) {
    const y = dirs[i * 3 + 1];
    const u = flip ? (1 - y) / 2 : (y + 1) / 2;
    const r = a[i] + (b[i] - a[i]) * progress(p, u);
    out[i * 3] = dirs[i * 3] * r;
    out[i * 3 + 1] = y * r;
    out[i * 3 + 2] = dirs[i * 3 + 2] * r;
  }
}

const antennaDirs = (() => {
  const tilt = THREE.MathUtils.degToRad(35);
  return [0, 1, 2, 3].map((i) => {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    return new THREE.Vector3(
      Math.sin(tilt) * Math.cos(a),
      Math.sin(tilt) * Math.sin(a),
      -Math.cos(tilt),
    ).normalize();
  });
})();

function Satellite({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const antennas = useRef<(THREE.Group | null)[]>([]);
  const pointer = useRef({ x: 0, y: 0 });
  const tilt = useRef({ x: 0, y: 0 });
  const fill = useRef<THREE.Mesh>(null);
  const popAt = useRef(-1);
  const pendingJump = useRef(false);
  const jump = useRef(0);
  const pumps = useRef(0);
  const lastPump = useRef(-1);
  const puff = useRef(1);

  // a cube-sphere: box vertices pushed onto the unit sphere, so the
  // grid lines up with the cube's edges and corners when it morphs there
  const geometry = useMemo(() => {
    const g = new THREE.BoxGeometry(2, 2, 2, 48, 48, 48);
    const arr = g.attributes.position.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      const l = Math.hypot(arr[i], arr[i + 1], arr[i + 2]);
      arr[i] /= l;
      arr[i + 1] /= l;
      arr[i + 2] /= l;
    }
    return g;
  }, []);
  const base = useMemo(
    () => Float32Array.from(geometry.attributes.position.array),
    [geometry],
  );
  const radii = useMemo(() => radiusTable(base), [base]);
  const lines = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(Float32Array.from(graticuleDirs), 3));
    return g;
  }, []);
  const lineRadii = useMemo(() => radiusTable(graticuleDirs), []);
  // one fling direction per run of segments, so pieces are arcs not dust
  const scatter = useMemo(() => {
    const n = graticuleDirs.length / 6;
    const out = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) {
      const c = Math.floor(k / 8);
      const j = c * 8 + 4;
      const mx = graticuleDirs[j * 6];
      const my = graticuleDirs[j * 6 + 1];
      const mz = graticuleDirs[j * 6 + 2];
      out[k * 3] = mx * 0.85 + hash(c, 1) * 0.45;
      out[k * 3 + 1] = my * 0.85 + hash(c, 2) * 0.45;
      out[k * 3 + 2] = mz * 0.85 + hash(c, 3) * 0.45;
    }
    return out;
  }, []);

  const pop = (e: { stopPropagation: () => void }) => {
    e.stopPropagation(); // the ray hits both the lines and the fill; count once
    if (!animate || popAt.current >= 0) return;
    pumps.current += 1;
    lastPump.current = -2; // stamped with the clock on the next frame
    if (pumps.current >= PUMPS) {
      pumps.current = 0;
      popAt.current = -2;
      pendingJump.current = true;
    }
  };
  const antennaRadii = useMemo(
    () => SHAPES.map((f) => antennaDirs.map((d) => f(d.x, d.y, d.z))),
    [],
  );
  const antennaQuats = useMemo(
    () => antennaDirs.map((d) => new THREE.Quaternion().setFromUnitVectors(UP, d)),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      lines.dispose();
    },
    [geometry, lines],
  );

  useEffect(() => {
    if (!animate) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [animate]);

  useFrame(({ clock }, delta) => {
    if (!animate || !group.current) return;
    const t = clock.elapsedTime;

    // pumping: each click puffs it up a step; it sighs back down if you stop
    if (lastPump.current === -2) lastPump.current = t;
    if (pumps.current > 0 && t - lastPump.current > PUMP_TIMEOUT) pumps.current = 0;
    const target = 1 + PUMP_STEP * pumps.current;
    const rate = target > puff.current ? 18 : 4;
    puff.current += (target - puff.current) * (1 - Math.exp(-delta * rate));
    const strain = pumps.current / PUMPS;
    group.current.position.set(
      hash(Math.floor(t * 30), 1) * 0.05 * strain,
      hash(Math.floor(t * 30), 2) * 0.05 * strain,
      0,
    );

    // pop state
    if (popAt.current === -2) popAt.current = t;
    const age = popAt.current < 0 ? Infinity : t - popAt.current;
    let sx = puff.current;
    let sy = puff.current;
    let env = 0;
    if (age < POP_INFLATE) {
      const k = easeOut(age / POP_INFLATE);
      sx = puff.current * (1 + 0.25 * k);
      sy = puff.current * (1 + 0.1 * k);
    } else if (age < POP_INFLATE + POP_BURST) {
      puff.current = 1;
      sx = 1;
      sy = 1;
      if (pendingJump.current) {
        jump.current += 1;
        pendingJump.current = false;
      }
      // fly apart fast, hang for a beat, then drift back together slowly
      const u = (age - POP_INFLATE) / POP_BURST;
      env = u < 0.1 ? easeOut(u / 0.1) : u < 0.3 ? 1 : 1 - easeInOut((u - 0.3) / 0.7);
    } else if (age < POP_INFLATE + POP_BURST + POP_SETTLE) {
      const u = (age - POP_INFLATE - POP_BURST) / POP_SETTLE;
      const wob = Math.sin(u * Math.PI * 2.5) * (1 - u) * 0.22;
      sx = 1 + wob;
      sy = 1 - wob;
    } else if (popAt.current >= 0) {
      popAt.current = -1;
    }
    group.current.scale.set(sx, sy, sx);
    if (fill.current) fill.current.visible = env < 0.03;

    // slow tumble plus a little lean toward the pointer
    const ease = 1 - Math.exp(-delta * 3);
    tilt.current.x += (pointer.current.y * 0.25 - tilt.current.x) * ease;
    tilt.current.y += (pointer.current.x * 0.35 - tilt.current.y) * ease;
    group.current.rotation.y = 0.6 + Math.sin(t * 0.25) * 0.55 + tilt.current.y;
    group.current.rotation.x = 0.35 + Math.sin(t * 0.35) * 0.2 + tilt.current.x;
    group.current.rotation.z = Math.sin(t * 0.18) * 0.15;

    // morph the body and its graticule
    const { idx, next, p, flip } = phaseAt(t + jump.current * (HOLD + MORPH));
    const pos = geometry.attributes.position;
    morph(base, pos.array as Float32Array, radii[idx], radii[next], p, flip);
    pos.needsUpdate = true;
    const lpos = lines.attributes.position;
    const larr = lpos.array as Float32Array;
    morph(graticuleDirs, larr, lineRadii[idx], lineRadii[next], p, flip);
    if (env > 0) {
      const n = scatter.length / 3;
      for (let k = 0; k < n; k++) {
        const dx = scatter[k * 3] * env;
        const dy = scatter[k * 3 + 1] * env;
        const dz = scatter[k * 3 + 2] * env;
        larr[k * 6] += dx;
        larr[k * 6 + 1] += dy;
        larr[k * 6 + 2] += dz;
        larr[k * 6 + 3] += dx;
        larr[k * 6 + 4] += dy;
        larr[k * 6 + 5] += dz;
      }
    }
    lpos.needsUpdate = true;

    // keep the antennas seated on the surface
    antennaDirs.forEach((d, i) => {
      const g = antennas.current[i];
      if (!g) return;
      const u = flip ? (1 - d.y) / 2 : (d.y + 1) / 2;
      const ra = antennaRadii[idx][i];
      const rb = antennaRadii[next][i];
      const r = ra + (rb - ra) * progress(p, u);
      g.position.copy(d).multiplyScalar(r - 0.02 + env * 1.2);
      g.rotation.z = env * (i % 2 ? 1.4 : -1.4);
    });
  });

  return (
    <group ref={group} rotation={[0.35, 0.6, 0]}>
      <lineSegments geometry={lines} onClick={pop}>
        <lineBasicMaterial color={INK} transparent opacity={0.9} />
      </lineSegments>
      <mesh
        ref={fill}
        geometry={geometry}
        onClick={pop}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <meshBasicMaterial color={BG} polygonOffset polygonOffsetFactor={0} polygonOffsetUnits={4} />
      </mesh>
      {antennaDirs.map((d, i) => (
        <group
          key={i}
          ref={(el) => {
            antennas.current[i] = el;
          }}
          position={d.clone().multiplyScalar(0.98)}
        >
          <group quaternion={antennaQuats[i]}>
            <mesh position={[0, ANTENNA_LENGTH / 2, 0]}>
              <cylinderGeometry args={[0.012, 0.012, ANTENNA_LENGTH, 6]} />
              <meshBasicMaterial color={INK} />
            </mesh>
            <mesh position={[0, ANTENNA_LENGTH, 0]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color={RED} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

export default function Sputnik() {
  const animate =
    typeof window === "undefined" ||
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={animate ? "always" : "demand"}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 6.2], fov: 38 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Satellite animate={animate} />
    </Canvas>
  );
}
