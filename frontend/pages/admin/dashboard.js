"use client";
import React, { useState, useEffect } from "react";
import { FaUsers, FaUserTie, FaBook, FaRegListAlt, FaCog, FaBullhorn, FaChartBar, FaUserShield, FaBars } from "react-icons/fa";
import ProtectedRoute from '../../components/ProtectedRoute';

import ProfileMenu from '../ProfileMenu';
import { getUserData, getToken } from "../../utils/auth.js";
import { BASE_API_URL } from '../apiurl.js';


function MainHomeContent() {
  // Get logged-in user data from JWT token
  const [userData, setUserData] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showViewAdmins, setShowViewAdmins] = useState(false);
  const [showRemoveAdmin, setShowRemoveAdmin] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [adminForm, setAdminForm] = useState({ email: "", isSuperAdmin: false });
  const [addStatus, setAddStatus] = useState("");
  const [removeEmail, setRemoveEmail] = useState("");
  const [removeStatus, setRemoveStatus] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("manage-users");

  // Fetch complete profile data
  const fetchProfileData = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfileData(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    }
  };

  useEffect(() => {
    // Get user data from JWT token
    const user = getUserData();
    if (user) {
      setUserData(user);
      setUserEmail(user.email);
    } else {
      // Fallback to localStorage for backward compatibility
      const email = localStorage.getItem("userEmail") || "";
      setUserEmail(email);
    }

    // Check if user is superadmin from localStorage
    const isSuper = typeof window !== "undefined" ? localStorage.getItem("isSuperAdmin") === "true" : false;
    setIsSuperAdmin(isSuper);

    // Fetch complete profile data immediately
    fetchProfileData();
  }, []);

  // Fetch admins when modal opens
  useEffect(() => {
    if (showViewAdmins) {
      fetch("http://localhost:8000/api/getadmins")
        .then(res => res.json())
        .then(data => setAdmins(data.admins || []))
        .catch(() => setAdmins([]));
    }
  }, [showViewAdmins]);

  // Add admin handler
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAddStatus("Adding...");
    try {
      const res = await fetch(`${BASE_API_URL}/addadmins`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          email: adminForm.email,
          isSuperAdmin: adminForm.isSuperAdmin,
          requesterEmail: userEmail
        })
      });
      if (res.ok) {
        setAddStatus("Admin added! Credentials sent to email.");
        setAdminForm({ email: "", isSuperAdmin: false });
        setTimeout(() => {
          setShowAddAdmin(false);
          setAddStatus("");
        }, 700); // Close modal after short delay
      } else {
        const data = await res.json();
        setAddStatus(data.message || "Failed to add admin");
      }
    } catch {
      setAddStatus("Failed to add admin");
    }
  };

  // Remove admin handler
  const handleRemoveAdmin = async (e) => {
    e.preventDefault();
    setRemoveStatus("Removing...");
    try {
      const res = await fetch(`${BASE_API_URL}/removeadmin`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          email: removeEmail,
          isSuperAdmin: isSuperAdmin, // Pass isSuperAdmin like in add admin
          requesterEmail: userEmail
        })
      });
      if (res.ok) {
        setRemoveStatus("Admin removed!");
        setRemoveEmail("");
        setTimeout(() => {
          setShowRemoveAdmin(false);
          setRemoveStatus("");
        }, 700); // Close modal after short delay
      } else {
        const data = await res.json();
        setRemoveStatus(data.message || "Failed to remove admin");
      }
    } catch {
      setRemoveStatus("Failed to remove admin");
    }
  };

  // Main content based on selected menu (placeholder for now)
  const renderContent = () => {
    return (
      <div style={{ padding: 32 }}>
        <h2>{{
            "manage-users": "Manage Users",
            "manage-teachers": "Manage Teachers",
            "manage-books": "Manage Books",
            "records": "Records",
            "announcements": "Announcements",
            "reports": "Reports",
            "settings": "Settings",
            "profile": "Profile"
          }[selectedMenu] || "Welcome"}</h2>
        <p>Feature coming soon.</p>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fa" }}>
      {/* Sidebar component for Admin with feature buttons */}
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
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6, alignSelf: "flex-start" }}>Admin Panel</div>
          <img
            src="/default-avatar.png"
            alt="Profile"
            style={{ width: 64, height: 64, borderRadius: "50%", margin: "10px 0" }}
          />
          <div style={{ fontSize: 13, color: "#888" }}>{userEmail}</div>
        </div>
        <nav>
          {/* Add/Remove Admin, Manage Users/Teachers only for superadmin */}
          {isSuperAdmin && (
            <>
              <button
                onClick={() => setShowAddAdmin(true)}
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
                <FaUserShield style={{ fontSize: 18 }} />
                Add Admin
              </button>
              <button
                onClick={() => setShowRemoveAdmin(true)}
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
                  color: "#c0392b",
                  cursor: "pointer",
                  fontWeight: 700
                }}
              >
                <FaUserShield style={{ fontSize: 18 }} />
                Remove Admin
              </button>
              <button
                onClick={() => setSelectedMenu("manage-users")}
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
                <FaUsers style={{ fontSize: 18 }} />
                Manage Users
              </button>
              <button
                onClick={() => setSelectedMenu("manage-teachers")}
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
                <FaUserTie style={{ fontSize: 18 }} />
                Manage Teachers
              </button>
            </>
          )}
          {/* The following options are for all admins */}
          <button
            onClick={() => setShowViewAdmins(true)}
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
            <FaUsers style={{ fontSize: 18 }} />
            View Admins
          </button>
          <button
            onClick={() => setSelectedMenu("manage-books")}
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
            <FaBook style={{ fontSize: 18 }} />
            Manage Books
          </button>
          <button
            onClick={() => setSelectedMenu("records")}
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
            <FaRegListAlt style={{ fontSize: 18 }} />
            Records
          </button>
          <button
            onClick={() => setSelectedMenu("announcements")}
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
            <FaBullhorn style={{ fontSize: 18 }} />
            Announcements
          </button>
          <button
            onClick={() => setSelectedMenu("reports")}
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
            <FaChartBar style={{ fontSize: 18 }} />
            Reports
          </button>
          <button
            onClick={() => setSelectedMenu("settings")}
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
            <FaCog style={{ fontSize: 18 }} />
            Settings
          </button>
        </nav>
      </aside>
      <main style={{ marginLeft: 260, flex: 1, minHeight: "100vh", background: "#f4f7fa" }}>
        {/* Remove the popout menu, keep only sidebar options */}
        <ProfileMenu 
          userEmail={userEmail} 
          userData={profileData}
          avatarStyle={{ width: 48, height: 48, borderRadius: '50%' }} 
          onProfileUpdate={fetchProfileData}
        />

        {/* Add Admin Modal */}
        {showAddAdmin && isSuperAdmin && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
          }}>
            <div style={{
              background: "#fff", color: "#222", borderRadius: 12, padding: 32, minWidth: 320, boxShadow: "0 4px 24px rgba(0,0,0,0.18)"
            }}>
              <h2 style={{ marginBottom: 18 }}>Add Admin</h2>
              <form onSubmit={handleAddAdmin}>
                <div style={{ marginBottom: 12 }}>
                  <label>Email:</label><br />
                  <input
                    type="email"
                    required
                    value={adminForm.email}
                    onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))}
                    style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #bbb" }}
                  />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={adminForm.isSuperAdmin}
                      onChange={e => setAdminForm(f => ({ ...f, isSuperAdmin: e.target.checked }))}
                    />{" "}
                    Is Superadmin
                  </label>
                </div>
                <button type="submit" style={{
                  background: "#1e3c72", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", fontWeight: 600, cursor: "pointer"
                }}>
                  Add
                </button>
                <button type="button" onClick={() => { setShowAddAdmin(false); setAddStatus(""); }} style={{
                  marginLeft: 12, background: "#bbb", color: "#222", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, cursor: "pointer"
                }}>
                  Cancel
                </button>
                <div style={{ marginTop: 10, color: "#1e3c72", fontWeight: 500 }}>{addStatus}</div>
              </form>
            </div>
          </div>
        )}

        {/* Remove Admin Modal */}
        {showRemoveAdmin && isSuperAdmin && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
          }}>
            <div style={{
              background: "#fff", color: "#222", borderRadius: 12, padding: 32, minWidth: 320, boxShadow: "0 4px 24px rgba(0,0,0,0.18)"
            }}>
              <h2 style={{ marginBottom: 18, color: "#c0392b" }}>Remove Admin</h2>
              <form onSubmit={handleRemoveAdmin}>
                <div style={{ marginBottom: 12 }}>
                  <label>Email:</label><br />
                  <input
                    type="email"
                    required
                    value={removeEmail}
                    onChange={e => setRemoveEmail(e.target.value)}
                    style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #bbb" }}
                  />
                </div>
                <button type="submit" style={{
                  background: "#c0392b", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", fontWeight: 600, cursor: "pointer"
                }}>
                  Remove
                </button>
                <button type="button" onClick={() => { setShowRemoveAdmin(false); setRemoveStatus(""); }} style={{
                  marginLeft: 12, background: "#bbb", color: "#222", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, cursor: "pointer"
                }}>
                  Cancel
                </button>
                <div style={{ marginTop: 10, color: "#c0392b", fontWeight: 500 }}>{removeStatus}</div>
              </form>
            </div>
          </div>
        )}

        {/* View Admins Modal */}
        {showViewAdmins && (
          <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
          }}>
            <div style={{
              background: "#fff", color: "#222", borderRadius: 12, padding: 32, minWidth: 320, boxShadow: "0 4px 24px rgba(0,0,0,0.18)"
            }}>
              <h2 style={{ marginBottom: 18 }}>Current Admins</h2>
              {/* Show superadmins first, then admins, with emails listed below each */}
              <div>
                <div style={{ fontWeight: 700, marginBottom: 8, color: "#ff0080" }}>Superadmins</div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 8 }}>
                  {admins.filter(a => a.isSuperAdmin).map(a => (
                    <li key={a._id} style={{ marginBottom: 2 }}>
                      {a.email}
                    </li>
                  ))}
                </ul>
                <div style={{ fontWeight: 700, margin: "18px 0 8px 0", color: "#1e3c72" }}>Admins</div>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {admins.filter(a => !a.isSuperAdmin).map(a => (
                    <li key={a._id} style={{ marginBottom: 2 }}>
                      {a.email}
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => setShowViewAdmins(false)} style={{
                marginTop: 18, background: "#bbb", color: "#222", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, cursor: "pointer"
              }}>
                Close
              </button>
            </div>
          </div>
        )}

        <div style={{
          background: "rgba(255,255,255,0.96)",
          borderRadius: 20,
          padding: "40px 32px",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          textAlign: "center",
          maxWidth: 400,
          width: "95%"
        }}>
          <h1 style={{
            fontWeight: 700,
            fontSize: "2.5rem",
            marginBottom: 16,
            letterSpacing: 1,
            color: "#1e3c72"
          }}>
            VK Publications Admin Panel
          </h1>
          <p style={{
            fontSize: "1.1rem",
            marginBottom: 32,
            color: "#444"
          }}>
            Manage admins and superadmins here.
          </p>
        </div>
        <div style={{
          marginTop: 40,
          fontSize: "0.95rem",
          color: "#1e3c72",
          letterSpacing: 0.5
        }}>
          © {new Date().getFullYear()} VK Publications. All rights reserved.
        </div>
      </main>
    </div>
  );
}

export default function MainHome() {
  return (
    <ProtectedRoute>
      <MainHomeContent />
    </ProtectedRoute>
  );
}