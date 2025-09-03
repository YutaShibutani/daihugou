
import React from 'react';
import { Card } from '../types';
import CardComponent from './CardComponent';

interface HandComponentProps {
  cards: Card[];
  selectedCards: Card[];
  onCardClick: (card: Card) => void;
  isMyTurn: boolean;
}

const HandComponent: React.FC<HandComponentProps> = ({ cards, selectedCards, onCardClick, isMyTurn }) => {
  return (
    <div className={`flex justify-center items-end min-h-[140px] p-4 ${!isMyTurn ? 'opacity-70' : ''}`}>
      {cards.map((card, index) => (
        <div key={card.id} className="-ml-12 first:ml-0">
           <CardComponent
            card={card}
            isSelected={selectedCards.some(sc => sc.id === card.id)}
            onCardClick={isMyTurn ? onCardClick : () => {}}
          />
        </div>
      ))}
    </div>
  );
};

export default HandComponent;
