"use client";
import React, { useState, useEffect } from "react";
import { FaClipboardList, FaNewspaper, FaChartBar, FaBookOpen, FaBullhorn, FaCalendarAlt, FaEnvelope, FaLaptop, FaUser } from "react-icons/fa";

// Sidebar component for Teacher with feature buttons (like StudentSidebar)
function TeacherSidebar({ userEmail, onMenuSelect }) {
  const menuItems = [
    { key: "test-generator", label: "Test Generator", icon: <FaClipboardList style={{ fontSize: 18 }} /> },
    { key: "cbse-updates", label: "CBSE Updates", icon: <FaNewspaper style={{ fontSize: 18 }} /> },
    { key: "student-performance", label: "Student Performance", icon: <FaChartBar style={{ fontSize: 18 }} /> },
    { key: "book-solutions", label: "Book Solutions", icon: <FaBookOpen style={{ fontSize: 18 }} /> },
    { key: "announcements", label: "Announcements", icon: <FaBullhorn style={{ fontSize: 18 }} /> },
    { key: "timetable", label: "Timetable", icon: <FaCalendarAlt style={{ fontSize: 18 }} /> },
    { key: "messages", label: "Messages", icon: <FaEnvelope style={{ fontSize: 18 }} /> },
    { key: "resources", label: "Digital Resources", icon: <FaLaptop style={{ fontSize: 18 }} /> }
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
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6, alignSelf: "flex-start" }}>Teacher Panel</div>
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

export default function TeacherDashboard() {
  const [selectedMenu, setSelectedMenu] = useState("test-generator");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    setUserEmail(localStorage.getItem("userEmail") || "");
  }, []);

  // Main content based on selected menu (placeholder for now)
  const renderContent = () => {
    return (
      <div style={{ padding: 32 }}>
        <h2>{{
            "test-generator": "Test Generator",
            "cbse-updates": "CBSE Updates",
            "student-performance": "Student Performance",
            "book-solutions": "Book Solutions",
            "announcements": "Announcements",
            "timetable": "Timetable",
            "messages": "Messages",
            "resources": "Digital Resources"
          }[selectedMenu] || "Welcome"}</h2>
        <p>Feature coming soon.</p>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fa" }}>
      <TeacherSidebar
        userEmail={userEmail}
        onMenuSelect={setSelectedMenu}
      />
      <main style={{ marginLeft: 260, flex: 1, minHeight: "100vh", background: "#f4f7fa" }}>
        {renderContent()}
      </main>
    </div>
  );
}