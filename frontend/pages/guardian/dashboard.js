"use client";
import React, { useEffect, useState } from "react";
import { FaUser, FaBars, FaTimes, FaChild, FaClipboardList, FaEnvelope, FaBookOpen, FaBullhorn, FaCalendarAlt, FaLaptop, FaTrashAlt, FaBell, FaPalette, FaRegListAlt, FaCog } from "react-icons/fa";
import DashboardCommon from "../DashboardCommon";
import { getToken, logout } from "../../utils/auth.js";
import ProtectedRoute from '../../components/ProtectedRoute';
import { BASE_API_URL } from "../../utils/apiurl";

// Add this style block at the top of the file (or in a global CSS if preferred)
const blinkStyle = `
@keyframes blink-badge {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
.blink-badge {
  animation: blink-badge 1s steps(1, end) infinite;
}
`;

function ParentSidebar({ userEmail, userPhoto, userName, onMenuSelect, selectedMenu, newAnnouncementCount, renderAnnouncementBadge }) {
  const menuItems = [
    { key: "student-profile", label: "Child Profile", icon: <FaChild style={{ fontSize: 18 }} /> },
    { key: "assignments", label: "Assignments", icon: <FaClipboardList style={{ fontSize: 18 }} /> },
    { key: "messages", label: "Messages", icon: <FaEnvelope style={{ fontSize: 18 }} /> },
    { key: "books", label: "Books", icon: <FaBookOpen style={{ fontSize: 18 }} /> },
    { key: "cbse-updates", label: "CBSE Updates", icon: <FaRegListAlt style={{ fontSize: 18 }} />, action: () => window.location.href = "/cbse-updates" },
    { key: "announcements", label: "Announcements", icon: <FaBullhorn style={{ fontSize: 18 }} />, action: () => window.location.href = "/announcement" },
    { key: "timetable", label: "Timetable", icon: <FaCalendarAlt style={{ fontSize: 18 }} /> },
    { key: "resources", label: "Digital Resources", icon: <FaLaptop style={{ fontSize: 18 }} /> },
    { key: "profile", label: "Profile", icon: <FaUser style={{ fontSize: 18 }} />, action: () => window.location.href = "/guardian/profile" },
    { key: "creative-corner", label: "Creative Corner", icon: <FaPalette style={{ fontSize: 18, color: '#ff0080' }} />, action: () => window.location.href = "/creative-corner" },
    { key: "discussion-panel", label: "Discussion Panel", icon: <FaUser style={{ fontSize: 18 }} /> },
    { key: "settings", label: "Settings", icon: <FaCog style={{ fontSize: 18 }} />, action: () => window.location.href = "/settings" }
  ];
  return (
    <>
      <style>{blinkStyle}</style>
      <aside style={{
        width: 300,
        background: "#fff",
        borderRight: "1px solid #e0e0e0",
        minHeight: "100vh",
        padding: "32px 0 0 0",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 2000,
        boxShadow: "2px 0 16px rgba(30,60,114,0.07)",
        overflow: "hidden"
      }}>
        <div style={{ height: "calc(100vh - 120px)", overflowY: "auto", paddingBottom: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "0 24px", marginBottom: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6, alignSelf: "flex-start", color: "#1e3c72" }}>Parent Panel</div>
            <img
              src={userPhoto || "/default-avatar.png"}
              alt="Profile"
              style={{ width: 72, height: 72, borderRadius: "50%", margin: "14px 0", objectFit: "cover", boxShadow: "0 2px 8px rgba(30,60,114,0.10)" }}
            />
            {userName && <div style={{ fontWeight: 600, fontSize: 16, color: "#1e3c72", marginBottom: 2 }}>{userName}</div>}
            <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>{userEmail}</div>
          </div>
          <nav>
            {menuItems.map(item => (
              <button
                key={item.key}
                onClick={() => { item.action ? item.action() : onMenuSelect(item.key); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  width: "100%",
                  background: selectedMenu === item.key ? "linear-gradient(90deg,#e0e7ff 0%,#f7fafd 100%)" : "none",
                  border: "none",
                  textAlign: "left",
                  padding: "14px 28px",
                  fontSize: 17,
                  color: selectedMenu === item.key ? "#1e3c72" : "#444",
                  cursor: "pointer",
                  fontWeight: 600,
                  borderLeft: selectedMenu === item.key ? "4px solid #1e3c72" : "4px solid transparent",
                  transition: "background 0.18s, color 0.18s",
                  position: "relative"
                }}
              >
                <span style={{ display: "flex", alignItems: "center" }}>{item.icon}</span>
                <span style={{ display: "flex", alignItems: "center" }}>{item.label}</span>
                {item.key === "announcements" && renderAnnouncementBadge && renderAnnouncementBadge(newAnnouncementCount)}
              </button>
            ))}
          </nav>
          <button
            onClick={async () => { await logout(); window.location.href = "/login"; }}
            style={{
              margin: "32px auto 0 auto",
              width: "80%",
              background: "rgb(98, 106, 169)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 0",
              fontWeight: 600,
              cursor: "pointer",
              alignSelf: "center"
            }}
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

const menuItems = [
  { key: "student-profile", label: "Child Profile" },
  { key: "assignments", label: "Assignments" },
  { key: "messages", label: "Messages" },
  { key: "books", label: "Books" },
  { key: "cbse-updates", label: "CBSE Updates" },
  { key: "announcements", label: "Announcements" },
  { key: "timetable", label: "Timetable" },
  { key: "resources", label: "Digital Resources" },
  { key: "profile", label: "Profile" },
  { key: "creative-corner", label: "Creative Corner" },
  { key: "discussion-panel", label: "Discussion Panel" },
  { key: "settings", label: "Settings" }
];

export default function ParentDashboardPage() {
  return (
    <DashboardCommon
      SidebarComponent={ParentSidebar}
      menuItems={menuItems}
      userType="Guardian"
      renderContent={({ selectedMenu, ...rest }) =>
        selectedMenu === "announcements"
          ? <AnnouncementPage {...rest} />
          : null
      }
    />
  );
}
