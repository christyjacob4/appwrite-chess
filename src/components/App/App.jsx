import { useState, useEffect } from "react";
import { GameMode, AppMode } from "../../utils/utils";
import JoinGame from "../JoinGame/JoinGame";
import CreateGame from "../CreateGame/CreateGame";
import ChessBoard from "../ChessBoard/ChessBoard";
import "../../api/api";
import "./App.css";
import qs from "querystring";
import Alert from "../Alert/Alert";
import api from "../../api/api";

const App = () => {
  /** HOOKS START */
  const [data, setData] = useState({});
  const [mode, setMode] = useState(AppMode.CREATE);
  
  /** Detect App Mode -> Create Game or Join Game */
  useEffect(() => {
    let queryParams = qs.parse(window.location.search.substr(1));
    let mode =
      queryParams["documentId"] && queryParams["playerOne"]
        ? AppMode.JOIN
        : AppMode.CREATE;
    setMode(mode);
  }, []);

  useEffect(() => {
    let { documentId } = data
    if (documentId) {
      /** When document ID changes, subscribe to realtime */
      console.log("Watching Document ", documentId);
      api.provider().subscribe(`documents.${documentId}`, (message) => {
        const { playerOne, playerTwo, fen } = message.payload;
        console.log("Received Realtime Update", message.payload);
        setData({
          ...data,
          playerOne: playerOne,
          playerTwo: playerTwo,
          fen : fen
        })
      });
    }
  }, [data.documentId]);
  /** HOOKS END */

  function renderAppMode() {
    switch (mode) {
      case AppMode.JOIN:
        return <JoinGame setParentData={setData} />;
      case AppMode.CREATE:
      default:
        return <CreateGame setParentData={setData} />;
    }
  }

  function getGameMode() {
    if (!data.documentId) return GameMode.DEMO
    if (!data.playerOne) return GameMode.DEMO
    if (!data.playerTwo) return GameMode.DEMO
    if (!data.userId) return GameMode.DEMO 
    return GameMode.LIVE;
  }

  return (
    <div className="grid_container h-screen bg-gray-800  text-gray-100">
      {data.show && <Alert color={data.color} message={data.message} />}
      <header>
        <ul className="flex justify-between text-xl py-8 px-8 md:px-48 ">
          <li className="text-green-600">Realtime Chess</li>
        </ul>
      </header>

      {/* Left Side  */}
      <div className="chessboard my-auto mx-auto">
        <ChessBoard
          mode={getGameMode()}
          {...data}
        />
      </div>

      {/* Right Side */}
      <div className="content flex flex-col my-auto items-center">
        {renderAppMode()}
      </div>

      <footer className="justify-self-center">Made with ♥️ and <span className="text-pink-700 font-bold">Appwrite</span></footer>
    </div>
  );
};

export default App;
