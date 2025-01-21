import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    // Filter states
    const [amountFilter, setAmountFilter] = useState('');
    const [budgetFilter, setBudgetFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // Function to load recent expenses
    const loadRecentExpenses = async (uid) => {
        try {
            const response = await axios.get(`http://localhost:3000/getlatestexpenses?user=${uid}`);
            setExpenses(response.data); // Set the expenses from the response
        } catch (err) {
            console.error("Error fetching recent expenses:", err);
            setError("Failed to load expenses."); // Set error message
        } finally {
            setLoading(false); // Set loading to false regardless of success or failure
        }
    };

    // useEffect to load expenses on component mount
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUserId(firebaseUser.uid); // Set user ID from Firebase
            } else {
                console.error("No user is logged in");
            }
        });

        return () => unsubscribe();
    }, []);

    // Fetch expenses when user ID is available
    useEffect(() => {
        if (userId) {
            loadRecentExpenses(userId);
        }
    }, [userId]);

    // Filter expenses based on user input
const filteredExpenses = expenses.filter((expense) => {
    // Format expense date and selected date for comparison
    const expenseDate = new Date(expense.date).toLocaleDateString();
    const selectedDate = dateFilter ? new Date(dateFilter).toLocaleDateString() : null;

    const isAmountMatch = amountFilter ? expense.amount <= parseFloat(amountFilter) : true;
    const isBudgetMatch = budgetFilter ? (expense.budget?.title || '').toLowerCase().includes(budgetFilter.toLowerCase()) : true;
    const isDateMatch = selectedDate ? expenseDate === selectedDate : true;
    return isAmountMatch && isBudgetMatch && isDateMatch;
});


    if (loading) {
        return <div className="text-center mt-20 text-blue-600">Loading...</div>;
    }

    if (error) {
        return <div className="text-center mt-20 text-red-500">{error}</div>;
    }

    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-3xl font-semibold text-blue-600 mb-6 text-center">Recent Expenses</h1>
                
                {/* Search and Filter Section */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row justify-center items-center">
                    <input
                        type="number"
                        placeholder="Filter by Amount (e.g., < 50)"
                        value={amountFilter}
                        onChange={(e) => setAmountFilter(e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />
                    <input
                        type="text"
                        placeholder="Filter by Budget Title"
                        value={budgetFilter}
                        onChange={(e) => setBudgetFilter(e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />
                    <input
                        type="date"
                        placeholder="Filter by Date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="border px-4 py-2 rounded-lg"
                    />
                </div>

                {/* Render Filtered Expenses */}
                {filteredExpenses.length === 0 ? (
                    <p className="text-center text-gray-600">No expenses found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                                <tr className="bg-violet-500 text-white">
                                    <th className="py-3 px-4 text-left">Amount</th>
                                    <th className="py-3 px-4 text-left">Description</th>
                                    <th className="py-3 px-4 text-left">Date</th>
                                    <th className="py-3 px-4 text-left">Budget Title</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map((expense) => (
                                    <tr key={expense._id} className="border-t">
                                        <td className="py-2 px-4">{expense.amount}</td>
                                        <td className="py-2 px-4">{expense.description}</td>
                                        <td className="py-2 px-4">{new Date(expense.date).toLocaleDateString()}</td>
                                        <td className="py-2 px-4">{expense.budget ? expense.budget.title : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Expenses;