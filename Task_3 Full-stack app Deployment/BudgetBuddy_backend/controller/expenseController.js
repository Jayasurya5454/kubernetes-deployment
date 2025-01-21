import Expense from '../models/expense.js'; // Import the Expense model
import Budget from '../models/budget.js';
import mongoose from 'mongoose'; // Import mongoose for ObjectId
import nodemailer from 'nodemailer';

const sendThresholdEmail = async (userEmail, budgetTitle, threshold) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465, // Use 465 for SSL
        secure: true, // Set to true for 465
        auth: {
            user: process.env.USER , // Your Gmail address
            pass: process.env.PASS , // Your Gmail app password (not your email password if 2FA is enabled)
        },
        tls: {
            rejectUnauthorized: false, // Optional: Bypass unauthorized certificate checks
        },
    });
    

    const mailOptions = {
        from: process.env.USER,
        to: userEmail,
        subject: `Budget Alert: ${budgetTitle} Budget is ${threshold}% Used`,
        text: `You have used ${threshold}% of your budget "${budgetTitle}". Consider reviewing your expenses to avoid overspending.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Threshold email sent successfully');
    } catch (error) {
        console.error('Error sending threshold email:', error);
    }
};


export const saveNewExpense = async (req, res) => {
    const { budgetId, amount, description, date, userId ,userEmail} = req.body;

    // Validate budgetId length and format
    if (!mongoose.Types.ObjectId.isValid(budgetId)) {
        return res.status(400).json({ message: "Invalid budget ID format" });
    }

    const budgetObjectId = new mongoose.Types.ObjectId(budgetId); // Use new ObjectId

    try {
        // Check if the budget exists
        const budget = await Budget.findById(budgetObjectId);
        if (!budget) {
            return res.status(404).json({ message: "Budget not found" });
        }

        // Check if there is enough remaining budget
        if (budget.remaining < amount) {
            return res.status(400).json({ message: "Insufficient budget remaining" });
        }

        // Create the expense
        const expense = new Expense({
            budgetId: budgetObjectId,
            amount,
            description,
            date,
            userId // Should be a valid string
        });

        await expense.save();

        // Update the budget
        budget.remaining -= amount; // Deduct the amount from remaining budget
        budget.expenses += amount;   // Update total expenses
        await budget.save();
        const usagePercent = ((budget.remaining || 0) / (budget.totalAmount || 1) * 100).toFixed(2);
        if (usagePercent <= 10) {
            // Send email notification if 90% used
            await sendThresholdEmail(userEmail, budget.title, 90);
        }
        res.status(201).json(expense);
    } catch (error) {
        console.error("Error adding expense:", error.message);
        console.error("Stack trace:", error.stack);
        res.status(500).json({ message: "Error adding expense", error: error.message });
    }
};



export const fetchExpenses = async (req, res) => {
    const { budgetId } = req.query;
    try {
        // Ensure that the budgetId is valid
        if (!mongoose.Types.ObjectId.isValid(budgetId)) {
            return res.status(400).json({ message: "Invalid budget ID format" });
        }
        // Convert budgetId to ObjectId
        const budgetObjectId = new mongoose.Types.ObjectId(budgetId);
        
        // Find all expenses associated with the budgetId
        const expenses = await Expense.find({ budgetId: budgetObjectId });
        if (expenses.length === 0) {
            return res.status(404).json({ message: "No expenses found for this budget" });
        }
        res.status(200).json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: "Error fetching expenses" });
    }
};
// Fetch recent expenses based on userid without budget join
// Fetch recent expenses based on userid and get the budget title
export const fetchRecentExpenses = async (req, res) => {
    const userId = req.query.user; // Get user ID from query param
    try {
        // Validate that userId is provided
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Aggregate to find expenses and join with Budget to get the budget title
        const expenses = await Expense.aggregate([
            {
                $match: { userId: userId } // Match expenses by userId
            },
            {
                $lookup: {
                    from: 'budgets', // The collection name for budgets
                    localField: 'budgetId', // Field from Expense collection (budgetId)
                    foreignField: '_id', // Field from Budget collection (_id)
                    as: 'budget' // Alias for the joined data
                }
            },
            {
                $unwind: { // Unwind the array to get a single budget
                    path: '$budget',
                    preserveNullAndEmptyArrays: true // Keep expenses without a matching budget
                }
            },
            {
                $project: { // Select only the fields to return
                    _id: 1,
                    amount: 1,
                    description: 1,
                    date: 1,
                    'budget.title': 1 // Include budget title
                }
            },
            {
                $sort: { date: -1 } // Sort by date in descending order
            }
        ]);

        res.status(200).json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: "Error fetching expenses" });
    }
};



export const updateExpense = async (req, res) => {
  const { expenseId } = req.params; // Extract expense ID from the URL parameters
  const { amount, description, date,userEmail } = req.body; // Extract fields from the request body

  try {
    // Find the existing expense by its ID
    const existingExpense = await Expense.findById(expenseId);
    if (!existingExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Find the corresponding budget
    const budget = await Budget.findById(existingExpense.budgetId);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Fetch all expenses linked to the budget to calculate the total amount spent
    const totalExpenses = await Expense.aggregate([
      { $match: { budgetId: existingExpense.budgetId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Calculate the remaining budget
    const currentRemaining = budget.totalAmount - (totalExpenses[0]?.total || 0);
    
    // Check if the new expense amount would exceed the budget remaining
    const updatedRemaining = currentRemaining + existingExpense.amount - amount; // Adjust for the current expense amount
    if (updatedRemaining < 0) {
      return res.status(400).json({ message: 'Insufficient budget remaining. Please update the budget first.' });
    }

    // Update the expense fields
    existingExpense.amount = amount;
    existingExpense.description = description;
    existingExpense.date = date;

    // Save the updated expense
    await existingExpense.save();

    // Update the budget's remaining amount
    budget.remaining = updatedRemaining; // Update the remaining budget
    await budget.save(); // Save the budget changes

    const usagePercent = ((budget.remaining || 0) / (budget.totalAmount || 1) * 100).toFixed(2);
        if (usagePercent <= 10) {
            // Send email notification if 90% used
            await sendThresholdEmail(userEmail, budget.title, 90);
        }

    res.status(200).json({ message: 'Expense updated successfully', expense: existingExpense });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ message: 'Error updating expense', error });
  }
};


  export const deleteExpense = async (req, res) => {
    const { expenseId } = req.params; // Extract expense ID from the URL parameters
  
    try {
      // Find the existing expense by its ID
      const existingExpense = await Expense.findById(expenseId);
      if (!existingExpense) {
        return res.status(404).json({ message: 'Expense not found' });
      }
  
      // Find the corresponding budget
      const budget = await Budget.findById(existingExpense.budgetId);
      if (!budget) {
        return res.status(404).json({ message: 'Budget not found' });
      }
  
      // Update the budget's remaining amount
      budget.remaining += existingExpense.amount; // Add back the expense amount
      await budget.save(); // Save the budget changes
  
      // Delete the expense
      await Expense.findByIdAndDelete(expenseId);
  
      res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: 'Error deleting expense', error });
    }
  };
  