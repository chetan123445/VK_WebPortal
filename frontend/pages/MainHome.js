"use client";
import React, { useState, useEffect } from "react";
import { FaBars } from 'react-icons/fa';
import { BASE_API_URL } from "./apiurl";
import ProtectedRoute from "../components/ProtectedRoute.js";
import ProfileMenu from './ProfileMenu';
import { getUserData, getToken } from "../utils/auth.js";

// Hardcoded superadmin email for demo; in real use, get from auth/session
const SUPERADMIN_EMAIL = "chetandudi791@gmail.com";

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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

    // Fetch complete profile data immediately
    fetchProfileData();

    // Fetch admin info for this user to check isSuperAdmin
    if (userEmail) {
      fetch(`${BASE_API_URL}/getadmins`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          const found = (data.admins || []).find(a => a.email === userEmail);
          setIsSuperAdmin(found?.isSuperAdmin === true);
        })
        .catch(() => setIsSuperAdmin(false));
    }
  }, [userEmail]);

  // Fetch admins when modal opens
  useEffect(() => {
    if (showViewAdmins) {
      fetch(`${BASE_API_URL}/getadmins`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      })
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
        setAddStatus("Admin added!");
        setAdminForm({ email: "", isSuperAdmin: false });
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
          requesterEmail: userEmail
        })
      });
      if (res.ok) {
        setRemoveStatus("Admin removed!");
        setRemoveEmail("");
      } else {
        const data = await res.json();
        setRemoveStatus(data.message || "Failed to remove admin");
      }
    } catch {
      setRemoveStatus("Failed to remove admin");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      backgroundColor: "#f9f9f9",
      backgroundImage: `
        linear-gradient(135deg, rgba(0,0,0,0.03) 25%, transparent 25%),
        linear-gradient(225deg, rgba(0,0,0,0.03) 25%, transparent 25%),
        linear-gradient(45deg, rgba(0,0,0,0.03) 25%, transparent 25%),
        linear-gradient(315deg, rgba(0,0,0,0.03) 25%, transparent 25%)
      `,
      backgroundSize: "40px 40px",
      backgroundPosition: "0 0, 0 20px, 20px -20px, -20px 0px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontFamily: "Segoe UI, Arial, sans-serif"
    }}>
      {/* Hamburger menu top left */}
      {isSuperAdmin && (
        <button
          onClick={() => setMenuOpen(true)}
          style={{
            position: 'absolute',
            top: 24,
            left: 32,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            zIndex: 2100
          }}
          aria-label="Open menu"
        >
          <FaBars size={32} color="#fff" />
        </button>
      )}
      {/* Side menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 260,
          height: '100vh',
          background: '#fff',
          color: '#1e3c72',
          boxShadow: '2px 0 16px rgba(0,0,0,0.18)',
          zIndex: 2200,
          display: 'flex',
          flexDirection: 'column',
          padding: '32px 18px 18px 18px',
        }}>
          <button onClick={() => setMenuOpen(false)} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', fontSize: 26, color: '#1e3c72', cursor: 'pointer', marginBottom: 18 }}>&times;</button>
          <button
            onClick={() => { setShowRemoveAdmin(true); setMenuOpen(false); }}
            style={{ background: '#fff', color: '#c0392b', border: '1px solid #c0392b', borderRadius: 6, padding: '10px 0', fontWeight: 600, cursor: 'pointer', marginBottom: 16 }}
          >
            Remove Admin
          </button>
          <button
            onClick={() => { setShowAddAdmin(true); setMenuOpen(false); }}
            style={{ background: '#fff', color: '#1e3c72', border: '1px solid #1e3c72', borderRadius: 6, padding: '10px 0', fontWeight: 600, cursor: 'pointer', marginBottom: 16 }}
          >
            Add Admin
          </button>
          <button
            onClick={() => { setShowViewAdmins(true); setMenuOpen(false); }}
            style={{ background: '#fff', color: '#1e3c72', border: '1px solid #1e3c72', borderRadius: 6, padding: '10px 0', fontWeight: 600, cursor: 'pointer' }}
          >
            View Admins
          </button>
        </div>
      )}
      <ProfileMenu 
        userEmail={userEmail} 
        userData={profileData}
        avatarStyle={{ width: 48, height: 48, borderRadius: '50%' }} 
        onProfileUpdate={fetchProfileData}
      />

      {/* Add Admin Modal */}
      {showAddAdmin && (
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
      {showRemoveAdmin && (
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
