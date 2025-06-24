"use client";
import React, { useState } from "react";
import { BASE_API_URL } from "./apiurl";
import { useRouter } from "next/navigation";

const btnStyle = {
  background: "linear-gradient(90deg, #ff8c00 0%, #ff0080 100%)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "12px 0",
  fontSize: "1.1rem",
  fontWeight: 600,
  cursor: "pointer",
};
const inputStyle = {
  width: "100%",
  padding: 8,
  margin: "8px 0",
  borderRadius: 6,
  border: "1px solid #ccc",
};

export default function RegisterParent() {
  const [step, setStep] = useState(1);
  const [childEmail, setChildEmail] = useState("");
  const [childOtp, setChildOtp] = useState("");
  const [childOtpSent, setChildOtpSent] = useState(false);
  const [childOtpVerified, setChildOtpVerified] = useState(false);

  // Parent info
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [parentOtp, setParentOtp] = useState("");
  const [parentOtpSent, setParentOtpSent] = useState(false);
  const [parentOtpVerified, setParentOtpVerified] = useState(false);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Step 1: Verify child email and send OTP
  const handleChildEmailSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_API_URL}/parent/verify-child-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childEmail: childEmail.trim().toLowerCase(),
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setChildOtpSent(true);
        setMsg("Child found. OTP sent to child email.");
      } else {
        setError(data.message || "Child verification failed");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  // Step 2: Verify OTP sent to child email (simulate for now)
  const handleChildOtpVerify = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    // In production, verify OTP with backend
    if (!childOtp || childOtp.length !== 6) {
      setError("Please enter the 6-digit OTP sent to child email.");
      setLoading(false);
      return;
    }
    // Simulate success for now
    setChildOtpVerified(true);
    setStep(2);
    setMsg("Child email verified. Please complete your registration.");
    setLoading(false);
  };

  // Step 2: Parent info and OTP
  const handleParentInfoSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    // Check if parent email already exists
    try {
      const checkRes = await fetch(`${BASE_API_URL}/user/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parentEmail.trim().toLowerCase() }),
      });
      if (checkRes.ok) {
        setError("Email already registered.");
        setLoading(false);
        return;
      }
    } catch {}
    // Send OTP to parent email
    try {
      const res = await fetch(`${BASE_API_URL}/user/send-register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parentEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setParentOtpSent(true);
        setMsg("OTP sent to your email.");
      } else {
        setError(data.message || "Failed to send OTP.");
      }
    } catch {
      setError("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleParentOtpVerifyAndRegister = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    // Verify OTP
    try {
      const res = await fetch(`${BASE_API_URL}/user/verify-register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: parentEmail.trim().toLowerCase(),
          otp: parentOtp,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid or expired OTP.");
        setLoading(false);
        return;
      }
    } catch {
      setError("OTP verification failed. Please try again.");
      setLoading(false);
      return;
    }
    // Register parent
    try {
      const res = await fetch(`${BASE_API_URL}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parentName,
          email: parentEmail.trim().toLowerCase(),
          password: parentPassword,
          otp: parentOtp,
          registeredAs: "Parent",
          childEmail: childEmail.trim().toLowerCase(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Registration successful! Redirecting...");
        localStorage.setItem("userEmail", parentEmail.trim().toLowerCase());
        setTimeout(() => {
          router.replace("/parent/dashboard");
        }, 1200);
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch {
      setError("Registration failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          color: "#222",
          borderRadius: 16,
          padding: 32,
          minWidth: 320,
          boxShadow:
            "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          position: "relative",
        }}
      >
        <h2>Parent Registration</h2>
        {step === 1 && (
          <form
            onSubmit={childOtpSent ? handleChildOtpVerify : handleChildEmailSubmit}
          >
            <input
              type="email"
              placeholder="Enter your child's registered email"
              value={childEmail}
              onChange={(e) => setChildEmail(e.target.value)}
              required
              disabled={childOtpSent}
              style={inputStyle}
            />
            {!childOtpSent ? (
              <button
                type="submit"
                disabled={loading}
                style={btnStyle}
              >
                {loading ? "Verifying..." : "Verify Child Email"}
              </button>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP sent to child email"
                  value={childOtp}
                  onChange={(e) => setChildOtp(e.target.value)}
                  required
                  style={inputStyle}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={btnStyle}
                >
                  {loading ? "Verifying OTP..." : "Verify OTP"}
                </button>
              </>
            )}
          </form>
        )}
        {step === 2 && (
          <form onSubmit={parentOtpSent ? handleParentOtpVerifyAndRegister : handleParentInfoSubmit}>
            <input
              type="text"
              placeholder="Parent Name"
              value={parentName}
              onChange={e => setParentName(e.target.value)}
              required
              disabled={parentOtpSent}
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Parent Email"
              value={parentEmail}
              onChange={e => setParentEmail(e.target.value)}
              required
              disabled={parentOtpSent}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={parentPassword}
              onChange={e => setParentPassword(e.target.value)}
              required
              disabled={parentOtpSent}
              style={inputStyle}
            />
            {!parentOtpSent ? (
              <button type="submit" disabled={loading} style={btnStyle}>
                {loading ? "Sending OTP..." : "Send OTP to Parent Email"}
              </button>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP sent to your email"
                  value={parentOtp}
                  onChange={e => setParentOtp(e.target.value)}
                  required
                  style={inputStyle}
                />
                <button type="submit" disabled={loading} style={btnStyle}>
                  {loading ? "Verifying & Registering..." : "Verify OTP & Register"}
                </button>
              </>
            )}
          </form>
        )}
        {msg && (
          <div style={{ color: "#0a0", marginTop: 12 }}>{msg}</div>
        )}
        {error && (
          <div style={{ color: "#f00", marginTop: 12 }}>{error}</div>
        )}
      </div>
    </div>
  );
}

