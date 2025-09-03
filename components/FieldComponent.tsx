
import React from 'react';
import { Card } from '../types';
import CardComponent from './CardComponent';

interface FieldComponentProps {
  cards: Card[];
  message: string;
}

const FieldComponent: React.FC<FieldComponentProps> = ({ cards, message }) => {
  return (
    <div className="relative flex justify-center items-center w-full h-full min-h-[250px] bg-green-800/50 rounded-3xl border-4 border-green-700 p-4">
      {cards.length > 0 ? (
        <div className="flex">
            {cards.map((card, index) => (
             <div key={card.id} className="-ml-12 first:ml-0">
                <CardComponent
                    card={card}
                    isSelected={false}
                    onCardClick={() => {}} // Not clickable on the field
                />
            </div>
            ))}
        </div>
      ) : (
        <div className="text-2xl font-semibold text-green-200 opacity-80">{message}</div>
      )}
    </div>
  );
};

export default FieldComponent;
