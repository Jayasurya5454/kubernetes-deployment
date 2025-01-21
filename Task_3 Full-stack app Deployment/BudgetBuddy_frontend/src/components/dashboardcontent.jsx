import React, { useEffect, useState } from "react";
import axios from "axios";
import ActivityChart from "./Activitychart.jsx";
import { FiDollarSign, FiClipboard, FiCreditCard } from "react-icons/fi";
import Layout from "./Layout";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import Firebase auth methods

const DashboardContent = () => {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [numBudgets, setNumBudgets] = useState(0);
  const [latestBudgets, setLatestBudgets] = useState([]);
  const [activityData, setActivityData] = useState({ budgets: [], amounts: [] });
  const [userId, setUserId] = useState(null); // State for user ID

  // Function to fetch dashboard data from the server
  const fetchDashboardData = async (uid) => {
    try {
      const response = await axios.get(`http://localhost:3000/getDashBoardData?user=${uid}`);
      const data = response.data;

      setTotalBudget(data.totalBudget);
      setTotalSpend(data.totalSpend);
      setNumBudgets(data.numBudgets);
      setLatestBudgets(data.latestBudgets);

      const activityData = data.activityData;
      const updatedActivityData = activityData.map(act => ({
        title: act.title,
        amount_spend: act.totalAmount - act.remaining,
      }));

      const budgets = updatedActivityData.map(act => act.title);
      const amounts = updatedActivityData.map(act => act.amount_spend);

      setActivityData({
        budgets: budgets,
        amounts: amounts,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

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

  // Fetch dashboard data when user ID is available
  useEffect(() => {
    if (userId) {
      fetchDashboardData(userId);
    }
  }, [userId]);

  return (
    <Layout>
      {/* Header with adjusted positioning for mobile */}
      <div className="mb-6 mt-8 sm:mt-12 flex justify-start sm:justify-start md:justify-start lg:justify-start">
        <div className="text-left sm:text-left md:text-left lg:text-left">
          <h1 className="text-3xl font-bold sm:text-4xl px-4">Welcome to BudgetBuddy ✌️</h1>
          <p className="text-gray-500 text-lg sm:text-xl">Here's what's happening with your money. Let's manage your expense.</p>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500">Total Budget</p>
            <h3 className="text-2xl font-bold">${totalBudget}</h3>
          </div>
          <FiDollarSign className="text-blue-500 text-3xl" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500">Total Spend</p>
            <h3 className="text-2xl font-bold">${totalSpend}</h3>
          </div>
          <FiClipboard className="text-blue-500 text-3xl" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500">No. of Budgets</p>
            <h3 className="text-2xl font-bold">{numBudgets}</h3>
          </div>
          <FiCreditCard className="text-blue-500 text-3xl" />
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-xl font-bold mb-4">Activity</h3>
        <ActivityChart budgets={activityData.budgets} amounts={activityData.amounts} />
      </div>

      {/* Latest Budgets */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Latest Budgets</h3>
        <div className="space-y-4">
          {latestBudgets.map((budget, index) => {
            const spentAmount = budget.totalAmount - budget.remaining;
            return (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium">{budget.title}</p>
                  <p className="text-gray-500 text-sm">
                    Total: ${budget.totalAmount} | Spent: ${spentAmount}
                  </p>
                </div>
                <div className="text-xl font-bold">${budget.totalAmount}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardContent;
