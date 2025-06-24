"use client";
import React, { useState } from "react";
import Register from "./Register";
import { useRouter } from "next/navigation";
import { BASE_API_URL } from "./apiurl";
import { setToken, setUserData } from "../utils/auth.js";

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
      const res = await fetch(`${BASE_API_URL}/user/login`, {
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
        const data = await res.json();
        setMsg("Login successful!");
        setError("");
        
        // Store JWT token and user data
        setToken(data.token);
        setUserData(data.user);
        
        // Store user email for MainHome superadmin check (backward compatibility)
        localStorage.setItem("userEmail", cleanEmail);
        
        // Redirect to mainhome page
        router.push("/MainHome");
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
      const res = await fetch(`${BASE_API_URL}/user/send-login-otp`, {
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
      const res = await fetch(`${BASE_API_URL}/user/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp })
      });
      if (res.ok) {
        const data = await res.json();
        setMsg("OTP login successful!");
        setError("");
        
        // Store JWT token and user data
        setToken(data.token);
        setUserData(data.user);
        
        // Store user email for MainHome superadmin check (backward compatibility)
        localStorage.setItem("userEmail", email.trim().toLowerCase());
        
        router.push("/MainHome");
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
      <div style={{
        background: "rgba(255,255,255,0.96)",
        borderRadius: 20,
        padding: "32px 32px",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
        textAlign: "center",
        maxWidth: 700,
        minWidth: 600,
        minHeight: 340,
        margin: "0 auto",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 32
      }}>
        {/* Left side: Login method selection and Register */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start"
        }}>
          <div style={{
            background: "#fff",
            color: "#1e3c72",
            borderRadius: 12,
            width: 120,
            margin: "0 auto 18px auto",
            fontWeight: 700,
            fontSize: "1.2rem",
            padding: "10px 0",
            boxShadow: "0 2px 8px rgba(30,60,114,0.08)"
          }}>
            Login
          </div>
          <div style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginBottom: 18,
            gap: 0
          }}>
            <button
              style={{
                background: mode === "password" ? "linear-gradient(90deg, #ff8c00 0%, #ff0080 100%)" : "#f0f0f0",
                color: mode === "password" ? "#fff" : "#1e3c72",
                border: "none",
                borderRadius: "8px 0 0 8px",
                padding: "12px 12px",
                fontWeight: 700,
                fontSize: "1.05rem",
                cursor: "pointer",
                width: 120
              }}
              onClick={() => setMode("password")}
            >
              Email & Password
            </button>
            <button
              style={{
                background: mode === "otp" ? "linear-gradient(90deg, #ff8c00 0%, #ff0080 100%)" : "#f0f0f0",
                color: mode === "otp" ? "#fff" : "#1e3c72",
                border: "none",
                borderRadius: "0 8px 8px 0",
                padding: "12px 12px",
                fontWeight: 700,
                fontSize: "1.05rem",
                cursor: "pointer",
                width: 120
              }}
              onClick={() => setMode("otp")}
            >
              Email & OTP
            </button>
          </div>
          <div style={{
            fontWeight: 700,
            color: "#1e3c72",
            fontSize: "1.1rem",
            margin: "10px 0"
          }}>
            <span style={{
              display: "inline-block",
              borderTop: "1px solid #ccc",
              width: 40,
              verticalAlign: "middle",
              marginRight: 8
            }}></span>
            OR
            <span style={{
              display: "inline-block",
              borderTop: "1px solid #ccc",
              width: 40,
              verticalAlign: "middle",
              marginLeft: 8
            }}></span>
          </div>
          <div style={{
            background: "#fff",
            borderRadius: 12,
            marginTop: 32,
            width: 120,
            marginLeft: "auto",
            marginRight: "auto",
            boxShadow: "0 2px 8px rgba(30,60,114,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <button
              onClick={() => setShowRegister(true)}
              style={{
                background: "transparent",
                color: "#1e3c72",
                border: "none",
                borderRadius: 12,
                padding: "14px 0",
                fontWeight: 600,
                fontSize: "1.1rem",
                width: "100%",
                cursor: "pointer"
              }}
            >
              Register
            </button>
          </div>
        </div>
        {/* Right side: Login form */}
        <div style={{
          flex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {mode === "password" && (
            <form onSubmit={handlePasswordLogin} style={{ width: "100%" }}>
              <div style={{
                background: "#f7f7f7",
                borderRadius: 10,
                margin: "0 auto 16px auto",
                padding: "16px 0",
                width: 260,
                boxShadow: "0 1px 4px rgba(30,60,114,0.06)"
              }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: "85%",
                    padding: "10px",
                    margin: "8px 0",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: "1rem"
                  }}
                /><br />
              </div>
              <div style={{
                background: "#f7f7f7",
                borderRadius: 10,
                margin: "0 auto 16px auto",
                padding: "16px 0",
                width: 260,
                boxShadow: "0 1px 4px rgba(30,60,114,0.06)"
              }}>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width: "85%",
                    padding: "10px",
                    margin: "8px 0",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: "1rem"
                  }}
                /><br />
              </div>
              <div style={{
                background: "#f7f7f7",
                borderRadius: 10,
                margin: "0 auto 16px auto",
                padding: "16px 0",
                width: 260,
                boxShadow: "0 1px 4px rgba(30,60,114,0.06)"
              }}>
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
                    width: "85%"
                  }}
                >
                  Login
                </button>
              </div>
              {msg && <div style={{ color: "#0f0", marginTop: 12 }}>{msg}</div>}
              {error && <div style={{ color: "#f66", marginTop: 12 }}>{error}</div>}
            </form>
          )}
          {mode === "otp" && (
            <form onSubmit={handleOtpLogin} style={{ width: "100%" }}>
              <div style={{
                background: "#f7f7f7",
                borderRadius: 10,
                margin: "0 auto 16px auto",
                padding: "16px 0",
                width: 260,
                boxShadow: "0 1px 4px rgba(30,60,114,0.06)"
              }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: "85%",
                    padding: "10px",
                    margin: "8px 0",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: "1rem"
                  }}
                  disabled={otpSent}
                /><br />
              </div>
              {!otpSent ? (
                <div style={{
                  background: "#f7f7f7",
                  borderRadius: 10,
                  margin: "0 auto 16px auto",
                  padding: "16px 0",
                  width: 260,
                  boxShadow: "0 1px 4px rgba(30,60,114,0.06)"
                }}>
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
                      width: "85%"
                    }}
                  >
                    Send OTP
                  </button>
                </div>
              ) : (
                <>
                  <div style={{
                    background: "#f7f7f7",
                    borderRadius: 10,
                    margin: "0 auto 16px auto",
                    padding: "16px 0",
                    width: 260,
                    boxShadow: "0 1px 4px rgba(30,60,114,0.06)"
                  }}>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      required
                      style={{
                        width: "85%",
                        padding: "10px",
                        margin: "8px 0",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        fontSize: "1rem"
                      }}
                    /><br />
                  </div>
                  <div style={{
                    background: "#f7f7f7",
                    borderRadius: 10,
                    margin: "0 auto 16px auto",
                    padding: "16px 0",
                    width: 260,
                    boxShadow: "0 1px 4px rgba(30,60,114,0.06)"
                  }}>
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
                        width: "85%"
                      }}
                    >
                      Login with OTP
                    </button>
                  </div>
                </>
              )}
              {msg && <div style={{ color: "#0f0", marginTop: 12 }}>{msg}</div>}
              {error && <div style={{ color: "#f66", marginTop: 12 }}>{error}</div>}
            </form>
          )}
        </div>
      </div>
      {/* Register Modal */}
      {showRegister && <Register onClose={() => setShowRegister(false)} />}
      {/* NotFound Popup */}
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
