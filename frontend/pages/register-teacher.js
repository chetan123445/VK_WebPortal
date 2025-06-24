"use client";
import React, { useState } from "react";
import { BASE_API_URL } from "./apiurl";

// ...existing styles...
const btnStyle = {
  background: "linear-gradient(90deg, #ff8c00 0%, #ff0080 100%)",
  color: "#fff", border: "none", borderRadius: 8, padding: "12px 0",
  fontSize: "1.1rem", fontWeight: 600, cursor: "pointer"
};
const inputStyle = {
  width: "100%", padding: 8, margin: "8px 0", borderRadius: 6, border: "1px solid #ccc"
};

export default function RegisterTeacher() {
  const [form, setForm] = useState({ name: '', email: '', otp: '', password: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [msg, setMsg] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendOtp = async e => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/teacher/send-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() })
      });
      if (res.ok) {
        setOtpSent(true); setMsg("OTP sent to your email.");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to send OTP.");
      }
    } catch {
      setError("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/teacher/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email: form.email.trim().toLowerCase() })
      });
      if (res.ok) {
        setMsg("Registration successful! Redirecting...");
        localStorage.setItem("userEmail", form.email.trim().toLowerCase());
        setTimeout(() => { window.location.href = "/teacher/dashboard"; }, 1200);
      } else {
        const data = await res.json(); setError(data.message || "Registration failed.");
      }
    } catch {
      setError("Registration failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff", color: "#222", borderRadius: 16, padding: 32, minWidth: 320,
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)", position: "relative"
      }}>
        <h2>Teacher Registration</h2>
        <form onSubmit={otpSent ? handleSubmit : handleSendOtp}>
          <input type="text" name="name" placeholder="Teacher Name" value={form.name} onChange={handleChange} required disabled={otpSent} style={inputStyle} />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required disabled={otpSent} style={inputStyle} />
          {!otpSent ? (
            <button type="submit" disabled={loading} style={btnStyle}>{loading ? "Sending OTP..." : "Send OTP"}</button>
          ) : (
            <>
              <input type="text" name="otp" placeholder="Enter OTP" value={form.otp} onChange={handleChange} required style={inputStyle} />
              <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required style={inputStyle} />
              <button type="submit" disabled={loading} style={btnStyle}>{loading ? "Registering..." : "Register"}</button>
            </>
          )}
        </form>
        {msg && <div style={{ color: "#0a0", marginTop: 12 }}>{msg}</div>}
        {error && <div style={{ color: "#f00", marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}

