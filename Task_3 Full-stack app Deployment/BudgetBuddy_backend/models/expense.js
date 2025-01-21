import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  budgetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Budget",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  userId: { // Optional, if you want to link expenses to users
    type: String ,
    required: true,
  },
});

const Expense = mongoose.model('Expense', ExpenseSchema);

export default Expense;
