import React, { useState, useEffect, useCallback } from 'react';
import { Card, Player } from '../types';
import { createDeck, dealCards, canPlay, isEightFlush, cpuSimpleThink } from '../logic/gameLogic';
import HandComponent from './HandComponent';
import PlayerInfoComponent from './PlayerInfoComponent';
import ControlsComponent from './ControlsComponent';
import FieldComponent from './FieldComponent';
import { WaitingPlayer } from './WaitingRoomComponent';

interface GameTableComponentProps {
    playersInfo: WaitingPlayer[];
    onGameOver: () => void;
}

const GameTableComponent: React.FC<GameTableComponentProps> = ({ playersInfo, onGameOver }) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [fieldCards, setFieldCards] = useState<Card[]>([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
    const [selectedCards, setSelectedCards] = useState<Card[]>([]);
    const [passCount, setPassCount] = useState<number>(0);
    const [lastPlayerToPlay, setLastPlayerToPlay] = useState<number | null>(null);
    const [gameMessage, setGameMessage] = useState<string>('Game Starting...');
    const [isGameOver, setIsGameOver] = useState<boolean>(false);

    const setupGame = useCallback(() => {
        const deck = createDeck();
        const hands = dealCards(deck, playersInfo.length);
        const newPlayers: Player[] = playersInfo.map((info, index) => ({
            id: index,
            name: info.name,
            isCpu: info.isCpu,
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
        setGameMessage(`${newPlayers[0].name}'s turn to start!`);
    }, [playersInfo]);

    useEffect(() => {
        setupGame();
    }, [setupGame]);

    const findNextPlayerIndex = (startIndex: number, currentPlayers: Player[]): number => {
        const activePlayers = currentPlayers.filter(p => !p.isFinished);
        if (activePlayers.length <= 1) return -1;

        let nextIndex = (startIndex + 1) % currentPlayers.length;
        while (currentPlayers[nextIndex].isFinished) {
            nextIndex = (nextIndex + 1) % currentPlayers.length;
            if (nextIndex === startIndex) return -1;
        }
        return nextIndex;
    };
    
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

    const executePlay = (cardsToPlay: Card[], playerIndex: number) => {
        const player = players[playerIndex];
        const newHand = player.hand.filter(c => !cardsToPlay.some(sc => sc.id === c.id));
        
        const updatedPlayers = [...players];
        const updatedPlayer = { ...player, hand: newHand };
        updatedPlayers[playerIndex] = updatedPlayer;

        if (newHand.length === 0) {
            updatedPlayer.isFinished = true;
            setGameMessage(`${player.name} has finished!`);
        }
        
        const wasEightFlush = isEightFlush(cardsToPlay);
        
        if (wasEightFlush) {
            setFieldCards([]);
            setGameMessage("8-Flush! Play again.");
            setPassCount(0);
            setLastPlayerToPlay(playerIndex);
             // Turn doesn't advance, will be handled by useEffect re-triggering
        } else {
            setFieldCards(cardsToPlay);
            setLastPlayerToPlay(playerIndex);
            setPassCount(0);
            const nextPlayer = findNextPlayerIndex(playerIndex, updatedPlayers);
            if (nextPlayer !== -1) {
              nextTurn(nextPlayer);
            }
        }
        
        setPlayers(updatedPlayers);

        const remainingPlayers = updatedPlayers.filter(p => !p.isFinished);
        if (remainingPlayers.length <= 1) {
            setIsGameOver(true);
            setGameMessage(`Game over! ${remainingPlayers[0]?.name || ''} is the loser.`);
        }
    };
    
    const handlePlay = () => {
        if (!canPlay(selectedCards, fieldCards)) {
            setGameMessage("You can't play those cards!");
            setTimeout(() => setGameMessage(`${players[currentPlayerIndex].name}'s turn`), 2000);
            return;
        }
        executePlay(selectedCards, currentPlayerIndex);
        setSelectedCards([]);
    };
    
    const handlePass = () => {
        const activePlayersCount = players.filter(p => !p.isFinished).length;
        const newPassCount = passCount + 1;

        if (newPassCount >= activePlayersCount - 1 && lastPlayerToPlay !== null) {
            setFieldCards([]);
            setPassCount(0);
            setGameMessage(`${players[lastPlayerToPlay].name} won the round and starts again.`);
            nextTurn(lastPlayerToPlay);
        } else {
            setPassCount(newPassCount);
            const nextPlayer = findNextPlayerIndex(currentPlayerIndex, players);
            if (nextPlayer !== -1) {
                nextTurn(nextPlayer);
            }
        }
    };

    useEffect(() => {
        if (isGameOver) return;

        const currentPlayer = players[currentPlayerIndex];
        if (currentPlayer && currentPlayer.isCpu && !currentPlayer.isFinished) {
            const timeoutId = setTimeout(() => {
                setGameMessage(`${currentPlayer.name} is thinking...`);
                
                const thinkDelayId = setTimeout(() => {
                    const cardsToPlay = cpuSimpleThink(currentPlayer.hand, fieldCards);

                    if (cardsToPlay && cardsToPlay.length > 0) {
                        setGameMessage(`${currentPlayer.name} plays ${cardsToPlay.length} card(s).`);
                        executePlay(cardsToPlay, currentPlayerIndex);
                    } else {
                        setGameMessage(`${currentPlayer.name} passes.`);
                        handlePass();
                    }
                }, 1000);

                return () => clearTimeout(thinkDelayId);
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [currentPlayerIndex, players, fieldCards, isGameOver]);

    if (players.length === 0) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    const humanPlayer = players.find(p => !p.isCpu) || players[0];
    const opponents = players.filter(p => p.id !== humanPlayer.id);

    if (isGameOver) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-5xl font-bold mb-4">Game Over!</h1>
                <p className="text-2xl mb-8">{gameMessage}</p>
                <button onClick={onGameOver} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-xl font-bold">
                    Back to Lobby
                </button>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-screen p-4">
            <div className="flex justify-around items-start mb-4">
                {opponents.map(player => (
                    <PlayerInfoComponent
                        key={player.id}
                        name={player.name}
                        isCpu={player.isCpu}
                        remainingCards={player.hand.length}
                        isCurrentTurn={player.id === currentPlayerIndex}
                        isFinished={player.isFinished}
                        rankTitle={player.rankTitle}
                    />
                ))}
            </div>

            <div className="flex-grow flex items-center justify-center">
                 <FieldComponent cards={fieldCards} message={gameMessage} />
            </div>

            <div className="flex flex-col items-center">
                <PlayerInfoComponent
                    name={humanPlayer.name}
                    isCpu={humanPlayer.isCpu}
                    remainingCards={humanPlayer.hand.length}
                    isCurrentTurn={humanPlayer.id === currentPlayerIndex}
                    isFinished={humanPlayer.isFinished}
                    rankTitle={humanPlayer.rankTitle}
                />
                <HandComponent
                    cards={humanPlayer.hand}
                    selectedCards={selectedCards}
                    onCardClick={handleCardClick}
                    isMyTurn={humanPlayer.id === currentPlayerIndex && !players[currentPlayerIndex].isCpu}
                />
                <ControlsComponent
                    onPlay={handlePlay}
                    onPass={handlePass}
                    isMyTurn={humanPlayer.id === currentPlayerIndex && !players[currentPlayerIndex].isCpu}
                    canPlay={selectedCards.length > 0}
                />
            </div>
        </div>
    );
};

export default GameTableComponent;