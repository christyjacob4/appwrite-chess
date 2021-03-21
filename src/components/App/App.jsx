import ChessBoard from "../ChessBoard/ChessBoard";
import "./App.css";
import Appwrite from "appwrite";
import { useState, useEffect } from "react";
import Alert from "../Alert/Alert";
import { GameMode, AppMode, createId } from "../../utils/utils";
import qs from "querystring";
import JoinGame from "../JoinGame/JoinGame";
import CreateGame from "../CreateGame/CreateGame";
import { ChessCollection } from "../../utils/config";
import realtime from "../../utils/Realtime";
import "../../api/api";

const App = () => {
  /** HOOKS START */
  const [data, setData] = useState({});
  const [mode, setMode] = useState(AppMode.CREATE);
  /** HOOKS END */

  /** Detect App Mode -> Create Game or Join Game */
  useEffect(() => {
    let queryParams = qs.parse(window.location.search.substr(1));
    let mode =
      queryParams["documentId"] && queryParams["playerOne"]
        ? AppMode.JOIN
        : AppMode.CREATE;
    setMode(mode);
  }, []);

  function renderAppMode() {
    switch (mode) {
      case AppMode.JOIN:
        return <JoinGame setParentData={setData} />;
      case AppMode.CREATE:
      default:
        return <CreateGame setParentData={setData} />;
    }
  }

  return (
    <div className="grid_container h-screen bg-gray-800  text-gray-100">
      {data.show && <Alert color={data.color} message={data.message} />}
      <header>
        <ul className="flex justify-between text-xl py-8 px-8 md:px-48 ">
          <li>Chess</li>
        </ul>
      </header>

      {/* Left Side  */}
      <div className="chessboard my-auto mx-auto">
        <ChessBoard
          mode={data.documentId ? GameMode.LIVE : GameMode.DEMO}
          {...data}
        />
      </div>

      {/* Right Side */}
      <div className="content flex flex-col my-auto items-center">
        {renderAppMode()}
      </div>

      <footer className="justify-self-center">Made with ♥️ and Appwrite</footer>
    </div>
  );
};

export default App;
