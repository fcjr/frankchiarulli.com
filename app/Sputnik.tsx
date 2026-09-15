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

    // slow tumble plus a little lean toward the pointer
    const ease = 1 - Math.exp(-delta * 3);
    tilt.current.x += (pointer.current.y * 0.25 - tilt.current.x) * ease;
    tilt.current.y += (pointer.current.x * 0.35 - tilt.current.y) * ease;
    group.current.rotation.y = 0.6 + Math.sin(t * 0.25) * 0.55 + tilt.current.y;
    group.current.rotation.x = 0.35 + Math.sin(t * 0.35) * 0.2 + tilt.current.x;
    group.current.rotation.z = Math.sin(t * 0.18) * 0.15;

    // morph the body and its graticule
    const { idx, next, p, flip } = phaseAt(t);
    const pos = geometry.attributes.position;
    morph(base, pos.array as Float32Array, radii[idx], radii[next], p, flip);
    pos.needsUpdate = true;
    const lpos = lines.attributes.position;
    morph(graticuleDirs, lpos.array as Float32Array, lineRadii[idx], lineRadii[next], p, flip);
    lpos.needsUpdate = true;

    // keep the antennas seated on the surface
    antennaDirs.forEach((d, i) => {
      const g = antennas.current[i];
      if (!g) return;
      const u = flip ? (1 - d.y) / 2 : (d.y + 1) / 2;
      const ra = antennaRadii[idx][i];
      const rb = antennaRadii[next][i];
      const r = ra + (rb - ra) * progress(p, u);
      g.position.copy(d).multiplyScalar(r - 0.02);
    });
  });

  return (
    <group ref={group} rotation={[0.35, 0.6, 0]}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color={INK} transparent opacity={0.9} />
      </lineSegments>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={BG} polygonOffset polygonOffsetFactor={0} polygonOffsetUnits={4} />
      </mesh>
      {antennaDirs.map((d, i) => (
        <group
          key={i}
          ref={(el) => {
            antennas.current[i] = el;
          }}
          position={d.clone().multiplyScalar(0.98)}
          quaternion={antennaQuats[i]}
        >
          <mesh position={[0, ANTENNA_LENGTH / 2, 0]}>
            <cylinderGeometry args={[0.012, 0.012, ANTENNA_LENGTH, 6]} />
            <meshBasicMaterial color={INK} />
          </mesh>
          <mesh position={[0, ANTENNA_LENGTH, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color={RED} />
          </mesh>
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
