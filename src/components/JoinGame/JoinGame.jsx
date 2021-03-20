import api from '../../api/api'
import { ChessCollection } from '../../utils/config';
import { createId } from '../../utils/utils';

const JoinGame = ({ handleJoinGame, responseState, data }) => {

  // const handleJoinGame = async (documentId, playerOne) => {
  //   try {
  //     let session = await api.getAccount();
  //     if (!session) {
  //       let randomEmailId = `${createId(8)}@gmail.com`;
  //       let randomPassword = createId(8);
  //       let randomName = randomEmailId;
  //       await api.createAccount(randomEmailId, randomPassword, randomName);
  //       session = await api.createSession(randomEmailId, randomPassword);
  //     }
  //     /** Update the document */
  //     let payload = {
  //       [ChessCollection.properties.playerTwo]: session["$id"],
  //       [ChessCollection.properties.status]: "IN PROGRESS",
  //     };

  //     console.log(documentId, playerOne);
  //     let document = await api.updateDocument(
  //       ChessCollection.id,
  //       documentId,
  //       payload,
  //       [`user:${session["$id"]}`, `user:${playerOne}`],
  //       [`user:${session["$id"]}`, `user:${playerOne}`]
  //     );
  //     console.log(document);
  //   } catch (e) {
  //     console.log("There has been an error in handleJoinGame", e);
  //   }
  // };

  return (
    <>
      <h1 className="text-5xl font-semibold text-center px-16 py-8">
        Ready to <span className="text-green-600">Join?</span>
      </h1>

      <button
        className="mx-auto mt-8 py-4 px-16 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        onClick={handleJoinGame}
        disabled={responseState.loading}
      >
        {responseState.loading ? "Joining Game ..." : "Join Game"}
      </button>

    </>
  );
};


export default JoinGame;