import "chessboard-element";
import { useState, useEffect, Fragment } from "react";
import Chess from "chess.js";
import { GameMode } from "../../utils/utils";
import realtime from "../../utils/Realtime";
import { ChessCollection } from "../../utils/config";

const ChessBoard = ({
  mode,
  documentId,
  playerOne,
  playerTwo,
  userId,
  fen,
  appwrite,
}) => {
  const TIMEOUT = 1000;
  const [board, setBoard] = useState(null);
  const [game, setGame] = useState(new Chess());

  var timeout = [];

  useEffect(() => {
    setBoard(document.querySelector("chess-board"));
    console.log("In board Use effect");
    cleanup()
    
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

    return cleanup
  }, [board, mode, documentId]);

  function cleanup() {
    timeout.forEach(it => clearTimeout(it))
    timeout.length = 0
  }

  function setupLiveMatch() {

    if (board != null && documentId) {
      console.log("Watching Document ", documentId);
      realtime.subscribe(`documents.${documentId}`, (message) => {
        const data = [message.payload];
        console.log(data);
      });

      /** Setup the board */
      let status = false
      if (fen) status = game.load(fen) 
      !status && game.reset()
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
        // only pick up pieces for White
        const playerOne = userId === playerOne
        if (playerOne && piece.search(/^b/) !== -1) {
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
        console.log("DROP", move)
        // illegal move
        if (move === null) {
          setAction("snapback");
          return;
        }
      });

      // update the board position after the piece snap
      // for castling, en passant, pawn promotion
      board.addEventListener("snap-end", (e) => {
        board.setPosition(game.fen());

        const payload = {
          fen: game.fen(),
        };
        // Update the doc with the new fen
        appwrite.database.updateDocument(
          /** Update Document */
          ChessCollection.id,
          documentId,
          payload,
          [],
          []
        );

      });
    }
  }

  function setupComputerMatch() {
    if (board != null) {
      let status = game.load(fen)
      !status && game.reset()  
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
    console.log("Make Random Move Called with repeat", repeat)
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
