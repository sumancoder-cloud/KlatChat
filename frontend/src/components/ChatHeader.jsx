import { XIcon, Gamepad2 } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import GamesModal from "./games/GamesModal";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, socket, authUser } = useAuthStore();
  const [showGames, setShowGames] = useState(false);
  const [gameInvite, setGameInvite] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [gameState, setGameState] = useState(null);
  const isOnline = onlineUsers.includes(selectedUser._id);

  // Socket listeners for game invites - always active when ChatHeader is mounted
  useEffect(() => {
    if (!socket) return;

    const handleInviteReceived = (data) => {
      console.log("Game invite received:", data);
      setGameInvite(data);
      setShowGames(true); // Auto-open modal
    };

    const handleGameAccepted = (data) => {
      console.log("Game accepted:", data);
      setActiveGame(data.gameId);
      setGameState({ started: true, isHost: true });
    };

    const handleGameDeclined = () => {
      setActiveGame(null);
      setGameState(null);
    };

    const handleGameExited = () => {
      setActiveGame(null);
      setGameState(null);
      setGameInvite(null);
    };

    socket.on("gameInviteReceived", handleInviteReceived);
    socket.on("gameAccepted", handleGameAccepted);
    socket.on("gameDeclined", handleGameDeclined);
    socket.on("gameExited", handleGameExited);

    return () => {
      socket.off("gameInviteReceived", handleInviteReceived);
      socket.off("gameAccepted", handleGameAccepted);
      socket.off("gameDeclined", handleGameDeclined);
      socket.off("gameExited", handleGameExited);
    };
  }, [socket]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div
      className="flex justify-between items-center bg-slate-800/50 border-b
   border-slate-700/50 max-h-[84px] px-6 flex-1"
    >
      <div className="flex items-center space-x-3">
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-12 rounded-full">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
          </div>
        </div>

        <div>
          <h3 className="text-slate-200 font-medium">{selectedUser.fullName}</h3>
          <p className="text-slate-400 text-sm">{isOnline ? "Online" : "Offline"}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowGames(true)}
          className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 transition-colors"
          title="Play Games"
        >
          <Gamepad2 className="w-5 h-5 text-cyan-400" />
        </button>
        <button onClick={() => setSelectedUser(null)}>
          <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
        </button>
      </div>

      <GamesModal
        isOpen={showGames}
        onClose={() => {
          setShowGames(false);
          setActiveGame(null);
          setGameState(null);
          setGameInvite(null);
        }}
        socket={socket}
        selectedUser={selectedUser}
        authUser={authUser}
        gameInvite={gameInvite}
        setGameInvite={setGameInvite}
        activeGame={activeGame}
        setActiveGame={setActiveGame}
        gameState={gameState}
        setGameState={setGameState}
      />
    </div>
  );
}
export default ChatHeader;