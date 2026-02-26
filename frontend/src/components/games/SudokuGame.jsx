import { useState, useEffect } from "react";

const generatePuzzle = () => {
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

  const puzzle = solution.map((row) =>
    row.map((cell) => (Math.random() > 0.5 ? cell : 0))
  );

  return { puzzle, solution };
};

function SudokuGame({ socket, selectedUser, authUser, gameState, onExit }) {
  const [{ puzzle, solution }] = useState(generatePuzzle);
  const [board, setBoard] = useState(puzzle.map((row) => [...row]));
  const [scores, setScores] = useState({ me: 0, opponent: 0 });
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleMove = (data) => {
      setBoard((prev) => {
        const newBoard = prev.map((row) => [...row]);
        newBoard[data.row][data.col] = data.value;
        return newBoard;
      });
      if (data.correct) {
        setScores((prev) => ({ ...prev, opponent: prev.opponent + 1 }));
      }
    };

    const handleReset = () => {
      const { puzzle: newPuzzle } = generatePuzzle();
      setBoard(newPuzzle.map((row) => [...row]));
      setScores({ me: 0, opponent: 0 });
    };

    socket.on("sudokuMove", handleMove);
    socket.on("sudokuReset", handleReset);

    return () => {
      socket.off("sudokuMove", handleMove);
      socket.off("sudokuReset", handleReset);
    };
  }, [socket]);

  const handleCellClick = (row, col) => {
    if (puzzle[row][col] !== 0) return;
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (num) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;

    const correct = solution[row][col] === num;
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);

    if (correct) {
      setScores((prev) => ({ ...prev, me: prev.me + 1 }));
    }

    socket?.emit("sudokuMove", {
      to: selectedUser._id,
      row,
      col,
      value: num,
      correct,
    });

    setSelectedCell(null);
  };

  const isComplete = board.every((row, i) =>
    row.every((cell, j) => cell === solution[i][j])
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-sm">
        <div className="text-cyan-400">You: {scores.me}</div>
        <div className="text-pink-400">{selectedUser.fullName}: {scores.opponent}</div>
      </div>

      <div className="grid grid-cols-9 gap-0 border-2 border-slate-500">
        {board.map((row, i) =>
          row.map((cell, j) => (
            <button
              key={`${i}-${j}`}
              onClick={() => handleCellClick(i, j)}
              className={`w-8 h-8 text-sm font-medium flex items-center justify-center
                ${j % 3 === 2 && j !== 8 ? "border-r-2 border-slate-500" : "border-r border-slate-600"}
                ${i % 3 === 2 && i !== 8 ? "border-b-2 border-slate-500" : "border-b border-slate-600"}
                ${puzzle[i][j] !== 0 ? "bg-slate-700 text-slate-300" : "bg-slate-800 text-cyan-400"}
                ${selectedCell?.row === i && selectedCell?.col === j ? "bg-cyan-500/30" : ""}
                ${cell && cell !== solution[i][j] ? "text-red-400" : ""}
              `}
            >
              {cell || ""}
            </button>
          ))
        )}
      </div>

      <div className="grid grid-cols-9 gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="w-8 h-8 bg-slate-700 rounded text-white hover:bg-cyan-500 transition-colors"
          >
            {num}
          </button>
        ))}
      </div>

      {isComplete && (
        <div className="text-center">
          <p className="text-2xl text-green-400 mb-2">🎉 Puzzle Complete!</p>
          <p className="text-slate-300">
            {scores.me > scores.opponent ? "You Win!" : scores.me < scores.opponent ? "Opponent Wins!" : "It's a Tie!"}
          </p>
        </div>
      )}
    </div>
  );
}

export default SudokuGame;
