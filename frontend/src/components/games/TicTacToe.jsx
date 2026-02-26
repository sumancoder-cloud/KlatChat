import { useState, useEffect } from "react";

function TicTacToe({ socket, selectedUser, authUser, gameState, onExit }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const isHost = gameState?.isHost;
  const mySymbol = isHost ? "X" : "O";
  const isMyTurn = (isXNext && isHost) || (!isXNext && !isHost);

  useEffect(() => {
    if (!socket) return;

    const handleMove = (data) => {
      setBoard(data.board);
      setIsXNext(data.isXNext);
    };

    const handleReset = () => {
      setBoard(Array(9).fill(null));
      setIsXNext(true);
    };

    socket.on("tttMove", handleMove);
    socket.on("tttReset", handleReset);

    return () => {
      socket.off("tttMove", handleMove);
      socket.off("tttReset", handleReset);
    };
  }, [socket]);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i) => {
    if (!isMyTurn || board[i] || calculateWinner(board)) return;

    const newBoard = [...board];
    newBoard[i] = mySymbol;
    setBoard(newBoard);
    setIsXNext(!isXNext);

    socket?.emit("tttMove", {
      to: selectedUser._id,
      board: newBoard,
      isXNext: !isXNext,
    });
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    socket?.emit("tttReset", { to: selectedUser._id });
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every((cell) => cell);

  let status;
  if (winner) {
    status = winner === mySymbol ? "🎉 You Won!" : "😔 You Lost!";
  } else if (isDraw) {
    status = "🤝 It's a Draw!";
  } else {
    status = isMyTurn ? "Your turn" : `${selectedUser.fullName}'s turn`;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-lg font-medium text-white mb-2">
        You are: <span className={mySymbol === "X" ? "text-cyan-400" : "text-pink-400"}>{mySymbol}</span>
      </div>
      <div className="text-slate-300 mb-4">{status}</div>
      
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={!isMyTurn || cell || winner}
            className={`w-20 h-20 text-4xl font-bold rounded-lg transition-all
              ${cell === "X" ? "text-cyan-400 bg-cyan-500/20" : ""}
              ${cell === "O" ? "text-pink-400 bg-pink-500/20" : ""}
              ${!cell ? "bg-slate-700 hover:bg-slate-600" : ""}
              ${!isMyTurn || cell || winner ? "cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {cell}
          </button>
        ))}
      </div>

      {(winner || isDraw) && (
        <button
          onClick={resetGame}
          className="mt-4 px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          Play Again
        </button>
      )}
    </div>
  );
}

export default TicTacToe;
