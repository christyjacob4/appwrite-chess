const JoinGame = ({handleJoinGame, responseState, data}) => {
    return (
      <>
        <h1 className="text-6xl text-center">
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