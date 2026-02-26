import { useState, useEffect } from "react";

const snakes = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
const ladders = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };

function SnakeLadders({ socket, selectedUser, authUser, gameState, onExit }) {
  const [myPos, setMyPos] = useState(0);
  const [oppPos, setOppPos] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(gameState?.isHost);
  const [dice, setDice] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("snlMove", (data) => {
      setOppPos(data.position);
      setIsMyTurn(true);
      if (data.position >= 100) setWinner("opponent");
    });

    socket.on("snlReset", () => {
      setMyPos(0);
      setOppPos(0);
      setWinner(null);
      setDice(null);
      setIsMyTurn(gameState?.isHost);
    });

    return () => {
      socket.off("snlMove");
      socket.off("snlReset");
    };
  }, [socket, gameState]);

  const rollDice = () => {
    if (!isMyTurn || rolling || winner) return;
    setRolling(true);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDice(roll);
      setRolling(false);

      let newPos = myPos + roll;
      if (newPos > 100) newPos = myPos;
      
      // Check snakes and ladders
      if (snakes[newPos]) newPos = snakes[newPos];
      if (ladders[newPos]) newPos = ladders[newPos];

      setMyPos(newPos);
      setIsMyTurn(roll === 6); // Extra turn on 6

      if (newPos >= 100) {
        setWinner("me");
      }

      socket?.emit("snlMove", { position: newPos, to: selectedUser._id });
    }, 500);
  };

  const resetGame = () => {
    setMyPos(0);
    setOppPos(0);
    setWinner(null);
    setDice(null);
    setIsMyTurn(gameState?.isHost);
    socket?.emit("snlReset", { to: selectedUser._id });
  };

  const renderBoard = () => {
    const cells = [];
    for (let row = 9; row >= 0; row--) {
      const isEvenRow = row % 2 === 0;
      for (let col = 0; col < 10; col++) {
        const cellNum = row * 10 + (isEvenRow ? col + 1 : 10 - col);
        const isSnake = snakes[cellNum];
        const isLadder = ladders[cellNum];
        const hasMe = myPos === cellNum;
        const hasOpp = oppPos === cellNum;

        cells.push(
          <div
            key={cellNum}
            className={`w-8 h-8 text-xs flex items-center justify-center rounded relative
              ${isSnake ? "bg-red-500/30" : isLadder ? "bg-green-500/30" : "bg-slate-700"}
              ${cellNum === 100 ? "bg-yellow-500/50" : ""}`}
          >
            <span className="text-slate-400">{cellNum}</span>
            {hasMe && <div className="absolute w-4 h-4 bg-cyan-500 rounded-full border-2 border-white" />}
            {hasOpp && <div className="absolute w-4 h-4 bg-pink-500 rounded-full border-2 border-white" style={{ marginLeft: hasMe ? "8px" : 0 }} />}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-cyan-500 rounded-full" /> You: {myPos}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-pink-500 rounded-full" /> {selectedUser.fullName.split(" ")[0]}: {oppPos}
          </span>
        </div>
        <p className={`text-sm ${winner ? "text-yellow-400" : isMyTurn ? "text-green-400" : "text-slate-500"}`}>
          {winner ? (winner === "me" ? "🎉 You won!" : "You lost!") : isMyTurn ? "Your turn - Roll!" : "Waiting..."}
        </p>
      </div>

      <div className="grid grid-cols-10 gap-0.5 mb-4 p-2 bg-slate-800 rounded-lg">
        {renderBoard()}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={rollDice}
          disabled={!isMyTurn || rolling || winner}
          className={`w-16 h-16 text-2xl font-bold rounded-lg transition-all
            ${rolling ? "animate-bounce bg-yellow-500" : "bg-slate-700"}
            ${isMyTurn && !winner ? "hover:bg-cyan-600 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
        >
          {rolling ? "🎲" : dice || "🎲"}
        </button>
      </div>

      <div className="flex gap-4 text-xs text-slate-400 mb-4">
        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500/50 rounded" /> Snake</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500/50 rounded" /> Ladder</span>
      </div>

      <div className="flex gap-2">
        <button onClick={resetGame} className="px-4 py-2 bg-cyan-600 rounded text-white text-sm hover:bg-cyan-500">
          New Game
        </button>
        <button onClick={onExit} className="px-4 py-2 bg-slate-600 rounded text-white text-sm hover:bg-slate-500">
          Exit
        </button>
      </div>
    </div>
  );
}

export default SnakeLadders;
