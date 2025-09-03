
import { Card, Suit, Rank, Player } from '../types';
import { CARD_RANK_POWER } from '../constants';

export const createDeck = (): Card[] => {
  const suits: Suit[] = [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS];
  const ranks: Rank[] = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 2];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, id: `${suit}-${rank}` });
    }
  }
  // Add Joker
  deck.push({ suit: Suit.JOKER, rank: 0, id: 'JOKER-0' });
  
  return deck;
};

export const shuffleDeck = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const dealCards = (deck: Card[], numPlayers: number): Card[][] => {
  const shuffled = shuffleDeck(deck);
  const hands: Card[][] = Array.from({ length: numPlayers }, () => []);
  
  shuffled.forEach((card, index) => {
    hands[index % numPlayers].push(card);
  });

  const sortHand = (hand: Card[]) => hand.sort((a, b) => CARD_RANK_POWER[a.rank] - CARD_RANK_POWER[b.rank]);
  return hands.map(sortHand);
};

export const getCardPower = (card: Card): number => {
    return CARD_RANK_POWER[card.rank];
};

// Simplified validation for Milestone 1 & 2
export const canPlay = (playedCards: Card[], fieldCards: Card[]): boolean => {
  if (playedCards.length === 0) {
    return false;
  }
  
  // Joker can be played as a wildcard with other cards.
  const nonJokerCards = playedCards.filter(c => c.suit !== Suit.JOKER);
  if (nonJokerCards.length > 1) {
    const firstRank = nonJokerCards[0].rank;
    if (!nonJokerCards.every(c => c.rank === firstRank)) {
      // For now, we only allow playing cards of the same rank (or with jokers)
      return false;
    }
  }

  if (fieldCards.length === 0) {
    return true; // Can play anything on an empty field
  }

  if (playedCards.length !== fieldCards.length) {
    return false;
  }

  const playedPower = getCardPower(nonJokerCards.length > 0 ? nonJokerCards[0] : playedCards[0]);
  const fieldPower = getCardPower(fieldCards[0]); // Assume field cards are of the same rank power

  return playedPower > fieldPower;
};

export const isEightFlush = (playedCards: Card[]): boolean => {
  if (playedCards.length === 0) {
      return false;
  }
  // All cards must be 8s, Jokers are treated as 8s
  return playedCards.every(card => card.rank === 8 || card.suit === Suit.JOKER);
};
