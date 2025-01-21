import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth'; 
import Layout from "./Layout";
import { ToastContainer, toast } from 'react-toastify';  // Import Toastify components
import 'react-toastify/dist/ReactToastify.css';

// Import Firebase auth methods

const AddReminder = () => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [lastDate, setLastDate] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser; // Get the current user

        if (user) {
            setUserEmail(user.email); // Set user email from Firebase
            setUserId(user.uid); // Set user ID from Firebase
        } else {
            setMessage('User is not authenticated.');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Reset message

        // Validate input
        if (!name || !amount || !lastDate) {
            setMessage('All fields are required.');
            return;
        }

        try {
            // Send reminder data to the backend
            const response = await axios.post('http://localhost:3000/remainders', {
                userId, // Use the user ID from Firebase
                name,
                amount,
                lastDate,
                userEmail, // Use the user email from Firebase
            });

            // Handle success
            toast.success("Remainder added succesfully!!", {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            // Reset form fields
            setName('');
            setAmount('');
            setLastDate('');
        } catch (error) {
            console.error('Error adding reminder:', error);
            toast.error("Error adding remainder!!", {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    return (
        <Layout>
        <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-lg bg-white">
            <h2 className="text-2xl font-bold mb-4">Add Reminder</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Reminder Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Last Date</label>
                    <input
                        type="date"
                        value={lastDate}
                        onChange={(e) => setLastDate(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-semibold p-2 rounded-md hover:bg-blue-700">
                    Add Reminder
                </button>
            </form>
            {message && <p className="mt-4 text-red-500">{message}</p>}
        </div>
        <ToastContainer />
        </Layout>
    );
};

export default AddReminder;
