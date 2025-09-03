
import React from 'react';

interface ControlsComponentProps {
  onPlay: () => void;
  onPass: () => void;
  isMyTurn: boolean;
  canPlay: boolean;
}

const ControlsComponent: React.FC<ControlsComponentProps> = ({ onPlay, onPass, isMyTurn, canPlay }) => {
  const baseButtonClass = "px-8 py-3 rounded-lg text-xl font-bold transition-transform duration-150 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  const playButtonClass = "bg-green-600 hover:bg-green-500 disabled:bg-green-800";
  const passButtonClass = "bg-red-600 hover:bg-red-500 disabled:bg-red-800";

  return (
    <div className="flex justify-center space-x-6 my-4">
      <button
        onClick={onPlay}
        disabled={!isMyTurn || !canPlay}
        className={`${baseButtonClass} ${playButtonClass}`}
      >
        Play
      </button>
      <button
        onClick={onPass}
        disabled={!isMyTurn}
        className={`${baseButtonClass} ${passButtonClass}`}
      >
        Pass
      </button>
    </div>
  );
};

export default ControlsComponent;
