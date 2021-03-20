import { useState } from "react";
import api from "../../api/api";
import { ChessCollection } from "../../utils/config";
import { createId } from "../../utils/utils";
import qs from "querystring";
import Alert from "../Alert/Alert";

const CreateGame = ({ setAlert }) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleCreateGame = async () => {
    try {
      setLoading(true);
      let session = await api.getAccount();
      if (!session) {
        let randomEmailId = `${createId(8)}@gmail.com`;
        let randomPassword = createId(8);
        let randomName = randomEmailId;
        await api.createAccount(randomEmailId, randomPassword, randomName);
        session = await api.createSession(randomEmailId, randomPassword);
      }

      if (!session) throw new Error("Unable to Create Session");
      /** Create the document */
      let payload = {
        [ChessCollection.properties.playerOne]: session["$id"],
        [ChessCollection.properties.status]: "WAITING",
      };
      let document = await api.createDocument(
        ChessCollection.id,
        payload,
        ["*", `user:${session["$id"]}`],
        ["*", `user:${session["$id"]}`]
      );
      if (!document) throw new Error("Unable to create game");
      console.log(document);
      const query = {
        documentId: document["$id"],
        playerOne: session["$id"],
      };

      setData({
        documentId: document["$id"],
        gameUrl: `${window.location.origin}/?${qs.stringify(query)}`,
        playerOne: document["playerOne"],
        playerTwo: document["playerTwo"],
      });
      setLoading(false);
      setAlert({
        show: true,
        color: "green",
        message: "Great! Let's get started",
      });
    } catch (e) {
      console.log("There has been an error in handleCreateGame", e);
      setLoading(false);
      setAlert({
        show: true,
        color: "red",
        message: e.message,
      });
    }
  };

  return (
    <>
      {data.documentId ? (
        <h1 className="text-5xl font-semibold text-center px-16 py-8">
          <span className="text-green-600"> Share the link </span> with your
          friend to start playing
        </h1>
      ) : (
        <h1 className="text-6xl text-center px-16 py-8">
          Welcome to <span className="text-green-600">Realtime Chess</span>
        </h1>
      )}

      {data.documentId ? (
        <div className="flex mt-8 w-full justify-center">
          <input
            type="text"
            value={data.gameUrl}
            readOnly
            className="xl:w-1/2 md:w-3/5 px-4 py-4 placeholder-gray-400 text-gray-700 bg-white text-lg shadow outline-none focus:outline-none focus:shadow-outline rounded-l-lg"
          ></input>
          <button
            onClick={() => navigator.clipboard.writeText(data.gameUrl)}
            className="py-4 px-4 bg-white text-green-500 font-semibold shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 rounded-r-lg"
          >
            Copy
          </button>
        </div>
      ) : (
        <button
          className="mx-auto mt-8 py-4 px-16 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          onClick={handleCreateGame}
          disabled={loading}
        >
          {loading ? "Creating Game ..." : "Create Game"}
        </button>
      )}
    </>
  );
};

export default CreateGame;
