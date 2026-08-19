"use client";

import { useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";
import { usePrefersReducedMotion, useThemeColors } from "./hero-visual";

function makeGlowTexture(color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function StarDust({ color }: { color: string }) {
  const texture = useMemo(() => makeGlowTexture(color), [color]);
  const positions = useMemo(() => {
    const rand = (i: number) => {
      const x = Math.sin(i * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    const pts = new Float32Array(240 * 3);
    for (let i = 0; i < 240; i++) {
      const r = 3.5 + rand(i) * 3.5;
      const theta = rand(i + 500) * Math.PI * 2;
      const phi = Math.acos(2 * rand(i + 900) - 1);
      const sinPhi = Math.sin(phi);
      pts[i * 3] = r * sinPhi * Math.cos(theta);
      pts[i * 3 + 1] = r * Math.cos(phi);
      pts[i * 3 + 2] = r * sinPhi * Math.sin(theta);
    }
    return pts;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        color={color}
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}

function Nebula({
  color,
  position,
  scale,
  opacity,
  additive,
}: {
  color: string;
  position: [number, number, number];
  scale: number;
  opacity: number;
  additive: boolean;
}) {
  const texture = useMemo(() => makeGlowTexture(color), [color]);
  return (
    <sprite position={position} scale={[scale, scale, 1]}>
      <spriteMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </sprite>
  );
}

function Orb({
  positionRef,
  color,
  reduced,
  dark,
  wire,
}: {
  positionRef: RefObject<THREE.Vector3>;
  color: string;
  reduced: boolean;
  dark: boolean;
  wire: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const time = useRef(0);
  const glow = useMemo(() => makeGlowTexture(color), [color]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    g.position.copy(positionRef.current);
    if (reduced) return;
    time.current += delta;
    if (wire) {
      g.rotation.y = time.current * 0.3;
      g.rotation.z = Math.sin(time.current * 0.2) * 0.4;
    } else {
      const s = 1 + Math.sin(time.current * 1.1) * 0.04;
      g.scale.setScalar(s);
    }
  });

  if (wire) {
    return (
      <group ref={group}>
        <mesh rotation={[0.4, 0.2, 0]}>
          <icosahedronGeometry args={[1.25, 1]} />
          <meshBasicMaterial
            color={color}
            wireframe
            transparent
            opacity={dark ? 0.45 : 0.6}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1.05, 48, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={dark ? 0.35 : 0.25}
          roughness={0.25}
          metalness={0.15}
        />
      </mesh>
      <sprite scale={[4.6, 4.6, 1]}>
        <spriteMaterial
          map={glow}
          transparent
          opacity={dark ? 0.55 : 0.65}
          depthWrite={false}
          blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </sprite>
    </group>
  );
}

const STREAM_COUNT = 130;

function RelayStream({
  fromRef,
  toRef,
  color,
  reduced,
  dark,
}: {
  fromRef: RefObject<THREE.Vector3>;
  toRef: RefObject<THREE.Vector3>;
  color: string;
  reduced: boolean;
  dark: boolean;
}) {
  const geometry = useRef<THREE.BufferGeometry>(null);
  const offset = useRef(0);

  const baseT = useMemo(() => Float32Array.from({ length: STREAM_COUNT }, (_, i) => i / STREAM_COUNT), []);
  const speeds = useMemo(() => {
    const rand01 = (i: number) => {
      const x = Math.sin(i * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    return Float32Array.from({ length: STREAM_COUNT }, (_, i) => 0.6 + rand01(i) * 0.7);
  }, []);

  useFrame((_, delta) => {
    const pos = geometry.current?.attributes.position as THREE.BufferAttribute | undefined;
    const from = fromRef.current;
    const to = toRef.current;
    if (!pos || !from || !to) return;

    const curve = new THREE.CatmullRomCurve3([
      from.clone(),
      new THREE.Vector3(
        (from.x + to.x) / 2,
        Math.min(from.y, to.y) + 1.2,
        (from.z + to.z) / 2,
      ),
      to.clone(),
    ]);

    if (!reduced) offset.current += delta / 6;
    for (let i = 0; i < STREAM_COUNT; i++) {
      const t = (baseT[i] + offset.current * speeds[i]) % 1;
      const p = curve.getPoint(t);
      pos.setXYZ(i, p.x, p.y, p.z);
    }
    pos.needsUpdate = true;
    geometry.current?.computeBoundingSphere();
  });

  return (
    <points>
      <bufferGeometry ref={geometry}>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(STREAM_COUNT * 3), 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        sizeAttenuation
        transparent
        opacity={dark ? 0.85 : 0.95}
        depthWrite={false}
        blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
        color={color}
      />
    </points>
  );
}

function RelaySystem({
  color,
  reduced,
  dark,
}: {
  color: string;
  reduced: boolean;
  dark: boolean;
}) {
  const orbA = useRef(new THREE.Vector3(-2.9, 0.5, 0));
  const orbB = useRef(new THREE.Vector3(2.9, -0.4, 0.4));
  const time = useRef(0);

  useFrame((_, delta) => {
    if (reduced) return;
    time.current += delta;
    const t = time.current;
    orbA.current.set(
      -2.9 + Math.sin(t * 0.4) * 0.2,
      0.5 + Math.cos(t * 0.3) * 0.25,
      Math.sin(t * 0.22) * 0.15,
    );
    orbB.current.set(
      2.9 + Math.sin(t * 0.32 + 2) * 0.22,
      -0.4 + Math.cos(t * 0.36 + 1) * 0.22,
      0.4 + Math.sin(t * 0.26 + 0.5) * 0.15,
    );
  });

  return (
    <>
      <Orb positionRef={orbA} color={color} reduced={reduced} dark={dark} wire={false} />
      <Orb positionRef={orbB} color={color} reduced={reduced} dark={dark} wire />
      <RelayStream fromRef={orbA} toRef={orbB} color={color} reduced={reduced} dark={dark} />
    </>
  );
}

export function HeroScene() {
  const colors = useThemeColors();
  const reduced = usePrefersReducedMotion();
  const dark = colors.dark;

  return (
    <Canvas
      camera={{ position: [0, 0, 8.5], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      frameloop={reduced ? "demand" : "always"}
      className="!absolute inset-0"
    >
      <ambientLight intensity={dark ? 0.6 : 0.45} />
      <directionalLight position={[4, 6, 4]} intensity={1.4} color={colors.primary} />
      {dark ? (
        <Stars radius={65} depth={35} count={1800} factor={3.5} saturation={0} fade speed={reduced ? 0 : 0.4} />
      ) : (
        <StarDust color={colors.primary} />
      )}
      <Sparkles count={70} scale={10} size={1.8} speed={reduced ? 0 : 0.35} color={colors.primary} opacity={dark ? 0.6 : 0.85} />
      <Nebula color={colors.glow1} position={[-9, 3.5, -7]} scale={18} opacity={dark ? 0.5 : 0.7} additive={dark} />
      <Nebula color={colors.glow2} position={[9, -2.5, -8]} scale={15} opacity={dark ? 0.45 : 0.65} additive={dark} />
      <Nebula color={colors.glow1} position={[0, -6, -6]} scale={20} opacity={dark ? 0.3 : 0.5} additive={dark} />
      <RelaySystem color={colors.primary} reduced={reduced} dark={dark} />
    </Canvas>
  );
}