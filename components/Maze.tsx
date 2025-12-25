
import React, { useMemo } from 'react';
import { useBox, usePlane } from '@react-three/cannon';
import * as THREE from 'three';

const createTexture = (type: 'wall' | 'floor') => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  if (type === 'wall') {
    // Brick pattern
    ctx.fillStyle = '#4a4e69';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) {
      const y = i * 32;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
      for (let j = 0; j < 4; j++) {
        const x = j * 64 + (i % 2 === 0 ? 0 : 32);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 32);
        ctx.stroke();
      }
    }
  } else {
    // Floor tiles
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 256, 256);
    ctx.beginPath();
    ctx.moveTo(128, 0); ctx.lineTo(128, 256);
    ctx.moveTo(0, 128); ctx.lineTo(256, 128);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
};

const MAZE_SIZE = 12;
const MAZE_LAYOUT = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const Wall: React.FC<{ position: [number, number, number], texture: THREE.Texture }> = ({ position, texture }) => {
  const [ref] = useBox(() => ({
    type: 'Static',
    args: [2, 3, 2],
    position,
  }));

  return (
    <mesh ref={ref as any}>
      <boxGeometry args={[2, 3, 2]} />
      <meshStandardMaterial map={texture} roughness={0.9} />
    </mesh>
  );
};

export const Maze: React.FC = () => {
  const wallTexture = useMemo(() => createTexture('wall'), []);
  const floorTexture = useMemo(() => {
    const t = createTexture('floor');
    t.repeat.set(20, 20);
    return t;
  }, []);

  // FÍSICA DO CHÃO
  const [floorRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }));

  const walls = useMemo(() => {
    const elements = [];
    for (let i = 0; i < MAZE_LAYOUT.length; i++) {
      for (let j = 0; j < MAZE_LAYOUT[i].length; j++) {
        if (MAZE_LAYOUT[i][j] === 1) {
          elements.push(
            <Wall 
              key={`${i}-${j}`} 
              position={[i * 2 - MAZE_SIZE, 1.5, j * 2 - MAZE_SIZE]} 
              texture={wallTexture}
            />
          );
        }
      }
    }
    return elements;
  }, [wallTexture]);

  return (
    <group>
      {/* Floor Mesh + Physics */}
      <mesh ref={floorRef as any} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial map={floorTexture} />
      </mesh>
      
      {/* Maze Walls */}
      {walls}
      
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
      />
    </group>
  );
};
