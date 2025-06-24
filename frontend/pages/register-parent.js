"use client";
import React, { useState } from "react";
import { BASE_API_URL } from "./apiurl";

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
  const [step, setStep] = useState(1); // 1: child email, 2: child OTP, 3: parent email, 4: parent OTP, 5: parent registration
  const [form, setForm] = useState({
    parentName: "",
    parentEmail: "",
    childEmail: "",
    childOtp: "",
    parentOtp: "",
    password: "",
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Verify child email exists
  const handleVerifyChild = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    const email = form.childEmail.trim().toLowerCase();
    if (!email) {
      setError("Enter child email.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${BASE_API_URL}/student/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setError("No student found with this child email.");
        setLoading(false);
        return;
      }
      // Send OTP to child email
      const otpRes = await fetch(`${BASE_API_URL}/student/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (otpRes.ok) {
        setMsg(
          "OTP sent to child email. Please enter the OTP received by your child."
        );
        setStep(2);
      } else {
        // Show backend error message if available
        let backendError = "Failed to send OTP to child email.";
        try {
          const data = await otpRes.json();
          if (data && data.message) backendError = data.message;
        } catch {}
        setError(backendError);
      }
    } catch {
      setError("Error verifying child email.");
    }
    setLoading(false);
  };

  // Step 2: Verify child OTP
  const handleVerifyChildOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    // Try to register with dummy data to check OTP validity
    try {
      const res = await fetch(`${BASE_API_URL}/student/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "dummy", // dummy, will not be saved if already exists
          email: form.childEmail.trim().toLowerCase(),
          school: "",
          class: "",
          otp: form.childOtp,
          password: "dummy",
        }),
      });
      if (res.status === 400) {
        const data = await res.json();
        setError(data.message || "Invalid OTP.");
        setLoading(false);
        return;
      }
      if (res.status === 409) {
        // Already registered, so OTP is valid
        setMsg("Child verified. Now enter parent email.");
        setStep(3);
        setLoading(false);
        return;
      }
      if (res.status === 201) {
        // Dummy student created, delete or inform
        setError(
          "This student email is not yet registered. Please use the student's real registration."
        );
        setLoading(false);
        return;
      }
      setError("OTP verification failed.");
    } catch {
      setError("OTP verification failed.");
    }
    setLoading(false);
  };

  // Step 3: Parent email, send OTP
  const handleSendParentOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    const parentEmail = form.parentEmail.trim().toLowerCase();
    if (!parentEmail) {
      setError("Enter parent email.");
      setLoading(false);
      return;
    }
    try {
      // Check as Student
      let res = await fetch(`${BASE_API_URL}/student/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parentEmail }),
      });
      if (res.ok) {
        setError("Email already registered as Student.");
        setLoading(false);
        return;
      }
      // Check as Parent
      res = await fetch(`${BASE_API_URL}/parent/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parentEmail }),
      });
      if (res.ok) {
        setError("Email already registered as Parent.");
        setLoading(false);
        return;
      }
      // Send OTP to parent email
      res = await fetch(`${BASE_API_URL}/parent/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: parentEmail,
          childEmail: form.childEmail.trim().toLowerCase(),
        }),
      });
      if (res.ok) {
        setMsg("OTP sent to parent email. Please enter the OTP.");
        setStep(4);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to send OTP.");
      }
    } catch {
      setError("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  // Step 4: Verify parent OTP
  const handleVerifyParentOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    // Try to register with dummy name/password to check OTP validity
    try {
      const res = await fetch(`${BASE_API_URL}/parent/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "dummy", // dummy, will not be saved if already exists
          email: form.parentEmail.trim().toLowerCase(),
          childEmail: form.childEmail.trim().toLowerCase(),
          otp: form.parentOtp,
          password: "dummy",
        }),
      });
      if (res.status === 400) {
        const data = await res.json();
        setError(data.message || "Invalid OTP.");
        setLoading(false);
        return;
      }
      if (res.status === 409) {
        setError("Parent email already registered.");
        setLoading(false);
        return;
      }
      if (res.status === 404) {
        setError("No student found with this child email.");
        setLoading(false);
        return;
      }
      if (res.status === 201) {
        setMsg("Parent OTP verified. Please complete parent registration.");
        setStep(5);
        setLoading(false);
        return;
      }
      setError("OTP verification failed.");
    } catch {
      setError("OTP verification failed.");
    }
    setLoading(false);
  };

  // Step 5: Register parent
  const handleRegisterParent = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/parent/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.parentName,
          email: form.parentEmail.trim().toLowerCase(),
          childEmail: form.childEmail.trim().toLowerCase(),
          otp: form.parentOtp,
          password: form.password,
        }),
      });
      if (res.ok) {
        setMsg("Registration successful! Redirecting...");
        localStorage.setItem("userEmail", form.parentEmail.trim().toLowerCase());
        setTimeout(() => {
          window.location.href = "/parent/dashboard";
        }, 1200);
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed.");
      }
    } catch {
      setError("Registration failed. Please try again.");
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setMsg("");
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
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          position: "relative",
        }}
      >
        <h2>Parent Registration</h2>
        {step === 1 && (
          <form onSubmit={handleVerifyChild}>
            <input
              type="email"
              name="childEmail"
              placeholder="Enter Child's Student Email"
              value={form.childEmail}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? "Verifying..." : "Verify Child"}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyChildOtp}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              OTP sent to child:{" "}
              <span style={{ color: "#0a0" }}>{form.childEmail}</span>
            </div>
            <input
              type="text"
              name="childOtp"
              placeholder="Enter OTP received by child"
              value={form.childOtp}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? "Verifying OTP..." : "Verify Child OTP"}
            </button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleSendParentOtp}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              Child verified:{" "}
              <span style={{ color: "#0a0" }}>{form.childEmail}</span>
            </div>
            <input
              type="email"
              name="parentEmail"
              placeholder="Enter Parent Email"
              value={form.parentEmail}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? "Sending OTP..." : "Send Parent OTP"}
            </button>
          </form>
        )}
        {step === 4 && (
          <form onSubmit={handleVerifyParentOtp}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              OTP sent to parent:{" "}
              <span style={{ color: "#0a0" }}>{form.parentEmail}</span>
            </div>
            <input
              type="text"
              name="parentOtp"
              placeholder="Enter OTP received by parent"
              value={form.parentOtp}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? "Verifying OTP..." : "Verify Parent OTP"}
            </button>
          </form>
        )}
        {step === 5 && (
          <form onSubmit={handleRegisterParent}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              Parent Email:{" "}
              <span style={{ color: "#0a0" }}>{form.parentEmail}</span>
            </div>
            <input
              type="text"
              name="parentName"
              placeholder="Parent Name"
              value={form.parentName}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        )}
        {msg && <div style={{ color: "#0a0", marginTop: 12 }}>{msg}</div>}
        {error && <div style={{ color: "#f00", marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}

