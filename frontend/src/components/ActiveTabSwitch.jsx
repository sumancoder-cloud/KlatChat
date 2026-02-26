import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="m-2">
      <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg">
        <button
          aria-pressed={activeTab === "chats"}
          onClick={() => setActiveTab("chats")}
          className={`flex-1 text-sm text-center py-2 rounded-md font-medium transition-colors ${
            activeTab === "chats"
              ? "bg-cyan-600 text-white shadow"
              : "text-slate-300 hover:bg-slate-700/40"
          }`}
        >
          Chats
        </button>

        <button
          aria-pressed={activeTab === "contacts"}
          onClick={() => setActiveTab("contacts")}
          className={`flex-1 text-sm text-center py-2 rounded-md font-medium transition-colors ${
            activeTab === "contacts"
              ? "bg-cyan-600 text-white shadow"
              : "text-slate-300 hover:bg-slate-700/40"
          }`}
        >
          Contacts
        </button>
      </div>
    </div>
  );
}

export default ActiveTabSwitch;