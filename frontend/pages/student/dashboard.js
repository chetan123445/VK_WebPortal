"use client";
import React, { useEffect, useState } from "react";
import { FaClipboardList, FaBookOpen, FaChartBar, FaBullhorn, FaCalendarAlt, FaEnvelope, FaLaptop, FaUser, FaTrashAlt, FaFilePdf, FaPalette, FaFileVideo, FaBell, FaRegListAlt, FaCog } from "react-icons/fa";
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

function StudentSidebar({ userEmail, userPhoto, userName, onMenuSelect, selectedMenu, profile, newAnnouncementCount, renderAnnouncementBadge }) {
  const menuItems = [
    { key: "cbse-updates", label: "CBSE Updates", icon: <FaRegListAlt style={{ fontSize: 18 }} />, action: () => window.location.href = "/cbse-updates" },
    { key: "announcements", label: "Announcements", icon: <FaBullhorn style={{ fontSize: 18 }} />, action: () => window.location.href = "/announcement" },
    { key: "quiz", label: "Quiz", icon: <FaClipboardList style={{ fontSize: 18 }} />, action: () => window.location.href = "/quiz" },
    { key: "sample-papers", label: "Sample Papers", icon: <FaBookOpen style={{ fontSize: 18 }} /> },
    { key: "avlrs", label: "AVLRs", icon: <FaLaptop style={{ fontSize: 18 }} />, action: () => window.location.href = "/avlrs" },
    { key: "dlrs", label: "DLRs", icon: <FaFilePdf style={{ fontSize: 18 }} />, action: () => window.location.href = "/dlrs" },
    { key: "mind-maps", label: "Mind Maps", icon: <FaChartBar style={{ fontSize: 18 }} />, action: () => window.location.href = "/mindmaps" },
    { key: "sqps", label: "SQPs", icon: <FaFilePdf style={{ fontSize: 18 }} />, action: () => window.location.href = "/sqps" },
    { key: "pyqs", label: "PYQs", icon: <FaFilePdf style={{ fontSize: 18 }} />, action: () => window.location.href = "/pyqs" },
    { key: "pyps", label: "PYPs", icon: <FaFilePdf style={{ fontSize: 18 }} />, action: () => window.location.href = "/pyps" },
    { key: "discussion-panel", label: "Discussion Panel", icon: <FaUser style={{ fontSize: 18 }} /> },
    { key: "creative-corner", label: "Creative Corner", icon: <FaPalette style={{ fontSize: 18, color: '#ff0080' }} />, action: () => window.location.href = "/creative-corner" },
    { key: "books", label: "Books", icon: <FaBookOpen style={{ fontSize: 18 }} /> },
    { key: "performance", label: "Performance", icon: <FaChartBar style={{ fontSize: 18 }} /> },
    { key: "profile", label: "Profile", icon: <FaUser style={{ fontSize: 18 }} />, action: () => window.location.href = "/student/profile" },
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
        .student-sidebar {
          background: #2563eb !important;
          color: #fff !important;
        }
        .student-sidebar .user-card {
          background: #1d4ed8;
          border-radius: 12px;
          padding: 24px 18px;
          margin: 24px 18px 32px 18px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .student-sidebar .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .student-sidebar .user-name {
          font-weight: 700;
          font-size: 18px;
          color: #fff;
        }
        .student-sidebar .user-role {
          font-size: 13px;
          color: #c7d2fe;
        }
        .student-sidebar nav {
          margin-top: 16px;
        }
        .student-sidebar .sidebar-btn {
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
        .student-sidebar .sidebar-btn.selected, .student-sidebar .sidebar-btn:hover {
          background: #1d4ed8 !important;
          color: #fff !important;
        }
        .student-sidebar .sidebar-btn .icon {
          color: #c7d2fe !important;
        }
        .student-sidebar .sidebar-section-label {
          color: #c7d2fe;
          font-size: 12px;
          font-weight: 600;
          margin: 18px 0 8px 24px;
          letter-spacing: 1px;
        }
      `}</style>
      <aside className="student-sidebar" style={{
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
            <div className="user-name">{userName || userEmail?.split('@')[0] || 'Student'}</div>
            <div className="user-role">Student</div>
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
  { key: "cbse-updates", label: "CBSE Updates" },
  { key: "announcements", label: "Announcements" },
  { key: "quizzes", label: "Quizzes" },
  { key: "sample-papers", label: "Sample Papers" },
  { key: "avlrs", label: "AVLRs" },
  { key: "dlrs", label: "DLRs" },
  { key: "mind-maps", label: "Mind Maps" },
  { key: "discussion-panel", label: "Discussion Panel" },
  { key: "creative-corner", label: "Creative Corner" },
  { key: "books", label: "Books" },
  { key: "performance", label: "Performance" },
  { key: "profile", label: "Profile" },
  { key: "notifications", label: "Notifications" },
  { key: "settings", label: "Settings" }
];

// Quizzes Card Component (mock data for now)
function QuizzesCard() {
  const quizzes = [
    { id: 1, title: "English - Quiz 01", status: "Completed", score: 37 },
    { id: 2, title: "English - Quiz 02", status: "Completed", score: 87 },
    { id: 3, title: "Science - Quiz 02", status: "Completed", score: 90 },
    { id: 4, title: "English - Quiz 04", status: "Completed", score: 57 },
    { id: 5, title: "English - Quiz 06", status: "Completed", score: 100 },
  ];
  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #e0e7ef', padding: 32, marginBottom: 32 }}>
      <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Quizzes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {quizzes.map(quiz => (
          <div key={quiz.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{quiz.title}</div>
              <div style={{ color: '#888', fontSize: 14 }}>{quiz.status}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontWeight: 700, color: '#3B5BDB', fontSize: 18 }}>{quiz.score}%</div>
              <button style={{ background: '#3B5BDB', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, cursor: 'pointer' }}>View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <DashboardCommon
      SidebarComponent={StudentSidebar}
      menuItems={menuItems}
      userType="Student"
      renderContent={({ selectedMenu, ...rest }) =>
        selectedMenu === "announcements"
          ? <AnnouncementPage {...rest} />
          : null
      }
    />
  );
}

// const Dashboard = () => {
//   return <div className="bg-blue-200">Dashboard</div>
// }

// export default Dashboard


