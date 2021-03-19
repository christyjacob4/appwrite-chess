import "chessboard-element";
import { useState, useEffect } from "react";
import Chess from "chess.js";

const ChessBoard = ({mode}) => {
  const TIMEOUT = 1000;
  const [board, setBoard] = useState(null);
  const [game, setGame] = useState(new Chess());

  useEffect(() => {
      setBoard(document.querySelector('chess-board'))
      setTimeout(makeRandomMove, TIMEOUT)
  },[board])

  function makeRandomMove() {
    const possibleMoves = game.moves();
    // exit if the game is over
    if (game.game_over()) {
      return;
    }
    if (board != null) {
        const randomIdx = Math.floor(Math.random() * possibleMoves.length);
        game.move(possibleMoves[randomIdx]);
        board.setPosition(game.fen());
    }
    setTimeout(makeRandomMove, TIMEOUT);
  }

  return (
      <chess-board position="start" style={{ width: 500 }} />
  );
};

export default ChessBoard;
