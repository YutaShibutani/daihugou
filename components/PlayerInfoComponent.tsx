
import React from 'react';

interface PlayerInfoComponentProps {
  name: string;
  remainingCards: number;
  isCurrentTurn: boolean;
  isFinished: boolean;
  rankTitle: string;
  isCpu: boolean;
}

const PlayerInfoComponent: React.FC<PlayerInfoComponentProps> = ({ name, remainingCards, isCurrentTurn, isFinished, rankTitle, isCpu }) => {
  const turnIndicatorClass = isCurrentTurn ? 'ring-4 ring-yellow-400 shadow-lg' : 'ring-2 ring-gray-600';
  const finishedClass = isFinished ? 'opacity-40' : '';

  return (
    <div className={`flex flex-col items-center p-3 bg-gray-800 rounded-lg w-48 transition-all duration-300 ${turnIndicatorClass} ${finishedClass}`}>
      <div className="text-lg font-bold">{name} {isCpu && <span className="text-xs text-gray-400">(CPU)</span>}</div>
      {isFinished ? (
        <div className="text-2xl font-bold text-green-400">FINISH</div>
      ) : (
        <div className="text-sm text-gray-400">Cards: {remainingCards}</div>
      )}
      <div className="mt-1 px-2 py-0.5 bg-indigo-600 text-xs rounded-full font-semibold">{rankTitle}</div>
    </div>
  );
};

export default PlayerInfoComponent;
