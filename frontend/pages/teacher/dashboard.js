"use client";
import React, { useState, useEffect } from "react";
import { FaClipboardList, FaNewspaper, FaChartBar, FaBookOpen, FaBullhorn, FaCalendarAlt, FaEnvelope, FaLaptop, FaUser } from "react-icons/fa";
import ProfileMenu from '../ProfileMenu'; // If you want to use the same ProfileMenu as admin
import { BASE_API_URL } from '../apiurl.js';
import { getToken } from "../../utils/auth.js";

// Sidebar component for Teacher with feature buttons (like StudentSidebar)
function TeacherSidebar({ userEmail, userPhoto, onMenuSelect }) {
  const menuItems = [
    { key: "test-generator", label: "Test Generator", icon: <FaClipboardList style={{ fontSize: 18 }} /> },
    { key: "cbse-updates", label: "CBSE Updates", icon: <FaNewspaper style={{ fontSize: 18 }} /> },
    { key: "student-performance", label: "Student Performance", icon: <FaChartBar style={{ fontSize: 18 }} /> },
    { key: "book-solutions", label: "Book Solutions", icon: <FaBookOpen style={{ fontSize: 18 }} /> },
    { key: "announcements", label: "Announcements", icon: <FaBullhorn style={{ fontSize: 18 }} /> },
    { key: "timetable", label: "Timetable", icon: <FaCalendarAlt style={{ fontSize: 18 }} /> },
    { key: "messages", label: "Messages", icon: <FaEnvelope style={{ fontSize: 18 }} /> },
    { key: "resources", label: "Digital Resources", icon: <FaLaptop style={{ fontSize: 18 }} /> },
    { key: "profile", label: "Profile", icon: <FaUser style={{ fontSize: 18 }} /> } // Add Profile option at the end
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
          src={userPhoto || "/default-avatar.png"}
          alt="Profile"
          style={{ width: 64, height: 64, borderRadius: "50%", margin: "10px 0", objectFit: "cover" }}
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
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', school: '', class: '', photo: null });
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState('');
  const fileInputRef = React.useRef();

  // Add userPhoto state to track the current photo for sidebar
  const [userPhoto, setUserPhoto] = useState('');

  useEffect(() => {
    setUserEmail(localStorage.getItem("userEmail") || "");
  }, []);

  // Fetch profile when "profile" menu is selected
  useEffect(() => {
    if (selectedMenu === "profile" && userEmail) {
      fetch(`${BASE_API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          // Do NOT set Content-Type here for GET
        }
      })
        .then(res => res.json())
        .then(data => {
          setProfile(data.user);
          setForm({
            name: data.user.name || '',
            phone: data.user.phone || '',
            school: data.user.school || '',
            class: data.user.class || '',
            photo: null
          });
          const photoUrl = data.user.photo && data.user.photo !== "" ? data.user.photo : "/default-avatar.png";
          setPreview(photoUrl);
          setUserPhoto(data.user.photo && data.user.photo !== "" ? data.user.photo : "");
        })
        .catch(() => {
          setProfile(null);
          setUserPhoto('');
        });
    }
  }, [selectedMenu, userEmail]);

  // Show preview when photo changes
  useEffect(() => {
    if (form.photo) {
      const url = URL.createObjectURL(form.photo);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [form.photo]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm({
      name: profile?.name || '',
      phone: profile?.phone || '',
      school: profile?.school || '',
      class: profile?.class || '',
      photo: null
    });
    setPreview(profile?.photo || "/default-avatar.png");
    setStatus('');
  };
  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === "photo" && files && files[0]) {
      setForm(f => ({ ...f, photo: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };
  const handleSave = async () => {
    setStatus('Saving...');
    try {
      let body;
      let headers;
      if (form.photo) {
        body = new FormData();
        body.append('name', form.name);
        body.append('phone', form.phone);
        body.append('school', form.school);
        body.append('class', form.class);
        body.append('photo', form.photo);
        headers = { 'Authorization': `Bearer ${getToken()}` };
      } else {
        body = JSON.stringify({
          name: form.name,
          phone: form.phone,
          school: form.school,
          class: form.class
        });
        headers = {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        };
      }
      const res = await fetch(`${BASE_API_URL}/profile`, {
        method: 'PUT',
        headers,
        body
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setEditMode(false);
        setStatus('Profile updated!');
        setPreview(data.user.photo || "/default-avatar.png");
        setUserPhoto(data.user.photo && data.user.photo !== "" ? data.user.photo : "");
      } else {
        setStatus(data.message || 'Failed to update profile');
      }
    } catch {
      setStatus('Failed to update profile');
    }
  };

  // Main content based on selected menu
  const renderContent = () => {
    if (selectedMenu === "profile") {
      if (!profile) {
        return (
          <div style={{ padding: 32 }}>
            <h2>Profile</h2>
            <p>Loading profile...</p>
          </div>
        );
      }
      return (
        <div style={{
          padding: 32,
          maxWidth: 400,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
        }}>
          <h2 style={{ marginBottom: 24 }}>Profile Details</h2>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <img
                src={preview || "/default-avatar.png"}
                alt="Profile"
                style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", marginBottom: 12 }}
              />
              {editMode && (
                <>
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "50%",
                      width: 28,
                      height: 28,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                    }}
                  >📷</button>
                </>
              )}
            </div>
            {!editMode ? (
              <>
                <div><strong>Name:</strong> {profile.name}</div>
                <div><strong>Email:</strong> {profile.email}</div>
                <div><strong>Phone:</strong> {profile.phone || "-"}</div>
                <div><strong>School:</strong> {profile.school || "-"}</div>
                <div><strong>Class:</strong> {profile.class || "-"}</div>
                <button onClick={handleEdit} style={{ marginTop: 16, padding: "8px 24px", borderRadius: 6, background: "#1e3c72", color: "#fff", border: "none", cursor: "pointer" }}>Edit</button>
              </>
            ) : (
              <>
                <div>
                  <label>Name:</label>
                  <input name="name" value={form.name} onChange={handleChange} style={{ width: "100%" }} />
                </div>
                <div>
                  <label>Phone:</label>
                  <input name="phone" value={form.phone} onChange={handleChange} style={{ width: "100%" }} />
                </div>
                <div>
                  <label>School:</label>
                  <input name="school" value={form.school} onChange={handleChange} style={{ width: "100%" }} />
                </div>
                <div>
                  <label>Class:</label>
                  <input name="class" value={form.class} onChange={handleChange} style={{ width: "100%" }} />
                </div>
                <div style={{ marginTop: 12 }}>
                  <button onClick={handleSave} style={{ marginRight: 8, padding: "8px 24px", borderRadius: 6, background: "#28a745", color: "#fff", border: "none", cursor: "pointer" }}>Save</button>
                  <button onClick={handleCancel} style={{ padding: "8px 24px", borderRadius: 6, background: "#bbb", color: "#222", border: "none", cursor: "pointer" }}>Cancel</button>
                </div>
                {status && <div style={{ marginTop: 10, color: "#1e3c72" }}>{status}</div>}
              </>
            )}
          </div>
        </div>
      );
    }
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
        userPhoto={userPhoto}
        onMenuSelect={setSelectedMenu}
      />
      <main style={{ marginLeft: 260, flex: 1, minHeight: "100vh", background: "#f4f7fa" }}>
        {renderContent()}
      </main>
    </div>
  );
}