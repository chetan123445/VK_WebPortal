import React, { useState, useEffect, useRef, useCallback } from "react";
import ProtectedRoute from '../components/ProtectedRoute';
import { BASE_API_URL } from '../utils/apiurl.js';
import { getUserData, getToken, logout } from "../utils/auth.js";
import { useRouter } from 'next/router';
import { FaBullhorn } from 'react-icons/fa';

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

export default function DashboardCommon({
  SidebarComponent,
  menuItems,
  userType = "User",
  renderContent,
  profileFields = ["name", "phone", "school", "class", "photo"],
  customSidebarProps = {},
  customProfileFetch,
  children
}) {
  const [selectedMenu, setSelectedMenu] = useState(menuItems?.[0]?.key || "profile");
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef();
  const [userPhoto, setUserPhoto] = useState('');
  const [userName, setUserName] = useState("");
  const [newAnnouncementCount, setNewAnnouncementCount] = useState(0);
  const [blink, setBlink] = useState(true);
  const [notifSettings, setNotifSettings] = useState(null);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchOptions = [
    { label: "Mind Map", path: "/mindmaps" },
    { label: "AVLR", path: "/avlrs" },
    { label: "DLRS", path: "/dlrs" },
    { label: "Creative Corner", path: "/creative-corner" },
    { label: "PYPs", path: "/pyps" },
    { label: "PYQs", path: "/pyqs" },
    { label: "SQPs", path: "/sqps" }
  ];
  const filteredOptions = showDropdown
    ? searchOptions.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];
  const handleSearchSelect = (option) => {
    setSearchTerm("");
    setShowDropdown(false);
    router.push(option.path);
  };

  // Fetch profile logic (can be overridden)
  const fetchProfile = useCallback(() => {
    if (typeof customProfileFetch === "function") return customProfileFetch();
    const u = getUserData();
    if (u && u.email) {
      setUserEmail(u.email);
      fetch(`${BASE_API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setProfile(data.user);
          setUserName(data.user.name || "");
          const newForm = {};
          profileFields.forEach(f => newForm[f] = data.user[f] || (f === 'photo' ? null : ''));
          setForm(newForm);
          const photoUrl = data.user.photo && data.user.photo !== "" ? data.user.photo : "/default-avatar.png";
          setPreview(photoUrl);
          setUserPhoto(data.user.photo && data.user.photo !== "" ? data.user.photo : "");
        })
        .catch(() => {
          setProfile(null);
          setUserName("");
          setUserPhoto('');
        });
    }
  }, []); // Only create once

  useEffect(() => {
    fetchProfile();
  }, []); // Only run once on mount

  useEffect(() => {
    if (form.photo && typeof form.photo === "object" && form.photo instanceof File) {
      const url = URL.createObjectURL(form.photo);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof form.photo === "string") {
      setPreview(form.photo);
    }
  }, [form.photo]);

  useEffect(() => {
    if (!notifSettings || !notifSettings.announcements) {
      setNewAnnouncementCount(0);
      return;
    }
    let registeredAs = userType;
    if (userType === 'Guardian') registeredAs = 'Parent';
    fetch(`${BASE_API_URL}/getannouncements?registeredAs=${registeredAs}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.announcements) {
          const count = data.announcements.filter(a => a.isNew).length;
          setNewAnnouncementCount(count);
        }
      });
  }, [userType, notifSettings]);

  // Blinking effect for announcement count
  useEffect(() => {
    if (newAnnouncementCount > 0) {
      const interval = setInterval(() => {
        setBlink(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setBlink(true);
    }
  }, [newAnnouncementCount]);

  // Fetch notification settings
  useEffect(() => {
    fetch(`${BASE_API_URL}/notification-settings`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => setNotifSettings(data.notificationSettings || { announcements: true }))
      .catch(() => setNotifSettings({ announcements: true }));
  }, []);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    if (profile) {
      const newForm = {};
      profileFields.forEach(f => newForm[f] = profile[f] || (f === 'photo' ? null : ''));
      setForm(newForm);
      setPreview(profile.photo || "/default-avatar.png");
    }
    setStatus('');
  };
  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === "photo" && files && files[0]) {
      setForm(f => ({ ...f, photo: files[0] }));
    } else if (name === "phone") {
      setForm(f => ({ ...f, phone: value.replace(/\D/g, '').slice(0, 10) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Render badge function to be used by all sidebars
  const renderAnnouncementBadge = (count) => (
    notifSettings && notifSettings.announcements && count > 0 ? (
      <span className="blink-badge" style={{
        marginLeft: 8,
        background: "#1e3c72",
        color: "#fff",
        borderRadius: "50%",
        padding: "2px 8px",
        fontSize: 13,
        fontWeight: 700,
        minWidth: 22,
        textAlign: "center",
        display: "inline-block"
      }}>{count}</span>
    ) : null
  );

  // Sidebar props
  const sidebarProps = {
    userEmail,
    userPhoto,
    userName,
    onMenuSelect: setSelectedMenu,
    selectedMenu,
    profile,
    newAnnouncementCount,
    renderAnnouncementBadge,
    notifSettings,
    ...customSidebarProps
  };

  return (
    <ProtectedRoute>
      <style>{blinkStyle}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fa", flexDirection: "column" }}>
        <div style={{ display: "flex", flex: 1 }}>
          {SidebarComponent && <SidebarComponent {...sidebarProps} />}
          <main style={{ marginLeft: 260, flex: 1, minHeight: "100vh", background: "#f4f7fa", transition: "margin-left 0.25s cubic-bezier(.4,0,.2,1)" }}>
            {/* Custom header for Student, Teacher, Admin only */}
            {userType !== 'Guardian' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 32px 0 32px', background: '#f7f8fa' }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>Dashboard</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', height: 44, minWidth: 320, maxWidth: 340, marginRight: 0, position: 'relative' }}>
                    {/* Removed search icon */}
                    <input
                      type="text"
                      placeholder="Search"
                      style={{ paddingLeft: 16, paddingRight: 16, border: 'none', outline: 'none', fontSize: 16, background: 'transparent', height: 42, width: 220 }}
                      value={searchTerm}
                      onChange={e => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    />
                    {showDropdown && filteredOptions.length > 0 && (
                      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 2px 8px #e0e7ef', zIndex: 10 }}>
                        {filteredOptions.map(opt => (
                          <div
                            key={opt.label}
                            style={{ padding: '10px 16px', cursor: 'pointer', color: '#1e293b', fontWeight: 500 }}
                            onMouseDown={() => handleSearchSelect(opt)}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => router.push('/announcement')}>
                    <FaBullhorn style={{ color: '#64748b', fontSize: 26 }} />
                    {notifSettings && notifSettings.announcements && newAnnouncementCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        background: '#2563eb',
                        color: '#fff',
                        borderRadius: '50%',
                        padding: '1px 5px',
                        fontSize: 11,
                        fontWeight: 700,
                        minWidth: 16,
                        textAlign: 'center',
                        display: 'inline-block',
                        zIndex: 2,
                        lineHeight: '16px',
                        height: 16
                      }}>{newAnnouncementCount}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Main content */}
            {renderContent ? renderContent({
              selectedMenu,
              setSelectedMenu,
              profile,
              editMode,
              setEditMode,
              form,
              setForm,
              status,
              setStatus,
              preview,
              setPreview,
              fileInputRef,
              userPhoto,
              userName,
              handleEdit,
              handleCancel,
              handleChange,
              fetchProfile,
              newAnnouncementCount,
              setNewAnnouncementCount
            }) : (
              <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
                {/* Welcome Card and Recent Results as before */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
                  {/* Welcome Card */}
                  <div style={{ background: '#e0e7ff', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 180 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Hello{userName ? ` ${userName}` : ''},</h2>
                        <p style={{ color: '#334155', marginBottom: 18, fontSize: 16 }}>
                          You have learned 80% of your course. Keep it up and improve your grades to get scholarship
                        </p>
                        <button style={{ background: '#3B5BDB', color: '#fff', borderRadius: 8, padding: '8px 20px', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer' }}>View Result</button>
                      </div>
                      <div style={{ width: 80, height: 80, background: '#c7d2fe', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: 14 }}>Illustration</span>
                      </div>
                    </div>
                  </div>
                  {/* Recent Results */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px #e0e7ef' }}>
                    <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: 18, marginBottom: 18 }}>Recent Results</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {[
                        { name: 'English - Quiz 01', score: 37, color: '#ef4444' },
                        { name: 'English - Quiz 02', score: 87, color: '#3b82f6' },
                        { name: 'Science - Quiz 02', score: 90, color: '#334155' },
                        { name: 'English - Quiz 04', score: 57, color: '#ef4444' },
                        { name: 'English - Quiz 06', score: 100, color: '#3b82f6' }
                      ].map((result, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: result.color }}></div>
                            <div style={{ fontSize: 15, color: '#334155' }}>{result.name}</div>
                          </div>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 15 }}>{result.score}%</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 15, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, background: '#94a3b8', borderRadius: '50%' }}></div>
                        <span>Wants to take a Leave?</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: 15 }}>
                        <div style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }}></div>
                        <span>Wants to complain against someone?</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 