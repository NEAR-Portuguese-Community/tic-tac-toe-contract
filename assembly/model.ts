import { PersistentVector, RNG, context, PersistentMap, logging, storage, u128 } from "near-sdk-as";

export enum GameState {
  Created,
  InProgress,
  Completed
}

@nearBindgen
export class TicTacToe {
  gameId: u32;
  gameState: GameState;
  player1: string;
  amount1: u128;
  player2: string;
  amount2: u128;
  roundsPlayed: u8;

  nextPlayer: string;
  line0: PersistentVector<i8>;
  line1: PersistentVector<i8>;
  line2: PersistentVector<i8>;
  constructor() {
    let rng = new RNG<u32>(1, u32.MAX_VALUE);
    let roll = rng.next();
    this.gameId = roll;

    this.gameState = GameState.Created;
    this.player1 = context.sender;
    this.amount1 = context.attachedDeposit;
    this.nextPlayer = this.player1;
    this.player2 = "";
    this.roundsPlayed = 0;

    this.line0 = new PersistentVector<i8>(`${this.gameId}-0`);
    this.line1 = new PersistentVector<i8>(`${this.gameId}-1`);
    this.line2 = new PersistentVector<i8>(`${this.gameId}-2`);

    for (let i=0; i<3; i++) {
      this.line0.push(0);
      this.line1.push(0);
      this.line2.push(0);
    }
  }
}

export const games = new PersistentMap<u32, TicTacToe>("g");


// so init() funcition is aways called when I deploy the contract?

// I want to make a on how to save a 2 dimentions array