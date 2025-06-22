"use client";
import React from "react";

export default function Home({ onLogin }) {
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
        padding: "40px 32px",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        textAlign: "center",
        maxWidth: 400,
        width: "90%"
      }}>
        <img
          src="https://img.icons8.com/color/96/000000/open-book--v2.png"
          alt="VK Publications"
          style={{ marginBottom: 24 }}
        />
        <h1 style={{
          fontWeight: 700,
          fontSize: "2.5rem",
          marginBottom: 16,
          letterSpacing: 1
        }}>
          VK Publications
        </h1>
        <p style={{
          fontSize: "1.1rem",
          marginBottom: 32,
          color: "#e0e0e0"
        }}>
          Welcome to the future of learning. Explore, connect, and grow with our platform.
        </p>
        <button
          onClick={onLogin}
          style={{
            background: "linear-gradient(90deg, #ff8c00 0%, #ff0080 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 32px",
            fontSize: "1.1rem",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "transform 0.1s"
          }}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        >
          Login
        </button>
      </div>
      <div style={{
        marginTop: 40,
        fontSize: "0.95rem",
        color: "#b0c4de",
        letterSpacing: 0.5
      }}>
        © {new Date().getFullYear()} VK Publications. All rights reserved.
      </div>
    </div>
  );
}
