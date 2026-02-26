import { useState, useEffect, useRef } from "react";

function CarromGame({ socket, selectedUser, authUser, gameState, onExit }) {
  const canvasRef = useRef(null);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(gameState?.isHost);
  const [striker, setStriker] = useState({ x: 200, y: 320 });
  const [power, setPower] = useState(0);
  const [angle, setAngle] = useState(-90);
  const [coins, setCoins] = useState([]);
  const [shooting, setShooting] = useState(false);

  const initCoins = () => [
    { x: 200, y: 200, color: "white", pocketed: false },
    { x: 185, y: 185, color: "black", pocketed: false },
    { x: 215, y: 185, color: "white", pocketed: false },
    { x: 170, y: 200, color: "black", pocketed: false },
    { x: 230, y: 200, color: "white", pocketed: false },
    { x: 185, y: 215, color: "black", pocketed: false },
    { x: 215, y: 215, color: "white", pocketed: false },
    { x: 200, y: 170, color: "black", pocketed: false },
    { x: 200, y: 230, color: "white", pocketed: false },
    { x: 200, y: 200, color: "red", pocketed: false }, // Queen
  ];

  useEffect(() => {
    setCoins(initCoins());
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("carromShot", (data) => {
      setCoins(data.coins);
      setOppScore(data.oppScore);
      setIsMyTurn(true);
    });

    socket.on("carromReset", () => {
      setCoins(initCoins());
      setMyScore(0);
      setOppScore(0);
      setIsMyTurn(gameState?.isHost);
    });

    return () => {
      socket.off("carromShot");
      socket.off("carromReset");
    };
  }, [socket, gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      // Board
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(0, 0, 400, 400);
      ctx.fillStyle = "#DEB887";
      ctx.fillRect(20, 20, 360, 360);

      // Pockets
      const pockets = [[30, 30], [370, 30], [30, 370], [370, 370]];
      pockets.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
      });

      // Center circle
      ctx.beginPath();
      ctx.arc(200, 200, 30, 0, Math.PI * 2);
      ctx.strokeStyle = "#8B4513";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Coins
      coins.forEach((coin) => {
        if (coin.pocketed) return;
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = coin.color === "red" ? "#DC143C" : coin.color;
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Striker
      ctx.beginPath();
      ctx.arc(striker.x, striker.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = isMyTurn ? "#00CED1" : "#666";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Aim line
      if (isMyTurn && !shooting) {
        const rad = (angle * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(striker.x, striker.y);
        ctx.lineTo(striker.x + Math.cos(rad) * power, striker.y + Math.sin(rad) * power);
        ctx.strokeStyle = "rgba(0,255,255,0.5)";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    };

    draw();
  }, [striker, coins, power, angle, isMyTurn, shooting]);

  const shoot = () => {
    if (!isMyTurn || shooting || power < 20) return;
    setShooting(true);

    // Simple physics simulation
    const rad = (angle * Math.PI) / 180;
    let vx = Math.cos(rad) * power * 0.1;
    let vy = Math.sin(rad) * power * 0.1;
    let sx = striker.x;
    let sy = striker.y;
    let newCoins = [...coins];
    let scored = 0;

    const simulate = () => {
      sx += vx;
      sy += vy;
      vx *= 0.98;
      vy *= 0.98;

      // Walls
      if (sx < 35 || sx > 365) vx *= -0.8;
      if (sy < 35 || sy > 365) vy *= -0.8;
      sx = Math.max(35, Math.min(365, sx));
      sy = Math.max(35, Math.min(365, sy));

      // Coin collisions
      newCoins.forEach((coin, i) => {
        if (coin.pocketed) return;
        const dx = coin.x - sx;
        const dy = coin.y - sy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 27) {
          coin.x += dx * 0.3;
          coin.y += dy * 0.3;
          vx *= 0.5;
          vy *= 0.5;
        }

        // Check pockets
        const pockets = [[30, 30], [370, 30], [30, 370], [370, 370]];
        pockets.forEach(([px, py]) => {
          const pdist = Math.sqrt((coin.x - px) ** 2 + (coin.y - py) ** 2);
          if (pdist < 25) {
            coin.pocketed = true;
            scored += coin.color === "red" ? 5 : coin.color === "white" ? 1 : 2;
          }
        });
      });

      setStriker({ x: sx, y: sy });
      setCoins([...newCoins]);

      if (Math.abs(vx) > 0.5 || Math.abs(vy) > 0.5) {
        requestAnimationFrame(simulate);
      } else {
        setShooting(false);
        setStriker({ x: 200, y: 320 });
        setPower(0);
        if (scored > 0) {
          setMyScore((s) => s + scored);
        }
        setIsMyTurn(scored > 0);
        socket?.emit("carromShot", {
          coins: newCoins,
          oppScore: myScore + scored,
          to: selectedUser._id,
        });
      }
    };

    simulate();
  };

  const resetGame = () => {
    setCoins(initCoins());
    setMyScore(0);
    setOppScore(0);
    setStriker({ x: 200, y: 320 });
    setPower(0);
    setIsMyTurn(gameState?.isHost);
    socket?.emit("carromReset", { to: selectedUser._id });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-center">
        <div className="flex items-center justify-center gap-6 mb-1">
          <span className="text-cyan-400">You: {myScore}</span>
          <span className="text-pink-400">{selectedUser.fullName.split(" ")[0]}: {oppScore}</span>
        </div>
        <p className={`text-xs ${isMyTurn ? "text-green-400" : "text-slate-500"}`}>
          {isMyTurn ? "Your turn - Aim and shoot!" : "Opponent's turn"}
        </p>
      </div>

      <canvas ref={canvasRef} width={400} height={400} className="rounded-lg border-4 border-amber-800 mb-2" />

      {isMyTurn && !shooting && (
        <div className="flex items-center gap-4 mb-2">
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400">Angle</span>
            <input
              type="range"
              min="-180"
              max="0"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-24"
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400">Power</span>
            <input
              type="range"
              min="0"
              max="150"
              value={power}
              onChange={(e) => setPower(Number(e.target.value))}
              className="w-24"
            />
          </div>
          <button
            onClick={shoot}
            disabled={power < 20}
            className="px-4 py-2 bg-cyan-600 rounded text-white text-sm hover:bg-cyan-500 disabled:opacity-50"
          >
            Shoot!
          </button>
        </div>
      )}

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

export default CarromGame;
