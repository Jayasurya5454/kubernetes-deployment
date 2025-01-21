import React from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaPhoneVolume, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="pt-8">
      <br></br><br></br>
      <div className="text-center p-2 bg-gray-900 text-white">
        <h1 className="mb-3 text font-semibold">
          © 2024 BudgetBuddy. All Rights Reserved.
        </h1>
        {/* <div className="flex justify-center items-center gap-2 text-sm sm:flex-col sm:gap-1">
          <h2 className="font-medium">Developed by Our Team Code Crackers</h2>
          <div className="flex items-center gap-2">
            <FaWhatsapp className="text-green-500" />
            <span className="font-medium">+91 9098789009</span>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Footer;
