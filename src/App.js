import Game from "./Game";

const App = () => {
  return (
    <div class="h-screen bg-gray-800  text-gray-100 flex flex-col">
      <div>
        <ul class="flex justify-between text-xl py-8 px-8 md:px-48 ">
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
      </div>

      <div className="h-100 container mx-auto flex-grow flex justify-between">
        {/* Left Side  */}
        <div className="flex-1 my-auto">
          <Game />
        </div>

        {/* Right Side */}
        <div className="flex flex-col flex-1 my-auto">
          <h1 class="text-6xl my-auto mx-auto md:mx-48 ">
            Realtime <br />
            <span class="text-green-600">Chess Game built with Appwrite</span>
          </h1>

          <button className="mx-auto py-4 px-16 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75">
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
