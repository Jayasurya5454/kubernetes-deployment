import React, { useState } from 'react';


const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="bg-white shadow-md h-20 flex items-center px-5 sm:h-16 sm:px-4">
            <div className="flex justify-between items-center w-full">
          <div className="text-2xl font-bold text-blue-600 mb-1">
          <div className="flex items-center">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoSbpWz8SUrRq7EZL-tE73XEN-oSUPFgA3KQ&s"
              alt="Logo"
              className="mr-2 rounded-full w-8 h-8"
            />
            <span>BudgetBuddy</span>
          </div>
        </div>                
                {/* Hamburger Menu Icon (Visible only on small screens) */}
                <button className="sm:hidden text-2xl" onClick={toggleMobileMenu}>
                    {isMobileMenuOpen ? '×' : '☰'}
                </button>

                {/* Desktop Menu (Visible on larger screens) */}
                <div className="hidden sm:flex gap-5">
                    <a href='/signin'>
                        <button className="bg-green-400 px-4 py-2 text-sm font-bold text-black border border-gray-300 rounded-md shadow-sm hover:bg-gray-300 transition-transform duration-300 transform hover:scale-105">
                            DashBoard
                        </button>
                    </a>
                </div>

                {/* Mobile Menu (Visible on small screens when the hamburger menu is clicked) */}
                {isMobileMenuOpen && (
                    <div className="absolute top-20 right-5 bg-white shadow-lg w-40 p-4 sm:hidden">
                        <a href='/signin'>
                            <button className="w-full mb-4 text-center text-sm font-bold text-[#4D46CF] bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-transform duration-300 transform hover:scale-105">
                                DashBoard
                            </button>
                        </a>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
