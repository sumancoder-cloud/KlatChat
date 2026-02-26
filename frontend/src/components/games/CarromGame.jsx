import { useRef, useEffect, useState } from "react";

function CarromGame({ socket, selectedUser, authUser, gameState, onExit }) {
  const canvasRef = useRef(null);
  const [isMyTurn, setIsMyTurn] = useState(gameState?.isHost);
  const [scores, setScores] = useState({ me: 0, opponent: 0 });
  const [striker, setStriker] = useState({ x: 200, y: 350 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  const coins = useRef([
    { x: 200, y: 200, color: "#000", pocketed: false },
    { x: 180, y: 180, color: "#fff", pocketed: false },
    { x: 220, y: 180, color: "#fff", pocketed: false },
    { x: 180, y: 220, color: "#fff", pocketed: false },
    { x: 220, y: 220, color: "#fff", pocketed: false },
    { x: 200, y: 160, color: "#fff", pocketed: false },
    { x: 160, y: 200, color: "#fff", pocketed: false },
    { x: 240, y: 200, color: "#fff", pocketed: false },
    { x: 200, y: 240, color: "#fff", pocketed: false },
  ]);

  const pockets = [
    { x: 20, y: 20 },
    { x: 380, y: 20 },
    { x: 20, y: 380 },
    { x: 380, y: 380 },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(0, 0, 400, 400);

      ctx.fillStyle = "#D2691E";
      ctx.fillRect(10, 10, 380, 380);

      pockets.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
      });

      coins.current.forEach((coin) => {
        if (!coin.pocketed) {
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, 12, 0, Math.PI * 2);
          ctx.fillStyle = coin.color;
          ctx.fill();
          ctx.strokeStyle = "#333";
          ctx.stroke();
        }
      });

      ctx.beginPath();
      ctx.arc(striker.x, striker.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = isMyTurn ? "#00BFFF" : "#666";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      if (dragging && dragStart) {
        ctx.beginPath();
        ctx.moveTo(striker.x, striker.y);
        ctx.lineTo(dragStart.x, dragStart.y);
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    draw();
  }, [striker, dragging, dragStart, isMyTurn, scores]);

  useEffect(() => {
    if (!socket) return;

    const handleShot = (data) => {
      coins.current = data.coins;
      setScores((prev) => ({ ...prev, opponent: data.score }));
      setIsMyTurn(true);
    };

    const handleReset = () => {
      coins.current = [
        { x: 200, y: 200, color: "#000", pocketed: false },
        { x: 180, y: 180, color: "#fff", pocketed: false },
        { x: 220, y: 180, color: "#fff", pocketed: false },
        { x: 180, y: 220, color: "#fff", pocketed: false },
        { x: 220, y: 220, color: "#fff", pocketed: false },
        { x: 200, y: 160, color: "#fff", pocketed: false },
        { x: 160, y: 200, color: "#fff", pocketed: false },
        { x: 240, y: 200, color: "#fff", pocketed: false },
        { x: 200, y: 240, color: "#fff", pocketed: false },
      ];
      setScores({ me: 0, opponent: 0 });
      setIsMyTurn(gameState?.isHost);
    };

    socket.on("carromShot", handleShot);
    socket.on("carromReset", handleReset);

    return () => {
      socket.off("carromShot", handleShot);
      socket.off("carromReset", handleReset);
    };
  }, [socket, gameState?.isHost]);

  const handleMouseDown = (e) => {
    if (!isMyTurn) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setDragging(true);
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = () => {
    if (!dragging || !dragStart) return;

    const dx = striker.x - dragStart.x;
    const dy = striker.y - dragStart.y;
    const power = Math.min(Math.sqrt(dx * dx + dy * dy) / 10, 10);

    let myScore = scores.me;
    coins.current.forEach((coin) => {
      if (!coin.pocketed) {
        const dist = Math.sqrt((coin.x - striker.x) ** 2 + (coin.y - striker.y) ** 2);
        if (dist < 30) {
          coin.x += dx * 0.5;
          coin.y += dy * 0.5;

          pockets.forEach((p) => {
            const pDist = Math.sqrt((coin.x - p.x) ** 2 + (coin.y - p.y) ** 2);
            if (pDist < 25) {
              coin.pocketed = true;
              myScore += coin.color === "#000" ? 5 : 1;
            }
          });
        }
      }
    });

    setScores((prev) => ({ ...prev, me: myScore }));
    setDragging(false);
    setDragStart(null);
    setIsMyTurn(false);

    socket?.emit("carromShot", {
      to: selectedUser._id,
      coins: coins.current,
      score: myScore,
    });
  };

  const allPocketed = coins.current.every((c) => c.pocketed);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-sm">
        <div className="text-cyan-400">You: {scores.me}</div>
        <div className="text-pink-400">{selectedUser.fullName}: {scores.opponent}</div>
      </div>

      <div className="text-slate-300 text-sm">
        {isMyTurn ? "Your turn - drag to shoot!" : `${selectedUser.fullName}'s turn`}
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="border-4 border-amber-900 rounded cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {allPocketed && (
        <div className="text-center">
          <p className="text-2xl mb-2">
            {scores.me > scores.opponent ? "🎉 You Win!" : "😔 Opponent Wins!"}
          </p>
        </div>
      )}

      <div className="text-xs text-slate-400">
        ⚫ Queen = 5 points | ⚪ Coin = 1 point
      </div>
    </div>
  );
}

export default CarromGame;
