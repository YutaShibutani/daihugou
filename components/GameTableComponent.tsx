
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Player, WaitingPlayer } from '../types';
import { createDeck, dealCards, canPlay, isEightFlush, cpuSimpleThink, isSevenGive, isTenDiscard, isCounterablePlay, canPerformFourStop } from '../logic/gameLogic';
import { CARD_RANK_POWER } from '../constants';
import HandComponent from './HandComponent';
import PlayerInfoComponent from './PlayerInfoComponent';
import ControlsComponent from './ControlsComponent';
import FieldComponent from './FieldComponent';

interface GameTableComponentProps {
    playersInfo: WaitingPlayer[];
    onGameOver: () => void;
}

type GameMode = 'NORMAL' | 'SEVEN_GIVE' | 'TEN_DISCARD' | 'AWAITING_COUNTER';

interface CounterablePlay {
    playerIndex: number;
    cards: Card[];
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
    const [gameMode, setGameMode] = useState<GameMode>('NORMAL');
    const [targetPlayerId, setTargetPlayerId] = useState<number | null>(null);

    // State for 4-Stop logic
    const [counterablePlay, setCounterablePlay] = useState<CounterablePlay | null>(null);
    const [counterTimer, setCounterTimer] = useState<number | null>(null);
    const [humanDeclinedStop, setHumanDeclinedStop] = useState<boolean>(false);

    const findNextPlayerIndex = useCallback((startIndex: number, currentPlayers: Player[]): number => {
        const activePlayers = currentPlayers.filter(p => !p.isFinished);
        if (activePlayers.length <= 1) return -1;

        let nextIndex = (startIndex + 1) % currentPlayers.length;
        while (currentPlayers[nextIndex].isFinished) {
            nextIndex = (nextIndex + 1) % currentPlayers.length;
            if (nextIndex === startIndex) return -1;
        }
        return nextIndex;
    }, []);

    const nextTurn = useCallback((nextPlayer: number) => {
        setCurrentPlayerIndex(nextPlayer);
        setSelectedCards([]);
        const nextPlayerName = players[nextPlayer]?.name;
        setGameMessage(nextPlayerName ? `${nextPlayerName}'s turn` : "Calculating next turn...");
    }, [players]);

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

        // Find starting player (one with Diamond 3)
        let startingPlayerIndex = newPlayers.findIndex(p => p.hand.some(c => c.suit === 'DIAMONDS' && c.rank === 3));
        if (startingPlayerIndex === -1) startingPlayerIndex = 0; // Fallback
        
        setPlayers(newPlayers);
        setFieldCards([]);
        setCurrentPlayerIndex(startingPlayerIndex);
        setSelectedCards([]);
        setPassCount(0);
        setLastPlayerToPlay(null);
        setIsGameOver(false);
        setGameMode('NORMAL');
        setTargetPlayerId(null);
        setCounterablePlay(null);
        if (counterTimer) clearTimeout(counterTimer);
        setCounterTimer(null);
        setHumanDeclinedStop(false);
        setGameMessage(`${newPlayers[startingPlayerIndex].name}'s turn to start!`);
    }, [playersInfo, counterTimer]);

    useEffect(() => {
        setupGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Effect to handle the timer for AWAITING_COUNTER state.
    // This solves stale state issues with setTimeout callbacks.
    useEffect(() => {
        if (gameMode !== 'AWAITING_COUNTER' || !counterablePlay) {
            return;
        }

        const timer = setTimeout(() => {
            const { playerIndex, cards } = counterablePlay;

            if (isSevenGive(cards)) {
                setGameMode('SEVEN_GIVE');
                setGameMessage(`${players[playerIndex].name}, choose ${cards.length} card(s) to give.`);
            } else if (isTenDiscard(cards)) {
                setGameMode('TEN_DISCARD');
                setGameMessage(`${players[playerIndex].name}, choose ${cards.length} card(s) to discard.`);
            } else if (isEightFlush(cards)) {
                setFieldCards([]);
                setGameMessage("8-Flush! Play again.");
                setPassCount(0);
                setLastPlayerToPlay(playerIndex);
                setCurrentPlayerIndex(playerIndex);
                setGameMode('NORMAL');
            } else {
                // Fallback for non-special counterable plays.
                setGameMode('NORMAL');
                const nextPlayer = findNextPlayerIndex(playerIndex, players);
                if (nextPlayer !== -1) {
                    nextTurn(nextPlayer);
                }
            }
            
            setCounterablePlay(null);
        }, 3000);

        setCounterTimer(timer);

        return () => clearTimeout(timer);
    }, [gameMode, counterablePlay, players, findNextPlayerIndex, nextTurn]);
    
    const handleCardClick = (card: Card) => {
        const isSpecialMode = gameMode === 'SEVEN_GIVE' || gameMode === 'TEN_DISCARD';
        if (isSpecialMode) {
             const numToSelect = fieldCards.length || 1;
             setSelectedCards(prev => {
                const isSelected = prev.some(c => c.id === card.id);
                if (isSelected) {
                    return prev.filter(c => c.id !== card.id);
                }
                if (prev.length < numToSelect) {
                    return [...prev, card];
                }
                return prev; // Do not add more than allowed
            });
             return;
        }

        setSelectedCards(prev =>
            prev.some(c => c.id === card.id)
                ? prev.filter(c => c.id !== card.id)
                : [...prev, card]
        );
    };

    const handlePlayerClick = (playerId: number) => {
        if (gameMode === 'SEVEN_GIVE' && players[currentPlayerIndex]?.isCpu === false) {
            setTargetPlayerId(prev => prev === playerId ? null : playerId);
        }
    };

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
        
        setPlayers(updatedPlayers);
        
        if (isCounterablePlay(cardsToPlay)) {
            setFieldCards(cardsToPlay);
            setGameMessage('Waiting for a 4-Stop...');
            setHumanDeclinedStop(false);
            const playDetails = { playerIndex, cards: cardsToPlay };
            setCounterablePlay(playDetails);
            setGameMode('AWAITING_COUNTER');
            return;
        }
        
        if (isEightFlush(cardsToPlay)) {
             setFieldCards([]);
             setGameMessage("8-Flush! Play again.");
             setPassCount(0);
             setLastPlayerToPlay(playerIndex);
             if(player.id === (players.find(p=>!p.isCpu) || {id:-1}).id) setSelectedCards([]);
             return;
        }

        if (isSevenGive(cardsToPlay)) {
            setGameMode('SEVEN_GIVE');
            setFieldCards(cardsToPlay);
            setGameMessage(`${player.name}, choose ${cardsToPlay.length} card(s) and another player to give them to.`);
            return;
        }

        if (isTenDiscard(cardsToPlay)) {
            setGameMode('TEN_DISCARD');
            setFieldCards(cardsToPlay);
            setGameMessage(`${player.name}, choose ${cardsToPlay.length} card(s) from your hand to discard.`);
            return;
        }
        
        setFieldCards(cardsToPlay);
        setLastPlayerToPlay(playerIndex);
        setPassCount(0);
        
        const nextPlayer = findNextPlayerIndex(playerIndex, updatedPlayers);
        if (nextPlayer !== -1) {
            nextTurn(nextPlayer);
        }

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
    
    const handleFourStop = useCallback((interruptingPlayerId: number) => {
        if (counterTimer) clearTimeout(counterTimer);
        setCounterTimer(null);

        const interruptingPlayerIndex = players.findIndex(p => p.id === interruptingPlayerId);
        if (interruptingPlayerIndex === -1) return;

        const player = players[interruptingPlayerIndex];
        const fours = player.hand.filter(c => c.rank === 4).slice(0, 2);
        const newHand = player.hand.filter(c => !fours.some(f => f.id === c.id));

        const updatedPlayers = [...players];
        updatedPlayers[interruptingPlayerIndex] = { ...player, hand: newHand };
        setPlayers(updatedPlayers);

        setFieldCards([]);
        setPassCount(0);
        setLastPlayerToPlay(interruptingPlayerId);
        setCurrentPlayerIndex(interruptingPlayerId);
        setGameMode('NORMAL');
        setCounterablePlay(null);
        setGameMessage(`${player.name} performs a 4-Stop! They start the next round.`);
    }, [counterTimer, players]);

    const handleDeclineFourStop = () => {
        setHumanDeclinedStop(true);
    };

    const handleGiveCard = useCallback((cpuCardsToGive?: Card[], cpuTargetId?: number) => {
        const numToGive = fieldCards.length;
        const cardsToGive = cpuCardsToGive || selectedCards;
        const targetId = cpuTargetId !== undefined ? cpuTargetId : targetPlayerId;

        if (gameMode !== 'SEVEN_GIVE' || cardsToGive.length !== numToGive || targetId === null) return;
        
        const giverIndex = currentPlayerIndex;
        const receiverIndex = players.findIndex(p => p.id === targetId);
        if (receiverIndex === -1) return;

        let updatedPlayers = [...players];
        const giver = { ...updatedPlayers[giverIndex], hand: updatedPlayers[giverIndex].hand.filter(c => !cardsToGive.some(ctg => ctg.id === c.id)) };
        const receiver = { ...updatedPlayers[receiverIndex], hand: [...updatedPlayers[receiverIndex].hand, ...cardsToGive].sort((a,b) => CARD_RANK_POWER[a.rank] - CARD_RANK_POWER[b.rank])};
        
        if (giver.hand.length === 0) giver.isFinished = true;

        updatedPlayers[giverIndex] = giver;
        updatedPlayers[receiverIndex] = receiver;
        setPlayers(updatedPlayers);
        setGameMessage(`${giver.name} gave ${numToGive} card(s) to ${receiver.name}.`);

        setGameMode('NORMAL');
        setTargetPlayerId(null);
        setSelectedCards([]);
        setPassCount(0);
        setLastPlayerToPlay(giverIndex);
        
        const nextPlayer = findNextPlayerIndex(giverIndex, updatedPlayers);
        if (nextPlayer !== -1) {
            nextTurn(nextPlayer);
        } else {
            const remainingPlayers = updatedPlayers.filter(p => !p.isFinished);
            if (remainingPlayers.length <= 1) {
                setIsGameOver(true);
                setGameMessage(`Game over! ${remainingPlayers[0]?.name || ''} is the loser.`);
            }
        }
    }, [currentPlayerIndex, fieldCards.length, findNextPlayerIndex, gameMode, nextTurn, players, selectedCards, targetPlayerId]);

    const handleDiscardCard = useCallback((cpuCardsToDiscard?: Card[]) => {
        const numToDiscard = fieldCards.length;
        const cardsToDiscard = cpuCardsToDiscard || selectedCards;

        if (gameMode !== 'TEN_DISCARD' || cardsToDiscard.length !== numToDiscard) return;
        
        const playerIndex = currentPlayerIndex;
        
        let updatedPlayers = [...players];
        const player = { ...updatedPlayers[playerIndex], hand: updatedPlayers[playerIndex].hand.filter(c => !cardsToDiscard.some(ctd => ctd.id === c.id)) };

        if (player.hand.length === 0) player.isFinished = true;

        updatedPlayers[playerIndex] = player;
        setPlayers(updatedPlayers);
        setGameMessage(`${player.name} discarded ${numToDiscard} card(s).`);
        
        setGameMode('NORMAL');
        setSelectedCards([]);
        setPassCount(0);
        setLastPlayerToPlay(playerIndex);
        
        const nextPlayer = findNextPlayerIndex(playerIndex, updatedPlayers);
        if (nextPlayer !== -1) {
            nextTurn(nextPlayer);
        } else {
            const remainingPlayers = updatedPlayers.filter(p => !p.isFinished);
            if (remainingPlayers.length <= 1) {
                setIsGameOver(true);
                setGameMessage(`Game over! ${remainingPlayers[0]?.name || ''} is the loser.`);
            }
        }
    }, [currentPlayerIndex, fieldCards.length, findNextPlayerIndex, gameMode, nextTurn, players, selectedCards]);

    // Main CPU Turn Logic
    useEffect(() => {
        if (isGameOver || gameMode === 'AWAITING_COUNTER') return;

        const currentPlayer = players[currentPlayerIndex];
        if (currentPlayer && currentPlayer.isCpu && !currentPlayer.isFinished) {
            const timeoutId = setTimeout(() => {
                setGameMessage(`${currentPlayer.name} is thinking...`);
                
                const thinkDelayId = setTimeout(() => {
                    if (gameMode === 'SEVEN_GIVE') {
                        const numToGive = fieldCards.length;
                        // CPU Logic: Select the weakest cards to give away.
                        const cardsToGive = currentPlayer.hand.slice(0, numToGive); 
                        
                        // CPU Logic: Find a player to give the cards to.
                        const potentialTargets = players.filter(p => !p.isFinished && p.id !== currentPlayer.id);
                        
                        if (potentialTargets.length > 0 && cardsToGive.length === numToGive) {
                            // Strategy: Give cards to the player with the fewest cards remaining.
                            const target = potentialTargets.sort((a,b) => a.hand.length - b.hand.length)[0];
                            handleGiveCard(cardsToGive, target.id); 
                        }
                        return;
                    }

                    if (gameMode === 'TEN_DISCARD') {
                        const numToDiscard = fieldCards.length;
                        // CPU Logic: Discard the weakest cards from hand.
                        const cardsToDiscard = currentPlayer.hand.slice(0, numToDiscard);
                        if (cardsToDiscard.length === numToDiscard) {
                            handleDiscardCard(cardsToDiscard);
                        }
                        return;
                    }

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
    }, [currentPlayerIndex, players, fieldCards, isGameOver, gameMode, handleGiveCard, handleDiscardCard]);
    
    // CPU 4-Stop Logic
    useEffect(() => {
        if (gameMode !== 'AWAITING_COUNTER' || isGameOver || !counterablePlay) return;

        const cpuStopper = players.find(p => 
            p.isCpu && 
            !p.isFinished && 
            p.id !== counterablePlay.playerIndex && 
            canPerformFourStop(p.hand)
        );

        if (cpuStopper) {
            const stopDelay = setTimeout(() => {
                handleFourStop(cpuStopper.id);
            }, 1500); // CPU reacts in 1.5 seconds

            return () => clearTimeout(stopDelay);
        }
    }, [gameMode, isGameOver, players, handleFourStop, counterablePlay]);


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
    
    const isMyTurn = humanPlayer.id === currentPlayerIndex && !players[currentPlayerIndex]?.isCpu;
    const canHumanFourStop = gameMode === 'AWAITING_COUNTER' && counterablePlay?.playerIndex !== humanPlayer.id && !humanPlayer.isFinished && canPerformFourStop(humanPlayer.hand);
    const showStopControls = canHumanFourStop && !humanDeclinedStop;

    return (
        <div className="flex flex-col h-screen p-4">
            <div className="flex justify-around items-start mb-4">
                {opponents.map(player => (
                    <PlayerInfoComponent
                        key={player.id}
                        id={player.id}
                        name={player.name}
                        isCpu={player.isCpu}
                        remainingCards={player.hand.length}
                        isCurrentTurn={player.id === currentPlayerIndex}
                        isFinished={player.isFinished}
                        rankTitle={player.rankTitle}
                        onPlayerClick={handlePlayerClick}
                        isTargetable={gameMode === 'SEVEN_GIVE' && isMyTurn && !player.isFinished}
                        isSelectedTarget={player.id === targetPlayerId}
                    />
                ))}
            </div>

            <div className="flex-grow flex items-center justify-center">
                 <FieldComponent cards={fieldCards} message={gameMessage} />
            </div>

            <div className="flex flex-col items-center">
                <PlayerInfoComponent
                    id={humanPlayer.id}
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
                    isMyTurn={isMyTurn || gameMode === 'SEVEN_GIVE' || gameMode === 'TEN_DISCARD' }
                />
                 {(isMyTurn || showStopControls) && (
                    <ControlsComponent
                        onPlay={handlePlay}
                        onPass={handlePass}
                        onGive={() => handleGiveCard()}
                        onDiscard={() => handleDiscardCard()}
                        onFourStop={() => handleFourStop(humanPlayer.id)}
                        onDeclineFourStop={handleDeclineFourStop}
                        isMyTurn={isMyTurn}
                        canPlay={canPlay(selectedCards, fieldCards)}
                        gameMode={gameMode}
                        selectedCardCount={selectedCards.length}
                        cardsToSelect={fieldCards.length}
                        isTargetSelected={targetPlayerId !== null}
                        canPerformFourStop={canHumanFourStop}
                    />
                 )}
            </div>
        </div>
    );
};

export default GameTableComponent;
