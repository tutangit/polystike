
import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useKeyboard } from '../hooks/useKeyboard';
import { Weapon } from './Weapon';
import { WeaponType } from '../types';

const SPEED = 5;
const JUMP_FORCE = 4;

export const Player: React.FC = () => {
  const { camera } = useThree();
  const keyboard = useKeyboard();
  const [weapon, setWeapon] = useState<WeaponType>(WeaponType.PISTOL);
  const [isShooting, setIsShooting] = useState(false);
  
  // SPAWN POSITION: Alterado para [-10, 2, -10] que é uma área vazia no layout do labirinto
  const [ref, api] = useSphere(() => ({
    mass: 1,
    type: 'Dynamic',
    position: [-10, 2, -10], 
    fixedRotation: true,
    args: [0.6],
    linearDamping: 0.9, // Ajuda a parar o movimento mais suavemente
  }));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => {
    const unsubscribe = api.velocity.subscribe((v) => (velocity.current = v));
    return unsubscribe;
  }, [api.velocity]);

  const pos = useRef([0, 0, 0]);
  useEffect(() => {
    const unsubscribe = api.position.subscribe((p) => (pos.current = p));
    return unsubscribe;
  }, [api.position]);

  // Weapon switching logic
  useEffect(() => {
    if (keyboard.slot1) setWeapon(WeaponType.AK47);
    if (keyboard.slot2) setWeapon(WeaponType.PISTOL);
  }, [keyboard.slot1, keyboard.slot2]);

  // Handle shooting
  useEffect(() => {
    const handleMouseDown = () => setIsShooting(true);
    const handleMouseUp = () => setIsShooting(false);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useFrame(() => {
    // Safety check: Se cair por algum erro de física, resetar para o spawn
    if (pos.current[1] < -5) {
      api.position.set(-10, 2, -10);
      api.velocity.set(0, 0, 0);
    }

    // Camera follows physics body
    camera.position.copy(new THREE.Vector3(pos.current[0], pos.current[1] + 0.8, pos.current[2]));

    // Movement calculation
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, Number(keyboard.backward) - Number(keyboard.forward));
    const sideVector = new THREE.Vector3(Number(keyboard.left) - Number(keyboard.right), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED)
      .applyQuaternion(camera.quaternion);

    api.velocity.set(direction.x, velocity.current[1], direction.z);

    // Jump logic (verificação simples de altura para permitir pulo)
    if (keyboard.jump && Math.abs(velocity.current[1]) < 0.1) {
      api.velocity.set(velocity.current[0], JUMP_FORCE, velocity.current[2]);
    }
  });

  return (
    <>
      <PointerLockControls />
      <mesh ref={ref as any} />
      {/* Weapon model attached to camera */}
      <group position={camera.position} quaternion={camera.quaternion}>
        <Weapon type={weapon} isShooting={isShooting} />
      </group>
    </>
  );
};
