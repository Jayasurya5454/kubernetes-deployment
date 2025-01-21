// models/Budget.js
import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  uid: { type: String, required: true },           // Firebase UID to associate with the user
  budgetId: { type: String, required: true },      // Unique budget ID (can be auto-generated)
  title: { type: String, required: true },         // Budget title
  totalAmount: { type: Number, required: true },   // Total budget amount
  remaining: { type: Number, required: true },     // Remaining amount
  createdAt: { type: Date, default: Date.now }     // Creation date
});

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
