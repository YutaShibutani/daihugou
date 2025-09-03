
import React, { useState } from 'react';
import LobbyComponent from './components/LobbyComponent';
import WaitingRoomComponent, { WaitingPlayer } from './components/WaitingRoomComponent';
import GameTableComponent from './components/GameTableComponent';
import JoinRoomComponent from './components/JoinRoomComponent';
import { Room } from './types';

type GameState = 'LOBBY' | 'JOINING_ROOM' | 'WAITING_ROOM' | 'GAME';

const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('LOBBY');
    const [playerName, setPlayerName] = useState<string>('');
    const [playersForGame, setPlayersForGame] = useState<WaitingPlayer[]>([]);
    
    // State for room management
    const [rooms, setRooms] = useState<{ [id: string]: Room }>({});
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [joinRoomError, setJoinRoomError] = useState<string | null>(null);

    const handleCreateRoom = (name: string) => {
        setPlayerName(name);
        const newRoomId = generateRoomId();
        const newRoom: Room = {
            id: newRoomId,
            players: [{ name, isCpu: false }],
            gameCount: 5
        };
        setRooms(prev => ({ ...prev, [newRoomId]: newRoom }));
        setCurrentRoomId(newRoomId);
        setGameState('WAITING_ROOM');
    };
    
    const handleGoToJoin = (name: string) => {
        setPlayerName(name);
        setGameState('JOINING_ROOM');
    };

    const handleJoinRoom = (roomId: string) => {
        setJoinRoomError(null);
        const roomToJoin = rooms[roomId.toUpperCase()];
        if (!roomToJoin) {
            setJoinRoomError("Room not found. Please check the code.");
            return;
        }
        if (roomToJoin.players.length >= 4) {
            setJoinRoomError("This room is already full.");
            return;
        }

        const updatedRoom = {
            ...roomToJoin,
            players: [...roomToJoin.players, { name: playerName, isCpu: false }]
        };

        setRooms(prev => ({ ...prev, [roomToJoin.id]: updatedRoom }));
        setCurrentRoomId(roomToJoin.id);
        setGameState('WAITING_ROOM');
    };

    const handleAddCpu = () => {
        if (!currentRoomId) return;
        const room = rooms[currentRoomId];
        if (room.players.length < 4) {
            const cpuNumber = room.players.filter(p => p.isCpu).length + 1;
            const updatedRoom = {
                ...room,
                players: [...room.players, { name: `CPU ${cpuNumber}`, isCpu: true }]
            };
            setRooms(prev => ({...prev, [currentRoomId]: updatedRoom }));
        }
    };

    const handleStartGame = () => {
        if (!currentRoomId) return;
        const room = rooms[currentRoomId];
        setPlayersForGame(room.players);
        setGameState('GAME');
    };

    const handleReturnToLobby = () => {
        setPlayerName('');
        setPlayersForGame([]);
        setCurrentRoomId(null);
        setJoinRoomError(null);
        setGameState('LOBBY');
    };

    const renderGameState = () => {
        const currentRoom = currentRoomId ? rooms[currentRoomId] : null;

        switch (gameState) {
            case 'LOBBY':
                return <LobbyComponent onCreateRoom={handleCreateRoom} onGoToJoin={handleGoToJoin} />;
            case 'JOINING_ROOM':
                return <JoinRoomComponent onJoinRoom={handleJoinRoom} onBack={handleReturnToLobby} error={joinRoomError} />
            case 'WAITING_ROOM':
                if (!currentRoom) {
                    // Should not happen, but as a fallback
                    return <LobbyComponent onCreateRoom={handleCreateRoom} onGoToJoin={handleGoToJoin} />;
                }
                return (
                    <WaitingRoomComponent 
                        roomCode={currentRoom.id}
                        players={currentRoom.players}
                        onStartGame={handleStartGame} 
                        onBackToLobby={handleReturnToLobby} 
                        onAddCpu={handleAddCpu}
                    />
                );
            case 'GAME':
                return <GameTableComponent playersInfo={playersForGame} onGameOver={handleReturnToLobby} />;
            default:
                return <LobbyComponent onCreateRoom={handleCreateRoom} onGoToJoin={handleGoToJoin} />;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            {renderGameState()}
        </div>
    );
};

export default App;
