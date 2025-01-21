import mongoose,{Types} from 'mongoose';
import Budget from '../models/budget.js'; // Import the Budget model
import Expense from '../models/expense.js';
// Save new budget to MongoDB
export const saveNewBudget = async (req, res) => {
  const { uid, title, totalAmount, date } = req.body; // Extract data from request body

  try {
    // Create a new budget document
    const newBudget = new Budget({
      uid,                                  // Firebase user ID from req.body
      budgetId: new mongoose.Types.ObjectId(), // Unique budget ID
      title,                                // Budget title
      totalAmount,                          // Total amount of the budget
      remaining: totalAmount,               // Initialize remaining amount as total
      date                                  // Date of budget
    });


    // Save the budget document to MongoDB
    await newBudget.save();

    res.status(201).json({ message: 'Budget saved successfully', budget: newBudget });
  } catch (error) {
    console.error("Error saving budget:", error); // Log the exact error
    res.status(500).json({ message: 'Error saving budget', error });
  }
};

// Fetch budgets for a specific user
export const fetchBudgetsByUserId = async (req, res) => {
  const { uid } = req.query; // Extract UID from request parameters

  try {
    const budgets = await Budget.find({ uid });// Find budgets based on UID
    res.status(200).json(budgets); // Send the budgets in the response
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budgets', error });
  }
};

// Update a budget by its ID
export const updateBudget = async (req, res) => {
  const { budgetId } = req.params; // Extract the budget ID from the URL parameters
  const { title, totalAmount } = req.body; // Extract updated data from the request body

  try {
    // Convert the budgetId string to ObjectId
    const objectId = new mongoose.Types.ObjectId(budgetId);

    // Find the current budget by its ID
    const currentBudget = await Budget.findById(objectId);
    // Check if the budget exists
    if (!currentBudget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Calculate current expenses based on the total amount and remaining
    const currentExpenses = currentBudget.totalAmount - currentBudget.remaining;
    // Calculate new remaining amount if total amount is updated
    const newRemaining = totalAmount - currentExpenses;
    // Check if new total amount is less than current expenses
    if (newRemaining < 0) {
      return res.status(500).json({ message: 'Total amount cannot be less than the expenses incurred.' });
    }

    // Proceed with the update
    const updatedBudget = await Budget.findByIdAndUpdate(
      objectId,
      {
        title,
        totalAmount,
        remaining: newRemaining, // Update remaining accordingly
      },
      { new: true } // Return the updated document
    );


    res.status(200).json({ message: 'Budget updated successfully', budget: updatedBudget });
  } catch (error) {
    console.error("Error updating budget in database:", error);
    res.status(500).json({ message: 'Error updating budget', error });
  }
};


export const deleteBudget = async (req, res) => {
  const { budgetId } = req.params; // Extract budget ID from the URL parameters
  try {
    // Find the budget by its ID and remove it
    const objectId = new mongoose.Types.ObjectId(budgetId);

    const deletedBudget = await Budget.findOneAndDelete({ _id: objectId });
    if (!deletedBudget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    // Delete all expenses associated with this budget
    await Expense.deleteMany({ budgetId: objectId });
    res.status(200).json({ message: 'Budget and corresponding expenses deleted successfully' });
  } catch (error) {
    console.error("Error deleting budget:", error); // Log the error
    res.status(500).json({ message: 'Error deleting budget', error });
  }
};

