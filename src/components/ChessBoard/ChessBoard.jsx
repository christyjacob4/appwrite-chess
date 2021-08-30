import "chessboard-element";
import { useState, useEffect, Fragment } from "react";
import Chess from "chess.js";
import { GameMode } from "../../utils/utils";
import { ChessCollection } from "../../utils/config";
import api from "../../api/api";

const game = new Chess();

const ChessBoard = ({
  mode,
  documentId,
  playerOne,
  playerTwo,
  userId,
  fen,
}) => {
  const TIMEOUT = 1000;
  const [board, setBoard] = useState(null);

  var timeout = [];

  useEffect(() => {
    console.log("In board,mode Use effect");
    setBoard(document.querySelector("chess-board"));
    cleanup();
    switch (mode) {
      case GameMode.COMPUTER:
        setupComputerMatch();
        break;
      case GameMode.LIVE:
        setupLiveMatch();
        break;
      case GameMode.DEMO:
        timeout.push(setTimeout(makeRandomMove, TIMEOUT));
        break;
      default:
        break;
    }

    return cleanup;
  }, [board, mode]);

  useEffect(() => {
    console.log("In fen Use effect", fen);
    if (!fen) return;
    if (!board) return;
    let status = game.load(fen)
    if (status) board.setPosition(fen)
  }, [fen])

  function cleanup() {
    timeout.forEach(it => clearTimeout(it))
    timeout.length = 0
  }

  function setupLiveMatch() {
    console.log("Setting up Live match");
    if (board != null) {
      /** 
       * Setup the board
       * Check if we have received a fen string from App. 
       * If yes, load the fen string. else reset the board
       *  */
      let status = false;
      if (fen) status = game.load(fen);
      !status && game.reset();

      // There's a bug that causes the board to throw an error when using .setPosition()
      // So adding this timeout to avoid the error
      setTimeout(() => {
        board.setPosition(game.fen());
        board.draggablePieces = true;
        userId === playerOne
          ? (board.orientation = "white")
          : (board.orientation = "black");

        board.addEventListener("drag-start", (e) => {
          const { source, piece, position, orientation } = e.detail;
          // do not pick up pieces if the game is over
          if (game.game_over()) {
            e.preventDefault();
            return;
          }

          if (piece.search(/^b/) === -1 && (userId === playerTwo)) {
            /** If piece is white and player is two, prevent the action */
            e.preventDefault();
            return;
          } else if (piece.search(/^w/) === -1 && (userId === playerOne)) {
            /** If piece is black and player is one, prevent the action */
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
        });

        // update the board position after the piece snap
        // for castling, en passant, pawn promotion
        board.addEventListener("snap-end", async (e) => {
          board.setPosition(game.fen());

          const payload = {
            fen: game.fen(),
          };
          // Update the doc with the new fen
          // The problem is figured out.
          // Need to pass the permissions when updating the document
          let updated = await api.provider().database.updateDocument(
            /** Update Document */
            ChessCollection.id,
            documentId,
            payload,
            [`user:${playerOne}`, `user:${playerTwo}`],
            [`user:${playerOne}`, `user:${playerTwo}`]
          );
        });
      }, 100);
    }
  }

  function setupComputerMatch() {
    if (board != null) {
      let status = game.load(fen);
      !status && game.reset();
      board.setPosition(game.fen());
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
    console.log("Make Random Move Called with repeat", repeat);
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
      cleanup()
      timeout.push(setTimeout(makeRandomMove, TIMEOUT));
    }
  }

  return <chess-board position="start" style={{ width: 500 }} />;
};

export default ChessBoard;
