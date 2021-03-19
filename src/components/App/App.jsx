import ChessBoard from "../ChessBoard/ChessBoard";
import "./App.css";
import Appwrite from "appwrite";
import { useState, useEffect } from "react";
import realtime from "../../utils/Realtime";
import Alert from "../Alert/Alert";

const App = () => {
  const [appwrite, setAppwrite] = useState({});
  const [responseState, setResponseState] = useState({
    error: false,
    loading: false,
  });
  const [showAlert, setShowAlert] = useState(false);
  /** The object used to store the userId, document ID etc. */
  const [date, setData] = useState({});
  const CHESS_COLLECTION_ID = "6054da89c0d0c";

  useEffect(() => {
    var sdk = new Appwrite();
    sdk
      .setEndpoint("https://appwrite-realtime.monitor-api.com/v1")
      .setProject("6054c42b77f63");
    setAppwrite(sdk);
  }, []);

  function makeid(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  function handleCreateGame() {
    console.log("Creating Game");
    setResponseState({
      loading: true,
      error: false,
    });
    /** Create Account  */
    let randomId = `${makeid(8)}@gmail.com`;
    let randomPassword = makeid(8);
    let randomName = randomId;
    let payload = {
      fen: "WAITING",
    };
    appwrite.account
      .create(randomId, randomPassword, randomName)
      .then((response) =>
        appwrite.account.createSession(randomId, randomPassword)
      )
      .then((response) =>
        appwrite.database.createDocument(
          CHESS_COLLECTION_ID,
          payload,
          ["*"],
          ["*"]
        )
      )
      .then((response) => {
        console.log(response);
        setResponseState({
          error: false,
          loading: false,
          message: "Great! Let's get Started!",
        });
        setShowAlert(true);
      })
      .catch((err) => {
        setResponseState({
          message: err.message,
          loading: false,
          error: true,
        });
        setShowAlert(true);
      });
  }

  return (
    <div className="_container h-screen bg-gray-800  text-gray-100">
      {showAlert ? (
        <Alert {...responseState} setResponseState={setResponseState} />
      ) : null}
      <header>
        <ul className="flex justify-between text-xl py-8 px-8 md:px-48 ">
          <li>Chess</li>
          <li>
            <a
              href="https://github.com/Icesofty"
              target="_blank"
              rel="noopener noreferrer"
            >
              Made with 💚 by Appwrite
            </a>
          </li>
        </ul>
      </header>

      {/* Left Side  */}
      <div className="chessboard my-auto mx-auto">
        <ChessBoard />
      </div>

      {/* Right Side */}
      <div className="content flex flex-col my-auto items-center">
        <h1 className="text-6xl text-center">
          Welcome to <span className="text-green-600">Realtime Chess</span>
        </h1>

        <button
          className="mx-auto mt-8 py-4 px-16 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          onClick={handleCreateGame}
        >
          {responseState.loading ? "Creating Game ..." : "Create Game"}
        </button>

        <div className="flex mt-8 mx-auto">
          <input
            type="text"
            className="px-4 py-4 placeholder-gray-400 text-gray-700 relative bg-white text-lg shadow outline-none focus:outline-none focus:shadow-outline rounded-l-lg"
          ></input>
          <button className="py-4 px-4 bg-white text-green-500 font-semibold shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 rounded-r-lg">
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
