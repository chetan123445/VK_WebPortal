"use client";
import React, { useState, useEffect } from "react";
import { FaBars } from 'react-icons/fa';
import ProtectedRoute from '../components/ProtectedRoute';

import ProfileMenu from './ProfileMenu';
import { getUserData, getToken, isAuthenticated, isTokenExpired } from "../utils/auth.js";
import { useRouter } from "next/navigation";

// Hardcoded superadmin email for demo; in real use, get from auth/session
const SUPERADMIN_EMAIL = "chetandudi791@gmail.com";

function MainHomeContent() {
  // Get logged-in user data from JWT token
  const [userData, setUserData] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

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
    if (email) {
      fetch(`http://localhost:8000/api/getadmins`)
        .then(res => res.json())
        .then(data => {
          const found = (data.admins || []).find(a => a.email === userEmail);
          setIsSuperAdmin(found?.isSuperAdmin === true);
        })
        .catch(() => setIsSuperAdmin(false));
    }
  }, [userEmail]);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    const token = getToken();
    if (isAuthenticated() && !isTokenExpired(token)) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role;
        if (role === 'admin') router.replace('/admin/dashboard');
        else if (role === 'student') router.replace('/student/dashboard');
        else if (role === 'teacher') router.replace('/teacher/dashboard');
        else if (role === 'parent') router.replace('/parent/dashboard');
        else router.replace('/MainHome');
      } catch {}
    }
  }, [router]);

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
      <ProfileMenu 
        userEmail={userEmail} 
        userData={profileData}
        avatarStyle={{ width: 48, height: 48, borderRadius: '50%' }} 
        onProfileUpdate={fetchProfileData}
      />

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
