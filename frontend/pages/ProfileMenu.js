// This file has been moved to student/ProfileMenu.js. Please update your imports.

import React, { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { useRouter } from 'next/navigation';
import { BASE_API_URL } from './apiurl';
import { getToken, logout } from '../utils/auth';

const DEFAULT_AVATAR = '/default-avatar.png'; // Correct path for default avatar in uploads folder
// Place a default avatar in public if needed

export default function ProfileMenu({ userEmail, userData, avatarStyle, onProfileUpdate, forceOpen }) {
  const [open, setOpen] = useState(!!forceOpen);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', school: '', class: '', photo: null });
  const [preview, setPreview] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef();
  const router = useRouter();

  // Fetch profile on mount and when userEmail changes
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${BASE_API_URL}/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setProfile(data.user);
          setForm({
            name: data.user.name || '',
            phone: data.user.phone || '',
            school: data.user.school || '',
            class: data.user.class || '',
            photo: null
          });
          setPreview(data.user.photo ? data.user.photo : DEFAULT_AVATAR);
        } else {
          setProfile(null);
          setForm({ name: '', phone: '', school: '', class: '', photo: null });
          setPreview(DEFAULT_AVATAR);
        }
      } catch {
        setProfile(null);
        setForm({ name: '', phone: '', school: '', class: '', photo: null });
        setPreview(DEFAULT_AVATAR);
      }
      setIsLoading(false);
    };
    if (userEmail && getToken()) fetchProfile();
  }, [userEmail]);

  // When modal opens, update form and preview from latest profile
  useEffect(() => {
    if (open && profile) {
      setForm({
        name: profile.name || '',
        phone: profile.phone || '',
        school: profile.school || '',
        class: profile.class || '',
        photo: null
      });
      setPreview(profile.photo ? profile.photo : DEFAULT_AVATAR);
    }
  }, [open, profile]);

  // Handle photo preview
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
      name: profile?.name || userData?.name || '',
      phone: profile?.phone || userData?.phone || '',
      school: profile?.school || userData?.school || '',
      class: profile?.class || userData?.class || '',
      photo: null
    });
    setPreview(profile?.photo || userData?.photo || DEFAULT_AVATAR);
    setStatus('');
  };

  const handleChange = async e => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files && files[0]) {
      const file = files[0];
      // Only allow jpg/jpeg/png
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setStatus('Only JPG and PNG files are allowed');
        return;
      }
      // Compress image
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 400,
          useWebWorker: true
        });
        setForm(f => ({ ...f, photo: compressed }));
      } catch (err) {
        setStatus('Failed to compress image');
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleDeletePhoto = async () => {
    setStatus('Deleting photo...');
    try {
      const res = await fetch(`${BASE_API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deletePhoto: true })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setPreview(DEFAULT_AVATAR);
        setStatus('Photo deleted successfully');
        setTimeout(() => setStatus(''), 2000);
        if (onProfileUpdate) onProfileUpdate();
      } else {
        setStatus(data.message || 'Failed to delete photo');
      }
    } catch {
      setStatus('Failed to delete photo');
    }
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.class.trim()) return 'Class is required';
    if (form.phone && !/^\d{10}$/.test(form.phone)) return 'Phone number must be 10 digits';
    return '';
  };

  // Cross button handler: redirect back
  const handleClose = () => {
    setOpen(false);
    router.back();
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setStatus(validationError);
      return;
    }
    setSaving(true);
    setStatus('Saving...');
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('phone', form.phone);
    formData.append('school', form.school);
    formData.append('class', form.class);
    if (form.photo) formData.append('photo', form.photo);
    try {
      const res = await fetch(`${BASE_API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setEditMode(false);
        setStatus('Profile updated successfully!');
        setTimeout(() => setStatus(''), 2000);
        if (onProfileUpdate) onProfileUpdate();
      } else {
        // Try to show a specific error message
        if (data.errors && Array.isArray(data.errors)) {
          setStatus(data.errors.map(e => e.msg || e.message || JSON.stringify(e)).join(', '));
        } else if (data.message) {
          setStatus(data.message);
        } else {
          setStatus('Failed to update profile: Unknown error');
        }
      }
    } catch (err) {
      setStatus('Failed to update profile: ' + (err?.message || 'Network/server error'));
    }
    setSaving(false);
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // If forceOpen is true, always show the profile modal as a page
  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  // Avatar button (top-right)
  if (forceOpen) {
    // Render only the modal content, not the floating button
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.03)'
      }}>
        {/* Modal content, always open */}
        <div style={{
          background: '#fff',
          color: '#222',
          borderRadius: 20,
          padding: 0,
          width: '90%',
          maxWidth: 500,
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: '#fff',
            padding: '24px 32px',
            textAlign: 'center',
            position: 'relative'
          }}>
            <button 
              onClick={handleClose}
              style={{ 
                position: 'absolute', 
                top: 16, 
                right: 20, 
                background: 'rgba(255,255,255,0.2)', 
                border: 'none', 
                borderRadius: '50%',
                width: 32,
                height: 32,
                fontSize: 18, 
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={preview || userData?.photo || DEFAULT_AVATAR}
                  alt="Profile"
                  style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    border: '3px solid rgba(255,255,255,0.3)',
                    backgroundColor: '#f0f0f0'
                  }}
                />
                {editMode && (
                  <button
                    onClick={triggerFileInput}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      background: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    📷
                  </button>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>
                  {profile?.name || userData?.name || 'User Profile'}
                </div>
                <div style={{ opacity: 0.9, fontSize: 14 }}>
                  {profile?.email || userData?.email || userEmail}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '32px', maxHeight: '60vh', overflowY: 'auto' }}>
            {(isLoading || saving) ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div className="spinner" style={{ fontSize: 18, color: '#666' }}>Loading...</div>
                <div style={{ margin: '24px auto', width: 120, height: 20, background: '#e1e5e9', borderRadius: 8 }} />
                <div style={{ margin: '12px auto', width: 80, height: 80, background: '#e1e5e9', borderRadius: '50%' }} />
                <div style={{ margin: '12px auto', width: 100, height: 16, background: '#e1e5e9', borderRadius: 8 }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />

                  {/* Name Field */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 8, 
                      fontWeight: 600, 
                      color: '#333',
                      fontSize: 14
                    }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !editMode) {
                          e.preventDefault();
                        }
                      }}
                      disabled={!editMode}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: editMode ? '2px solid #e1e5e9' : '2px solid #f0f0f0',
                        fontSize: 16,
                        backgroundColor: editMode ? '#fff' : '#f8f9fa',
                        transition: 'all 0.2s ease'
                      }}
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email Field (Read-only) */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 8, 
                      fontWeight: 600, 
                      color: '#333',
                      fontSize: 14
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile?.email || userData?.email || userEmail}
                      disabled
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: '2px solid #f0f0f0',
                        fontSize: 16,
                        backgroundColor: '#f8f9fa',
                        color: '#666'
                      }}
                    />
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 8, 
                      fontWeight: 600, 
                      color: '#333',
                      fontSize: 14
                    }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !editMode) {
                          e.preventDefault();
                        }
                      }}
                      disabled={!editMode}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: editMode ? '2px solid #e1e5e9' : '2px solid #f0f0f0',
                        fontSize: 16,
                        backgroundColor: editMode ? '#fff' : '#f8f9fa',
                        transition: 'all 0.2s ease'
                      }}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* School Field */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 8, 
                      fontWeight: 600, 
                      color: '#333',
                      fontSize: 14
                    }}>
                      School/Institution
                    </label>
                    <input
                      type="text"
                      name="school"
                      value={form.school}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !editMode) {
                          e.preventDefault();
                        }
                      }}
                      disabled={!editMode}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: editMode ? '2px solid #e1e5e9' : '2px solid #f0f0f0',
                        fontSize: 16,
                        backgroundColor: editMode ? '#fff' : '#f8f9fa',
                        transition: 'all 0.2s ease'
                      }}
                      placeholder="Enter your school name"
                    />
                  </div>

                  {/* Class Field */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 8, 
                      fontWeight: 600, 
                      color: '#333',
                      fontSize: 14
                    }}>
                      Class/Year *
                    </label>
                    <input
                      type="text"
                      name="class"
                      value={form.class}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !editMode) {
                          e.preventDefault();
                        }
                      }}
                      disabled={!editMode}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: editMode ? '2px solid #e1e5e9' : '2px solid #f0f0f0',
                        fontSize: 16,
                        backgroundColor: editMode ? '#fff' : '#f8f9fa',
                        transition: 'all 0.2s ease'
                      }}
                      placeholder="Enter your class or year"
                    />
                  </div>
                </div>

                {/* Status Message */}
                {status && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    backgroundColor: status.includes('success') ? '#d4edda' : '#f8d7da',
                    color: status.includes('success') ? '#155724' : '#721c24',
                    fontSize: 14,
                    textAlign: 'center'
                  }}>
                    {status}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                  {!editMode ? (
                    <>
                      <button
                        type="button"
                        onClick={handleEdit}
                        style={{
                          flex: 1,
                          padding: '12px 24px',
                          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 16,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                      >
                        Edit Profile
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                          padding: '12px 24px',
                          background: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 16,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#c82333'}
                        onMouseLeave={(e) => e.target.style.background = '#dc3545'}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                          flex: 1,
                          padding: '12px 24px',
                          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 16,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease',
                          opacity: saving ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        style={{
                          padding: '12px 24px',
                          background: '#6c757d',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 16,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                          opacity: saving ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#5a6268'}
                        onMouseLeave={(e) => e.target.style.background = '#6c757d'}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>

                {/* Photo Actions (only in edit mode) */}
                {editMode && (profile?.photo || userData?.photo) && (
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <button
                      type="button"
                      onClick={handleDeletePhoto}
                      style={{
                        padding: '8px 16px',
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#c82333'}
                      onMouseLeave={(e) => e.target.style.background = '#dc3545'}
                    >
                      Remove Photo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Avatar button (top-right)
  return (
    <>
      <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 2000 }}>
        <button
          onClick={() => setOpen(true)}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            padding: 0,
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <img
            src={profile?.photo || DEFAULT_AVATAR}
            alt="User Avatar"
            style={avatarStyle || { 
              width: 48, 
              height: 48, 
              borderRadius: '50%', 
              border: '2px solid #fff', 
              objectFit: 'cover',
              backgroundColor: '#f0f0f0'
            }}
          />
        </button>
      </div>

      {open && (
        <div style={{
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh',
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 3000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff', 
            color: '#222', 
            borderRadius: 20, 
            padding: 0, 
            width: '90%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: '#fff',
              padding: '24px 32px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <button 
                onClick={handleClose}
                style={{ 
                  position: 'absolute', 
                  top: 16, 
                  right: 20, 
                  background: 'rgba(255,255,255,0.2)', 
                  border: 'none', 
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  fontSize: 18, 
                  cursor: 'pointer',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={preview || userData?.photo || DEFAULT_AVATAR}
                    alt="Profile"
                    style={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      objectFit: 'cover', 
                      border: '3px solid rgba(255,255,255,0.3)',
                      backgroundColor: '#f0f0f0'
                    }}
                  />
                  {editMode && (
                    <button
                      onClick={triggerFileInput}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        background: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: 28,
                        height: 28,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                    >
                      📷
                    </button>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>
                    {profile?.name || userData?.name || 'User Profile'}
                  </div>
                  <div style={{ opacity: 0.9, fontSize: 14 }}>
                    {profile?.email || userData?.email || userEmail}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '32px', maxHeight: '60vh', overflowY: 'auto' }}>
              {(isLoading || saving) ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="spinner" style={{ fontSize: 18, color: '#666' }}>Loading...</div>
                  <div style={{ margin: '24px auto', width: 120, height: 20, background: '#e1e5e9', borderRadius: 8 }} />
                  <div style={{ margin: '12px auto', width: 80, height: 80, background: '#e1e5e9', borderRadius: '50%' }} />
                  <div style={{ margin: '12px auto', width: 100, height: 16, background: '#e1e5e9', borderRadius: 8 }} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Form Fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handleChange}
                      style={{ display: 'none' }}
                    />

                    {/* Name Field */}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 8, 
                        fontWeight: 600, 
                        color: '#333',
                        fontSize: 14
                      }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !editMode) {
                            e.preventDefault();
                          }
                        }}
                        disabled={!editMode}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: 8,
                          border: editMode ? '2px solid #e1e5e9' : '2px solid #f0f0f0',
                          fontSize: 16,
                          backgroundColor: editMode ? '#fff' : '#f8f9fa',
                          transition: 'all 0.2s ease'
                        }}
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email Field (Read-only) */}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 8, 
                        fontWeight: 600, 
                        color: '#333',
                        fontSize: 14
                      }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile?.email || userData?.email || userEmail}
                        disabled
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: 8,
                          border: '2px solid #f0f0f0',
                          fontSize: 16,
                          backgroundColor: '#f8f9fa',
                          color: '#666'
                        }}
                      />
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 8, 
                        fontWeight: 600, 
                        color: '#333',
                        fontSize: 14
                      }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !editMode) {
                            e.preventDefault();
                          }
                        }}
                        disabled={!editMode}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: 8,
                          border: editMode ? '2px solid #e1e5e9' : '2px solid #f0f0f0',
                          fontSize: 16,
                          backgroundColor: editMode ? '#fff' : '#f8f9fa',
                          transition: 'all 0.2s ease'
                        }}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    {/* School Field */}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 8, 
                        fontWeight: 600, 
                        color: '#333',
                        fontSize: 14
                      }}>
                        School/Institution
                      </label>
                      <input
                        type="text"
                        name="school"
                        value={form.school}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !editMode) {
                            e.preventDefault();
                          }
                        }}
                        disabled={!editMode}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: 8,
                          border: editMode ? '2px solid #e1e5e9' : '2px solid #f0f0f0',
                          fontSize: 16,
                          backgroundColor: editMode ? '#fff' : '#f8f9fa',
                          transition: 'all 0.2s ease'
                        }}
                        placeholder="Enter your school name"
                      />
                    </div>

                    {/* Class Field */}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: 8, 
                        fontWeight: 600, 
                        color: '#333',
                        fontSize: 14
                      }}>
                        Class/Year *
                      </label>
                      <input
                        type="text"
                        name="class"
                        value={form.class}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !editMode) {
                            e.preventDefault();
                          }
                        }}
                        disabled={!editMode}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: 8,
                          border: editMode ? '2px solid #e1e5e9' : '2px solid #f0f0f0',
                          fontSize: 16,
                          backgroundColor: editMode ? '#fff' : '#f8f9fa',
                          transition: 'all 0.2s ease'
                        }}
                        placeholder="Enter your class or year"
                      />
                    </div>
                  </div>

                  {/* Status Message */}
                  {status && (
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      backgroundColor: status.includes('success') ? '#d4edda' : '#f8d7da',
                      color: status.includes('success') ? '#155724' : '#721c24',
                      fontSize: 14,
                      textAlign: 'center'
                    }}>
                      {status}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                    {!editMode ? (
                      <>
                        <button
                          type="button"
                          onClick={handleEdit}
                          style={{
                            flex: 1,
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                          Edit Profile
                        </button>
                        <button
                          type="button"
                          onClick={handleLogout}
                          style={{
                            padding: '12px 24px',
                            background: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#c82333'}
                          onMouseLeave={(e) => e.target.style.background = '#dc3545'}
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving}
                          style={{
                            flex: 1,
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease',
                            opacity: saving ? 0.7 : 1
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={saving}
                          style={{
                            padding: '12px 24px',
                            background: '#6c757d',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                            opacity: saving ? 0.7 : 1
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#5a6268'}
                          onMouseLeave={(e) => e.target.style.background = '#6c757d'}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>

                  {/* Photo Actions (only in edit mode) */}
                  {editMode && (profile?.photo || userData?.photo) && (
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                      <button
                        type="button"
                        onClick={handleDeletePhoto}
                        style={{
                          padding: '8px 16px',
                          background: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 14,
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#c82333'}
                        onMouseLeave={(e) => e.target.style.background = '#dc3545'}
                      >
                        Remove Photo
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}