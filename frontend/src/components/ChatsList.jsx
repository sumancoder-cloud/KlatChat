import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <div className="space-y-2 p-2">
      {chats.map((chat) => (
        <div
          key={chat._id}
          className="flex items-center gap-3 p-3 bg-cyan-500/8 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(chat)}
        >
          <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
            <div className="size-12 rounded-full">
              <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
            </div>
          </div>
          <div className="min-w-0">
            <h4 className="text-slate-200 font-medium truncate">{chat.fullName}</h4>
          </div>
        </div>
      ))}
    </div>
  );
}
export default ChatsList;