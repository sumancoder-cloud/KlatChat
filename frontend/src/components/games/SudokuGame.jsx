import { useState, useEffect } from "react";

const easyPuzzle = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const solution = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

function SudokuGame({ socket, selectedUser, authUser, gameState, onExit }) {
  const [board, setBoard] = useState(JSON.parse(JSON.stringify(easyPuzzle)));
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [selectedCell, setSelectedCell] = useState(null);
  const [winner, setWinner] = useState(null);

  const totalEmpty = easyPuzzle.flat().filter((c) => c === 0).length;

  useEffect(() => {
    if (!socket) return;

    socket.on("sudokuMove", (data) => {
      const newBoard = [...board];
      newBoard[data.row][data.col] = data.value;
      setBoard(newBoard);
      if (data.correct) setOppScore((s) => s + 1);
    });

    socket.on("sudokuReset", () => {
      setBoard(JSON.parse(JSON.stringify(easyPuzzle)));
      setMyScore(0);
      setOppScore(0);
      setWinner(null);
    });

    return () => {
      socket.off("sudokuMove");
      socket.off("sudokuReset");
    };
  }, [socket, board]);

  useEffect(() => {
    if (myScore + oppScore >= totalEmpty) {
      setWinner(myScore > oppScore ? "me" : myScore < oppScore ? "opponent" : "draw");
    }
  }, [myScore, oppScore, totalEmpty]);

  const handleInput = (num) => {
    if (!selectedCell || winner) return;
    const [row, col] = selectedCell;
    if (easyPuzzle[row][col] !== 0) return;

    const isCorrect = solution[row][col] === num;
    const newBoard = [...board];
    newBoard[row][col] = num;
    setBoard(newBoard);

    if (isCorrect) setMyScore((s) => s + 1);

    socket?.emit("sudokuMove", {
      row,
      col,
      value: num,
      correct: isCorrect,
      to: selectedUser._id,
    });

    setSelectedCell(null);
  };

  const resetGame = () => {
    setBoard(JSON.parse(JSON.stringify(easyPuzzle)));
    setMyScore(0);
    setOppScore(0);
    setWinner(null);
    socket?.emit("sudokuReset", { to: selectedUser._id });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        <div className="flex items-center justify-center gap-6 mb-2">
          <span className="text-cyan-400">You: {myScore}</span>
          <span className="text-pink-400">{selectedUser.fullName.split(" ")[0]}: {oppScore}</span>
        </div>
        <p className="text-sm text-slate-400">
          {winner
            ? winner === "draw"
              ? "It's a draw!"
              : winner === "me"
              ? "🎉 You won!"
              : "You lost!"
            : "Tap a cell, then a number. Correct answers score!"}
        </p>
      </div>

      <div className="grid grid-cols-9 gap-0.5 mb-4 p-1 bg-slate-600 rounded">
        {board.map((row, ri) =>
          row.map((cell, ci) => {
            const isOriginal = easyPuzzle[ri][ci] !== 0;
            const isSelected = selectedCell?.[0] === ri && selectedCell?.[1] === ci;
            const isCorrect = cell !== 0 && cell === solution[ri][ci];
            const isWrong = cell !== 0 && cell !== solution[ri][ci];

            return (
              <button
                key={`${ri}-${ci}`}
                onClick={() => !isOriginal && !winner && setSelectedCell([ri, ci])}
                className={`w-7 h-7 text-sm font-medium flex items-center justify-center
                  ${isOriginal ? "bg-slate-700 text-slate-300" : "bg-slate-800"}
                  ${isSelected ? "ring-2 ring-cyan-400" : ""}
                  ${isCorrect && !isOriginal ? "text-green-400" : ""}
                  ${isWrong ? "text-red-400" : ""}
                  ${(ci + 1) % 3 === 0 && ci < 8 ? "mr-0.5" : ""}
                  ${(ri + 1) % 3 === 0 && ri < 8 ? "mb-0.5" : ""}`}
              >
                {cell || ""}
              </button>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-9 gap-1 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleInput(num)}
            disabled={!selectedCell || winner}
            className="w-8 h-8 bg-cyan-600 hover:bg-cyan-500 rounded text-white font-medium disabled:opacity-50"
          >
            {num}
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

export default SudokuGame;
