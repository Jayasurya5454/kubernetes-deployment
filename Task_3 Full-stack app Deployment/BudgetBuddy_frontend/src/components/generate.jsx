import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import BudgetChart from './Bugetchart';
import html2canvas from 'html2canvas';
import { ToastContainer, toast } from 'react-toastify';  
import 'react-toastify/dist/ReactToastify.css';

const GenerateReport = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const [totalBudget, setTotalBudget] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);
    const [remainingAmount, setRemainingAmount] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budgetData, setBudgetData] = useState([]);

    // Fetch expenses within the selected date range
    const fetchExpensesInRange = async () => {
        if (!startDate || !endDate) {
            return toast.error("Please select both start and end dates.");
        }

        if (new Date(startDate) > new Date(endDate)) {
            return toast.error("Start date cannot be after end date.");
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `http://localhost:3000/getexpensesinrange?user=${userId}&startDate=${startDate}&endDate=${endDate}`
            );

            if (response.data.length === 0) {
                setExpenses([]);
                toast.error("No expenses found for the selected date range.");
                return;
            }

            setExpenses(response.data);
            await fetchBudgetData(userId, response.data);
        } catch (err) {
            console.error("Error fetching expenses:", err);
            toast.error("Failed to load expenses.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch budget data based on the fetched expenses
    const fetchBudgetData = async (uid, expenses) => {
        try {
            const response = await axios.get(
                `http://localhost:3000/getbudgetdata?user=${uid}`
            );

            const allBudgets = response.data;
            const budgetIds = [...new Set(expenses.map(expense => expense.budgetId))];
            const filteredBudgets = allBudgets.filter(budget => budgetIds.includes(budget.budgetId));

            let totalBudget = 0;
            let totalSpent = 0;
            const budgetSpentMap = {};

            filteredBudgets.forEach(budget => {
                totalBudget += budget.totalAmount;
                budgetSpentMap[budget.budgetId] = 0; // Initialize spent amounts
            });

            expenses.forEach(expense => {
                const expenseBudgetId = expense.budgetId;
                if (budgetSpentMap[expenseBudgetId] !== undefined) {
                    budgetSpentMap[expenseBudgetId] += expense.amount;
                }
            });

            totalSpent = Object.values(budgetSpentMap).reduce((acc, spent) => acc + spent, 0);

            setTotalBudget(totalBudget);
            setTotalSpent(totalSpent);
            setRemainingAmount(totalBudget - totalSpent);

            const updatedBudgets = filteredBudgets.map(budget => ({
                ...budget,
                spentAmount: budgetSpentMap[budget.budgetId] || 0
            }));

            setBudgetData(updatedBudgets);
        } catch (err) {
            console.error("Error fetching budget data:", err);
            toast.error("No expenses found for the selected date range.", {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }
    };

    // Generate PDF report for the selected date range
    const generateReport = async () => {
        if (!expenses || expenses.length === 0) return;
    
        const doc = new jsPDF();
        const reportTitle = `${productName} - Expense Report for ${startDate} to ${endDate}`;
    
        // Header Section
        doc.setFontSize(16);
        doc.text(`Hello ${userEmail}`, 14, 10);
        doc.setFontSize(16);
        doc.text(productName, 14, 20); // Product Name
        doc.setFontSize(16);
        doc.text(reportTitle, 14, 30); // Report Title
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40);
    
        // Summary Section
        doc.setFontSize(14);
        doc.text(`Total Budget: $${totalBudget}`, 14, 50);
        doc.text(`Total Spent: $${totalSpent}`, 14, 58);
        doc.text(`Remaining Amount: $${remainingAmount}`, 14, 66);
    
        const chartElement = document.getElementById('budgetChart');
        if (chartElement) {
            try {
                const canvas = await html2canvas(chartElement);
                const imgData = canvas.toDataURL('image/png');
                doc.addImage(imgData, 'PNG', 14, 75, 180, 100);
    
                const tableData = expenses.map(expense => [
                    `$${expense.amount}`,
                    expense.description,
                    new Date(expense.date).toLocaleDateString(),
                    expense.budget ? expense.budget.title : 'N/A'
                ]);
    
                doc.autoTable({
                    head: [['Amount', 'Description', 'Date', 'Budget Title']],
                    body: tableData,
                    startY: 185
                });
    
                doc.save(`${productName}_Expense_Report_${startDate}_to_${endDate}.pdf`);
            } catch (error) {
                console.error("Error generating chart image:", error);
            }
        } else {
            console.error("Chart element not found");
        }
    };
    

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUserId(firebaseUser.uid);
                setUserEmail(firebaseUser.email);
            } else {
                console.error("No user is logged in");
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <Layout>
            <div className="max-w-screen mx-auto p-6 md:p-8 bg-white shadow-lg rounded-lg">
                <h1 className="text-3xl font-semibold text-blue-600 text-center mb-6">Generate Expense Report</h1>
                {/* <h2 className="text-lg font-medium text-gray-600 text-center mb-8">Welcome, {userEmail}</h2> */}

                {/* Budget Summary Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
                    <div className="bg-blue-100 p-4 rounded-lg shadow-md">
                        <p className="font-medium text-blue-600">Total Budget:</p>
                        <p className="text-2xl font-bold">${totalBudget}</p>
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg shadow-md">
                        <p className="font-medium text-green-600">Total Spent:</p>
                        <p className="text-2xl font-bold">${totalSpent}</p>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-lg shadow-md">
                        <p className="font-medium text-yellow-600">Remaining Amount:</p>
                        <p className="text-2xl font-bold">${remainingAmount}</p>
                    </div>
                </div>

                {/* Date Range Selection and Buttons */}
                <div className="flex flex-col md:flex-row md:space-x-6 items-center mb-8 space-y-4 md:space-y-0">
                    <label className="font-medium">From </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-gray-300 rounded-lg p-3 w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                      <label  className="font-medium">To </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-gray-300 rounded-lg p-3 w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={fetchExpensesInRange}
                        className="bg-blue-600 text-white px-4 py-3 rounded-lg w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-500 transition"
                    >
                        Fetch Expenses
                    </button>
                    <button
                        onClick={generateReport}
                        className="bg-green-600 text-white px-4 py-3 rounded-lg w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-green-500 hover:bg-green-500 transition"
                    >
                        Generate Report
                    </button>
                </div>

                {/* Budget Chart Section */}
                {budgetData.length > 0 && (
                    <div className="mb-8" id="budgetChart">
                        <BudgetChart budgetData={budgetData} expenseData={expenses} />
                    </div>
                )}

                {/* Expenses Table Section */}
                <div className="overflow-x-auto mb-8">
                    <h2 className="text-xl font-semibold text-blue-600 mb-4">Expenses for Selected Date Range</h2>
                    <table className="min-w-full bg-white table-auto border-collapse shadow-md rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Amount</th>
                                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
                                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Budget Title</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length > 0 ? (
                                expenses.map((expense, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2">${expense.amount}</td>
                                        <td className="border border-gray-300 px-4 py-2">{expense.description}</td>
                                        <td className="border border-gray-300 px-4 py-2">{new Date(expense.date).toLocaleDateString()}</td>
                                        <td className="border border-gray-300 px-4 py-2">{expense.budget ? expense.budget.title : 'N/A'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="border border-gray-300 px-4 py-2 text-center text-gray-500">No expenses found for the selected date range.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {error && <p className="text-red-600 text-center">{error}</p>}

                {/* Add Toastify container here to render notifications */}
                <ToastContainer />
            </div>
        </Layout>
    );
};

export default GenerateReport;
