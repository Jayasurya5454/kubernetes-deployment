import React from "react";
import Sidebar from "./sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-grow p-4 bg-gray-100 min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default Layout;
