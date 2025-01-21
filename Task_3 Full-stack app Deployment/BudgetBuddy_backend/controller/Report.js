import Expense from '../models/expense.js'; // Import your Expense model
import Budget from '../models/budget.js'; // Import your Budget model

// Endpoint to fetch expenses for the selected month
export const generateReport = async (req, res) => {
  const userId = req.query.user;
  const startDate = new Date(req.query.startDate);
  const endDate = new Date(req.query.endDate);

  // Validate input
  if (!startDate || !endDate || !userId) {
    return res.status(400).json({ message: "User ID, startDate, and endDate are required." });
  }

  try {
    // Aggregate to find expenses and join with Budget to get the budget title
    const expenses = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: 'budgets', // The collection name for budgets
          localField: 'budgetId', // Field from Expense collection (budgetId)
          foreignField: '_id', // Field from Budget collection (_id)
          as: 'budget', // Alias for the joined data
        },
      },
      {
        $unwind: {
          path: '$budget', // Unwind the array to get a single budget
          preserveNullAndEmptyArrays: true, // Keep expenses without a matching budget
        },
      },
      {
        $project: { // Select only the fields to return
          _id: 1,
          amount: 1,
          description: 1,
          date: 1,
          budgetId: 1, // Include budgetId from the Expense collection
          'budget.title': 1, // Include budget title
        },
      },
      {
        $sort: { date: -1 } // Sort by date in descending order
      }
    ]);

    if (expenses.length === 0) {
      return res.json({ message: "No expenses found" });
    }
    res.json(expenses); // Send back the filtered expenses
  } catch (error) {
    console.error("Error fetching expenses:", error); // Log the error for debugging
    res.status(500).json({ message: "Error fetching expenses", error });
  }
};

// Endpoint to fetch all budgets for a user
export const getBudgetById = async (req, res) => {
  const { user } = req.query.user; // Extract user ID from query parameters

  try {
    // Find all budgets for the specified user
    const budgets = await Budget.find({ userId: user });

    // If no budgets are found, respond accordingly
    if (!budgets || budgets.length === 0) {
      return res.status(404).json({ message: "No budgets found for this user" });
    }

    // Respond with the list of budgets
    const budgetData = budgets.map(budget => ({
      budgetId: budget._id, // Include budget ID for reference
      title: budget.title,
      totalAmount: budget.totalAmount,
      remaining: budget.remaining,
      totalSpent: budget.totalAmount - budget.remaining, // Calculate total spent
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    }));

    res.json(budgetData);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({ message: "Server error" });
  }
};
