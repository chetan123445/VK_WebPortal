"use client";
import React, { useState } from "react";
import Register from "./Register";
import { useRouter } from "next/navigation";

export default function Login() {
  const [mode, setMode] = useState("password"); // "password" or "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [showNotFoundPopup, setShowNotFoundPopup] = useState(false);
  const router = useRouter();

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch("http://localhost:8000/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password })
      });
      if (res.status === 404) {
        setError("");
        setShowNotFoundPopup(true);
        return;
      }
      if (res.status === 401) {
        setError("Incorrect password.");
        return;
      }
      if (res.ok) {
        setMsg("Login successful!");
        setError("");
        // Redirect to mainhome page
        router.push("/mainhome");
      } else {
        const data = await res.json();
        setError(data.message || "Login failed.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  const handleSendOtp = async () => {
    setError("");
    setMsg("");
    try {
      const res = await fetch("http://localhost:8000/api/user/send-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
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
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    try {
      const res = await fetch("http://localhost:8000/api/user/verify-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp })
      });
      if (res.ok) {
        setMsg("OTP login successful!");
        setError("");
        router.push("/mainhome");
      } else {
        const data = await res.json();
        setError(data.message || "Invalid OTP.");
      }
    } catch (err) {
      setError("OTP login failed. Please try again.");
    }
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
        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => setShowRegister(true)}
            style={{
              background: "#fff",
              color: "#1e3c72",
              border: "none",
              borderRadius: 8,
              padding: "8px 24px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Register
          </button>
        </div>
        {msg && <div style={{ color: "#0f0", marginTop: 12 }}>{msg}</div>}
        {error && <div style={{ color: "#f66", marginTop: 12 }}>{error}</div>}
      </div>
      {showRegister && <Register onClose={() => setShowRegister(false)} />}
      {showNotFoundPopup && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000
        }}>
          <div style={{
            background: "#fff",
            color: "#222",
            borderRadius: 16,
            padding: 32,
            minWidth: 320,
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            textAlign: "center"
          }}>
            <div style={{ marginBottom: 18, fontWeight: 500, fontSize: "1.1rem" }}>
              User not found. Do you want to register?
            </div>
            <button
              onClick={() => {
                setShowNotFoundPopup(false);
                setShowRegister(true);
              }}
              style={{
                background: "linear-gradient(90deg, #ff8c00 0%, #ff0080 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 24px",
                fontWeight: 600,
                cursor: "pointer",
                marginRight: 12
              }}
            >
              Yes
            </button>
            <button
              onClick={() => setShowNotFoundPopup(false)}
              style={{
                background: "#eee",
                color: "#1e3c72",
                border: "none",
                borderRadius: 8,
                padding: "8px 24px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
