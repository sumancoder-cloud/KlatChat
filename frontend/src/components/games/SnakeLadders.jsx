import { useState, useEffect } from "react";

const BOARD_SIZE = 100;
const snakes = { 99: 54, 70: 55, 52: 42, 25: 2, 95: 72 };
const ladders = { 6: 25, 11: 40, 60: 85, 46: 90, 17: 69 };

function SnakeLadders({ socket, selectedUser, authUser, gameState, onExit }) {
  const [positions, setPositions] = useState({ me: 0, opponent: 0 });
  const [isMyTurn, setIsMyTurn] = useState(gameState?.isHost);
  const [dice, setDice] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleMove = (data) => {
      setPositions((prev) => ({ ...prev, opponent: data.position }));
      setIsMyTurn(true);
      if (data.position >= BOARD_SIZE) {
        setWinner("opponent");
      }
    };

    const handleReset = () => {
      setPositions({ me: 0, opponent: 0 });
      setIsMyTurn(gameState?.isHost);
      setWinner(null);
      setDice(null);
    };

    socket.on("snlMove", handleMove);
    socket.on("snlReset", handleReset);

    return () => {
      socket.off("snlMove", handleMove);
      socket.off("snlReset", handleReset);
    };
  }, [socket, gameState?.isHost]);

  const rollDice = () => {
    if (!isMyTurn || rolling || winner) return;

    setRolling(true);
    const roll = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      setDice(roll);
      setRolling(false);

      let newPos = positions.me + roll;
      if (newPos > BOARD_SIZE) {
        newPos = positions.me;
      } else {
        if (snakes[newPos]) newPos = snakes[newPos];
        if (ladders[newPos]) newPos = ladders[newPos];
      }

      setPositions((prev) => ({ ...prev, me: newPos }));
      setIsMyTurn(false);

      socket?.emit("snlMove", {
        to: selectedUser._id,
        position: newPos,
        dice: roll,
      });

      if (newPos >= BOARD_SIZE) {
        setWinner("me");
      }
    }, 500);
  };

  const resetGame = () => {
    setPositions({ me: 0, opponent: 0 });
    setIsMyTurn(gameState?.isHost);
    setWinner(null);
    setDice(null);
    socket?.emit("snlReset", { to: selectedUser._id });
  };

  const renderBoard = () => {
    const cells = [];
    for (let row = 9; row >= 0; row--) {
      const isEvenRow = row % 2 === 0;
      for (let col = 0; col < 10; col++) {
        const cellNum = isEvenRow ? row * 10 + (10 - col) : row * 10 + col + 1;
        const hasMe = positions.me === cellNum;
        const hasOpponent = positions.opponent === cellNum;
        const hasSnake = snakes[cellNum];
        const hasLadder = ladders[cellNum];

        cells.push(
          <div
            key={cellNum}
            className={`w-10 h-10 border border-slate-600 flex items-center justify-center text-xs relative
              ${hasSnake ? "bg-red-500/30" : ""}
              ${hasLadder ? "bg-green-500/30" : ""}
            `}
          >
            <span className="text-slate-500">{cellNum}</span>
            {hasMe && <div className="absolute w-4 h-4 bg-cyan-400 rounded-full" />}
            {hasOpponent && <div className="absolute w-4 h-4 bg-pink-400 rounded-full ml-3" />}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyan-400 rounded-full" />
          <span className="text-slate-300">You: {positions.me}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pink-400 rounded-full" />
          <span className="text-slate-300">{selectedUser.fullName}: {positions.opponent}</span>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-0 border border-slate-600">
        {renderBoard()}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-4xl w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
          {rolling ? "🎲" : dice || "?"}
        </div>
        <button
          onClick={rollDice}
          disabled={!isMyTurn || rolling || winner}
          className={`px-6 py-3 rounded-lg font-medium transition-colors
            ${isMyTurn && !winner ? "bg-cyan-500 hover:bg-cyan-600 text-white" : "bg-slate-600 text-slate-400 cursor-not-allowed"}
          `}
        >
          {rolling ? "Rolling..." : isMyTurn ? "Roll Dice" : "Opponent's Turn"}
        </button>
      </div>

      {winner && (
        <div className="text-center">
          <p className="text-2xl mb-4">
            {winner === "me" ? "🎉 You Won!" : "😔 You Lost!"}
          </p>
          <button onClick={resetGame} className="px-6 py-2 bg-cyan-500 text-white rounded-lg">
            Play Again
          </button>
        </div>
      )}

      <div className="flex gap-4 text-xs text-slate-400">
        <span>🔴 Snake (go down)</span>
        <span>🟢 Ladder (go up)</span>
      </div>
    </div>
  );
}

export default SnakeLadders;
