"use client";
import React, { useState } from "react";
import StudentSidebar from "../../components/StudentSidebar";
import useAuthRedirect from "../../utils/useAuthRedirect";

export default function StudentDashboard() {
  useAuthRedirect();
  const [selectedMenu, setSelectedMenu] = useState("books");
  const userEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : "";

  // Placeholder for profile update callback
  const handleProfileUpdate = () => {};

  // Main content based on selected menu
  const renderContent = () => {
    if (selectedMenu.startsWith("class")) {
      return (
        <div style={{ padding: 32 }}>
          <h2>Books for {selectedMenu.replace("class", "Class ")}</h2>
          <p>Book list will appear here.</p>
        </div>
      );
    }
    if (selectedMenu === "books") {
      return (
        <div style={{ padding: 32 }}>
          <h2>Books</h2>
          <p>Select a class to view books.</p>
        </div>
      );
    }
    if (selectedMenu === "resources") {
      return (
        <div style={{ padding: 32 }}>
          <h2>Digital Resources</h2>
          <p>Digital resources will be listed here.</p>
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
        userData={{}}
        onProfileUpdate={handleProfileUpdate}
        onMenuSelect={setSelectedMenu}
      />
      <main style={{ marginLeft: 260, flex: 1, minHeight: "100vh", background: "#f4f7fa" }}>
        {renderContent()}
      </main>
    </div>
  );
}
