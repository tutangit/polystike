
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { WeaponType } from '../types';

interface WeaponProps {
  type: WeaponType;
  isShooting: boolean;
}

const WEAPON_CONFIGS = {
  [WeaponType.PISTOL]: {
    url: 'https://poly.pizza/api/model/J3i9KDQ3kt/download/glb/683fd73347b14484c2798cb4db01c7c3',
    position: [0.35, -0.25, -0.45] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
    scale: 0.1,
    color: '#333'
  },
  [WeaponType.AK47]: {
    url: 'https://poly.pizza/api/model/Bgvuu4CUMV/download/glb/9f0e239ddec0436e26e4e56885283ec1',
    position: [0.35, -0.3, -0.55] as [number, number, number],
    rotation: [0, Math.PI / 2, 0] as [number, number, number],
    scale: 0.25,
    color: '#4b3621'
  }
};

/**
 * Procedural low-poly weapon models as fallback
 * if the external GLB fails to fetch (e.g. CORS issues).
 */
const FallbackModel: React.FC<{ type: WeaponType }> = ({ type }) => {
  const isAK = type === WeaponType.AK47;
  
  if (isAK) {
    return (
      <group rotation={[0, -Math.PI / 2, 0]}>
        {/* AK47 Fallback */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.1, 0.06]} /> {/* Receiver */}
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[-0.4, -0.05, 0]}>
          <boxGeometry args={[0.3, 0.15, 0.05]} /> {/* Stock */}
          <meshStandardMaterial color="#4b3621" />
        </mesh>
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[0.6, 0.04, 0.04]} /> {/* Barrel */}
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0.1, -0.2, 0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.08, 0.3, 0.05]} /> {/* Magazine */}
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0.2, 0, 0]}>
          <boxGeometry args={[0.3, 0.08, 0.07]} /> {/* Handguard */}
          <meshStandardMaterial color="#4b3621" />
        </mesh>
      </group>
    );
  }

  return (
    <group rotation={[0, Math.PI, 0]}>
      {/* Pistol Fallback */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.06, 0.08, 0.3]} /> {/* Slide */}
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, -0.1, -0.05]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.05, 0.15, 0.07]} /> {/* Grip */}
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
};

const SafeGLTF: React.FC<{ url: string; scale: number; type: WeaponType }> = ({ url, scale, type }) => {
  const [error, setError] = useState(false);

  // We use a custom hook-like pattern to catch potential errors in useGLTF
  // Although useGLTF is a hook, if the promise rejects, Suspense usually catches it.
  // This is a safety layer.
  try {
    const { scene } = useGLTF(url);
    if (error) return <FallbackModel type={type} />;
    return <primitive object={scene} scale={scale} />;
  } catch (e) {
    if (!error) setError(true);
    return <FallbackModel type={type} />;
  }
};

export const Weapon: React.FC<WeaponProps> = ({ type, isShooting }) => {
  const group = useRef<THREE.Group>(null);
  const flashRef = useRef<THREE.Group>(null);
  const config = WEAPON_CONFIGS[type];
  const [flashIntensity, setFlashIntensity] = useState(0);

  // Create shell particles for effect
  const shells = useMemo(() => {
    return new Array(5).fill(0).map(() => ({
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      active: false
    }));
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    
    // CS 1.6 Style Recoil (Snappy and Vertical)
    if (isShooting) {
      // Push back and kick up
      group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, config.position[2] + 0.12, 0.5);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -0.15, 0.5);
      setFlashIntensity(10);
    } else {
      // Smooth recovery
      group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, config.position[2], 0.1);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0, 0.1);
      setFlashIntensity(prev => Math.max(0, prev - 2));
    }

    // Weapon Sway (Breathe effect)
    if (!isShooting) {
      group.current.position.x = config.position[0] + Math.sin(t * 1.2) * 0.004;
      group.current.position.y = config.position[1] + Math.cos(t * 2.4) * 0.004;
    }

    // Randomize flash scale to look like it's flickering
    if (flashRef.current && flashIntensity > 0) {
      const s = 0.8 + Math.random() * 0.4;
      flashRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={group} position={config.position} rotation={config.rotation}>
      <React.Suspense fallback={<FallbackModel type={type} />}>
        <SafeGLTF url={config.url} scale={config.scale} type={type} />
      </React.Suspense>
      
      {/* Enhanced Muzzle Flash */}
      {flashIntensity > 0 && (
        <group ref={flashRef} position={[0, 0.05, type === WeaponType.AK47 ? 0.6 : 0.35]}>
          <pointLight intensity={flashIntensity} distance={4} color="#ffcc33" />
          {/* Inner Core */}
          <mesh>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Outer Glow */}
          <mesh>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color="#ffaa00" transparent opacity={0.4} />
          </mesh>
          {/* Spike FX */}
          {[0, 1, 2].map((i) => (
            <mesh key={i} rotation={[0, 0, (i * Math.PI) / 1.5]}>
              <boxGeometry args={[0.01, 0.2, 0.01]} />
              <meshBasicMaterial color="#ffcc00" />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};
