"use client";
import React, { useState, useEffect } from "react";
import { FaQuestionCircle, FaVideo, FaRegListAlt, FaBook, FaNewspaper } from "react-icons/fa";

// Sidebar component defined locally
function StudentSidebar({ userEmail, onMenuSelect }) {
  const menuItems = [
    { key: "quizzes", label: "Quizzes", icon: <FaQuestionCircle style={{ fontSize: 18 }} /> },
    { key: "avlrs", label: "AVLRs", icon: <FaVideo style={{ fontSize: 18 }} /> },
    { key: "records", label: "Records", icon: <FaRegListAlt style={{ fontSize: 18 }} /> },
    { key: "books", label: "Books", icon: <FaBook style={{ fontSize: 18 }} /> },
    { key: "cbseupdates", label: "CBSE Updates", icon: <FaNewspaper style={{ fontSize: 18 }} /> }
  ];
  return (
    <aside style={{
      width: 260,
      background: "#fff",
      borderRight: "1px solid #e0e0e0",
      minHeight: "100vh",
      padding: "32px 0 0 0",
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 100,
      boxShadow: "2px 0 8px rgba(0,0,0,0.04)"
    }}>
      <div style={{ padding: "0 24px", marginBottom: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6, alignSelf: "flex-start" }}>Student Panel</div>
        <img
          src="/default-avatar.png"
          alt="Profile"
          style={{ width: 64, height: 64, borderRadius: "50%", margin: "10px 0" }}
        />
        <div style={{ fontSize: 13, color: "#888" }}>{userEmail}</div>
      </div>
      <nav>
        {menuItems.map(item => (
          <button
            key={item.key}
            onClick={() => onMenuSelect(item.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              background: "none",
              border: "none",
              textAlign: "left",
              padding: "12px 24px",
              fontSize: 16,
              color: "#1e3c72",
              cursor: "pointer",
              fontWeight: 700 // Make menu item bold
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default function StudentDashboard() {
  const [selectedMenu, setSelectedMenu] = useState("books");
  const [userEmail, setUserEmail] = useState(""); // Initialize as empty

  // Set userEmail from localStorage after mount (client-side only)
  useEffect(() => {
    setUserEmail(localStorage.getItem("userEmail") || "");
  }, []);

  // Placeholder for profile update callback
  const handleProfileUpdate = () => {};

  // Main content based on selected menu
  const renderContent = () => {
    if (selectedMenu === "quizzes") {
      return (
        <div style={{ padding: 32 }}>
          <h2>Quizzes</h2>
          <p>Quiz features will appear here.</p>
        </div>
      );
    }
    if (selectedMenu === "avlrs") {
      return (
        <div style={{ padding: 32 }}>
          <h2>AVLRs</h2>
          <p>Audio-Visual Learning Resources will be listed here.</p>
        </div>
      );
    }
    if (selectedMenu === "records") {
      return (
        <div style={{ padding: 32 }}>
          <h2>Records</h2>
          <p>Your records will be shown here.</p>
        </div>
      );
    }
    if (selectedMenu === "books") {
      return (
        <div style={{ padding: 32 }}>
          <h2>Books</h2>
          <p>Books will be listed here.</p>
        </div>
      );
    }
    if (selectedMenu === "cbseupdates") {
      return (
        <div style={{ padding: 32 }}>
          <h2>CBSE Updates</h2>
          <p>Latest CBSE updates will be shown here.</p>
        </div>
      );
    }
    return (
      <div style={{ padding: 32 }}>
        <h2>Welcome</h2>
        <p>Select a feature from the menu.</p>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fa" }}>
      <StudentSidebar
        userEmail={userEmail}
        onProfileUpdate={handleProfileUpdate}
        onMenuSelect={setSelectedMenu}
      />
      <main style={{ marginLeft: 260, flex: 1, minHeight: "100vh", background: "#f4f7fa" }}>
        {renderContent()}
      </main>
    </div>
  );
}
