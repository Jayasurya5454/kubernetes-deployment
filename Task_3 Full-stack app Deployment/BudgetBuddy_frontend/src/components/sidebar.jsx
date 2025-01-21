import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiGrid, FiDollarSign, FiCreditCard, FiShield, FiLogOut, FiBell, FiMenu } from "react-icons/fi";
import { getAuth } from "firebase/auth";

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();
  
  useEffect(() => {
    // Get the current user from Firebase and set their email
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email) {
      setUserEmail(currentUser.email);
      console.log( userEmail.split('@')[0]);
    }
  }, [auth]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-white shadow-lg h-full p-4">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600 mb-10">
          <div className="flex items-center">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoSbpWz8SUrRq7EZL-tE73XEN-oSUPFgA3KQ&s"
              alt="Logo"
              className="mr-2 rounded-full w-9 h-9"
            />
            <span>BudgetBuddy</span>
          </div>
        </div>

        {/* Navigation */}
        <nav>
          <ul>
            <li className="mb-6">
              <Link to="/dashboard" className="flex items-center font-semibold">
                <FiGrid className="mr-3" />
                Dashboard
              </Link>
            </li>
            <li className="mb-6">
              <Link to="/budgets" className="flex items-center">
                <FiDollarSign className="mr-3" />
                Budgets
              </Link>
            </li>
            <li className="mb-6">
              <Link to="/expenses" className="flex items-center">
                <FiCreditCard className="mr-3" />
                Expenses
              </Link>
            </li>
            <li className="mb-6">
              <Link to="/generate" className="flex items-center">
                <FiShield className="mr-3" />
                Download Report
              </Link>
            </li>
            <li>
              <Link to="/remainders" className="flex items-center">
                <FiBell className="mr-3" />
                Reminders
              </Link>
            </li>
          </ul>
        </nav>

        {/* Profile Section */}
        <div className="absolute bottom-24 left-4 flex items-center space-x-3">
          <div className="bg-green-500 h-10 w-10 rounded-full flex items-center justify-center text-white">
            {userEmail ? userEmail[0].toUpperCase() : "G"}
          </div>
          <span>Profile!</span>

          {/* <span>{userEmail && userEmail.includes('@') ? userEmail.split('@')[0] : "Profile"}</span> */}
          </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="absolute bottom-6 left-4 flex items-center text-red-500 hover:text-red-700"
        >
          <FiLogOut className="mr-2" />
          Logout
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} fixed inset-0 bg-gray-800 bg-opacity-50 p-4`}>
        <div className="bg-white p-4 rounded-md w-64">
          <nav>
            <ul>
              <li className="mb-6">
                <Link to="/dashboard" className="flex items-center font-semibold">
                  <FiGrid className="mr-3" />
                  Dashboard
                </Link>
              </li>
              <li className="mb-6">
                <Link to="/budgets" className="flex items-center">
                  <FiDollarSign className="mr-3" />
                  Budgets
                </Link>
              </li>
              <li className="mb-6">
                <Link to="/expenses" className="flex items-center">
                  <FiCreditCard className="mr-3" />
                  Expenses
                </Link>
              </li>
              <li className="mb-6">
                <Link to="/generate" className="flex items-center">
                  <FiShield className="mr-3" />
                  Download Report
                </Link>
              </li>
              <li>
                <Link to="/remainders" className="flex items-center">
                  <FiBell className="mr-3" />
                  Reminders
                </Link>
              </li>
            </ul>
          </nav>

          {/* Profile Section for Mobile */}
          <div className="flex items-center space-x-3 mt-8">
            <div className="bg-green-500 h-10 w-10 rounded-full flex items-center justify-center text-white">
              {userEmail ? userEmail[0].toUpperCase() : "G"}
            </div>
            <span>{userEmail && userEmail.includes('@') ? userEmail.split('@')[0] : "Profile"}</span>
            </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="mt-4 flex items-center text-red-500 hover:text-red-700"
          >
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Hamburger Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="text-blue-600 p-3 rounded-md bg-white shadow-md"
        >
          <FiMenu className="text-2xl" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
