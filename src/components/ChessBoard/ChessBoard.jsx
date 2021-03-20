import "chessboard-element";
import { useState, useEffect } from "react";
import Chess from "chess.js";
import { GameMode } from "../../utils/utils";
import realtime from "../../utils/Realtime";

const ChessBoard = ({ mode, documentId }) => {
  const TIMEOUT = 1000;
  const [board, setBoard] = useState(null);
  const [game, setGame] = useState(new Chess());
  const [timeout, changeTimeout] = useState(null);

  useEffect(() => {
    setBoard(document.querySelector("chess-board"));
    clearTimeout(timeout)
    switch (mode) {
      case GameMode.COMPUTER:
        setupComputerMatch();
        break;
      case GameMode.LIVE:
        setupLiveMatch();
        break;
      case GameMode.DEMO:
      default:
        changeTimeout(setTimeout(makeRandomMove, TIMEOUT));
        break;
    }
  }, [board, mode]);

  useEffect(() => {
    clearTimeout(timeout)
    if (mode === GameMode.LIVE) setupLiveMatch();
  }, [documentId]);

  function setupLiveMatch() {
    if (board != null && documentId) {
      console.log("Watching Document ", documentId);
      realtime.subscribe(
        `documents.${documentId}`,
        (message) => {
          const data = [message.payload];
          console.log(data);
        }
      );
      board.setPosition("start");
      board.draggablePieces = true;
    }
  }

  function setupComputerMatch() {
    if (board != null) {
      board.setPosition("start");
      board.draggablePieces = true;

      board.addEventListener("drag-start", (e) => {
        const { source, piece, position, orientation } = e.detail;
        // do not pick up pieces if the game is over
        if (game.game_over()) {
          e.preventDefault();
          return;
        }
        // only pick up pieces for White
        if (piece.search(/^b/) !== -1) {
          e.preventDefault();
          return;
        }
      });

      board.addEventListener("drop", (e) => {
        const { source, target, setAction } = e.detail;
        // see if the move is legal
        const move = game.move({
          from: source,
          to: target,
          promotion: "q", // NOTE: always promote to a queen for example simplicity
        });
        // illegal move
        if (move === null) {
          setAction("snapback");
          return;
        }
        // make random legal move for black
        setTimeout(() => {
          makeRandomMove(false);
        }, 500);
      });

      // update the board position after the piece snap
      // for castling, en passant, pawn promotion
      board.addEventListener("snap-end", (e) => {
        board.setPosition(game.fen());
      });
    }
  }

  function makeRandomMove(repeat = true) {
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
    if (repeat) {
      clearTimeout(timeout)
      changeTimeout(setTimeout(makeRandomMove, TIMEOUT));
    }
  }

  return <chess-board position="start" style={{ width: 500 }} />;
};

export default ChessBoard;
