"use client";
import React from "react";
import Link from "next/link";
import { Dashboard, Store, AdminPanelSettings } from "@mui/icons-material";

const Sidebar = () => {
  const linkStyle = {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    color: "white",
    textDecoration: "none",
    marginBottom: "10px",
    borderRadius: "5px",
    background: "#1976d2"
  };
  const iconStyle = { marginRight: "10px" };

  return (
    <div style={{ width: "220px", background: "#1976d2", color: "white", padding: "20px", minHeight: "100vh" }}>
      <h2>Agri Mart</h2>
      <nav>
        <Link href="/dashboard" style={linkStyle}><Dashboard style={iconStyle}/> Dashboard</Link>
        <Link href="/seller" style={linkStyle}><Store style={iconStyle}/> Seller</Link>
        <Link href="/admin" style={linkStyle}><AdminPanelSettings style={iconStyle}/> Admin</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
