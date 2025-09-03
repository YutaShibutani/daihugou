
export enum Suit {
  SPADES = 'SPADES',
  HEARTS = 'HEARTS',
  DIAMONDS = 'DIAMONDS',
  CLUBS = 'CLUBS',
  JOKER = 'JOKER',
}

export type Rank = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 1 | 2 | 0; // 0 for Joker rank

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // Unique ID for React keys
}

export interface Player {
  id: number;
  name: string;
  hand: Card[];
  isFinished: boolean;
  rankTitle: string; // e.g., 'Daifugo', 'Hinmin'
}
