"use client";
import React, { useState, useEffect } from "react";
import { FaUserGraduate, FaRegListAlt, FaBook, FaNewspaper, FaComments } from "react-icons/fa";

// Sidebar component for Parent with feature buttons
function ParentSidebar({ userEmail, onMenuSelect }) {
  const menuItems = [
    { key: "child-progress", label: "Child Progress", icon: <FaUserGraduate style={{ fontSize: 18 }} /> },
    { key: "records", label: "Records", icon: <FaRegListAlt style={{ fontSize: 18 }} /> },
    { key: "books", label: "Books", icon: <FaBook style={{ fontSize: 18 }} /> },
    { key: "cbseupdates", label: "CBSE Updates", icon: <FaNewspaper style={{ fontSize: 18 }} /> },
    { key: "messages", label: "Messages", icon: <FaComments style={{ fontSize: 18 }} /> }
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
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6, alignSelf: "flex-start" }}>Parent Panel</div>
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
              fontWeight: 700
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

export default function ParentDashboard() {
  const [selectedMenu, setSelectedMenu] = useState("child-progress");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    setUserEmail(localStorage.getItem("userEmail") || "");
  }, []);

  // Main content based on selected menu (placeholder for now)
  const renderContent = () => {
    return (
      <div style={{ padding: 32 }}>
        <h2>{{
            "child-progress": "Child Progress",
            "records": "Records",
            "books": "Books",
            "cbseupdates": "CBSE Updates",
            "messages": "Messages"
          }[selectedMenu] || "Welcome"}</h2>
        <p>Feature coming soon.</p>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fa" }}>
      <ParentSidebar
        userEmail={userEmail}
        onMenuSelect={setSelectedMenu}
      />
      <main style={{ marginLeft: 260, flex: 1, minHeight: "100vh", background: "#f4f7fa" }}>
        {renderContent()}
      </main>
    </div>
  );
}
