import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FiPlus, FiEdit, FiTrash } from "react-icons/fi"; // Added icons for edit and delete
import axios from "axios";
import Layout from "./Layout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newBudgetTitle, setNewBudgetTitle] = useState("");
  const [newBudgetTotalAmount, setNewBudgetTotalAmount] = useState("");
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(getMaxDate());
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]); 
  const [isEditingBudget, setIsEditingBudget] = useState(false); // To handle budget edit state
  const [isEditingExpense, setIsEditingExpense] = useState(false); // To handle expense edit state
  const [editBudgetId, setEditBudgetId] = useState(null); // Store current budget being edited
  const [editExpenseId, setEditExpenseId] = useState(null); // Store current expense being edited

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        loadBudgets(firebaseUser.uid);
      } else {
        setUser(null);
        console.error("No user is logged in");
      }
    });
    return () => unsubscribe();
  }, []);

  const loadBudgets = async (uid) => {
    try {
      const response = await axios.get("http://localhost:3000/getbudgets", {
        params: { uid },
      });
      setBudgets(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      setBudgets([]);
    }
  };

  const loadExpenses = async (budgetId) => {
    try {
      const response = await axios.get("http://localhost:3000/getexpenses", {
        params: { budgetId },
      });
      setExpenses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const handleCreateBudget = async (event) => {
    event.preventDefault();
    try {
      if (!user || !user.uid) {
        console.error("User is not logged in or UID is undefined");
        return;
      }

      const newBudget = {
        uid: user.uid,
        title: newBudgetTitle,
        totalAmount: parseFloat(newBudgetTotalAmount),
        remaining: parseFloat(newBudgetTotalAmount),
        expenses: [],
        createdAt: new Date().toISOString(),
      };
      toast.success("Budget Added Successfully !", { autoClose: 1000 });

      await axios.post("http://localhost:3000/addbudget", newBudget);
      loadBudgets(user.uid);
      setNewBudgetTitle("");
      setNewBudgetTotalAmount("");
      setShowForm(false);
    } catch (error) {
      toast.error("Error adding budget !", { autoClose: 1000 });
      console.error("Error adding budget:", error);
    }
  };
  const handleUpdateBudget = async (event) => {
    event.preventDefault();
    try {
      console.log("Sending budgetId:", editBudgetId); // Log the budgetId before sending
      console.log("Title:", newBudgetTitle);
      console.log("Total Amount:", parseFloat(newBudgetTotalAmount));
  
      // Sending the request to update the budget
      const response = await axios.put(`http://localhost:3000/updatebudget/${editBudgetId}`, {
        title: newBudgetTitle,
        totalAmount: parseFloat(newBudgetTotalAmount),
      });
  
      toast.success("Budget Updated Successfully!", { autoClose: 1000 });
      loadBudgets(user.uid);
      setNewBudgetTitle("");
      setNewBudgetTotalAmount("");
      setIsEditingBudget(false);
      setEditBudgetId(null);
    } catch (error) {
      // Check if the error response contains a specific message
      if (error.response) {
        // Error response from the server
        const errorMessage = error.response.data.message || 'Error updating budget!';
        toast.error(errorMessage, { autoClose: 1000 });
        console.error("Server Error:", errorMessage);
      } else if (error.request) {
        // Request was made but no response was received
        toast.error("No response from the server.", { autoClose: 1000 });
        console.error("No response from server:", error.request);
      } else {
        // Something happened in setting up the request
        toast.error("Error in request setup: " + error.message, { autoClose: 1000 });
        console.error("Request Setup Error:", error.message);
      }
    }
  };
  
  
  
  const handleDeleteBudget = async (budgetId) => {
    try {
      await axios.delete(`http://localhost:3000/deletebudget/${budgetId}`);
      toast.success("Budget Deleted Successfully!", { autoClose: 1000 });
      setIsEditingExpense(false);
      loadBudgets(user.uid);
    } catch (error) {
      toast.error("Error deleting budget!", { autoClose: 1000 });
      console.error("Error deleting budget:", error);
    }
  };

  const handleAddExpense = async (event) => {
    event.preventDefault();
    try {
      const newExpense = {
        budgetId: selectedBudget._id,
        amount: parseFloat(expenseAmount),
        description: expenseDescription,
        date: expenseDate,
        userId: user.uid,
        userEmail : user.email,
      };
      await axios.post("http://localhost:3000/addexpense", newExpense);
      toast.success("Expense Added Successfully !", { autoClose: 1000 });
      loadBudgets(user.uid);
      loadExpenses(selectedBudget._id); 
      setExpenseAmount("");
      setExpenseDescription("");
    }catch (error) {
      // Check if the error response contains a specific message
      if (error.response) {
        // Error response from the server
        const errorMessage = error.response.data.message || 'Error updating Expense!';
        toast.error(errorMessage, { autoClose: 2000 });
        console.error("Server Error:", errorMessage);
      } else if (error.request) {
        // Request was made but no response was received
        toast.error("No response from the server.", { autoClose: 1000 });
        console.error("No response from server:", error.request);
      } else {
        // Something happened in setting up the request
        toast.error("Error in request setup: " + error.message, { autoClose: 1000 });
        console.error("Request Setup Error:", error.message);
      }
    }
  };

  const handleUpdateExpense = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`http://localhost:3000/updateexpense/${editExpenseId}`, {
        amount: parseFloat(expenseAmount),
        description: expenseDescription,
        userEmail : user.email,
      });
      toast.success("Expense Updated Successfully!", { autoClose: 1000 });
      loadBudgets(user.uid);
      loadExpenses(selectedBudget._id);
      setIsEditingExpense(false);
      setEditExpenseId(null);
    }catch (error) {
      // Check if the error response contains a specific message
      if (error.response) {
        // Error response from the server
        const errorMessage = error.response.data.message || 'Error updating Expense!';
        toast.error(errorMessage, { autoClose: 2000 });
        console.error("Server Error:", errorMessage);
      } else if (error.request) {
        // Request was made but no response was received
        toast.error("No response from the server.", { autoClose: 1000 });
        console.error("No response from server:", error.request);
      } else {
        // Something happened in setting up the request
        toast.error("Error in request setup: " + error.message, { autoClose: 1000 });
        console.error("Request Setup Error:", error.message);
      }
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await axios.delete(`http://localhost:3000/deleteexpense/${expenseId}`);
      toast.success("Expense Deleted Successfully!", { autoClose: 1000 });
      loadBudgets(user.uid);
      loadExpenses(selectedBudget._id);
    } catch (error) {
      toast.error("Error deleting expense!", { autoClose: 1000 });
      console.error("Error deleting expense:", error);
    }
  };

  const handleSelectBudget = (budget) => {
    setSelectedBudget(budget);
    loadExpenses(budget._id); 
  };
  
  // Function to get today's date in yyyy-mm-dd format
function getMaxDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

// Function to get the date one month ago in yyyy-mm-dd format
function getMinDate() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().split("T")[0];
}

return (
  <Layout>
  <div className="p-8 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 min-h-screen">
    <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
      Manage Your Budgets
    </h1>

    <div
      className="border border-gray-300 bg-white shadow-lg rounded-lg p-6 mb-6 cursor-pointer flex items-center justify-between hover:bg-blue-50 hover:shadow-xl transition"
      onClick={() => {
        setShowForm(!showForm);
        setIsEditingBudget(false); // Ensure we're not editing when adding new
      }}
    >
      <div className="flex items-center">
        <FiPlus className="mr-2 text-indigo-600" size={24} />
        <span className="font-semibold text-gray-800 text-lg">
          {isEditingBudget ? "Edit Budget" : "Create New Budget"}
        </span>
      </div>
    </div>

    {showForm && (
      <form
        onSubmit={isEditingBudget ? handleUpdateBudget : handleCreateBudget}
        className="mb-6 bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Budget Title"
            value={newBudgetTitle}
            onChange={(e) => setNewBudgetTitle(e.target.value)}
            required
            className="border border-indigo-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500 transition"
          />
          <input
            type="number"
            placeholder="Total Amount"
            value={newBudgetTotalAmount}
            onChange={(e) => setNewBudgetTotalAmount(e.target.value)}
            required
            className="border border-indigo-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-indigo-600 text-white py-3 px-6 rounded-lg w-full hover:bg-indigo-700 transition"
        >
          {isEditingBudget ? "Update Budget" : "Add Budget"}
        </button>
      </form>
    )}

    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Budgets</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {budgets.map((budget) => (
        <div
          key={budget._id}
          className={`bg-white shadow-lg rounded-lg p-6 ${
            selectedBudget && selectedBudget._id === budget._id
              ? "border-2 border-indigo-600"
              : ""
          } cursor-pointer hover:bg-indigo-50 hover:shadow-xl transition`}
          onClick={() => handleSelectBudget(budget)}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">{budget.title}</h3>
            <div className="flex space-x-2">
              <button
                className="text-indigo-600 hover:text-indigo-800"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingBudget(true);
                  setEditBudgetId(budget._id);
                  setNewBudgetTitle(budget.title);
                  setNewBudgetTotalAmount(budget.totalAmount);
                  setShowForm(true);
                }}
              >
                <FiEdit size={20} />
              </button>
              <button
                className="text-red-600 hover:text-red-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBudget(budget._id);
                }}
              >
                <FiTrash size={20} />
              </button>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            Remaining: ${budget.remaining} / Total: ${budget.totalAmount}
          </p>
        </div>
      ))}
    </div>

    {selectedBudget && (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Expenses for {selectedBudget.title}
        </h2>

        <form
          onSubmit={isEditingExpense ? handleUpdateExpense : handleAddExpense}
          className="mb-6 bg-white shadow-lg rounded-lg p-6 max-w-3xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <input
              type="number"
              placeholder="Expense Amount"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              required
              className="border border-indigo-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500 transition"
            />
            <input
              type="text"
              placeholder="Expense Description"
              value={expenseDescription}
              onChange={(e) => setExpenseDescription(e.target.value)}
              required
              className="border border-indigo-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500 transition"
            />
            <input
              type="date"
              placeholder="Expense Date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              required
              className="border border-indigo-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500 transition"
              min={getMinDate()}
              max={getMaxDate()}
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-indigo-600 text-white py-3 px-6 rounded-lg w-full hover:bg-indigo-700 transition"
          >
            {isEditingExpense ? "Update Expense" : "Add Expense"}
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {expenses.map((expense) => (
            <div
              key={expense._id}
              className="bg-white shadow-lg rounded-lg p-6 hover:bg-indigo-50 hover:shadow-xl transition"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">
                  ${expense.amount}
                </h3>
                <div className="flex space-x-2">
                  <button
                    className="text-indigo-600 hover:text-indigo-800"
                    onClick={() => {
                      setIsEditingExpense(true);
                      setEditExpenseId(expense._id);
                      setExpenseAmount(expense.amount);
                      setExpenseDescription(expense.description);
                    }}
                  >
                    <FiEdit size={20} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleDeleteExpense(expense._id)}
                  >
                    <FiTrash size={20} />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mt-2">{expense.description}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    <ToastContainer />
  </div>
</Layout>

);

};

export default Budgets;
