import React from 'react';
import Navbar from './navbar';
import Footer from './footer';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Home() {
    return (
        <div>
            <Navbar />
            <div className="mt-8 flex flex-col items-center">
                <div className="flex justify-center items-center flex-col md:flex-row">
                    <img 
                        src="https://happay.com/blog/wp-content/uploads/sites/12/2022/08/what-is-expense-management.png" 
                        alt="expense image" 
                        className="w-[600px] h-auto mr-0 md:mr-5"
                    />
                    <div className="text-center mt-8 md:mt-0">
                        <h1 className="text-4xl font-extrabold mb-3">Manage Your Expense</h1>
                        <h1 className="text-4xl font-extrabold text-[#4D46CF] mb-5">Control Your Money</h1>
                        <p className="text-base font-bold text-gray-600 mb-4">
                            Start creating your budget and save tons of money.
                        </p>
                        <a href='/signin'>
                        <button className="bg-[#4D46CF] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#3b3b98] transition-colors duration-300">
                            Get Started
                        </button>
                        </a>
                    </div>
                
                </div>
            </div>
            <Footer />
            
        </div>
    );
}

export default Home;
