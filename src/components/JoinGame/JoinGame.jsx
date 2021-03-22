import { useState } from "react";
import api from "../../api/api";
import { ChessCollection } from "../../utils/config";
import { createId } from "../../utils/utils";
import qs from "querystring";

const JoinGame = ({ setParentData }) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleJoinGame = async () => {
    setLoading(true);
    let queryParams = qs.parse(window.location.search.substr(1));
    let { documentId, playerOne } = queryParams;
    try {
      console.log("Joining Game");
      let session,
        account = await api.getAccount();
      if (account && account["$id"] === playerOne)
        throw new Error("You cant play with yourself :P");
      if (!account) {
        console.log("No Account Currently logged in");
        let randomEmailId = `${createId(8)}@gmail.com`;
        let randomPassword = createId(8);
        let randomName = randomEmailId;
        account = await api.createAccount(
          randomEmailId,
          randomPassword,
          randomName
        );
        session = await api.createSession(randomEmailId, randomPassword);
        if (!session) throw new Error("Unable to Create Session");
        console.log("Created new session");
      }
      let userId = account["$id"];
      /** Update the document */
      let payload = {
        [ChessCollection.properties.playerTwo]: userId,
        [ChessCollection.properties.status]: "IN PROGRESS",
      };

      let document = await api.updateDocument(
        ChessCollection.id,
        documentId,
        payload,
        [`user:${userId}`, `user:${playerOne}`],
        [`user:${userId}`, `user:${playerOne}`]
      );
      if (!document) throw new Error("Unable to create game");

      console.log("Account", account);

      setParentData({
        show: true,
        color: "green",
        message: "Successfully Joined!",
        userId: userId,
        documentId: document["$id"],
        playerOne: document["playerOne"],
        playerTwo: document["playerTwo"],
        fen: document["fen"],
      });
      setLoading(false);
    } catch (e) {
      console.log("There has been an error in handleJoinGame", e);
      setLoading(false);
      setParentData({
        show: true,
        color: "red",
        message: e.message,
      });
    }
  };

  return (
    <>
      <h1 className="text-5xl font-semibold text-center px-16 py-8">
        Ready to <span className="text-green-600">Join?</span>
      </h1>

      {!data.documentId && (
        <button
          className="mx-auto mt-8 py-4 px-16 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          onClick={handleJoinGame}
          disabled={loading}
        >
          {loading ? "Joining Game ..." : "Join Game"}
        </button>
      )}
    </>
  );
};

export default JoinGame;
