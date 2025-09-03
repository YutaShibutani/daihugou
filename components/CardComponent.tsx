
import React from 'react';
import { Card, Suit } from '../types';
import { SUIT_SYMBOLS, RANK_DISPLAY } from '../constants';

interface CardComponentProps {
  card: Card;
  isSelected: boolean;
  onCardClick: (card: Card) => void;
}

const CardComponent: React.FC<CardComponentProps> = ({ card, isSelected, onCardClick }) => {
  const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;
  const colorClass = isRed ? 'text-red-500' : 'text-black';
  
  const selectionClass = isSelected 
    ? 'transform -translate-y-4 shadow-lg ring-2 ring-yellow-400' 
    : 'hover:-translate-y-2';

  return (
    <div
      onClick={() => onCardClick(card)}
      className={`relative w-20 h-28 bg-white border border-gray-300 rounded-lg shadow-md cursor-pointer transition-transform duration-200 ease-in-out ${selectionClass}`}
    >
      <div className={`absolute top-1 left-2 text-2xl font-bold ${colorClass}`}>
        <span>{RANK_DISPLAY[card.rank]}</span>
      </div>
      <div className={`absolute top-2.5 right-2 text-xl ${colorClass}`}>
         <span>{SUIT_SYMBOLS[card.suit]}</span>
      </div>
       <div className={`absolute inset-0 flex items-center justify-center text-5xl ${colorClass} opacity-60`}>
         <span>{SUIT_SYMBOLS[card.suit]}</span>
      </div>
      <div className={`absolute bottom-1 right-2 text-2xl font-bold transform rotate-180 ${colorClass}`}>
        <span>{RANK_DISPLAY[card.rank]}</span>
      </div>
    </div>
  );
};

export default CardComponent;
