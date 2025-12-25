
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky, Stars, ContactShadows } from '@react-three/drei';
import { Player } from './Player';
import { Maze } from './Maze';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any) { console.error("GameScene Error:", error); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-black flex items-center justify-center text-white font-mono p-10 text-center">
          <div>
            <h2 className="text-2xl text-red-500 mb-4">CRITICAL ERROR</h2>
            <p className="mb-6 opacity-60 text-sm">A rendering error occurred. This might be due to a failed resource fetch or GPU driver issue.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors"
            >
              RELOAD GAME
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const GameScene: React.FC = () => {
  return (
    <div className="w-full h-full relative cursor-crosshair overflow-hidden bg-black">
      <ErrorBoundary>
        <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1000 }}>
          <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
          
          <Suspense fallback={null}>
            <Physics gravity={[0, -9.81, 0]}>
              <Player />
              <Maze />
            </Physics>
          </Suspense>
        </Canvas>
      </ErrorBoundary>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 select-none">
        {/* Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 opacity-70 flex items-center justify-center">
            <div className="absolute w-4 h-0.5 bg-green-400" />
            <div className="absolute w-0.5 h-4 bg-green-400" />
            <div className="w-1 h-1 bg-green-400 rounded-full" />
        </div>

        {/* HUD Top */}
        <div className="flex justify-between items-start">
          <div className="bg-black/70 text-green-400 px-6 py-3 rounded-sm font-mono text-xl border-l-4 border-green-500 shadow-xl">
            POLYSTRIKE <span className="opacity-50 text-xs">v1.6-BETA</span>
          </div>
          <div className="bg-black/70 text-white px-6 py-3 rounded-sm font-mono border-b border-white/10 flex gap-4">
            <span className="text-gray-500">PING: <span className="text-green-500">12ms</span></span>
            <span>TIME: <span className="text-yellow-400">01:34</span></span>
          </div>
        </div>

        {/* HUD Bottom */}
        <div className="flex justify-between items-end">
          <div className="flex gap-2">
            <div className="bg-black/70 text-white px-6 py-4 rounded-sm border-b-4 border-green-600 shadow-2xl min-w-[120px]">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Health</div>
              <div className="text-4xl font-black text-green-500 italic">100</div>
            </div>
            <div className="bg-black/70 text-white px-6 py-4 rounded-sm border-b-4 border-blue-600 shadow-2xl min-w-[120px]">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Armor</div>
              <div className="text-4xl font-black text-blue-500 italic">100</div>
            </div>
          </div>
          
          <div className="bg-black/70 text-white px-8 py-4 rounded-sm border-b-4 border-yellow-600 shadow-2xl flex flex-col items-end min-w-[160px]">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Ammo</div>
            <div className="text-4xl font-black text-yellow-500 italic flex items-baseline gap-1">
              30 <span className="text-xl text-yellow-800">/ 90</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/20 text-[10px] font-mono tracking-widest uppercase">
        [WASD] MOVE | [SPACE] JUMP | [L-CLICK] FIRE | [1-2] WEAPONS | [ESC] UNLOCK MOUSE
      </div>
    </div>
  );
};
