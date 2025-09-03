
import React, { useState } from 'react';

interface LobbyComponentProps {
  onEnterRoom: (playerName: string) => void;
}

const LobbyComponent: React.FC<LobbyComponentProps> = ({ onEnterRoom }) => {
  const [playerName, setPlayerName] = useState('');

  const handleEnter = () => {
    if (playerName.trim()) {
      onEnterRoom(playerName.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800">
      <h1 className="text-5xl font-bold mb-8">Daifugo Online</h1>
      <div className="w-full max-w-sm p-8 bg-gray-700 rounded-lg shadow-xl">
        <label htmlFor="playerName" className="block text-lg font-medium mb-2">
          Enter Your Name
        </label>
        <input
          type="text"
          id="playerName"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
          className="w-full px-4 py-2 mb-6 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Player"
        />
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleEnter}
            disabled={!playerName.trim()}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-xl font-bold transition-transform duration-150 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Room
          </button>
          <button
            onClick={handleEnter}
            disabled={!playerName.trim()}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-xl font-bold transition-transform duration-150 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyComponent;
