import React from "react";

export default function Navbar({ activeTab, onSwitchTab, currentUser, onLogout }) {
  return (
    <nav className="bg-slate-900 text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-wrap gap-4 justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          🍽️ <span>Le Gourmet</span>
          <span className="text-xs bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-normal border border-slate-700">
            React
          </span>
        </h1>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSwitchTab("client")}
            className={`px-4 py-2 rounded text-sm transition ${
              activeTab === "client"
                ? "bg-amber-500 text-slate-900 font-semibold"
                : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            Espace Client
          </button>

          <button
            onClick={() => onSwitchTab("admin")}
            className={`px-4 py-2 rounded text-sm transition ${
              activeTab === "admin"
                ? "bg-amber-500 text-slate-900 font-semibold"
                : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            Espace Restaurateur
          </button>

          {currentUser && (
            <div className="flex items-center space-x-2 pl-3 border-l border-slate-700 text-xs">
              <span className="bg-slate-800 px-3 py-1.5 rounded-full font-medium text-amber-400 border border-slate-700">
                👤 {currentUser.name} ({currentUser.role})
              </span>
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-white underline"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
