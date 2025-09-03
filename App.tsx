
import React, { useState } from 'react';
import LobbyComponent from './components/LobbyComponent';
import WaitingRoomComponent, { WaitingPlayer } from './components/WaitingRoomComponent';
import GameTableComponent from './components/GameTableComponent';

type GameState = 'LOBBY' | 'WAITING_ROOM' | 'GAME';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('LOBBY');
    const [playerName, setPlayerName] = useState<string>('');
    const [players, setPlayers] = useState<WaitingPlayer[]>([]);

    const handleEnterRoom = (name: string) => {
        setPlayerName(name);
        setGameState('WAITING_ROOM');
    };

    const handleStartGame = (finalPlayers: WaitingPlayer[]) => {
        setPlayers(finalPlayers);
        setGameState('GAME');
    };

    const handleGameOver = () => {
        // Reset and go back to lobby
        setPlayerName('');
        setPlayers([]);
        setGameState('LOBBY');
    };

    const renderGameState = () => {
        switch (gameState) {
            case 'LOBBY':
                return <LobbyComponent onEnterRoom={handleEnterRoom} />;
            case 'WAITING_ROOM':
                return <WaitingRoomComponent playerName={playerName} onStartGame={handleStartGame} />;
            case 'GAME':
                return <GameTableComponent playersInfo={players} onGameOver={handleGameOver} />;
            default:
                return <LobbyComponent onEnterRoom={handleEnterRoom} />;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            {renderGameState()}
        </div>
    );
};

export default App;
