import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_AVATAR = '/default-avatar.png'; // Place a default avatar in public if needed

export default function ProfileMenu({ userEmail, avatarStyle }) {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', school: '', class: '', photo: null });
  const [preview, setPreview] = useState('');
  const [status, setStatus] = useState('');
  const fileInputRef = useRef();

  // Fetch profile on open
  useEffect(() => {
    if (open && userEmail) {
      fetch(`http://localhost:8000/api/profile?email=${encodeURIComponent(userEmail)}`)
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
          setPreview(data.user.photo ? data.user.photo : DEFAULT_AVATAR);
        })
        .catch(() => setProfile(null));
    }
  }, [open, userEmail]);

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
      name: profile?.name || '',
      phone: profile?.phone || '',
      school: profile?.school || '',
      class: profile?.class || '',
      photo: null
    });
    setPreview(profile?.photo ? profile.photo : DEFAULT_AVATAR);
    setStatus('');
  };

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files && files[0]) {
      setForm(f => ({ ...f, photo: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleDeletePhoto = async () => {
    setStatus('Deleting photo...');
    try {
      const res = await fetch('http://localhost:8000/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ email: userEmail, deletePhoto: true }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setPreview(DEFAULT_AVATAR);
        setStatus('Photo deleted');
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
    return '';
  };

  const handleSave = async e => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setStatus(validationError);
      return;
    }
    setStatus('Saving...');
    const formData = new FormData();
    formData.append('email', userEmail);
    formData.append('name', form.name);
    formData.append('phone', form.phone);
    formData.append('school', form.school);
    formData.append('class', form.class);
    if (form.photo) formData.append('photo', form.photo);
    try {
      const res = await fetch('http://localhost:8000/api/profile', {
        method: 'PUT',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setEditMode(false);
        setStatus('Profile updated!');
      } else {
        setStatus(data.message || 'Failed to update');
      }
    } catch {
      setStatus('Failed to update');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  };

  // Avatar button (top-right)
  return (
    <>
      <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 2000 }}>
        <button
          onClick={() => setOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <img
            src={profile?.photo ? profile.photo : DEFAULT_AVATAR}
            alt="User Avatar"
            style={avatarStyle || { width: 48, height: 48, borderRadius: '50%', border: '2px solid #fff', objectFit: 'cover' }}
          />
        </button>
      </div>
      {open && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
        }}>
          <div style={{
            background: '#fff', color: '#222', borderRadius: 16, padding: 32, minWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.18)', position: 'relative'
          }}>
            <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>&times;</button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18 }}>
              <img
                src={preview || DEFAULT_AVATAR}
                alt="Profile"
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 8, border: '2px solid #1e3c72' }}
              />
              <div style={{ fontWeight: 700, fontSize: 18 }}>{profile?.name || profile?.email?.split('@')[0]}</div>
              <div style={{ color: '#888', fontSize: 14 }}>{profile?.email}</div>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label>Name: <span style={{ color: 'red' }}>*</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                  style={{ width: '100%', padding: 7, borderRadius: 4, border: '1px solid #bbb', marginTop: 2 }}
                />
              </label>
              <label>School Name:
                <input
                  type="text"
                  name="school"
                  value={form.school}
                  onChange={handleChange}
                  disabled={!editMode}
                  style={{ width: '100%', padding: 7, borderRadius: 4, border: '1px solid #bbb', marginTop: 2 }}
                />
              </label>
              <label>Class:
                <input
                  type="text"
                  name="class"
                  value={form.class}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                  style={{ width: '100%', padding: 7, borderRadius: 4, border: '1px solid #bbb', marginTop: 2 }}
                />
              </label>
              <label>Phone No.:
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={!editMode}
                  maxLength={10}
                  style={{ width: '100%', padding: 7, borderRadius: 4, border: '1px solid #bbb', marginTop: 2 }}
                />
              </label>
              <label>Photo:
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleChange}
                  disabled={!editMode}
                  style={{ marginTop: 2 }}
                />
                {editMode && profile?.photo && (
                  <button type="button" onClick={handleDeletePhoto} style={{ marginLeft: 10, background: '#c0392b', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Delete Photo</button>
                )}
              </label>
              {!editMode ? (
                <button type="button" onClick={handleEdit} style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                  <button type="button" onClick={handleCancel} style={{ background: '#bbb', color: '#222', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                </div>
              )}
              <div style={{ marginTop: 8, color: '#1e3c72', fontWeight: 500 }}>{status}</div>
            </form>
            <button onClick={handleLogout} style={{ marginTop: 18, background: '#c0392b', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
} 