"use client";
import React, { useState } from "react";

export default function Register({ onClose }) {
  const [form, setForm] = useState({
    registeredAs: "Student",
    email: "",
    password: "",
    school: "",
    class: "",
    otp: ""
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async e => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/user/send-register-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() })
      });
      if (res.ok) {
        setOtpSent(true);
        setMsg("OTP sent to your email.");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    try {
      // Optionally verify OTP first (or just let backend handle it)
      const res = await fetch("http://localhost:8000/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setMsg("Registration successful! Redirecting...");
        setError("");
        // Store user email for MainHome superadmin check
        localStorage.setItem("userEmail", form.email.trim().toLowerCase());
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href = "/MainHome";
          }
        }, 1200);
        setForm({
          registeredAs: "Student",
          email: "",
          password: "",
          school: "",
          class: "",
          otp: ""
        });
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed.");
        setMsg("");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
      setMsg("");
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: onClose ? "fixed" : "static",
      top: 0, left: 0, width: "100vw", height: "100vh",
      background: onClose ? "rgba(0,0,0,0.4)" : "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "#fff",
        color: "#222",
        borderRadius: 16,
        padding: 32,
        minWidth: 320,
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        position: "relative"
      }}>
        {onClose && (
          <button onClick={onClose} style={{
            position: "absolute", top: 12, right: 12, background: "none",
            border: "none", fontSize: 22, cursor: "pointer"
          }}>&times;</button>
        )}
        <h2 style={{ marginBottom: 18 }}>Register</h2>
        <form onSubmit={otpSent ? handleSubmit : handleSendOtp}>
          <label>
            Register As:
            <select name="registeredAs" value={form.registeredAs} onChange={handleChange} required style={{ marginLeft: 8 }}>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Parent">Parent</option>
            </select>
          </label>
          <br /><br />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8, margin: "8px 0", borderRadius: 6, border: "1px solid #ccc" }}
            disabled={otpSent}
          /><br />
          {!otpSent ? (
            <button type="submit" disabled={loading} style={{
              background: "linear-gradient(90deg, #ff8c00 0%, #ff0080 100%)",
              color: "#fff", border: "none", borderRadius: 8, padding: "10px 28px",
              fontSize: "1rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: 10
            }}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          ) : (
            <>
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={form.otp}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: 8, margin: "8px 0", borderRadius: 6, border: "1px solid #ccc" }}
              /><br />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: 8, margin: "8px 0", borderRadius: 6, border: "1px solid #ccc" }}
              /><br />
              <input
                type="text"
                name="school"
                placeholder="School (optional)"
                value={form.school}
                onChange={handleChange}
                style={{ width: "100%", padding: 8, margin: "8px 0", borderRadius: 6, border: "1px solid #ccc" }}
              /><br />
              <input
                type="text"
                name="class"
                placeholder="Class"
                value={form.class}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: 8, margin: "8px 0", borderRadius: 6, border: "1px solid #ccc" }}
              /><br />
              <button type="submit" disabled={loading} style={{
                background: "linear-gradient(90deg, #ff8c00 0%, #ff0080 100%)",
                color: "#fff", border: "none", borderRadius: 8, padding: "10px 28px",
                fontSize: "1rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: 10
              }}>
                {loading ? "Registering..." : "Register"}
              </button>
            </>
          )}
        </form>
        {msg && <div style={{ color: "#0a0", marginTop: 12 }}>{msg}</div>}
        {error && <div style={{ color: "#f00", marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}
