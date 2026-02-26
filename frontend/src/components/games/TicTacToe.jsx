import { useState, useEffect } from "react";

function TicTacToe({ socket, selectedUser, authUser, gameState, onExit }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isMyTurn, setIsMyTurn] = useState(gameState?.isHost);
  const [winner, setWinner] = useState(null);
  const mySymbol = gameState?.isHost ? "X" : "O";

  useEffect(() => {
    if (!socket) return;

    socket.on("tttMove", (data) => {
      setBoard(data.board);
      setIsMyTurn(true);
      checkWinner(data.board);
    });

    socket.on("tttReset", () => {
      setBoard(Array(9).fill(null));
      setWinner(null);
      setIsMyTurn(gameState?.isHost);
    });

    return () => {
      socket.off("tttMove");
      socket.off("tttReset");
    };
  }, [socket, gameState]);

  const checkWinner = (b) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let [a, b1, c] of lines) {
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
        setWinner(b[a]);
        return b[a];
      }
    }
    if (b.every((cell) => cell)) setWinner("draw");
    return null;
  };

  const handleClick = (i) => {
    if (board[i] || !isMyTurn || winner) return;
    const newBoard = [...board];
    newBoard[i] = mySymbol;
    setBoard(newBoard);
    setIsMyTurn(false);
    checkWinner(newBoard);
    socket?.emit("tttMove", { board: newBoard, to: selectedUser._id });
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsMyTurn(gameState?.isHost);
    socket?.emit("tttReset", { to: selectedUser._id });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        <p className="text-slate-300">
          You are <span className={`font-bold ${mySymbol === "X" ? "text-cyan-400" : "text-pink-400"}`}>{mySymbol}</span>
        </p>
        <p className={`text-sm ${isMyTurn ? "text-green-400" : "text-slate-500"}`}>
          {winner ? (winner === "draw" ? "It's a draw!" : `${winner === mySymbol ? "You won!" : "You lost!"}`) : isMyTurn ? "Your turn" : "Opponent's turn"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={!isMyTurn || cell || winner}
            className={`w-20 h-20 text-4xl font-bold rounded-lg transition-all
              ${cell ? "bg-slate-600" : "bg-slate-700 hover:bg-slate-600"}
              ${cell === "X" ? "text-cyan-400" : "text-pink-400"}
              ${!isMyTurn || cell || winner ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            {cell}
          </button>
        ))}
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

export default TicTacToe;
