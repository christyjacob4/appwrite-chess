import { useState } from "react";
import api from "../../api/api";
import { ChessCollection } from "../../utils/config";
import { createId, GameMode } from "../../utils/utils";
import qs from "querystring";

const CreateGame = ({ setParentData, parentData }) => {
  const [loading, setLoading] = useState(false);

  const handleCreateLiveGame = async () => {
    setLoading(true);
    try {
      console.log("Creating Game");
      let session, account = await api.getAccount();

      if (!account) {
        console.log("No Account Currently logged in. Creating Session...");
        session = await api.createAnonymousSession();
        if (!session) throw new Error("Unable to Create Session");
        console.log("Created new session");
        account = await api.getAccount();
      }

      let userId = account["$id"];
     
      /** Create the document */
      let payload = {
        [ChessCollection.properties.playerOne]: userId,
        [ChessCollection.properties.status]: "WAITING",
      };
      let document = await api.createDocument(
        ChessCollection.id,
        payload,
        ["*"],
        ["*", `user:${userId}`]
      );
      if (!document) throw new Error("Unable to create game");

      const query = {
        documentId: document["$id"],
        playerOne: userId,
      };

      setParentData({
        show: true,
        color: "green",
        message: "Great! Let's get started",
        gameMode: GameMode.LIVE,
        userId: userId,
        gameUrl: `${window.location.origin}/?${qs.stringify(query)}`,
        documentId: document["$id"],
        playerOne: document["playerOne"],
        playerTwo: document["playerTwo"],
        fen: document["fen"],
      });
      setLoading(false);
    } catch (e) {
      console.log("There has been an error in handleCreateGame", e);
      setLoading(false);
      setParentData({
        show: true,
        color: "red",
        message: e.message,
      });
    }
  };

  const handleCreateComputerGame = async () => {
    setLoading(true);
    console.log("Creating Computer Game");
    setParentData({
      show: true,
      color: "green",
      message: "Great! Let's get started",
      gameMode: GameMode.COMPUTER
    });
    setLoading(false);
  }

  return (
    <>
      {parentData.documentId ? (
        <h1 className="text-5xl font-semibold text-center px-16 py-8">
          <span className="text-green-600"> Share the room link </span> to start playing
        </h1>
      ) : (
        <h1 className="text-6xl text-center px-16 py-8">
          Welcome to <span className="text-green-600">Realtime Chess</span>
        </h1>
      )}

      {parentData.documentId ? (
        <div className="flex mt-8 w-full justify-center">
          <input
            type="text"
            value={parentData.gameUrl}
            readOnly
            className="xl:w-1/2 md:w-3/5 px-4 py-4 placeholder-gray-400 text-gray-700 bg-white text-lg shadow outline-none focus:outline-none focus:shadow-outline rounded-l-lg"
          ></input>
          <button
            onClick={() => navigator.clipboard.writeText(parentData.gameUrl)}
            className="py-4 px-4 bg-white text-green-500 font-semibold shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 rounded-r-lg"
          >
            Copy
          </button>
        </div>
      ) : (

        <div className="flex flex-col space-y-4">
          <button
          className="mx-auto mt-8 py-4 px-16 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          onClick={handleCreateLiveGame}
          disabled={loading}
        >
          {loading ? "Creating Game ..." : "Live Match"}
        </button>
        {/* <button
          className="mx-auto mt-8 py-4 px-16 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          onClick={handleCreateComputerGame}
          disabled={loading}
        >
          {loading ? "Creating Game ..." : "Computer Match"}
        </button> */}
        </div>  
      )}
    </>
  );
};

export default CreateGame;
