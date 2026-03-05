"use client";
import React from "react";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px", background: "#f5f5f5", minHeight: "100vh" }}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
