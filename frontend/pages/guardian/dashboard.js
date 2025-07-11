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
    { key: "notifications", label: "Notifications", icon: <FaBell style={{ fontSize: 18 }} /> },
    { key: "settings", label: "Settings", icon: <FaCog style={{ fontSize: 18 }} />, action: () => window.location.href = "/settings" }
  ];
  return (
    <>
      <style>{`
        @keyframes blink-badge {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .blink-badge {
          animation: blink-badge 1s steps(1, end) infinite;
        }
        .parent-sidebar {
          background: #2563eb !important;
          color: #fff !important;
        }
        .parent-sidebar .user-card {
          background: #1d4ed8;
          border-radius: 12px;
          padding: 24px 18px;
          margin: 24px 18px 32px 18px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .parent-sidebar .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .parent-sidebar .user-name {
          font-weight: 700;
          font-size: 18px;
          color: #fff;
        }
        .parent-sidebar .user-role {
          font-size: 13px;
          color: #c7d2fe;
        }
        .parent-sidebar nav {
          margin-top: 16px;
        }
        .parent-sidebar .sidebar-btn {
          background: none;
          color: #fff;
          border: none;
          border-radius: 8px;
          margin: 2px 12px;
          display: flex;
          align-items: center;
          gap: 14px;
          width: calc(100% - 24px);
          text-align: left;
          padding: 12px 20px;
          font-size: 16px;
          font-weight: 600;
          transition: background 0.18s, color 0.18s;
          position: relative;
          cursor: pointer;
        }
        .parent-sidebar .sidebar-btn.selected, .parent-sidebar .sidebar-btn:hover {
          background: #1d4ed8 !important;
          color: #fff !important;
        }
        .parent-sidebar .sidebar-btn .icon {
          color: #c7d2fe !important;
        }
        .parent-sidebar .sidebar-section-label {
          color: #c7d2fe;
          font-size: 12px;
          font-weight: 600;
          margin: 18px 0 8px 24px;
          letter-spacing: 1px;
        }
      `}</style>
      <aside className="parent-sidebar" style={{
        width: 300,
        minHeight: "100vh",
        padding: 0,
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 2000,
        boxShadow: "2px 0 16px rgba(30,60,114,0.07)",
        overflow: "hidden"
      }}>
        <div style={{ height: "calc(100vh - 120px)", overflowY: "auto", paddingBottom: 24, display: "flex", flexDirection: "column" }}>
          <div className="user-card">
            <div className="user-avatar">
              <img
                src={userPhoto || "/default-avatar.png"}
                alt="Profile"
                style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
              />
            </div>
            <div className="user-name">{userName || userEmail?.split('@')[0] || 'Parent'}</div>
            <div className="user-role">Parent</div>
          </div>
          <div className="sidebar-section-label">LEARNING</div>
          <nav>
            {menuItems.map(item => (
              <button
                key={item.key}
                onClick={() => { item.action ? item.action() : onMenuSelect(item.key); }}
                className={`sidebar-btn${selectedMenu === item.key ? ' selected' : ''}`}
              >
                <span className="icon" style={{ display: "flex", alignItems: "center" }}>{item.icon}</span>
                <span style={{ display: "flex", alignItems: "center" }}>{item.label}</span>
                {item.key === "announcements" && renderAnnouncementBadge && renderAnnouncementBadge(newAnnouncementCount)}
              </button>
            ))}
          </nav>
          <div className="sidebar-section-label">HELP & SUPPORT</div>
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
  { key: "notifications", label: "Notifications" },
  { key: "settings", label: "Settings" }
];

// Remove QuizzesCard and its usage from the main dashboard area

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
