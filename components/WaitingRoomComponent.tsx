
import React, { useState } from 'react';

export interface WaitingPlayer {
    name: string;
    isCpu: boolean;
}

interface WaitingRoomComponentProps {
  playerName: string;
  onStartGame: (players: WaitingPlayer[]) => void;
}

const WaitingRoomComponent: React.FC<WaitingRoomComponentProps> = ({ playerName, onStartGame }) => {
  const [players, setPlayers] = useState<WaitingPlayer[]>([{ name: playerName, isCpu: false }]);

  const handleAddCpu = () => {
    if (players.length < 4) {
      const cpuNumber = players.filter(p => p.isCpu).length + 1;
      setPlayers([...players, { name: `CPU ${cpuNumber}`, isCpu: true }]);
    }
  };
  
  const canAddCpu = players.length < 4;
  const canStartGame = players.length >= 2; // Daifugo is typically 3+, but 2 is playable. Let's allow 2 for testing.

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 p-4">
        <div className="w-full max-w-2xl p-8 bg-gray-700 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold text-center mb-6">Waiting Room</h1>
            
            <div className="mb-6 p-4 bg-gray-900 rounded-md">
                <h2 className="text-lg font-semibold mb-2 text-yellow-400">Room Code</h2>
                <p className="text-2xl font-mono tracking-widest">XYZ123</p>
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 text-yellow-400">Players ({players.length}/4)</h2>
                <ul className="space-y-2">
                    {players.map((player, index) => (
                        <li key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                            <span className="font-medium text-lg">{player.name}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${player.isCpu ? 'bg-indigo-600' : 'bg-green-600'}`}>
                                {player.isCpu ? 'CPU' : 'Human'}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="mb-6">
                <label htmlFor="game-count" className="text-lg font-semibold mb-2 text-yellow-400 block">Number of Games</label>
                <select id="game-count" className="w-full p-2 bg-gray-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <option>1</option>
                    <option>3</option>
                    <option>5</option>
                </select>
            </div>

            <div className="flex justify-between space-x-4">
                <button
                    onClick={handleAddCpu}
                    disabled={!canAddCpu}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-lg font-bold transition-transform duration-150 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Add CPU
                </button>
                 <button
                    onClick={() => onStartGame(players)}
                    disabled={!canStartGame}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-lg font-bold transition-transform duration-150 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Start Game
                </button>
            </div>
        </div>
    </div>
  );
};

export default WaitingRoomComponent;
