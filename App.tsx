
import React, { useState } from 'react';
import { GameScene } from './components/GameScene';

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);

  if (!gameStarted) {
    return (
      <div className="w-full h-full bg-[#111] flex items-center justify-center text-white flex-col gap-8">
        <div className="text-center">
          <h1 className="text-6xl font-black tracking-tighter mb-2 italic">POLYSTRIKE <span className="text-green-500">1.6</span></h1>
          <p className="text-gray-400 font-mono tracking-widest uppercase text-sm">Low-Poly First Person Tactics</p>
        </div>
        
        <div className="flex flex-col gap-4 w-64">
          <button 
            onClick={() => setGameStarted(true)}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-900/20"
          >
            START GAME
          </button>
          
          <div className="bg-white/5 p-4 rounded text-xs font-mono text-gray-400 leading-relaxed border border-white/10">
            <p className="mb-2 text-white font-bold">CONTROLS:</p>
            <ul className="space-y-1">
              <li>• [WASD] MOVE</li>
              <li>• [SPACE] JUMP</li>
              <li>• [1] PRIMARY (AK47)</li>
              <li>• [2] SECONDARY (PISTOL)</li>
              <li>• [CLICK] FIRE</li>
            </ul>
          </div>
        </div>

        <div className="absolute bottom-8 text-gray-600 text-[10px] font-mono tracking-tighter">
          RENDERED VIA THREE.JS & REACT THREE FIBER
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <GameScene />
    </div>
  );
};

export default App;
