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

export const canPlay = (playedCards: Card[], fieldCards: Card[]): boolean => {
  if (playedCards.length === 0) {
    return false;
  }
  
  const nonJokerCards = playedCards.filter(c => c.suit !== Suit.JOKER);
  if (nonJokerCards.length > 1) {
    const firstRank = nonJokerCards[0].rank;
    if (!nonJokerCards.every(c => c.rank === firstRank)) {
      return false; // Must be same rank (or with jokers)
    }
  }

  if (fieldCards.length === 0) {
    return true; // Can play anything on an empty field
  }

  if (playedCards.length !== fieldCards.length) {
    return false;
  }

  const playedPowerCard = nonJokerCards.length > 0 ? nonJokerCards[0] : playedCards[0]; // If only jokers, use joker power
  const playedPower = getCardPower(playedPowerCard);

  const fieldNonJokerCards = fieldCards.filter(c => c.suit !== Suit.JOKER);
  const fieldPowerCard = fieldNonJokerCards.length > 0 ? fieldNonJokerCards[0] : fieldCards[0]; // If only jokers, use joker power
  const fieldPower = getCardPower(fieldPowerCard);

  // 4-Shield: Cannot play a 2 or Joker on a 4
  if (fieldPowerCard && fieldPowerCard.rank === 4) {
    const hasPowerfulCard = playedCards.some(c => c.rank === 2 || c.suit === Suit.JOKER);
    if (hasPowerfulCard) {
      return false;
    }
  }

  return playedPower > fieldPower;
};

export const isEightFlush = (playedCards: Card[]): boolean => {
  if (playedCards.length === 0) {
      return false;
  }
  // All cards must be 8s, Jokers are treated as 8s
  return playedCards.every(card => card.rank === 8 || card.suit === Suit.JOKER);
};

export const isSevenGive = (playedCards: Card[]): boolean => {
  if (playedCards.length === 0) return false;
  return playedCards.every(card => card.rank === 7 || card.suit === Suit.JOKER);
};

export const isTenDiscard = (playedCards: Card[]): boolean => {
  if (playedCards.length === 0) return false;
  return playedCards.every(card => card.rank === 10 || card.suit === Suit.JOKER);
};

export const isCounterablePlay = (playedCards: Card[]): boolean => {
    if (playedCards.length === 0 || playedCards.length > 2) {
        return false;
    }
    const mainCard = playedCards.find(c => c.suit !== Suit.JOKER);
    if (!mainCard) return false; // Pure joker plays aren't counterable this way

    const counterableRanks: Rank[] = [7, 8, 10];
    return counterableRanks.includes(mainCard.rank);
};

export const canPerformFourStop = (hand: Card[]): boolean => {
    return hand.filter(card => card.rank === 4).length >= 2;
};


// Helper to generate card combinations from a player's hand
const getCombinations = <T,>(array: T[], size: number): T[][] => {
    const result: T[][] = [];
    function combinationUtil(startIndex: number, tempCombination: T[]) {
        if (tempCombination.length === size) {
            result.push([...tempCombination]);
            return;
        }
        for (let i = startIndex; i < array.length; i++) {
            tempCombination.push(array[i]);
            combinationUtil(i + 1, tempCombination);
            tempCombination.pop();
        }
    }
    combinationUtil(0, []);
    return result;
}

export const cpuSimpleThink = (hand: Card[], fieldCards: Card[]): Card[] | null => {
  // If field is empty, play the weakest single card.
  if (fieldCards.length === 0) {
    const nonJokerHand = hand.filter(c => c.suit !== Suit.JOKER);
    if (nonJokerHand.length > 0) {
        return [nonJokerHand[0]];
    }
    // If only has joker(s), play one.
    return hand.length > 0 ? [hand[0]] : null;
  }

  const numToPlay = fieldCards.length;
  // Find all combinations of `numToPlay` cards from the CPU's hand.
  const handCombinations = getCombinations(hand, numToPlay);
  
  // Find the first valid (and weakest) combination to play.
  for (const combo of handCombinations) {
    if (canPlay(combo, fieldCards)) {
      return combo;
    }
  }

  // If no valid combination is found, pass.
  return null;
};