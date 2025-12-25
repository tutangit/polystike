
export enum WeaponType {
  PISTOL = 'PISTOL',
  AK47 = 'AK47'
}

export interface KeyboardState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  slot1: boolean;
  slot2: boolean;
}
