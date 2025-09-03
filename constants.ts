
import { Suit, Rank } from './types';

export const SUIT_SYMBOLS: { [key in Suit]: string } = {
  [Suit.SPADES]: '♠',
  [Suit.HEARTS]: '♥',
  [Suit.DIAMONDS]: '♦',
  [Suit.CLUBS]: '♣',
  [Suit.JOKER]: 'J',
};

export const RANK_DISPLAY: { [key in Rank]: string } = {
  3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
  11: 'J', 12: 'Q', 13: 'K', 1: 'A', 2: '2', 0: 'oker',
};

export const CARD_RANK_POWER: { [key in Rank]: number } = {
  3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8,
  11: 9, 12: 10, 13: 11, 1: 12, 2: 13, 0: 99, // Joker is strongest
};

export const INITIAL_PLAYER_NAMES = ['Player 1', 'CPU 2', 'CPU 3', 'CPU 4'];
