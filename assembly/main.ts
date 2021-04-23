import { logging, context, PersistentVector, ContractPromiseBatch, u128 } from "near-sdk-as";
import { TicTacToe, games, GameState } from "./model";

export function createGame(): u32 {
  const game = new TicTacToe();
  games.set(game.gameId, game);
  return game.gameId;
}

export function play(gameId: u32, lin: i8, col: i8): string {
  assert(games.contains(gameId), 'GameId not found');

  let game = games.getSome(gameId);
  let currentPlayer = context.sender;
  assert(lin>=0 && lin<3, 'Not valid line');
  assert(col>=0 && col<3, 'Not valid column');
  if (lin==0) assert(game.line0[col]==0, 'Position already asigned');
  if (lin==1) assert(game.line1[col]==0, 'Position already asigned');
  if (lin==2) assert(game.line2[col]==0, 'Position already asigned');
  assert(game.nextPlayer == currentPlayer, 'Its not your turn');
  assert(game.gameState == GameState.InProgress, 'Game is not in progress');

  if (lin == 0) {
    fillBoard(game.line0, col, currentPlayer, game);
  } else if (lin == 1) {
    fillBoard(game.line1, col, currentPlayer, game);
  } else if (lin == 2) {
    fillBoard(game.line2, col, currentPlayer, game);
  }
  
  let res = verifyBoard(game.line0, game.line1, game.line2);
  if (res == 1) {
    return finishGame(game, game.player1);
  } 
  if (res == -1) {
    return finishGame(game, game.player2);
  }
  
  game.roundsPlayed++;
  if (game.roundsPlayed == 9) {
    game.gameState = GameState.Completed;
    games.set(game.gameId, game);
    return "Game tied. No winners!"
  }
  
  games.set(game.gameId, game);
  return getBoard(game.line0, game.line1, game.line2);
}

export function viewBoard(gameId: u32): string {
  let game = games.getSome(gameId);
  return getBoard(game.line0, game.line1, game.line2);
}

export function getBoard(line0: PersistentVector<i8>, line1: PersistentVector<i8>, line2: PersistentVector<i8>): string {
  var parseBoard = "";

  for (let i = 0; i < 3; ++i) {
    for (let j = 0; j < 3; ++j) {
      if (i == 0) {
        parseBoard = parseBoard.concat(line0[j].toString())
      } else if (i == 1) {
        parseBoard = parseBoard.concat(line1[j].toString())
      } else if (i == 2) {
        parseBoard = parseBoard.concat(line2[j].toString())
      }
    }

    if (i != 2) {
      parseBoard = parseBoard.concat(' | ')
    }
  }

  return parseBoard;
}

export function joinGame(gameId: u32): string {
  assert(games.contains(gameId), 'Game does not exists');
  let game = games.getSome(gameId);
  assert(game.player2 == "", 'This game already has two players');
  assert(game.player1 != context.sender, 'You cant play with youself :(');

  game.player2 = context.sender;
  game.amount2 = context.attachedDeposit;
  game.gameState = GameState.InProgress;

  games.set(gameId, game);

  return "Joined the game, lets play!";
}

export function verifyBoard(line0: PersistentVector<i8>, line1: PersistentVector<i8>, line2: PersistentVector<i8>): i8 {
  if(isEqual(line0[0], line0[1], line0[2])) {
    return line0[0];
  } else if (isEqual(line1[0], line1[1], line1[2])) {
    return line1[0];
  } else if (isEqual(line2[0], line2[1], line2[2])) {
    return line2[0];
  } else if (isEqual(line0[0], line1[0], line2[0])) {
    return line0[0];
  } else if (isEqual(line0[1], line1[1], line2[1])) {
    return line0[1];
  } else if (isEqual(line0[2], line1[2], line2[2])) {
    return line0[2];
  } else if (isEqual(line0[0], line1[1], line2[2])) {
    return line0[0];
  } else if (isEqual(line2[0], line1[1], line0[2])) {
    return line2[0];
  } else {
    return 0;
  }
}

function isEqual(x: i8, y: i8, z: i8): boolean {
  if (x == y && y == z && z != 0) {
    return true;
  }
  return false;
}

function finishGame(game: TicTacToe, winnerId: string): string {
  game.gameState = GameState.Completed;
  
  const to_winner = ContractPromiseBatch.create(winnerId);
  const amount_to_receive = u128.add(game.amount2, game.amount1);
  to_winner.transfer(amount_to_receive);
  
  games.set(game.gameId, game);
  return `Congratulations: ${winnerId} is the winner and received ${amount_to_receive}`;
}

function fillBoard(line: PersistentVector<i8>, col: i8, player: string, game: TicTacToe): void {
  if (player == game.player1) {
    line[col] = 1;
    game.nextPlayer = game.player2;
  } else if (player == game.player2) {
    line[col] = -1;
    game.nextPlayer = game.player1;
  }
}
