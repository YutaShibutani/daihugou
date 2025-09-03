
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Player } from './types';
import { createDeck, dealCards, canPlay, isEightFlush } from './logic/gameLogic';
import { INITIAL_PLAYER_NAMES } from './constants';
import HandComponent from './components/HandComponent';
import PlayerInfoComponent from './components/PlayerInfoComponent';
import ControlsComponent from './components/ControlsComponent';
import FieldComponent from './components/FieldComponent';

const App: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [fieldCards, setFieldCards] = useState<Card[]>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
    const [selectedCards, setSelectedCards] = useState<Card[]>([]);
    const [passCount, setPassCount] = useState<number>(0);
    const [lastPlayerToPlay, setLastPlayerToPlay] = useState<number | null>(null);
    const [gameMessage, setGameMessage] = useState<string>('Game Starting...');
    const [isGameOver, setIsGameOver] = useState<boolean>(false);

    const activePlayers = players.filter(p => !p.isFinished).length;

    const findNextPlayerIndex = useCallback((startIndex: number): number => {
        let nextIndex = (startIndex + 1) % players.length;
        while (players[nextIndex] && players[nextIndex].isFinished) {
            nextIndex = (nextIndex + 1) % players.length;
            if (nextIndex === startIndex) return -1; // All other players are finished
        }
        return nextIndex;
    }, [players]);

    const setupGame = useCallback(() => {
        const deck = createDeck();
        const hands = dealCards(deck, INITIAL_PLAYER_NAMES.length);
        const newPlayers: Player[] = INITIAL_PLAYER_NAMES.map((name, index) => ({
            id: index,
            name,
            hand: hands[index],
            isFinished: false,
            rankTitle: 'Citizen',
        }));
        setPlayers(newPlayers);
        setFieldCards([]);
        setCurrentPlayerIndex(0);
        setSelectedCards([]);
        setPassCount(0);
        setLastPlayerToPlay(null);
        setIsGameOver(false);
        setGameMessage('Your turn to start!');
    }, []);

    useEffect(() => {
        setupGame();
    }, [setupGame]);
    
    const handleCardClick = (card: Card) => {
        setSelectedCards(prev =>
            prev.some(c => c.id === card.id)
                ? prev.filter(c => c.id !== card.id)
                : [...prev, card]
        );
    };

    const nextTurn = useCallback((nextPlayer: number) => {
        setCurrentPlayerIndex(nextPlayer);
        setSelectedCards([]);
        const nextPlayerName = players[nextPlayer]?.name;
        setGameMessage(nextPlayerName ? `${nextPlayerName}'s turn` : "Calculating next turn...");
    }, [players]);
    
    const handlePlay = () => {
        if (!canPlay(selectedCards, fieldCards)) {
            setGameMessage("You can't play those cards!");
            setTimeout(() => setGameMessage(`${players[currentPlayerIndex].name}'s turn`), 2000);
            return;
        }

        const player = players[currentPlayerIndex];
        const newHand = player.hand.filter(c => !selectedCards.some(sc => sc.id === c.id));
        
        const updatedPlayers = [...players];
        updatedPlayers[currentPlayerIndex] = { ...player, hand: newHand };

        if (newHand.length === 0) {
            updatedPlayers[currentPlayerIndex].isFinished = true;
            setGameMessage(`${player.name} has finished!`);
        }
        setPlayers(updatedPlayers);
        
        const wasEightFlush = isEightFlush(selectedCards);

        if (wasEightFlush) {
            setFieldCards([]);
            setGameMessage("8-Flush! Play again.");
            setPassCount(0);
            setLastPlayerToPlay(currentPlayerIndex);
            // Don't advance turn
        } else {
            setFieldCards(selectedCards);
            setLastPlayerToPlay(currentPlayerIndex);
            setPassCount(0);
            const nextPlayer = findNextPlayerIndex(currentPlayerIndex);
            if (nextPlayer !== -1) {
              nextTurn(nextPlayer);
            }
        }
        
        setSelectedCards([]);

        // Check for game over
        const remainingPlayers = updatedPlayers.filter(p => !p.isFinished);
        if (remainingPlayers.length <= 1) {
            setIsGameOver(true);
            setGameMessage(`Game over! ${remainingPlayers[0]?.name || ''} is the loser.`);
        }
    };
    
    const handlePass = () => {
        const newPassCount = passCount + 1;
        setPassCount(newPassCount);

        if (newPassCount >= activePlayers - 1 && lastPlayerToPlay !== null) {
            // Field gets cleared
            setFieldCards([]);
            setPassCount(0);
            setGameMessage(`${players[lastPlayerToPlay].name} won the round and starts again.`);
            nextTurn(lastPlayerToPlay);
        } else {
            const nextPlayer = findNextPlayerIndex(currentPlayerIndex);
            if (nextPlayer !== -1) {
                nextTurn(nextPlayer);
            }
        }
    };

    if (players.length === 0) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    const humanPlayer = players[0];
    const opponents = players.slice(1);

    if (isGameOver) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
                <h1 className="text-5xl font-bold mb-4">Game Over!</h1>
                <p className="text-2xl mb-8">{gameMessage}</p>
                <button onClick={setupGame} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-xl font-bold">
                    Play Again
                </button>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white p-4 font-sans">
            {/* Opponents */}
            <div className="flex justify-around items-start mb-4">
                {opponents.map(player => (
                    <PlayerInfoComponent
                        key={player.id}
                        name={player.name}
                        remainingCards={player.hand.length}
                        isCurrentTurn={player.id === currentPlayerIndex}
                        isFinished={player.isFinished}
                        rankTitle={player.rankTitle}
                    />
                ))}
            </div>

            {/* Game Field */}
            <div className="flex-grow flex items-center justify-center">
                 <FieldComponent cards={fieldCards} message={gameMessage} />
            </div>

            {/* Player Area */}
            <div className="flex flex-col items-center">
                <PlayerInfoComponent
                    name={humanPlayer.name}
                    remainingCards={humanPlayer.hand.length}
                    isCurrentTurn={humanPlayer.id === currentPlayerIndex}
                    isFinished={humanPlayer.isFinished}
                    rankTitle={humanPlayer.rankTitle}
                />
                <HandComponent
                    cards={humanPlayer.hand}
                    selectedCards={selectedCards}
                    onCardClick={handleCardClick}
                    isMyTurn={humanPlayer.id === currentPlayerIndex}
                />
                <ControlsComponent
                    onPlay={handlePlay}
                    onPass={handlePass}
                    isMyTurn={humanPlayer.id === currentPlayerIndex}
                    canPlay={selectedCards.length > 0}
                />
            </div>
        </div>
    );
};

export default App;
