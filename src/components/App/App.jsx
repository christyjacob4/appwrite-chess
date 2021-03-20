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
import '../../api/api'

const App = () => {
  /** HOOKS START */
  const [appwrite, setAppwrite] = useState({});
  const [responseState, setResponseState] = useState({
    error: false,
    loading: false,
  });
  const [alert, setAlert] = useState({});
  
  /** The object used to store the userId, document ID etc. */
  const [data, setData] = useState({});
  const [mode, setMode] = useState(AppMode.CREATE);
  /** HOOKS END */

  /** Initialise the SDK */
  useEffect(() => {
    var sdk = new Appwrite();
    sdk
      .setEndpoint("https://appwrite-realtime.monitor-api.com/v1")
      .setProject("6054c42b77f63");
    setAppwrite(sdk);
  }, []);

  /** Detect App Mode -> Create Game or Join Game */
  useEffect(() => {
    let queryParams = qs.parse(window.location.search.substr(1));
    let mode = (queryParams["documentId"] && queryParams["playerOne"]) ? AppMode.JOIN : AppMode.CREATE;
    setMode(mode);
  }, []);

  function renderAppMode(mode) {
    switch (mode) {
      case AppMode.JOIN:
        return (
          <JoinGame
            handleJoinGame={handleJoinGame}
            responseState={responseState}
            data={data}
          />
        );
      case AppMode.CREATE:
      default:
        return (
          <CreateGame setAlert={setAlert}/>
        );
    }
  }

  function handleJoinGame() {
    console.log("Joining Game");
    
    let queryParams = qs.parse(window.location.search.substr(1));
    let { documentId, playerOne } = queryParams

    setResponseState({
      loading: true,
      error: false,
    });

    /** Create Account  */
    let randomEmailId = `${createId(8)}@gmail.com`;
    let randomPassword = createId(8);
    let randomName = randomEmailId;
    let payload = {
      [ChessCollection.properties.status]: "IN PROGRESS",
      [ChessCollection.properties.playerTwo]: "",
    };

    let data = {
      email: randomEmailId,
      password: randomPassword,
      name: randomName,
    };

    appwrite.account
      .create(randomEmailId, randomPassword, randomName) /** Create Account */
      .then((response) => {
        data["userId"] = response["$id"];
        return appwrite.account.createSession(
          randomEmailId,
          randomPassword
        ); /** Create Session */
      })
      .then((response) => {
        data["sessionId"] = response["$id"];
        payload[ChessCollection.properties.playerTwo] = data["userId"];
        return appwrite.database.updateDocument(
          /** Create Document */
          ChessCollection.id,
          documentId,
          payload,
          [`user:${data["userId"]}`, `user:${playerOne}`],
          [`user:${data["userId"]}`, `user:${playerOne}`]
        );
      })
      .then((response) => {
        console.log(response);
        setResponseState({
          error: false,
          loading: false,
          message: "Joined Game!",
        });
        setAlert(true);
        data["documentId"] = response["$id"];
        data["playerOne"] = response["playerOne"]
        data["playerTwo"] = response["playerTwo"]
        data["fen"] = response["fen"]
        setData(data);
      })
      .catch((err) => {
        setResponseState({
          message: err.message,
          loading: false,
          error: true,
        });
        setAlert(true);
      });
  }

  return (
    <div className="grid_container h-screen bg-gray-800  text-gray-100">
      {alert.show && <Alert {...alert} />}
      <header>
        <ul className="flex justify-between text-xl py-8 px-8 md:px-48 ">
          <li>Chess</li>
        </ul>
      </header>

      {/* Left Side  */}
      <div className="chessboard my-auto mx-auto">
        <ChessBoard
          mode={data.documentId ? GameMode.LIVE : GameMode.DEMO}
          // mode={GameMode.COMPUTER}
          {...data}
          appwrite = {appwrite}
        />
      </div>

      {/* Right Side */}
      <div className="content flex flex-col my-auto items-center">
        {renderAppMode(mode)}
      </div>

      <footer className="justify-self-center">Made with ♥️ and Appwrite</footer>
    </div>
  );
};

export default App;
