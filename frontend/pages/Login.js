"use client";
import React, { useState } from "react";

export default function Login({ onBack }) {
  const [mode, setMode] = useState("password"); // "password" or "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    // Replace with your backend API call
    // Example:
    // const res = await fetch('/api/user/login', { ... });
    // if (res.ok) { ... } else { setError("Invalid credentials"); }
    setMsg("Password login attempted (implement backend call).");
  };

  const handleSendOtp = async () => {
    setError("");
    setMsg("");
    // Replace with your backend API call
    // Example:
    // const res = await fetch('/api/user/send-otp', { ... });
    // if (res.ok) setOtpSent(true); else setError("Failed to send OTP");
    setOtpSent(true);
    setMsg("OTP sent to your email (implement backend call).");
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setError("");
    // Replace with your backend API call
    // Example:
    // const res = await fetch('/api/user/login-otp', { ... });
    // if (res.ok) { ... } else { setError("Invalid OTP"); }
    setMsg("OTP login attempted (implement backend call).");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontFamily: "Segoe UI, Arial, sans-serif"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "36px 28px",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        textAlign: "center",
        maxWidth: 380,
        width: "90%"
      }}>
        <h2 style={{ marginBottom: 18 }}>Login</h2>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <button
            style={{
              background: mode === "password" ? "#ff8c00" : "#444",
              color: "#fff",
              border: "none",
              borderRadius: "8px 0 0 8px",
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 600
            }}
            onClick={() => setMode("password")}
          >
            Email & Password
          </button>
          <button
            style={{
              background: mode === "otp" ? "#ff0080" : "#444",
              color: "#fff",
              border: "none",
              borderRadius: "0 8px 8px 0",
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 600
            }}
            onClick={() => setMode("otp")}
          >
            Email & OTP
          </button>
        </div>
        <div style={{ margin: "10px 0", color: "#ccc", fontWeight: 500 }}>OR</div>
        {mode === "password" ? (
          <form onSubmit={handlePasswordLogin} style={{ marginTop: 10 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: "90%",
                padding: "8px",
                margin: "8px 0",
                borderRadius: 6,
                border: "1px solid #ccc"
              }}
            /><br />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: "90%",
                padding: "8px",
                margin: "8px 0",
                borderRadius: 6,
                border: "1px solid #ccc"
              }}
            /><br />
            <button
              type="submit"
              style={{
                background: "linear-gradient(90deg, #ff8c00 0%, #ff0080 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 28px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                marginTop: 10
              }}
            >
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpLogin} style={{ marginTop: 10 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: "90%",
                padding: "8px",
                margin: "8px 0",
                borderRadius: 6,
                border: "1px solid #ccc"
              }}
              disabled={otpSent}
            /><br />
            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                style={{
                  background: "#ff0080",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 24px",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginTop: 10
                }}
              >
                Send OTP
              </button>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                  style={{
                    width: "90%",
                    padding: "8px",
                    margin: "8px 0",
                    borderRadius: 6,
                    border: "1px solid #ccc"
                  }}
                /><br />
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(90deg, #ff8c00 0%, #ff0080 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 28px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: 10
                  }}
                >
                  Login with OTP
                </button>
              </>
            )}
          </form>
        )}
        {msg && <div style={{ color: "#0f0", marginTop: 12 }}>{msg}</div>}
        {error && <div style={{ color: "#f66", marginTop: 12 }}>{error}</div>}
        <button
          onClick={onBack}
          style={{
            marginTop: 24,
            background: "#222",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 24px",
            cursor: "pointer"
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
