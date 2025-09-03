import React from 'react';

type GameMode = 'NORMAL' | 'SEVEN_GIVE' | 'TEN_DISCARD' | 'AWAITING_COUNTER';

interface ControlsComponentProps {
  onPlay: () => void;
  onPass: () => void;
  onGive: () => void;
  onDiscard: () => void;
  onFourStop: () => void;
  onDeclineFourStop: () => void;
  isMyTurn: boolean;
  canPlay: boolean;
  gameMode: GameMode;
  selectedCardCount: number;
  cardsToSelect: number;
  isTargetSelected: boolean;
  canPerformFourStop: boolean;
}

const ControlsComponent: React.FC<ControlsComponentProps> = ({ 
  onPlay, onPass, onGive, onDiscard, onFourStop, onDeclineFourStop,
  isMyTurn, canPlay, gameMode, selectedCardCount, cardsToSelect, isTargetSelected, canPerformFourStop
}) => {
  const baseButtonClass = "px-8 py-3 rounded-lg text-xl font-bold transition-transform duration-150 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  // Allow rendering for 4-stop even if not the player's turn
  if (!isMyTurn && gameMode !== 'AWAITING_COUNTER') return null;

  if (gameMode === 'AWAITING_COUNTER') {
    if (canPerformFourStop && !isMyTurn) { // only show if it's not our turn but we can interrupt
      return (
        <div className="flex justify-center space-x-6 my-4">
          <button
            onClick={onFourStop}
            className={`${baseButtonClass} bg-yellow-500 hover:bg-yellow-400 text-gray-900 animate-pulse`}
          >
            4-Stop!
          </button>
          <button
            onClick={onDeclineFourStop}
            className={`${baseButtonClass} bg-gray-600 hover:bg-gray-500`}
          >
            見送る (Pass)
          </button>
        </div>
      );
    }
    return null; // Don't show any other controls during await
  }


  if (gameMode === 'SEVEN_GIVE') {
    const isButtonDisabled = selectedCardCount !== cardsToSelect || !isTargetSelected;
    return (
      <div className="flex flex-col items-center space-y-2 my-4">
        <p className="font-semibold text-yellow-300">Select {cardsToSelect} card(s) and a player to give them to.</p>
        <button
          onClick={onGive}
          disabled={isButtonDisabled}
          className={`${baseButtonClass} bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800`}
        >
          Give ({selectedCardCount}/{cardsToSelect})
        </button>
      </div>
    );
  }

  if (gameMode === 'TEN_DISCARD') {
    const isButtonDisabled = selectedCardCount !== cardsToSelect;
    return (
      <div className="flex flex-col items-center space-y-2 my-4">
        <p className="font-semibold text-yellow-300">Select {cardsToSelect} card(s) to discard.</p>
        <button
          onClick={onDiscard}
          disabled={isButtonDisabled}
          className={`${baseButtonClass} bg-yellow-600 hover:bg-yellow-500 disabled:bg-yellow-800 text-gray-900`}
        >
          Discard ({selectedCardCount}/{cardsToSelect})
        </button>
      </div>
    );
  }

  // Normal turn controls
  return (
    <div className="flex justify-center space-x-6 my-4">
      <button
        onClick={onPlay}
        disabled={!canPlay}
        className={`${baseButtonClass} bg-green-600 hover:bg-green-500 disabled:bg-green-800`}
      >
        Play
      </button>
      <button
        onClick={onPass}
        className={`${baseButtonClass} bg-red-600 hover:bg-red-500`}
      >
        Pass
      </button>
    </div>
  );
};

export default ControlsComponent;
