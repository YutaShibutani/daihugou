
import React, { useState } from 'react';

interface JoinRoomComponentProps {
    onJoinRoom: (roomId: string) => void;
    onBack: () => void;
    error: string | null;
}

const JoinRoomComponent: React.FC<JoinRoomComponentProps> = ({ onJoinRoom, onBack, error }) => {
    const [roomCode, setRoomCode] = useState('');

    const handleJoin = () => {
        if (roomCode.trim()) {
            onJoinRoom(roomCode.trim());
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-800">
            <div className="w-full max-w-sm p-8 bg-gray-700 rounded-lg shadow-xl relative">
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-lg font-bold transition-transform duration-150 transform active:scale-95"
                    aria-label="Back to Lobby"
                >
                    &larr; Back
                </button>
                <h1 className="text-3xl font-bold text-center mb-6">Join Room</h1>
                
                <label htmlFor="roomCode" className="block text-lg font-medium mb-2">
                    Enter Room Code
                </label>
                <input
                    type="text"
                    id="roomCode"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    className="w-full px-4 py-2 mb-4 text-black uppercase rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="XYZ123"
                    maxLength={6}
                />
                
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                <button
                    onClick={handleJoin}
                    disabled={!roomCode.trim()}
                    className="w-full px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-xl font-bold transition-transform duration-150 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Join
                </button>
            </div>
        </div>
    );
};

export default JoinRoomComponent;
