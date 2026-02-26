import { useState, useEffect } from "react";
import { X, Gamepad2 } from "lucide-react";
import TicTacToe from "./TicTacToe";
import SnakeLadders from "./SnakeLadders";
import SudokuGame from "./SudokuGame";
import CarromGame from "./CarromGame";

const games = [
  { id: "tictactoe", name: "Tic Tac Toe", icon: "⭕", description: "Classic X and O" },
  { id: "snake", name: "Snake & Ladders", icon: "🐍", description: "Roll dice and climb" },
  { id: "sudoku", name: "Sudoku Race", icon: "🔢", description: "Solve together" },
  { id: "carrom", name: "Carrom", icon: "🎯", description: "Strike and pocket" },
];

function GamesModal({ 
  isOpen, onClose, socket, selectedUser, authUser,
  gameInvite, setGameInvite, activeGame, setActiveGame, gameState, setGameState 
}) {
  const [selectedGame, setSelectedGame] = useState(null);

  // Sync activeGame from parent (when other user accepts)
  useEffect(() => {
    if (activeGame) {
      setSelectedGame(activeGame);
    }
  }, [activeGame]);

  const sendGameInvite = (gameId) => {
    console.log("Sending game invite:", gameId, "to:", selectedUser._id);
    socket?.emit("gameInvite", {
      gameId,
      from: authUser._id,
      to: selectedUser._id,
      fromName: authUser.fullName,
    });
    setSelectedGame(gameId);
    setGameState({ waiting: true });
  };

  const acceptInvite = () => {
    console.log("Accepting invite:", gameInvite);
    socket?.emit("acceptGame", {
      gameId: gameInvite.gameId,
      from: authUser._id,
      to: gameInvite.from,
    });
    setSelectedGame(gameInvite.gameId);
    setGameState({ started: true, isHost: false });
    setGameInvite(null);
  };

  const declineInvite = () => {
    socket?.emit("declineGame", { to: gameInvite.from });
    setGameInvite(null);
  };

  const exitGame = () => {
    socket?.emit("exitGame", { to: selectedUser._id });
    setSelectedGame(null);
    setActiveGame(null);
    setGameState(null);
  };

  if (!isOpen) return null;

  const currentGameState = gameState || {};

  const renderGame = () => {
    const props = { socket, selectedUser, authUser, gameState: currentGameState, onExit: exitGame };
    switch (selectedGame) {
      case "tictactoe":
        return <TicTacToe {...props} />;
      case "snake":
        return <SnakeLadders {...props} />;
      case "sudoku":
        return <SudokuGame {...props} />;
      case "carrom":
        return <CarromGame {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Gamepad2 className="text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">
              {selectedGame ? games.find((g) => g.id === selectedGame)?.name : "Games"}
            </h2>
          </div>
          <button onClick={selectedGame ? exitGame : onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Game Invite Notification */}
        {gameInvite && (
          <div className="p-4 bg-cyan-500/20 border-b border-cyan-500/30">
            <p className="text-cyan-300 mb-2">
              {gameInvite.fromName} invited you to play {games.find((g) => g.id === gameInvite.gameId)?.name}!
            </p>
            <div className="flex gap-2">
              <button onClick={acceptInvite} className="px-4 py-1 bg-green-500 rounded text-white text-sm">
                Accept
              </button>
              <button onClick={declineInvite} className="px-4 py-1 bg-red-500 rounded text-white text-sm">
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {!selectedGame ? (
            /* Game Selection */
            <div className="grid grid-cols-2 gap-4">
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => sendGameInvite(game.id)}
                  className="p-6 bg-slate-700/50 rounded-lg hover:bg-cyan-500/20 transition-colors text-left group"
                >
                  <span className="text-4xl mb-2 block">{game.icon}</span>
                  <h3 className="text-white font-medium group-hover:text-cyan-400">{game.name}</h3>
                  <p className="text-slate-400 text-sm">{game.description}</p>
                </button>
              ))}
            </div>
          ) : currentGameState?.waiting ? (
            /* Waiting for opponent */
            <div className="text-center py-12">
              <div className="animate-pulse text-6xl mb-4">{games.find((g) => g.id === selectedGame)?.icon}</div>
              <p className="text-slate-300">Waiting for {selectedUser.fullName} to accept...</p>
              <button onClick={exitGame} className="mt-4 px-4 py-2 bg-slate-600 rounded text-white text-sm">
                Cancel
              </button>
            </div>
          ) : (
            /* Game Component */
            renderGame()
          )}
        </div>
      </div>
    </div>
  );
}

export default GamesModal;
