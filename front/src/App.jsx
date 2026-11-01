import React, { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import BookingForm from "./components/BookingForm.jsx";
import ReservationLookup from "./components/ReservationLookup.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import LoginModal from "./components/LoginModal.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("client");
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem("restau_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  function handleSwitchTab(tab) {
    if (tab === "admin" && !currentUser) {
      setLoginModalOpen(true);
      return;
    }
    setActiveTab(tab);
  }

  function handleLoginSuccess(user) {
    setCurrentUser(user);
    sessionStorage.setItem("restau_user", JSON.stringify(user));
    setLoginModalOpen(false);
    setActiveTab("admin");
  }

  function handleLogout() {
    setCurrentUser(null);
    sessionStorage.removeItem("restau_user");
    setActiveTab("client");
  }

  return (
    <div className="bg-slate-100 text-slate-800 min-h-screen">
      <Navbar
        activeTab={activeTab}
        onSwitchTab={handleSwitchTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto p-6">
        {activeTab === "client" ? (
          <section className="grid md:grid-cols-2 gap-8">
            <BookingForm />
            <ReservationLookup />
          </section>
        ) : (
          <AdminDashboard currentUser={currentUser} />
        )}
      </main>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
